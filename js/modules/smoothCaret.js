// 平滑光标：用可动画的覆盖层替代编辑器原生插入符。
let smoothCaretActive = false;
let caretElement = null;
let frameId = null;

const findTextNode = (node, fromEnd = false) => {
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue?.length ? node : null;

    const children = node.childNodes;
    for (let index = fromEnd ? children.length - 1 : 0;
        fromEnd ? index >= 0 : index < children.length;
        index += fromEnd ? -1 : 1) {
        const textNode = findTextNode(children[index], fromEnd);
        if (textNode) return textNode;
    }
    return null;
};

const getAdjacentTextPosition = (range, after) => {
    const container = range.startContainer;
    const offset = range.startOffset;

    if (container.nodeType === Node.TEXT_NODE) {
        const length = container.nodeValue?.length || 0;
        if (after && offset < length) return { node: container, offset };
        if (!after && offset > 0) return { node: container, offset: offset - 1 };
        return null;
    }

    if (container.nodeType !== Node.ELEMENT_NODE) return null;
    const child = container.childNodes[after ? offset : offset - 1];
    const textNode = findTextNode(child, !after);
    if (!textNode) return null;
    return {
        node: textNode,
        offset: after ? 0 : textNode.nodeValue.length - 1
    };
};

const getTextCaretRect = (range) => {
    // 优先采用后一个字符，换行边界处它所在的行才是光标实际所在行。
    for (const after of [true, false]) {
        const position = getAdjacentTextPosition(range, after);
        if (!position) continue;

        const probe = document.createRange();
        try {
            probe.setStart(position.node, position.offset);
            probe.setEnd(position.node, position.offset + 1);
            const rect = Array.from(probe.getClientRects()).find(item => item.height > 0);
            if (rect) {
                return {
                    left: after ? rect.left : rect.right,
                    top: rect.top,
                    width: 0,
                    height: rect.height
                };
            }
        } finally {
            probe.detach?.();
        }
    }
    return null;
};

const getEmptyInlineCaretRect = (element) => {
    const inline = element.closest('span[data-type~="code"], code:not(.hljs)');
    if (!inline || inline.textContent) return null;

    const rect = inline.getBoundingClientRect();
    if (rect.height <= 0) return null;
    const style = getComputedStyle(inline);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const height = Number.isFinite(lineHeight) ? Math.min(lineHeight, rect.height) : rect.height;
    return {
        left: rect.left
            + (Number.parseFloat(style.borderLeftWidth) || 0)
            + (Number.parseFloat(style.paddingLeft) || 0),
        top: rect.top + Math.max(0, (rect.height - height) / 2),
        width: 0,
        height
    };
};

const getCaretInfo = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    if (!element?.closest?.('.protyle-wysiwyg[contenteditable="true"]')) return null;

    // 分割线节点的 Range 会覆盖整个块，不能直接作为插入符矩形使用。
    const thematicBreak = element.closest('[data-type="NodeThematicBreak"]');
    if (thematicBreak) {
        const breakRect = thematicBreak.getBoundingClientRect();
        const style = getComputedStyle(thematicBreak);
        const fontSize = Number.parseFloat(style.fontSize) || 16;
        const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.5;
        return {
            rect: {
                left: breakRect.right - 1,
                top: breakRect.top + Math.max(0, (breakRect.height - lineHeight) / 2),
                height: lineHeight
            },
            color: style.color
        };
    }

    // 折叠 Range 在行内元素边界可能返回整行行首的伪矩形。相邻字符的边缘
    // 更接近浏览器原生插入符，并且能覆盖 Alt+G 改写出的 code/span 容器边界。
    const rect = range.getBoundingClientRect();
    const caretRect = getTextCaretRect(range)
        || getEmptyInlineCaretRect(element)
        || (rect.height > 0 ? rect : Array.from(range.getClientRects()).find(item => item.height > 0));
    if (caretRect) return { rect: caretRect, color: getComputedStyle(element).color };

    // 空块没有文本矩形，优先使用内部 spellcheck 行，避免外层块的边距影响位置。
    // 表格空单元格：spellcheck 可能命中单元格外的表格容器，需以 td/th 为界，否则光标会落到表格左上角。
    const cell = element.closest('td, th');
    let line = element.closest('[spellcheck]');
    if (!line || (cell && !cell.contains(line))) {
        line = cell
            || element.closest('[contenteditable="true"]')
            || element.closest('[data-node-id]');
    }
    if (!line) return null;
    const lineRect = line.getBoundingClientRect();
    if (lineRect.height <= 0) return null;
    const style = getComputedStyle(line);
    const lineHeight = Number.parseFloat(style.lineHeight);
    return {
        rect: {
            left: lineRect.left + Number.parseFloat(style.paddingLeft || 0),
            top: lineRect.top + Number.parseFloat(style.paddingTop || 0),
            height: Number.isFinite(lineHeight) ? lineHeight : lineRect.height
        },
        color: style.color
    };
};

const hideCaret = () => caretElement?.classList.remove('savor-smooth-caret--visible');

const updateCaret = () => {
    frameId = null;
    if (!smoothCaretActive || document.hidden || !document.hasFocus()) return hideCaret();
    const caret = getCaretInfo();
    if (!caret) return hideCaret();
    caretElement.style.height = `${Math.max(1, caret.rect.height)}px`;
    caretElement.style.backgroundColor = caret.color;
    caretElement.style.transform = `translate3d(${Math.round(caret.rect.left)}px, ${Math.round(caret.rect.top)}px, 0)`;
    caretElement.classList.add('savor-smooth-caret--visible');
};

const scheduleUpdate = () => {
    if (!smoothCaretActive || frameId !== null) return;
    frameId = requestAnimationFrame(updateCaret);
};

export const enableSmoothCaret = () => {
    if (smoothCaretActive) return;
    smoothCaretActive = true;
    caretElement = document.createElement('div');
    caretElement.className = 'savor-smooth-caret';
    caretElement.setAttribute('aria-hidden', 'true');
    document.body.append(caretElement);
    document.documentElement.setAttribute('savor-smooth-caret', 'true');
    document.addEventListener('selectionchange', scheduleUpdate);
    document.addEventListener('input', scheduleUpdate, true);
    document.addEventListener('focusin', scheduleUpdate);
    document.addEventListener('focusout', hideCaret);
    document.addEventListener('visibilitychange', scheduleUpdate);
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);
    scheduleUpdate();
};

export const disableSmoothCaret = () => {
    if (!smoothCaretActive) return;
    smoothCaretActive = false;
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    document.removeEventListener('selectionchange', scheduleUpdate);
    document.removeEventListener('input', scheduleUpdate, true);
    document.removeEventListener('focusin', scheduleUpdate);
    document.removeEventListener('focusout', hideCaret);
    document.removeEventListener('visibilitychange', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
    window.removeEventListener('scroll', scheduleUpdate, true);
    document.documentElement.removeAttribute('savor-smooth-caret');
    caretElement?.remove();
    caretElement = null;
};

export const initSmoothCaretModule = () => {
    window.enableSmoothCaret = enableSmoothCaret;
    window.disableSmoothCaret = disableSmoothCaret;
    window.cleanupSmoothCaret = cleanupSmoothCaret;
};

export const cleanupSmoothCaret = () => {
    disableSmoothCaret();
    window.enableSmoothCaret = null;
    window.disableSmoothCaret = null;
    window.cleanupSmoothCaret = null;
};

// ========================================
// 模块：打字机模式功能
// ========================================

import { throttle } from './utils.js';

let typewriterModeActive = false, typewriterHandler = null, typewriterEnterHandler = null;

const getTypewriterEditor = (selection) => {
    if (!selection || !selection.rangeCount) return document.documentElement;

    const range = selection.getRangeAt(0);
    const node = range.startContainer || range.commonAncestorContainer;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const editor = element?.closest?.(".protyle-content");
    if (editor) return editor;

    return document.querySelector(".layout__wnd--active .protyle-content")
        || document.documentElement;
};

const getCaretRect = (range, selection) => {
    let rect = range.getBoundingClientRect();
    if (rect.height > 0) return rect;

    const rects = range.getClientRects();
    if (rects.length > 0 && rects[0].height > 0) return rects[0];

    const node = selection?.focusNode || range.startContainer || range.commonAncestorContainer;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const line = element?.closest?.("[data-node-id]") || element?.closest?.("[contenteditable='true']");
    if (line) {
        rect = line.getBoundingClientRect();
        if (rect.height > 0) return rect;
    }
    return null;
};

const syncTypewriterScroll = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const rect = getCaretRect(range, sel);
    if (!rect) return;
    const editor = getTypewriterEditor(sel);
    const editorRect = editor.getBoundingClientRect();
    const scrollTop = editor === document.documentElement || editor === document.body
        ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
        : editor.scrollTop;
    const editorCenter = editorRect.top + editorRect.height / 2;
    const cursorPosition = rect.top + rect.height / 2;
    const scrollAmount = scrollTop + (cursorPosition - editorCenter);
    if (editor === document.documentElement || editor === document.body) {
        window.scrollTo({ top: scrollAmount, behavior: "smooth" });
    } else {
        editor.scrollTo({ top: scrollAmount, behavior: "smooth" });
    }
};

// 启用打字机模式
export const enableTypewriterMode = () => {
    if (typewriterModeActive) return;
    typewriterModeActive = true;
    typewriterHandler = throttle(() => requestAnimationFrame(syncTypewriterScroll), 100);
    typewriterEnterHandler = (event) => {
        if (event.key !== "Enter") return;
        const target = event.target;
        if (!target?.closest?.(".protyle-content")) return;
        requestAnimationFrame(syncTypewriterScroll);
    };
    document.addEventListener("selectionchange", typewriterHandler);
    document.addEventListener("keyup", typewriterEnterHandler, true);
};

// 禁用打字机模式
export const disableTypewriterMode = () => {
    if (!typewriterModeActive) return;
    typewriterModeActive = false;
    if (typewriterHandler) {
        document.removeEventListener("selectionchange", typewriterHandler);
        typewriterHandler = null;
    }
    if (typewriterEnterHandler) {
        document.removeEventListener("keyup", typewriterEnterHandler, true);
        typewriterEnterHandler = null;
    }
};

// 初始化打字机模式模块
export const initTypewriterModeModule = () => {
    window.enableTypewriterMode = enableTypewriterMode;
    window.disableTypewriterMode = disableTypewriterMode;
    window.cleanupTypewriterMode = cleanupTypewriterMode;
};

// 清理打字机模式功能
export const cleanupTypewriterMode = () => {
    // 禁用打字机模式
    disableTypewriterMode();
    
    // 清理全局变量
    window.enableTypewriterMode = null;
    window.disableTypewriterMode = null;
    window.cleanupTypewriterMode = null;
};

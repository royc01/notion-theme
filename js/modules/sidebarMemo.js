// ========================================
// 模块：侧边栏备注功能
// ========================================

import { $, debounce, throttle } from './utils.js';
import { config } from './config.js';

let isEnabled = false, observers = {}, editorNode = null, dragTimeout = null, dragMutationObserver = null, connectionCleanup = null;

// 配置常量
const CONFIG = {
    SIDEBAR_WIDTH: 230,
    MARGIN: 10,
    EDITING_MARGIN: 5,
    MIN_INPUT_HEIGHT: 60,
    CONNECTION_OPACITY: 0.5,
    Z_INDEX_EDITING: 999
};

const autoResizeDiv = div => { 
    div.style.height = 'auto'; 
    div.style.height = (div.scrollHeight + 1) + 'px'; 
};

// 确保光标正确定位到最后一个字符后
const setCursorPositionToEnd = el => {
    const range = document.createRange();
    const selection = window.getSelection();
    
    // 清除现有选择
    selection.removeAllRanges();
    
    // 将光标定位到内容末尾
    if (el.lastChild) {
        range.setStartAfter(el.lastChild);
    } else {
        range.selectNodeContents(el);
        range.collapse(false);
    }
    
    selection.addRange(range);
    el.focus();
};

// 获取块节点
const getBlockNode = el => { 
    while (el && !el.dataset.nodeId) el = el.parentElement;
    return el && el.closest('[data-type="NodeBlockQueryEmbed"]')?.dataset.nodeId ? 
        el.closest('[data-type="NodeBlockQueryEmbed"]') : el;
};

// 检查块类型是否有效（用于行内备注）
const isValidBlockTypeForInlineMemo = block => {
    return block && ['NodeParagraph', 'NodeHeading'].includes(block.getAttribute('data-type'));
};

// 检查是否在嵌入块内
const isInsideEmbedBlock = blockEl => {
    return blockEl?.closest('[data-type="NodeBlockQueryEmbed"]');
};

// 获取备注内容的HTML格式
const getMemoContentHtml = memoItem => {
    return memoItem.querySelector('.memo-content-view')?.innerHTML.replace(/<br>/g, '\n') || '';
};

// 更新块元素的备注内容
const updateBlockMemoContent = (blockEl, oldContent, newContent) => {
    const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
    
    memoSpans.forEach(span => {
        if (span.getAttribute('data-inline-memo-content') === oldContent) {
            span.setAttribute('data-inline-memo-content', newContent);
        }
    });
    
    // 更新块内容
    return updateBlock(blockEl);
};

// 删除块元素中的备注
const removeBlockMemoContent = (blockEl, memoContent) => {
    const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
    
    memoSpans.forEach(span => {
        const content = span.getAttribute('data-inline-memo-content');
        // 只删除内容匹配的备注元素
        if (content === memoContent) {
            let types = (span.getAttribute("data-type") || "").split(" ").filter(t => t !== "inline-memo");
            if (types.length) { 
                span.setAttribute("data-type", types.join(" ")); 
                span.removeAttribute("data-inline-memo-content"); 
            } else { 
                span.outerHTML = span.innerHTML; 
            }
        }
    });
    
    // 更新块内容
    return updateBlock(blockEl);
};

// 统一的块更新函数
const updateBlock = (blockEl) => {
    return fetch('/api/block/updateBlock', { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ''}` 
        }, 
        body: JSON.stringify({ 
            dataType: 'html', 
            data: blockEl.outerHTML, 
            id: blockEl.dataset.nodeId 
        }) 
    });
};

// 高亮备注元素
const highlightMemoElements = (blockEl, memoContent) => {
    const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
    
    // 高亮所有相同内容的备注元素
    const targetSpans = memoSpans.filter(span => 
        span.getAttribute('data-inline-memo-content') === memoContent
    );
    
    targetSpans.forEach(span => span.classList.add('memo-span-highlight'));
    
    // 返回最后一个匹配的备注元素
    return targetSpans[targetSpans.length - 1];
};

// 创建备忘录连接线
const createMemoConnection = (memoDiv, memoSpan) => { 
    removeMemoConnection(); 
    if (!memoDiv || !memoSpan) return; 
    
    const container = document.createElement('div'); 
    container.id = 'memo-connection-container'; 
    container.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:998;will-change:transform;'; 
    container.innerHTML = `
        <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:${CONFIG.CONNECTION_OPACITY};">
            <path stroke="var(--Sv-dock-item--activefocus-background)" stroke-width="2" fill="none" stroke-dasharray="6,4" stroke-linecap="round">
                <animate attributeName="stroke-dashoffset" from="20" to="-20" dur="1.5s" repeatCount="indefinite"/>
            </path>
        </svg>`; 
    document.body.appendChild(container); 
    
    const path = container.querySelector('path'); 
    const updatePath = () => { 
        const a = memoDiv.getBoundingClientRect(), b = memoSpan.getBoundingClientRect(); 
        if (!a.width || !b.width) return; 
        const sx = b.right, sy = b.top + b.height / 2, ex = a.left - 6, ey = a.top + a.height / 2; 
        const o = Math.min(Math.abs(ex - sx) * 0.5, 200); 
        path.setAttribute('d', `M${sx} ${sy}C${sx + o} ${sy},${ex - o} ${ey},${ex} ${ey}`); 
    }; 
    
    updatePath(); 
    const onScroll = () => requestAnimationFrame(updatePath); 
    window.addEventListener('scroll', onScroll, true); 
    window.addEventListener('resize', onScroll); 
    
    connectionCleanup = () => { 
        window.removeEventListener('scroll', onScroll, true); 
        window.removeEventListener('resize', onScroll); 
        container.remove(); 
        connectionCleanup = null; 
    }; 
};

const removeMemoConnection = () => connectionCleanup?.();

// 判断某块及其所有父块是否有折叠
const isAnyAncestorFolded = block => {
    for (let current = block; current; current = current.parentElement) {
        if (current.getAttribute?.('fold') === '1') return true;
    }
    return false;
};

// 拖拽监听
const observeDragTitle = () => {
    if (dragMutationObserver) return;
    
    const setupObserver = () => {
        const dragEl = document.getElementById('drag');
        if (!dragEl) { 
            dragTimeout = setTimeout(setupObserver, 1000); 
            return; 
        }
        
        dragMutationObserver = new MutationObserver(refreshEditor);
        dragMutationObserver.observe(dragEl, { attributes: true, attributeFilter: ['title'] });
    };
    
    setupObserver();
};

const unobserveDragTitle = () => {
    dragMutationObserver?.disconnect(); 
    dragMutationObserver = null;
    dragTimeout && clearTimeout(dragTimeout); 
    dragTimeout = null;
};

// 刷新侧边栏备注位置
const refreshMemoOffset = (main, sidebar) => {
    requestAnimationFrame(() => {
        let lastBottom = 0;
        
        Array.from(sidebar.querySelectorAll('.memo-item'))
            .filter(item => item.style.display !== 'none')
            .forEach(memoItem => {
                const nodeId = memoItem.getAttribute('data-node-id');
                const memoType = memoItem.getAttribute('data-memo-type');
                
                const block = main.querySelector(`div[data-node-id="${nodeId}"]`);
                if (!block) return;
                
                // 行内备注只处理 NodeParagraph 和 NodeHeading 类型的节点
                const isValidBlockType = memoType === 'block' || isValidBlockTypeForInlineMemo(block);
                if (!isValidBlockType) return;
                
                let targetTop = 0;
                
                if (memoType === 'block') {
                    // 块备注：与块的顶部对齐
                    const blockRect = block.getBoundingClientRect();
                    const mainRect = main.getBoundingClientRect();
                    targetTop = blockRect.top - mainRect.top - (memoItem.offsetHeight / 2);
                } else {
                    // 行内备注：定位到第一个相关元素的位置
                    const blockRect = block.getBoundingClientRect();
                    const mainRect = main.getBoundingClientRect();
                    
                    // 获取所有行内备注元素
                    const memoSpans = Array.from(block.querySelectorAll('span[data-type*="inline-memo"]'));
                    // 使用innerHTML而不是textContent来正确处理换行符
                    const memoContent = getMemoContentHtml(memoItem);
                    
                    // 找到第一个包含相同备注内容的元素
                    const targetSpan = memoSpans.find(span => 
                        span.getAttribute('data-inline-memo-content') === memoContent
                    );
                    
                    targetTop = targetSpan ? 
                        targetSpan.getBoundingClientRect().top - mainRect.top + 
                        (targetSpan.getBoundingClientRect().height / 2) - (memoItem.offsetHeight / 2) :
                        blockRect.top - mainRect.top + blockRect.height / 2 - memoItem.offsetHeight / 2;
                }
                
                // 重叠检查 - 更智能的间距处理
                const isEditing = memoItem.classList.contains('editing');
                // 对于编辑中的项，使用更精确的位置计算
                if (isEditing) {
                    // 确保编辑项不会与前一项重叠，但也不要过度拉开距离
                    targetTop = Math.max(targetTop, lastBottom + CONFIG.EDITING_MARGIN); // 编辑时使用较小的间距
                } else {
                    // 对于非编辑项，保持正常的间距
                    targetTop = Math.max(targetTop, lastBottom + CONFIG.MARGIN);
                }
                
                memoItem.style.position = 'absolute';
                memoItem.style.top = `${targetTop}px`;
                memoItem.style.transition = 'top 0.3s cubic-bezier(0.4,0,0.2,1),transform 0.3s cubic-bezier(0.4,0,0.2,1)';
                
                lastBottom = targetTop + memoItem.offsetHeight;
            });
    });
};

// 添加侧边栏
const addSideBar = main => {
    const sidebar = main.parentElement.querySelector('#protyle-sidebar');
    const title = main.parentElement.querySelector('div.protyle-title');
    
    if (!sidebar && title) {
        const newSidebar = document.createElement('div'); 
        newSidebar.id = 'protyle-sidebar';
        title.insertAdjacentElement('beforeend', newSidebar);
        newSidebar.style.cssText = `position:absolute;right:-${CONFIG.SIDEBAR_WIDTH}px;width:${CONFIG.SIDEBAR_WIDTH}px;`; 
        main.style.minWidth = '90%';
        return newSidebar;
    }
    
    return sidebar;
};

// 处理备注编辑和保存
const handleMemoEdit = (memoDiv, el, main, sidebar) => {
    const memoType = memoDiv.getAttribute('data-memo-type');
    const isBlockMemo = memoType === 'block';
    
    // 获取旧值
    const old = isBlockMemo ? 
        (el.getAttribute('memo') || '') : 
        (memoDiv.querySelector('.memo-content-view')?.innerHTML.replace(/<br>/g, '\n') || '');
    
    const input = document.createElement('div');
    input.className = 'memo-edit-input';
    input.contentEditable = 'true';
    input.innerHTML = old.replace(/\n/g, '<br>');
    input.setAttribute('placeholder', '输入备注内容...');
    input.style.cssText = `width:100%;min-height:${CONFIG.MIN_INPUT_HEIGHT}px;padding:6px;border:1px solid var(--b3-theme-primary);border-radius:8px;font-size:0.8em;resize:vertical;box-sizing:border-box;overflow:auto;outline:none;white-space:pre-wrap;word-break:break-all;overflow-y:hidden;`;
    input.addEventListener('input', () => autoResizeDiv(input));
    
    const save = () => {
        // 保留原始HTML格式用于显示，同时提取纯文本用于比较
        const val = input.innerHTML.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<p>/gi, '\n').replace(/<\/p>/gi, '').replace(/&nbsp;/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
        const htmlVal = input.innerHTML;
        
        if (val !== old) {
            if (isBlockMemo) {
                // 块备注更新逻辑
                el.setAttribute('memo', val);
                updateBlock(el);
            } else {
                // 行内备注更新逻辑
                const nodeId = memoDiv.getAttribute('data-node-id');
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                
                if (blockEl) {
                    // 更新块备注内容
                    updateBlockMemoContent(blockEl, old, val);
                }
            }
        }
        
        const newDiv = document.createElement('div'); 
        newDiv.className = 'memo-content-view'; 
        newDiv.style.cssText = 'font-size:0.8em;margin-bottom:4px;cursor:pointer;';
        
        // 显示值设置 - 正确处理换行符
        const displayVal = htmlVal || '<span style="color:#bbb;">点击编辑备注...</span>';
        newDiv.innerHTML = displayVal;
        
        newDiv.onclick = (e) => {
            // 检查是否已经在编辑状态
            if (memoDiv.classList.contains('editing')) return;
            
            const { input: newInput, save: newSave } = handleMemoEdit(memoDiv, el, main, sidebar);
            newDiv.replaceWith(newInput);
            memoDiv.classList.add('editing');
            memoDiv.style.zIndex = `${CONFIG.Z_INDEX_EDITING}`;
            newInput.focus();
            setCursorPositionToEnd(newInput);
            requestAnimationFrame(() => {
                autoResizeDiv(newInput);
                refreshMemoOffset(main, sidebar);
            });
        };
        
        input.replaceWith(newDiv);
        memoDiv.classList.remove('editing'); 
        memoDiv.style.zIndex = '';
        refreshMemoOffset(main, sidebar);
    };
    
    // 设置输入框事件
    input.onblur = () => setTimeout(() => { 
        if (document.activeElement !== input) save(); 
    }, 100);
    
    input.onkeydown = e => { 
        if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') { 
            e.preventDefault(); 
            save(); 
        } else if (e.key === 'a' && e.ctrlKey) { 
            e.preventDefault(); 
            const range = document.createRange(); 
            range.selectNodeContents(input); 
            const selection = window.getSelection(); 
            selection.removeAllRanges(); 
            selection.addRange(range); 
        }
    };
    
    input.addEventListener('paste', e => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text');
        text && document.execCommand('insertText', false, text);
    }, true);
    
    autoResizeDiv(input); 
    return { input, save };
};

// 刷新侧边栏备注
const refreshSideBarMemos = (main, sidebar) => {
    // 清除之前的内容
    sidebar.innerHTML = ''; 
    const frag = document.createDocumentFragment();
    
    const isReadonly = main.getAttribute?.('data-readonly') === 'true';
    let visibleMemoCount = 0;
    
    // 使用Set来避免重复的块ID
    const processedBlocks = new Set();
    
    // 提前检查当前启用的模式
    const isBlockMemoMode = document.documentElement.hasAttribute('savor-sidebar-block-memo');
    
    // 获取所有块
    const allBlocks = Array.from(main.querySelectorAll('[data-node-id]'));
    
    // 创建块顺序映射
    const blockOrderMap = new Map();
    allBlocks.forEach((block, index) => {
        blockOrderMap.set(block.dataset.nodeId, index);
    });
    
    const allMemos = [];
    
    allBlocks.forEach(block => {
        const blockId = block.dataset.nodeId;
        // 避免重复处理
        if (processedBlocks.has(blockId)) return;
        processedBlocks.add(blockId);
        
        // 添加块备注
        if (block.hasAttribute('memo')) {
            allMemos.push({
                element: block,
                type: 'block',
                content: block.getAttribute('memo') || '',
                text: '<svg width="14" height="14"><use xlink:href="#iconM"></use></svg> ',
                blockId: blockId,
                elements: [],
                index: -1,
                blockOrder: blockOrderMap.get(blockId)
            });
        }
        
        // 收集行内备注
        if (!isBlockMemoMode) {
            // 行内备注只处理 NodeParagraph 和 NodeHeading 类型的节点
            const isValidBlockType = isValidBlockTypeForInlineMemo(block);
            if (isValidBlockType) {
                // 收集块内的行内备注
                const inlineMemos = block.querySelectorAll('span[data-type*="inline-memo"]');
                const memoGroups = [];
                
                for (let i = 0; i < inlineMemos.length; i++) {
                    const el = inlineMemos[i];
                    const memoContent = el.getAttribute('data-inline-memo-content') || '';
                    const memoText = el.textContent || '';
                    
                    // 检查是否与前一个元素相邻且内容相同
                    let isAdjacentAndSame = false;
                    if (memoGroups.length > 0) {
                        const lastGroup = memoGroups[memoGroups.length - 1];
                        const lastElement = lastGroup.elements[lastGroup.elements.length - 1].element;
                        
                        // 检查是否相邻
                        let nextSibling = lastElement.nextSibling;
                        while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent.trim() === '') {
                            nextSibling = nextSibling.nextSibling;
                        }
                        
                        if (nextSibling === el && lastGroup.content === memoContent) {
                            isAdjacentAndSame = true;
                        }
                    }
                    
                    if (isAdjacentAndSame) {
                        // 添加到当前组
                        const currentGroup = memoGroups[memoGroups.length - 1];
                        currentGroup.elements.push({
                            element: el,
                            index: i
                        });
                        
                        // 避免重复文本
                        if (!currentGroup.texts.includes(memoText)) {
                            currentGroup.texts.push(memoText);
                        }
                    } else {
                        // 创建新组
                        memoGroups.push({
                            elements: [{
                                element: el,
                                index: i
                            }],
                            texts: [memoText],
                            content: memoContent
                        });
                    }
                }
                
                // 处理每个分组
                memoGroups.forEach(group => {
                    const memoBlock = getBlockNode(group.elements[0].element);
                    const memoBlockId = memoBlock?.dataset.nodeId || blockId;
                    const combinedText = group.texts.join('');
                    
                    allMemos.push({
                        elements: group.elements,
                        element: group.elements[0].element,
                        type: 'inline',
                        content: group.content,
                        text: combinedText,
                        blockId: blockId,
                        blockOrder: blockOrderMap.get(memoBlockId)
                    });
                });
            }
        }
    });
    
    // 按块顺序排序
    allMemos.sort((a, b) => a.blockOrder - b.blockOrder);
    
    // 如果没有备注，直接返回
    if (allMemos.length === 0) { 
        sidebar.removeAttribute('data-memo-count'); 
        
        // 修复：即使没有备注也要确保清除 Sv-memo 类
        const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
        if (protyleContent) {
            protyleContent.classList.remove('Sv-memo');
        }
        
        return; 
    }
    
    // 计算块折叠状态
    const blockFoldStates = new Map();
    allMemos.forEach(memoData => {
        if (!blockFoldStates.has(memoData.blockId)) {
            const block = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
            blockFoldStates.set(memoData.blockId, block && isAnyAncestorFolded(block));
        }
    });
    
    // 显示备注
    allMemos.forEach(memoData => {
        const block = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
        // 如果块不存在，跳过
        if (!block) return;
        
        const isBlockFolded = blockFoldStates.get(memoData.blockId) || false;
        const { content: memo, text } = memoData;
        
        const memoDiv = document.createElement('div');
        memoDiv.className = 'memo-item';
        memoDiv.setAttribute('data-node-id', memoData.blockId);
        memoDiv.setAttribute('data-memo-index', memoData.type === 'inline' ? (memoData.elements?.[0]?.index || -1) : -1);
        memoDiv.setAttribute('data-memo-type', memoData.type);
        
        // 存储元素数量
        memoData.type === 'inline' && memoDiv.setAttribute('data-memo-element-count', memoData.elements?.length || 1);
        
        memoDiv.style.cssText = 'margin:0px 0px 8px 16px;padding:8px;border-radius:8px;position:relative;width:220px;box-shadow:rgba(0, 0, 0, 0.03) 0px 12px 20px, var(--b3-border-color) 0px 0px 0px 1px inset;';
        
        // 显示/隐藏逻辑
        memoDiv.style.display = isBlockFolded ? 'none' : '';
        !isBlockFolded && visibleMemoCount++;
        
        const formattedDisplayText = text;
        
        const memoContentStyle = isReadonly ? 'cursor:auto;' : 'cursor:pointer;';
        memoDiv.innerHTML = `<div class="memo-title-with-dot" style="font-weight:bold;margin-bottom:4px;font-size:0.9em;display:flex;"><span class="memo-title-dot"></span>${formattedDisplayText}</div><div class="memo-content-view" style="${memoContentStyle}font-size:0.8em;margin-bottom:4px;">${memo ? memo.replace(/\n/g, '<br>') : '<span style="color:#bbb;">点击编辑备注...</span>'}</div>`;
        
        const titleDiv = memoDiv.querySelector('.memo-title-with-dot');
        // 创建删除按钮
        if (titleDiv && !isReadonly) {
            // 检查是否在嵌入块内
            const blockEl = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
            const isInsideEmbedBlockResult = isInsideEmbedBlock(blockEl);
            
            // 如果不在嵌入块内，才显示删除按钮
            if (!isInsideEmbedBlockResult) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = `<svg class="b3-menu__icon" style="vertical-align:middle;"><use xlink:href="#iconTrashcan"></use></svg>`;
                deleteBtn.style.cssText = 'position:absolute;top:6px;right:6px;padding:0;border:none;border-radius:6px;cursor:pointer;z-index:2;';
                deleteBtn.setAttribute('data-action', 'delete'); 
                titleDiv.appendChild(deleteBtn);
            }
        }
        
        const memoContentDiv = memoDiv.querySelector('.memo-content-view');
        if (!isReadonly) {
            memoContentDiv.onclick = (e) => {
                e.stopPropagation();
                if (memoDiv.classList.contains('editing')) return;
                
                const nodeId = memoData.blockId;
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                
                // 检查是否在嵌入块内
                const isInsideEmbedBlockResult = isInsideEmbedBlock(blockEl);
                
                // 如果在嵌入块内，禁止编辑
                if (isInsideEmbedBlockResult) return;
                
                if (blockEl) {
                    // 行内备注只处理 NodeParagraph 和 NodeHeading 类型的节点
                    const isValidBlockType = memoData.type === 'block' || isValidBlockTypeForInlineMemo(blockEl);
                    if (isValidBlockType) {
                        // 获取目标元素
                        let targetElement = memoData.element;
                        if (memoData.type === 'inline' && memoData.elements?.length > 0) {
                            targetElement = memoData.elements[0].element;
                        }
                        
                        const { input, save } = handleMemoEdit(memoDiv, targetElement, main, sidebar);
                        memoContentDiv.replaceWith(input);
                        memoDiv.classList.add('editing');
                        memoDiv.style.zIndex = `${CONFIG.Z_INDEX_EDITING}`;
                        input.focus();
                        setCursorPositionToEnd(input);
                        requestAnimationFrame(() => {
                            autoResizeDiv(input);
                            refreshMemoOffset(main, sidebar);
                        });
                    }
                }
            };
        }
        
        frag.appendChild(memoDiv);
    });
    
    sidebar.setAttribute('data-memo-count', `共 ${visibleMemoCount} 个备注`); 
    sidebar.appendChild(frag);

    // 事件委托
    if (!sidebar._delegated) {
        const handleMouseInteraction = (e, isEnter) => {
            const item = e.target.closest('.memo-item');
            if (!item || !sidebar.contains(item)) return; 
            const rt = e.relatedTarget;
            if (rt && item.contains(rt)) return;
            
            if (isEnter) {
                const nodeId = item.getAttribute('data-node-id');
                const memoType = item.getAttribute('data-memo-type');
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                
                // 检查是否在嵌入块内
                const isInsideEmbedBlock = blockEl?.closest('[data-type="NodeBlockQueryEmbed"]');
                
                if (blockEl) {
                    // 行内备注只处理 NodeParagraph 和 NodeHeading 类型的节点
                    const isValidBlockType = memoType === 'block' || isValidBlockTypeForInlineMemo(blockEl);
                    if (!isValidBlockType) return;
                    
                    if (memoType === 'block') {
                        blockEl.classList.add('memo-span-highlight');
                        createMemoConnection(item, blockEl);
                    } else {
                        // 高亮备注元素
                        const memoContent = getMemoContentHtml(item);
                        const targetSpan = highlightMemoElements(blockEl, memoContent);
                        
                        targetSpan && createMemoConnection(item, targetSpan);
                    }
                }
            } else {
                removeMemoConnection();
                main.querySelectorAll('.memo-span-highlight').forEach(el => el.classList.remove('memo-span-highlight'));
            }
        };
        
        // 鼠标事件处理
        ['mouseover', 'mouseout'].forEach(eventType => {
            sidebar.addEventListener(eventType, e => handleMouseInteraction(e, eventType === 'mouseover'));
        });
        
        // 点击事件处理
        sidebar.addEventListener('click', e => {
            const btn = e.target.closest('button[data-action="delete"]');
            if (!btn) return; 
            const item = btn.closest('.memo-item'); 
            if (!item) return;
            e.stopPropagation();
            
            const nodeId = item.getAttribute('data-node-id');
            const memoType = item.getAttribute('data-memo-type');
            const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
            
            // 检查是否在嵌入块内
            const isInsideEmbedBlockResult = isInsideEmbedBlock(blockEl);
            
            // 如果在嵌入块内，禁止删除
            if (isInsideEmbedBlockResult) return;
            
            item.remove(); 
            removeMemoConnection();
            // 确保connectionCleanup被重置
            connectionCleanup = null;
            
            if (blockEl) {
                // 行内备注只处理 NodeParagraph 和 NodeHeading 类型的节点
                const isValidBlockType = memoType === 'block' || isValidBlockTypeForInlineMemo(blockEl);
                
                if (isValidBlockType) {
                    if (memoType === 'block') {
                        blockEl.removeAttribute('memo');
                    } else {
                        // 删除当前合并项中包含的行内备注
                        const memoContent = getMemoContentHtml(item);
                        removeBlockMemoContent(blockEl, memoContent);
                    }
                    
                    updateBlock(blockEl);
                }
            }
        });
        
        sidebar._delegated = true;
    }
    
    refreshMemoOffset(main, sidebar);
    const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
    // 修复：无论是否有可见备注，都应该正确设置 Sv-memo 类
    if (protyleContent) {
        if (visibleMemoCount > 0) {
            protyleContent.classList.add('Sv-memo');
        } else {
            protyleContent.classList.remove('Sv-memo');
        }
    }
};

// 更新内联备注到思源
const updateInlineMemo = async (el, content) => {
    try {
        const blockEl = getBlockNode(el);
        if (!blockEl?.dataset.nodeId) return;
        el.setAttribute('data-inline-memo-content', content);
        await fetch('/api/block/updateBlock', { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ''}` 
            }, 
            body: JSON.stringify({ 
                dataType: 'html', 
                data: blockEl.outerHTML, 
                id: blockEl.dataset.nodeId 
            }) 
        });
    } catch (e) {
        // 更新备注出错: e 
    }
};

// 刷新编辑器
const refreshEditor = () => {
    if (!editorNode) return;
    Object.values(observers).flat().forEach(o => o.disconnect()); 
    observers = {};
    
    editorNode.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
        let sidebar = main.parentElement.querySelector('#protyle-sidebar');
        if (!sidebar && isEnabled) sidebar = addSideBar(main); 
        if (!sidebar) return;
        
        const mainId = main.parentElement.parentElement.getAttribute('data-id');
        let refreshTimer = null;
        
        const observer = new MutationObserver(() => {
            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => {
                if (isEnabled) refreshSideBarMemos(main, sidebar);
                refreshMemoOffset(main, sidebar);
            }, 100);
        });
        
        observer.observe(main, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['data-inline-memo-content', 'data-readonly', 'fold', 'memo'] 
        });
        
        observers[mainId] = [observer]; 
        refreshSideBarMemos(main, sidebar);
        
        const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
        if (protyleContent?._sidebarMemoScrollBinded === undefined) {
            let scheduled = false;
            const onScroll = () => {
                if (scheduled) return; 
                scheduled = true;
                requestAnimationFrame(() => { 
                    refreshMemoOffset(main, sidebar); 
                    scheduled = false; 
                });
            };
            
            protyleContent.addEventListener('scroll', onScroll, { passive: true });
            protyleContent._sidebarMemoScrollBinded = true;
        }
    });
    
    // 修复：在全局范围内检查并清除没有备注的文档的 Sv-memo 类
    document.querySelectorAll('.protyle-content').forEach(pc => {
        const main = pc.closest('.protyle')?.querySelector('.protyle-wysiwyg');
        // 增强检查逻辑：不仅检查是否有备注元素，还要检查侧边栏是否为空
        if (main) {
            const sidebar = main.parentElement.querySelector('#protyle-sidebar');
            // 如果侧边栏存在但为空，或者完全没有备注元素，则移除 Sv-memo 类
            if ((sidebar && (!sidebar.querySelector('.memo-item') || sidebar.children.length === 0)) || 
                (!main.querySelector('span[data-type*="inline-memo"]') && !main.querySelector('[memo]'))) { 
                pc.classList.remove('Sv-memo'); 
            }
        }
    });
};

// 开关侧边栏
const openSideBar = (open, save = false) => {
    if (isEnabled === open) return;
    
    if (!editorNode && open) {
        const wait = () => {
            editorNode = document.querySelector('div.layout__center');
            editorNode ? openSideBar(open, save) : setTimeout(wait, 100);
        };
        wait();
        return;
    }
    
    isEnabled = open;
    
    if (open) {
        window.siyuan?.eventBus?.on('loaded-protyle', refreshEditor);
        refreshEditor(); 
        observeDragTitle();
    } else {
        window.siyuan?.eventBus?.off('loaded-protyle', refreshEditor);
        Object.values(observers).flat().forEach(o => o.disconnect()); 
        observers = {};
        
        editorNode?.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
            main.parentElement.querySelector('#protyle-sidebar')?.remove();
            const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
            protyleContent?.classList.remove('Sv-memo');
        });
        
        unobserveDragTitle();
    }
    
    save && config.set('sidebarMemoEnabled', open ? '1' : '0');
};

const init = () => {
    editorNode = document.querySelector('div.layout__center');
    const shouldEnable = document.documentElement.hasAttribute('savor-sidebar-memo') || 
                        document.documentElement.hasAttribute('savor-sidebar-block-memo');
    openSideBar(shouldEnable, true);
};

// 清理函数
const cleanupSidebarMemo = () => {
    try {
        openSideBar(false);
    } catch (e) {
        // 关闭侧边栏失败: e
    }
    
    dragMutationObserver?.disconnect();
    dragMutationObserver = null;
    
    dragTimeout && clearTimeout(dragTimeout);
    dragTimeout = null;
    
    removeMemoConnection();
    
    isEnabled = false;
    observers = {};
    editorNode = null;
    connectionCleanup = null;
    
    document.getElementById('sb-resizer-styles')?.remove();
    
    document.querySelectorAll('.protyle-content.Sv-memo').forEach(el => {
        el.classList.remove('Sv-memo');
    });
};

// 初始化侧边栏备注模块
export const initSidebarMemoModule = () => {
    window.sidebarMemo = {
        init,
        openSideBar,
        isEnabled: () => isEnabled,
        setEnabled: enabled => openSideBar(enabled, true),
        unobserveDragTitle
    };
    window.cleanupSidebarMemo = cleanupSidebarMemo;
    init();
};

export { cleanupSidebarMemo };

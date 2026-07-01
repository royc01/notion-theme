// ========================================
// 模块：侧边栏备注功能
// ========================================

import { config } from './config.js';

let isEnabled = false, observerCleanups = [], editorNode = null, dragTimeout = null, dragMutationObserver = null, connectionCleanup = null, activeConnectionItem = null;
const scrollBindings = new Map();

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

// 获取备注内容的 HTML 格式
const getMemoContentHtml = memoItem => {
    return memoItem.querySelector('.memo-content-view')?.innerHTML.replace(/<br>/g, '\n') || '';
};

// 获取行内备注定位信息
const getInlineMemoLocator = memoRef => {
    const isElement = memoRef instanceof Element;
    const rawIndex = isElement ? memoRef.getAttribute('data-memo-index') : memoRef?.index;
    const rawCount = isElement ? memoRef.getAttribute('data-memo-element-count') : (memoRef?.elements?.length ?? memoRef?.elementCount);
    const index = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : -1;
    const elementCount = Math.max(1, Number.isFinite(Number(rawCount)) ? Number(rawCount) : 1);
    const content = typeof memoRef === 'string' ? memoRef : (isElement ? getMemoContentHtml(memoRef) : (memoRef?.content || ''));
    return { index, elementCount, content };
};

// 根据定位信息获取行内备注元素
const getInlineMemoSpans = (blockEl, memoRef) => {
    const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
    const { index, elementCount, content } = getInlineMemoLocator(memoRef);
    if (index >= 0) {
        const targetSpans = memoSpans.slice(index, index + elementCount);
        if (targetSpans.length && (!content || targetSpans[0].getAttribute('data-inline-memo-content') === content)) {
            return targetSpans;
        }
    }
    return memoSpans.filter(span => span.getAttribute('data-inline-memo-content') === content).slice(0, elementCount);
};

// 绑定编辑区滚动同步
const bindSidebarScroll = (protyleContent, callback) => {
    if (!protyleContent) return;
    const existingBinding = scrollBindings.get(protyleContent);
    if (existingBinding) {
        existingBinding.callback = callback;
        return;
    }

    let scheduled = false;
    const binding = {
        callback,
        onScroll: null
    };

    binding.onScroll = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            binding.callback?.();
            scheduled = false;
        });
    };

    protyleContent.addEventListener('scroll', binding.onScroll, { passive: true });
    scrollBindings.set(protyleContent, binding);
};

// 清理所有滚动绑定
const unbindAllSidebarScroll = () => {
    scrollBindings.forEach((binding, protyleContent) => {
        protyleContent.removeEventListener('scroll', binding.onScroll);
    });
    scrollBindings.clear();
};

// 恢复编辑区最小宽度
const restoreMainMinWidth = main => {
    if (!main) return;
    if (main.dataset.sidebarMemoPrevMinWidth !== undefined) {
        if (main.dataset.sidebarMemoPrevMinWidth) {
            main.style.minWidth = main.dataset.sidebarMemoPrevMinWidth;
        } else {
            main.style.removeProperty('min-width');
        }
        delete main.dataset.sidebarMemoPrevMinWidth;
        return;
    }
    main.style.removeProperty('min-width');
};

const cleanupObservers = () => {
    observerCleanups.forEach(cleanup => cleanup?.());
    observerCleanups = [];
};

// 持久化块更新
const persistBlockUpdate = async (blockEl) => {
    try {
        const response = await fetch('/api/block/updateBlock', {
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
        if (!response.ok) return false;
        const result = await response.json().catch(() => null);
        return typeof result?.code === 'number' ? result.code === 0 : true;
    } catch (e) {
        return false;
    }
};

const updateInlineMemoGroup = async (blockEl, memoRef, newContent) => {
    const targetSpans = getInlineMemoSpans(blockEl, memoRef);
    if (!targetSpans.length) return false;

    const previousContents = targetSpans.map(span => span.getAttribute('data-inline-memo-content') || '');
    targetSpans.forEach(span => {
        span.setAttribute('data-inline-memo-content', newContent);
    });

    const updated = await persistBlockUpdate(blockEl);
    if (updated) return true;

    targetSpans.forEach((span, index) => {
        span.setAttribute('data-inline-memo-content', previousContents[index]);
    });
    return false;
};

const removeInlineMemoGroup = async (blockEl, memoRef) => {
    const targetSpans = getInlineMemoSpans(blockEl, memoRef);
    if (!targetSpans.length) return false;

    const previousStates = targetSpans.map(span => ({
        dataType: span.getAttribute('data-type'),
        memoContent: span.getAttribute('data-inline-memo-content')
    }));

    targetSpans.forEach(span => {
        const types = (span.getAttribute('data-type') || '').split(' ').filter(t => t && t !== 'inline-memo');
        if (types.length) {
            span.setAttribute('data-type', types.join(' '));
        } else {
            span.removeAttribute('data-type');
        }
        span.removeAttribute('data-inline-memo-content');
    });

    const updated = await persistBlockUpdate(blockEl);
    if (updated) return true;

    targetSpans.forEach((span, index) => {
        const previousState = previousStates[index];
        if (previousState.dataType) {
            span.setAttribute('data-type', previousState.dataType);
        } else {
            span.removeAttribute('data-type');
        }
        if (previousState.memoContent !== null) {
            span.setAttribute('data-inline-memo-content', previousState.memoContent);
        } else {
            span.removeAttribute('data-inline-memo-content');
        }
    });
    return false;
};

// 高亮同组行内备注
const highlightInlineMemoGroup = (blockEl, memoRef) => {
    const targetSpans = getInlineMemoSpans(blockEl, memoRef);
    targetSpans.forEach(span => span.classList.add('memo-span-highlight'));
    return targetSpans[targetSpans.length - 1];
};

// 创建备注连线
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
    let settleRafId = null;
    let settleUntil = 0;
    const updatePath = () => { 
        const a = memoDiv.getBoundingClientRect(), b = memoSpan.getBoundingClientRect(); 
        if (!a.width || !b.width) return; 
        const sx = b.right, sy = b.top + b.height / 2, ex = a.left - 6, ey = a.top + a.height / 2; 
        const o = Math.min(Math.abs(ex - sx) * 0.5, 200); 
        path.setAttribute('d', `M${sx} ${sy}C${sx + o} ${sy},${ex - o} ${ey},${ex} ${ey}`); 
    }; 
    const scheduleSettledUpdates = (duration = 360) => {
        settleUntil = Math.max(settleUntil, performance.now() + duration);
        if (settleRafId) return;
        const tick = () => {
            updatePath();
            if (performance.now() < settleUntil) {
                settleRafId = requestAnimationFrame(tick);
            } else {
                settleRafId = null;
            }
        };
        settleRafId = requestAnimationFrame(tick);
    };
    const onTransitionEvent = e => {
        if (e.target !== memoDiv) return;
        if (e.propertyName === 'transform' || e.propertyName === 'top') {
            scheduleSettledUpdates();
        }
    };

    updatePath(); 
    scheduleSettledUpdates();
    const onScroll = () => requestAnimationFrame(updatePath); 
    window.addEventListener('scroll', onScroll, true); 
    window.addEventListener('resize', onScroll); 
    memoDiv.addEventListener('transitionrun', onTransitionEvent);
    memoDiv.addEventListener('transitionstart', onTransitionEvent);
    memoDiv.addEventListener('transitionend', onTransitionEvent);
    
    connectionCleanup = () => { 
        if (settleRafId) {
            cancelAnimationFrame(settleRafId);
            settleRafId = null;
        }
        window.removeEventListener('scroll', onScroll, true); 
        window.removeEventListener('resize', onScroll); 
        memoDiv.removeEventListener('transitionrun', onTransitionEvent);
        memoDiv.removeEventListener('transitionstart', onTransitionEvent);
        memoDiv.removeEventListener('transitionend', onTransitionEvent);
        container.remove(); 
        connectionCleanup = null; 
    }; 
};

// 移除备注连线
const removeMemoConnection = () => {
    activeConnectionItem = null;
    connectionCleanup?.();
};

// 判断某块及其父块是否折叠
const isAnyAncestorFolded = block => {
    for (let current = block; current; current = current.parentElement) {
        if (current.getAttribute?.('fold') === '1') return true;
    }
    return false;
};

// 监听拖拽标题变化
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
                
                // 行内备注只处理 NodeParagraph 和 NodeHeading
                const isValidBlockType = memoType === 'block' || isValidBlockTypeForInlineMemo(block);
                if (!isValidBlockType) return;
                
                let targetTop = 0;
                
                if (memoType === 'block') {
                    // 块备注与块顶部对齐
                    const blockRect = block.getBoundingClientRect();
                    const mainRect = main.getBoundingClientRect();
                    targetTop = blockRect.top - mainRect.top - (memoItem.offsetHeight / 2);
                } else {
                    // 行内备注定位到同组最后一个元素
                    const blockRect = block.getBoundingClientRect();
                    const mainRect = main.getBoundingClientRect();
                    
                    const targetSpans = getInlineMemoSpans(block, memoItem);
                    const targetSpan = targetSpans[targetSpans.length - 1];
                    
                    targetTop = targetSpan ? 
                        targetSpan.getBoundingClientRect().top - mainRect.top + 
                        (targetSpan.getBoundingClientRect().height / 2) - (memoItem.offsetHeight / 2) :
                        blockRect.top - mainRect.top + blockRect.height / 2 - memoItem.offsetHeight / 2;
                }
                
                // 处理备注项重叠
                const isEditing = memoItem.classList.contains('editing');
                if (isEditing) {
                    // 编辑态使用更紧凑的间距
                    targetTop = Math.max(targetTop, lastBottom + CONFIG.EDITING_MARGIN);
                } else {
                    // 非编辑态保持正常间距
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
        if (main.dataset.sidebarMemoPrevMinWidth === undefined) {
            main.dataset.sidebarMemoPrevMinWidth = main.style.minWidth || '';
        }
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
    
    const save = async () => {
        const normalizedValue = input.innerHTML.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<p>/gi, '\n').replace(/<\/p>/gi, '').replace(/&nbsp;/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
        let saved = true;

        if (normalizedValue !== old) {
            if (isBlockMemo) {
                const previousMemo = el.getAttribute('memo');
                el.setAttribute('memo', normalizedValue);
                saved = await persistBlockUpdate(el);
                if (!saved) {
                    if (previousMemo === null) {
                        el.removeAttribute('memo');
                    } else {
                        el.setAttribute('memo', previousMemo);
                    }
                }
            } else {
                const nodeId = memoDiv.getAttribute('data-node-id');
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                saved = blockEl ? await updateInlineMemoGroup(blockEl, memoDiv, normalizedValue) : false;
            }
        }

        memoDiv.classList.remove('editing');
        memoDiv.style.zIndex = '';
        refreshSideBarMemos(main, sidebar);
        if (!saved) {
            refreshMemoOffset(main, sidebar);
        }
    };
    
    // 失焦或快捷键时保存
    input.onblur = () => setTimeout(() => { 
        if (document.activeElement !== input) void save(); 
    }, 100);
    
    input.onkeydown = e => { 
        if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') { 
            e.preventDefault(); 
            void save(); 
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
    return input;
};

const collectSidebarMemoState = main => {
    const isReadonly = main.getAttribute?.('data-readonly') === 'true';

    // 使用 Set 去重块 ID
    const processedBlocks = new Set();
    
    // 是否仅显示块备注
    const isBlockMemoMode = document.documentElement.hasAttribute('savor-sidebar-block-memo');
    
    // 获取当前编辑区所有块
    const allBlocks = Array.from(main.querySelectorAll('[data-node-id]'));
    
    // 建立块顺序映射
    const blockOrderMap = new Map();
    allBlocks.forEach((block, index) => {
        blockOrderMap.set(block.dataset.nodeId, index);
    });
    
    const allMemos = [];
    
    allBlocks.forEach(block => {
        const blockId = block.dataset.nodeId;
        // 跳过重复块
        if (processedBlocks.has(blockId)) return;
        processedBlocks.add(blockId);
        
        // 收集块备注
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
            // 行内备注只处理 NodeParagraph 和 NodeHeading
            const isValidBlockType = isValidBlockTypeForInlineMemo(block);
            if (isValidBlockType) {
                // 收集当前块里的行内备注
                const inlineMemos = block.querySelectorAll('span[data-type*="inline-memo"]');
                const memoGroups = [];
                
                for (let i = 0; i < inlineMemos.length; i++) {
                    const el = inlineMemos[i];
                    const memoContent = el.getAttribute('data-inline-memo-content') || '';
                    const memoText = el.textContent || '';
                    
                    // 合并相邻且内容相同的行内备注
                    let isAdjacentAndSame = false;
                    if (memoGroups.length > 0) {
                        const lastGroup = memoGroups[memoGroups.length - 1];
                        const lastElement = lastGroup.elements[lastGroup.elements.length - 1].element;
                        
                        // 检查是否紧邻
                        let nextSibling = lastElement.nextSibling;
                        while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent.trim() === '') {
                            nextSibling = nextSibling.nextSibling;
                        }
                        
                        if (nextSibling === el && lastGroup.content === memoContent) {
                            isAdjacentAndSame = true;
                        }
                    }
                    
                    if (isAdjacentAndSame) {
                        // 合并到当前组
                        const currentGroup = memoGroups[memoGroups.length - 1];
                        currentGroup.elements.push({
                            element: el,
                            index: i
                        });
                        
                        // 记录展示文本
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
                
                // 写入分组后的行内备注
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

    // 计算块折叠状态
    const blockFoldStates = new Map();
    allMemos.forEach(memoData => {
        if (!blockFoldStates.has(memoData.blockId)) {
            const block = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
            blockFoldStates.set(memoData.blockId, block && isAnyAncestorFolded(block));
        }
    });

    const visibleMemoCount = allMemos.reduce((count, memoData) => {
        return count + (blockFoldStates.get(memoData.blockId) ? 0 : 1);
    }, 0);

    const signature = JSON.stringify({
        isReadonly,
        isBlockMemoMode,
        memos: allMemos.map(memoData => ({
            blockId: memoData.blockId,
            type: memoData.type,
            content: memoData.content,
            text: memoData.text,
            blockOrder: memoData.blockOrder,
            index: memoData.elements?.[0]?.index ?? memoData.index ?? -1,
            elementCount: memoData.elements?.length || 0,
            folded: Boolean(blockFoldStates.get(memoData.blockId))
        }))
    });

    return {
        allMemos,
        blockFoldStates,
        isReadonly,
        signature,
        visibleMemoCount
    };
};

// 刷新侧边栏备注
const refreshSideBarMemos = (main, sidebar, memoState = null) => {
    // 重建侧边栏内容
    sidebar.innerHTML = ''; 
    const frag = document.createDocumentFragment();

    const {
        allMemos,
        blockFoldStates,
        isReadonly,
        signature,
        visibleMemoCount
    } = memoState || collectSidebarMemoState(main);
    
    // 没有备注时清理状态并返回
    if (allMemos.length === 0) { 
        sidebar.dataset.memoSignature = signature;
        sidebar.removeAttribute('data-memo-count'); 
        
        // 即使没有备注也要移除 Sv-memo 类
        const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
        if (protyleContent) {
            protyleContent.classList.remove('Sv-memo');
        }
        
        return; 
    }

    sidebar.dataset.memoSignature = signature;

    // 清理高亮和连线
    const clearMemoHighlights = () => {
        removeMemoConnection();
        main.querySelectorAll('.memo-span-highlight').forEach(el => el.classList.remove('memo-span-highlight'));
    };

    // 处理悬停进入
    const handleMemoEnter = item => {
        if (item === activeConnectionItem) return;
        clearMemoHighlights();

        const nodeId = item.getAttribute('data-node-id');
        const memoType = item.getAttribute('data-memo-type');
        const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
        if (!blockEl) return;

        const isValidBlockType = memoType === 'block' || isValidBlockTypeForInlineMemo(blockEl);
        if (!isValidBlockType) return;

        if (memoType === 'block') {
            activeConnectionItem = item;
            blockEl.classList.add('memo-span-highlight');
            createMemoConnection(item, blockEl);
            return;
        }

        const targetSpan = highlightInlineMemoGroup(blockEl, item);
        if (targetSpan) {
            activeConnectionItem = item;
            createMemoConnection(item, targetSpan);
        }
    };
    
    // 渲染备注项
    allMemos.forEach(memoData => {
        const block = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
        if (!block) return;
        
        const isBlockFolded = blockFoldStates.get(memoData.blockId) || false;
        const { content: memo, text } = memoData;
        
        const memoDiv = document.createElement('div');
        memoDiv.className = 'memo-item';
        memoDiv.setAttribute('data-node-id', memoData.blockId);
        memoDiv.setAttribute('data-memo-index', memoData.type === 'inline' ? (memoData.elements?.[0]?.index ?? -1) : -1);
        memoDiv.setAttribute('data-memo-type', memoData.type);
        
        // 记录合并元素数量
        memoData.type === 'inline' && memoDiv.setAttribute('data-memo-element-count', memoData.elements?.length || 1);
        
        memoDiv.style.cssText = 'margin:0px 0px 8px 16px;padding:8px;border-radius:8px;position:relative;width:220px;box-shadow:rgba(0, 0, 0, 0.03) 0px 12px 20px, var(--b3-border-color) 0px 0px 0px 1px inset;';
        
        // 折叠块内的备注默认隐藏
        memoDiv.style.display = isBlockFolded ? 'none' : '';
        
        const formattedDisplayText = text;
        
        const memoContentStyle = isReadonly ? 'cursor:auto;' : 'cursor:pointer;';
        memoDiv.innerHTML = `<div class="memo-title-with-dot" style="font-weight:bold;margin-bottom:4px;font-size:0.9em;display:flex;"><span class="memo-title-dot"></span>${formattedDisplayText}</div><div class="memo-content-view" style="${memoContentStyle}font-size:0.8em;margin-bottom:4px;">${memo ? memo.replace(/\n/g, '<br>') : '<span style="color:#bbb;">点击编辑备注...</span>'}</div>`;
        
        const titleDiv = memoDiv.querySelector('.memo-title-with-dot');
        // 创建删除按钮
        if (titleDiv && !isReadonly) {
            const blockEl = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
            const isInsideEmbedBlockResult = isInsideEmbedBlock(blockEl);
            
            // 嵌入块内不显示删除按钮
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
                
                const isInsideEmbedBlockResult = isInsideEmbedBlock(blockEl);
                
                // 嵌入块内不允许编辑
                if (isInsideEmbedBlockResult) return;
                
                if (blockEl) {
                    // 行内备注只处理 NodeParagraph 和 NodeHeading
                    const isValidBlockType = memoData.type === 'block' || isValidBlockTypeForInlineMemo(blockEl);
                    if (isValidBlockType) {
                        // 找到实际对应的目标元素
                        let targetElement = memoData.element;
                        if (memoData.type === 'inline' && memoData.elements?.length > 0) {
                            targetElement = memoData.elements[0].element;
                        }
                        
                        const input = handleMemoEdit(memoDiv, targetElement, main, sidebar);
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
        
        memoDiv.addEventListener('mouseenter', () => handleMemoEnter(memoDiv));
        memoDiv.addEventListener('mouseleave', clearMemoHighlights);
        frag.appendChild(memoDiv);
    });
    
    sidebar.setAttribute('data-memo-count', `共 ${visibleMemoCount} 个备注`); 
    sidebar.appendChild(frag);

    // 绑定删除事件
    if (!sidebar._delegated) {
        sidebar.addEventListener('click', async e => {
            const btn = e.target.closest('button[data-action="delete"]');
            if (!btn) return;

            const item = btn.closest('.memo-item');
            if (!item) return;
            e.stopPropagation();

            const nodeId = item.getAttribute('data-node-id');
            const memoType = item.getAttribute('data-memo-type');
            const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
            const isInsideEmbedBlockResult = isInsideEmbedBlock(blockEl);
            if (isInsideEmbedBlockResult) return;

            clearMemoHighlights();

            let deleted = false;
            if (blockEl) {
                const isValidBlockType = memoType === 'block' || isValidBlockTypeForInlineMemo(blockEl);
                if (isValidBlockType) {
                    if (memoType === 'block') {
                        const previousMemo = blockEl.getAttribute('memo');
                        blockEl.removeAttribute('memo');
                        deleted = await persistBlockUpdate(blockEl);
                        if (!deleted) {
                            if (previousMemo === null) {
                                blockEl.removeAttribute('memo');
                            } else {
                                blockEl.setAttribute('memo', previousMemo);
                            }
                        }
                    } else {
                        deleted = await removeInlineMemoGroup(blockEl, item);
                    }
                }
            }

            refreshSideBarMemos(main, sidebar);
            if (!deleted) {
                refreshMemoOffset(main, sidebar);
            }
        });

        sidebar._delegated = true;
    }
    
    refreshMemoOffset(main, sidebar);
    const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
    // 根据当前是否存在备注，维护 Sv-memo 类
    if (protyleContent) {
        if (visibleMemoCount > 0) {
            protyleContent.classList.add('Sv-memo');
        } else {
            protyleContent.classList.remove('Sv-memo');
        }
    }
};

// 判断侧栏备注是否处于编辑中
const isSidebarMemoEditing = sidebar => {
    return Boolean(sidebar?.querySelector('.memo-item.editing, .memo-edit-input'));
};

// 刷新编辑器
const refreshEditor = () => {
    if (!editorNode) return;
    cleanupObservers();
    
    editorNode.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
        let sidebar = main.parentElement.querySelector('#protyle-sidebar');
        if (!sidebar && isEnabled) sidebar = addSideBar(main); 
        if (!sidebar) return;
        
        let refreshTimer = null;
        
        const observer = new MutationObserver(() => {
            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => {
                if (isEnabled && !isSidebarMemoEditing(sidebar)) {
                    const memoState = collectSidebarMemoState(main);
                    if (sidebar.dataset.memoSignature !== memoState.signature) {
                        refreshSideBarMemos(main, sidebar, memoState);
                    }
                }
                refreshMemoOffset(main, sidebar);
            }, 100);
        });
        
        observer.observe(main, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['data-inline-memo-content', 'data-readonly', 'fold', 'memo'] 
        });
        
        observerCleanups.push(() => {
            observer.disconnect();
            clearTimeout(refreshTimer);
        });
        refreshSideBarMemos(main, sidebar);
        
        const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
        bindSidebarScroll(protyleContent, () => refreshMemoOffset(main, sidebar));
    });
    
    // 全局兜底：清理没有备注的 Sv-memo 标记
    document.querySelectorAll('.protyle-content').forEach(pc => {
        const main = pc.closest('.protyle')?.querySelector('.protyle-wysiwyg');
        if (main) {
            const sidebar = main.parentElement.querySelector('#protyle-sidebar');
            if ((sidebar && (!sidebar.querySelector('.memo-item') || sidebar.children.length === 0)) || 
                (!main.querySelector('span[data-type*="inline-memo"]') && !main.querySelector('[memo]'))) { 
                pc.classList.remove('Sv-memo'); 
            }
        }
    });
};

// 切换侧边栏
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
        cleanupObservers();
        unbindAllSidebarScroll();
        
        editorNode?.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
            main.parentElement.querySelector('#protyle-sidebar')?.remove();
            const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
            protyleContent?.classList.remove('Sv-memo');
            restoreMainMinWidth(main);
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
    } catch (e) {}
    
    dragMutationObserver?.disconnect();
    dragMutationObserver = null;
    
    dragTimeout && clearTimeout(dragTimeout);
    dragTimeout = null;
    
    removeMemoConnection();
    unbindAllSidebarScroll();
    cleanupObservers();
    
    isEnabled = false;
    editorNode = null;
    connectionCleanup = null;

    document.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
        main.parentElement.querySelector('#protyle-sidebar')?.remove();
        restoreMainMinWidth(main);
    });
    
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


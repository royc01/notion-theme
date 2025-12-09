// ========================================
// 模块：侧边栏备注功能
// ========================================

import { $, debounce, throttle } from './utils.js';
import { config } from './config.js';

let isEnabled = false, observers = {}, editorNode = null, dragTimeout = null, dragMutationObserver = null, connectionCleanup = null;

const autoResizeDiv = div => { 
    div.style.height = 'auto'; 
    div.style.height = (div.scrollHeight + 1) + 'px'; 
};

const setEndOfContenteditable = el => { 
    const range = document.createRange(); 
    range.selectNodeContents(el); 
    range.collapse(false); 
    const sel = window.getSelection(); 
    sel.removeAllRanges(); 
    sel.addRange(range); 
};

// 移除了图片相关功能，因为思源笔记会过滤掉<img>标签
const getBlockNode = el => { 
    while (el && !el.dataset.nodeId) el = el.parentElement; 
    if (el) { 
        const embedBlock = el.closest('[data-type="NodeBlockQueryEmbed"]'); 
        return embedBlock?.dataset.nodeId ? embedBlock : el; 
    } 
    return el; 
};

const toggleMemoHighlight = (main, nodeId, index, highlight, memoDiv) => { 
    const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`); 
    if (!blockEl) return; 
    const memoSpans = blockEl.querySelectorAll('span[data-type*="inline-memo"]'); 
    const target = memoSpans[index]; 
    if (target) { 
        target.classList.toggle('memo-span-highlight', highlight); 
        highlight && memoDiv ? createMemoConnection(memoDiv, target) : removeMemoConnection(); 
    } 
};

const createMemoConnection = (memoDiv, memoSpan) => { 
    removeMemoConnection(); 
    if (!memoDiv || !memoSpan) return; 
    const container = document.createElement('div'); 
    container.id = 'memo-connection-container'; 
    container.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;'; 
    container.innerHTML = `<svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;"><path stroke="var(--Sv-dock-item--activefocus-background)" stroke-width="2" fill="none" stroke-dasharray="6,4"></path></svg>`; 
    document.body.appendChild(container); 
    const path = container.querySelector('path'); 
    const update = () => { 
        const a = memoDiv.getBoundingClientRect(), b = memoSpan.getBoundingClientRect(); 
        if (!a.width || !b.width) return; 
        const sx = b.right, sy = b.top + b.height / 2, ex = a.left - 6, ey = a.top + a.height / 2; 
        const o = Math.min(Math.abs(ex - sx) * 0.5, 200); 
        path.setAttribute('d', `M${sx} ${sy}C${sx + o} ${sy},${ex - o} ${ey},${ex} ${ey}`); 
    }; 
    update(); 
    const onScroll = () => requestAnimationFrame(update); 
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
function isAnyAncestorFolded(block) {
    let current = block;
    while (current) {
        if (current.getAttribute && current.getAttribute('fold') === '1') {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}

// 拖拽监听
function observeDragTitle() {
    if (dragMutationObserver) return;
    function waitForDrag() {
        const dragEl = document.getElementById('drag');
        if (!dragEl) { dragTimeout = setTimeout(waitForDrag, 1000); return; }
        // 简化防抖调用，直接使用 refreshEditor 而不是包装
        dragMutationObserver = new MutationObserver(refreshEditor);
        dragMutationObserver.observe(dragEl, { attributes: true, attributeFilter: ['title'] });
    }
    waitForDrag();
}

function unobserveDragTitle() {
    dragMutationObserver?.disconnect(); dragMutationObserver = null;
    if (dragTimeout) { clearTimeout(dragTimeout); dragTimeout = null; }
}

// 刷新侧边栏备注位置
function refreshMemoOffset(main, sidebar) {
    requestAnimationFrame(() => {
        const MARGIN = 10;
        let lastBottom = 0;
        
        // 按照DOM顺序处理所有可见备注项，不再重新排序
        const memoItems = Array.from(sidebar.querySelectorAll('.memo-item'))
            .filter(memoItem => memoItem.style.display !== 'none');
        
        // 用于跟踪每个块的第一个备注
        const firstMemoPerBlock = new Map();
        
        // 第一遍：识别每个块的第一个备注
        memoItems.forEach((memoItem, index) => {
            const nodeId = memoItem.getAttribute('data-node-id');
            if (!firstMemoPerBlock.has(nodeId)) {
                firstMemoPerBlock.set(nodeId, { memoItem, index });
            }
        });
        
        // 第二遍：定位备注项
        memoItems.forEach((memoItem, index) => {
            const nodeId = memoItem.getAttribute('data-node-id');
            const memoIndex = Number(memoItem.getAttribute('data-memo-index')) || 0;
            const memoType = memoItem.getAttribute('data-memo-type');
            
            // 查找对应的块元素
            const block = main.querySelector(`div[data-node-id="${nodeId}"]`);
            if (!block) return;
            
            let targetTop = 0;
            
            if (memoType === 'block') {
                // 块备注：与块的顶部对齐并在顶部区域内垂直居中
                const blockRect = block.getBoundingClientRect();
                const mainRect = main.getBoundingClientRect();
                // 定位到块的顶部，并在顶部区域垂直居中
                targetTop = blockRect.top - mainRect.top  - (memoItem.offsetHeight / 2);
            } else {
                // 行内备注：定位到具体的行
                const blockRect = block.getBoundingClientRect();
                const mainRect = main.getBoundingClientRect();
                
                // 获取所有行内备注元素
                const memoSpans = Array.from(block.querySelectorAll('span[data-type*="inline-memo"]'));
                const targetSpan = memoSpans[memoIndex];
                
                if (targetSpan) {
                    const spanRect = targetSpan.getBoundingClientRect();
                    targetTop = spanRect.top - mainRect.top + (spanRect.height / 2) - (memoItem.offsetHeight / 2);
                } else {
                    // 如果找不到对应的行内备注，则定位到块的中心
                    targetTop = blockRect.top - mainRect.top + blockRect.height / 2 - memoItem.offsetHeight / 2;
                }
            }
            
            // 确保不会与上方的备注重叠
            if (targetTop < lastBottom + MARGIN) {
                targetTop = lastBottom + MARGIN;
            }
            
            memoItem.style.position = 'absolute';
            memoItem.style.top = `${targetTop}px`;
            memoItem.style.transition = 'top 0.3s cubic-bezier(0.4,0,0.2,1),transform 0.3s cubic-bezier(0.4,0,0.2,1)';
            
            lastBottom = targetTop + memoItem.offsetHeight;
        });
    });
}

// 添加侧边栏
function addSideBar(main) {
    let sidebar = main.parentElement.querySelector('#protyle-sidebar');
    const title = main.parentElement.querySelector('div.protyle-title');
    if (!sidebar && title) {
        sidebar = document.createElement('div'); 
        sidebar.id = 'protyle-sidebar';
        title.insertAdjacentElement('beforeend', sidebar);
        sidebar.style.cssText = 'position:absolute;right:-230px;width:230px;'; 
        main.style.minWidth = '90%';
    }
    return sidebar;
}

// 处理备注编辑和保存
function handleMemoEdit(memoDiv, el, main, sidebar) {
    const memoType = memoDiv.getAttribute('data-memo-type');
    let old = '';
    
    if (memoType === 'block') {
        old = el.getAttribute('memo') || '';
    } else {
        old = el.getAttribute('data-inline-memo-content') || '';
    }
    
    const input = document.createElement('div');
    input.className = 'memo-edit-input';
    input.contentEditable = 'true';
    input.innerHTML = old.replace(/\n/g, '<br>');
    input.setAttribute('placeholder', '输入备注内容...');
    input.style.cssText = 'width:100%;min-height:60px;padding:6px;border:1px solid var(--b3-theme-primary);border-radius:8px;font-size:0.8em;resize:vertical;box-sizing:border-box;overflow:auto;outline:none;white-space:pre-wrap;word-break:break-all;overflow-y:hidden;';
    input.addEventListener('input', () => autoResizeDiv(input));
    
    // 提取公共的编辑初始化逻辑
    const initEditState = (targetInput) => {
        memoDiv.classList.add('editing');
        memoDiv.style.zIndex = '999';
        targetInput.focus();
        setEndOfContenteditable(targetInput);
        requestAnimationFrame(() => {
            autoResizeDiv(targetInput);
            refreshMemoOffset(main, sidebar);
        });
    };
    
    const save = () => {
        const val = input.innerHTML.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<p>/gi, '\n').replace(/<\/p>/gi, '').replace(/&nbsp;/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
        
        if (val !== old) {
            if (memoType === 'block') {
                el.setAttribute('memo', val);
                fetch('/api/block/updateBlock', { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ''}` 
                    }, 
                    body: JSON.stringify({ 
                        dataType: 'html', 
                        data: el.outerHTML, 
                        id: el.dataset.nodeId 
                    }) 
                });
            } else {
                el.setAttribute('data-inline-memo-content', val);
                updateInlineMemo(el, val);
            }
        }
        
        const newDiv = document.createElement('div'); 
        newDiv.className = 'memo-content-view'; 
        newDiv.style.cssText = 'font-size:0.8em;margin-bottom:4px;cursor:pointer;';
        newDiv.innerHTML = val ? val.replace(/\n/g, '<br>') : '<span style="color:#bbb;">点击编辑备注...</span>';
        newDiv.onclick = (e) => {
            // 检查是否已经在编辑状态
            if (memoDiv.classList.contains('editing')) return;
            
            const { input: newInput, save: newSave } = handleMemoEdit(memoDiv, el, main, sidebar);
            newDiv.replaceWith(newInput);
            initEditState(newInput);
        };
        input.replaceWith(newDiv);
        memoDiv.classList.remove('editing'); 
        memoDiv.style.zIndex = '';
        setTimeout(() => refreshMemoOffset(main, sidebar), 100);
    };
    
    // 设置输入框事件
    input.onblur = () => setTimeout(() => { if (document.activeElement !== input) save(); }, 100);
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
        if (text) document.execCommand('insertText', false, text);
    }, true);
    
    autoResizeDiv(input); 
    return { input, save };
}

// 刷新侧边栏备注
function refreshSideBarMemos(main, sidebar) {
    // 清除之前的内容
    sidebar.innerHTML = ''; 
    const frag = document.createDocumentFragment();
    
    const isReadonly = main.getAttribute?.('data-readonly') === 'true';
    let visibleMemoCount = 0;
    
    // 使用Set来避免重复的块ID
    const processedBlocks = new Set();
    // 使用Map来存储已经处理过的备注内容，避免内容重复显示
    // Key为内容标识符，Value为备注元素数组
    const processedMemoContents = new Map();
    
    // 提前检查当前启用的模式，避免重复DOM查询
    const isBlockMemoMode = document.documentElement.hasAttribute('savor-sidebar-block-memo');
    const isSidebarMemoMode = document.documentElement.hasAttribute('savor-sidebar-memo');
    
    // 预先获取所有块，避免重复查询
    const allBlocks = main.querySelectorAll('[data-node-id]');
    
    // 创建一个映射来存储块在文档中的顺序
    const blockOrderMap = new Map();
    allBlocks.forEach((block, index) => {
        blockOrderMap.set(block.dataset.nodeId, index);
    });
    
    const allMemos = [];
    
    allBlocks.forEach(block => {
        const blockId = block.dataset.nodeId;
        // 避免重复处理同一个块
        if (processedBlocks.has(blockId)) return;
        processedBlocks.add(blockId);
        
        // 对于每个块，先添加块备注（如果存在）
        if (block.hasAttribute('memo')) {
            allMemos.push({
                element: block,
                type: 'block',
                content: block.getAttribute('memo') || '',
                text: '<svg width="14" height="14"><use xlink:href="#iconM"></use></svg> ',
                blockId: blockId,
                index: -1, // 块备注使用特殊索引
                blockOrder: blockOrderMap.get(blockId) // 添加块顺序信息
            });
        }
        
        // 只有在非块备注模式下才收集行内备注
        if (!isBlockMemoMode) {
            // 然后收集块内的行内备注
            const inlineMemos = block.querySelectorAll('span[data-type*="inline-memo"]');
            inlineMemos.forEach((el, index) => {
                const memoContent = el.getAttribute('data-inline-memo-content') || '';
                const memoText = el.textContent || '';
                // 创建内容标识符，用于检查是否重复
                const contentKey = memoText + '|' + memoContent;
                
                // 检查是否已经处理过相同内容的备注（解决内容重复显示问题）
                // 但允许多个具有相同内容的不同元素
                const existingMemos = processedMemoContents.get(contentKey) || [];
                
                // 检查是否是完全相同的元素（通过比较元素引用）
                const isDuplicate = existingMemos.some(existingMemo => existingMemo.element === el);
                
                if (isDuplicate) return;
                
                // 添加到已处理的备注中
                existingMemos.push({
                    element: el,
                    blockId: blockId,
                    index: index
                });
                processedMemoContents.set(contentKey, existingMemos);
                
                // 获取行内备注所属的块ID，确保使用正确的块ID
                const memoBlock = getBlockNode(el);
                const memoBlockId = memoBlock?.dataset.nodeId || blockId;
                
                allMemos.push({
                    element: el,
                    type: 'inline',
                    content: memoContent,
                    text: memoText,
                    blockId: blockId,
                    index: index,
                    blockOrder: blockOrderMap.get(memoBlockId) // 添加块顺序信息
                });
            });
        }
    });
    
    // 按照块顺序和备注索引排序
    allMemos.sort((a, b) => {
        // 首先按块在文档中的顺序排序
        if (a.blockOrder !== b.blockOrder) {
            return a.blockOrder - b.blockOrder;
        }
        // 然后按备注索引排序（块备注索引为-1，会排在最前面）
        return a.index - b.index;
    });
    
    // 如果没有备注，直接返回
    if (allMemos.length === 0) { 
        sidebar.removeAttribute('data-memo-count'); 
        return; 
    }
    
    // 预先计算所有块的折叠状态，避免重复调用 isAnyAncestorFolded
    const blockFoldStates = new Map();
    allMemos.forEach(memoData => {
        if (!blockFoldStates.has(memoData.blockId)) {
            const block = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
            blockFoldStates.set(memoData.blockId, block && isAnyAncestorFolded(block));
        }
    });
    
    // 按照排序后的顺序显示备注
    allMemos.forEach((memoData, idx) => {
        const block = main.querySelector(`div[data-node-id="${memoData.blockId}"]`);
        // 如果块不存在，跳过
        if (!block) return;
        
        const isBlockFolded = blockFoldStates.get(memoData.blockId) || false;
        
        const memo = memoData.content;
        const text = memoData.text;
        
        const memoDiv = document.createElement('div');
        memoDiv.className = 'memo-item';
        memoDiv.setAttribute('data-node-id', memoData.blockId);
        memoDiv.setAttribute('data-memo-index', memoData.index);
        memoDiv.setAttribute('data-memo-type', memoData.type); // 标记备注类型
        memoDiv.style.cssText = 'margin:0px 0px 8px 16px;padding:8px;border-radius:8px;position:relative;width:220px;box-shadow:rgba(0, 0, 0, 0.03) 0px 12px 20px, var(--b3-border-color) 0px 0px 0px 1px inset;';
        if (isBlockFolded) { 
            memoDiv.style.display = 'none'; 
        } else { 
            visibleMemoCount++; 
        }
        
        const memoContentStyle = isReadonly ? 'cursor:auto;' : 'cursor:pointer;';
        memoDiv.innerHTML = `<div class="memo-title-with-dot" style="font-weight:bold;margin-bottom:4px;font-size:0.9em;display:flex;"><span class="memo-title-dot"></span>${text}</div><div class="memo-content-view" style="${memoContentStyle}font-size:0.8em;margin-bottom:4px;">${memo ? memo.replace(/\n/g, '<br>') : '<span style="color:#bbb;">点击编辑备注...</span>'}</div>`;
        
        const titleDiv = memoDiv.querySelector('.memo-title-with-dot');
        if (titleDiv && !isReadonly) {
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = `<svg class="b3-menu__icon" style="vertical-align:middle;"><use xlink:href="#iconTrashcan"></use></svg>`;
            deleteBtn.style.cssText = 'position:absolute;top:6px;right:6px;padding:0;border:none;border-radius:6px;cursor:pointer;z-index:2;';
            deleteBtn.setAttribute('data-action', 'delete'); 
            titleDiv.appendChild(deleteBtn);
        }
        
        const memoContentDiv = memoDiv.querySelector('.memo-content-view');
        // 为不同类型的备注绑定不同的编辑处理
        if (!isReadonly) {
            memoContentDiv.onclick = (e) => {
                e.stopPropagation();
                if (memoDiv.classList.contains('editing')) return;
                
                const { input, save } = handleMemoEdit(memoDiv, memoData.element, main, sidebar);
                memoContentDiv.replaceWith(input);
                // 使用handleMemoEdit中定义的公共初始化逻辑
                memoDiv.classList.add('editing');
                memoDiv.style.zIndex = '999';
                input.focus();
                setEndOfContenteditable(input);
                requestAnimationFrame(() => {
                    autoResizeDiv(input);
                    refreshMemoOffset(main, sidebar);
                });
            };
        }
        frag.appendChild(memoDiv);
    });
    
    sidebar.setAttribute('data-memo-count', `共 ${visibleMemoCount} 个备注`); 
    sidebar.appendChild(frag);

    // 简化事件监听器添加逻辑，只在首次添加时绑定事件
    if (!sidebar._delegated) {
        // 合并相似的事件处理逻辑
        const handleMouseInteraction = (e, isEnter) => {
            const item = e.target.closest('.memo-item');
            if (!item || !sidebar.contains(item)) return; 
            const rt = e.relatedTarget;
            if (rt && item.contains(rt)) return;
            
            if (isEnter) {
                const nodeId = item.getAttribute('data-node-id');
                const memoIndex = Number(item.getAttribute('data-memo-index')) || 0;
                const memoType = item.getAttribute('data-memo-type');
                
                // 根据备注类型进行高亮处理
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                if (blockEl) {
                    if (memoType === 'block') {
                        // 块备注高亮整个块
                        blockEl.classList.add('memo-span-highlight');
                        createMemoConnection(item, blockEl);
                    } else {
                        // 行内备注高亮具体的span元素
                        const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
                        const targetSpan = memoSpans[memoIndex];
                        if (targetSpan) {
                            targetSpan.classList.add('memo-span-highlight');
                            createMemoConnection(item, targetSpan);
                        }
                    }
                }
            } else {
                removeMemoConnection();
                // 移除所有高亮
                main.querySelectorAll('.memo-span-highlight').forEach(el => el.classList.remove('memo-span-highlight'));
            }
        };
        
        sidebar.addEventListener('mouseover', e => handleMouseInteraction(e, true));
        sidebar.addEventListener('mouseout', e => handleMouseInteraction(e, false));
        
        sidebar.addEventListener('click', e => {
            const btn = e.target.closest('button[data-action="delete"]');
            if (!btn) return; 
            const item = btn.closest('.memo-item'); 
            if (!item) return;
            e.stopPropagation();
            
            const nodeId = item.getAttribute('data-node-id');
            const memoIndex = Number(item.getAttribute('data-memo-index')) || 0;
            const memoType = item.getAttribute('data-memo-type');
            
            const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
            item.remove(); 
            removeMemoConnection();
            
            if (blockEl) {
                if (memoType === 'block') {
                    // 删除块备注
                    blockEl.removeAttribute('memo');
                    fetch('/api/block/updateBlock', { 
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
                } else {
                    // 删除行内备注
                    const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
                    const targetSpan = memoSpans[memoIndex];
                    if (targetSpan) {
                        let types = (targetSpan.getAttribute("data-type") || "").split(" ").filter(t => t !== "inline-memo");
                        if (types.length) { 
                            targetSpan.setAttribute("data-type", types.join(" ")); 
                            targetSpan.removeAttribute("data-inline-memo-content"); 
                        } else { 
                            targetSpan.outerHTML = targetSpan.innerHTML; 
                        }
                        fetch('/api/block/updateBlock', { 
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
                    }
                }
            }
        });
        sidebar._delegated = true;
    }
    refreshMemoOffset(main, sidebar);
    const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
    if (protyleContent) {
        visibleMemoCount > 0 ? protyleContent.classList.add('Sv-memo') : protyleContent.classList.remove('Sv-memo');
    }
}

// 更新内联备注到思源
async function updateInlineMemo(el, content) {
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
}

// 刷新编辑器
function refreshEditor() {
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
        // 监听行内备注和块级备注的变化
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
    document.querySelectorAll('.protyle-content').forEach(pc => {
        const main = pc.closest('.protyle')?.querySelector('.protyle-wysiwyg');
        // 检查是否存在任何类型的备注
        if (main && !main.querySelector('span[data-type*="inline-memo"]') && !main.querySelector('[memo]')) { 
            pc.classList.remove('Sv-memo'); 
        }
    });
}

// 开关侧边栏
function openSideBar(open, save = false) {
    if (isEnabled === open) return;
    if (!editorNode && open) {
        (function wait() {
            editorNode = document.querySelector('div.layout__center');
            if (editorNode) openSideBar(open, save); 
            else setTimeout(wait, 100);
        })();
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
            if (protyleContent) { 
                protyleContent.classList.remove('Sv-memo'); 
            }
        });
        unobserveDragTitle();
    }
    save && config.set('sidebarMemoEnabled', open ? '1' : '0');
}

function init() {
    editorNode = document.querySelector('div.layout__center');
    const shouldEnable = document.documentElement.hasAttribute('savor-sidebar-memo') || 
                         document.documentElement.hasAttribute('savor-sidebar-block-memo');
    openSideBar(shouldEnable, true);
}

// 清理函数
function cleanupSidebarMemo() {
    
    // 关闭侧边栏
    try {
        openSideBar(false);
    } catch (e) {
        // 关闭侧边栏失败: e
    }
    
    // 清理观察器
    if (dragMutationObserver) {
        dragMutationObserver.disconnect();
        dragMutationObserver = null;
    }
    
    if (dragTimeout) {
        clearTimeout(dragTimeout);
        dragTimeout = null;
    }
    
    // 清理连接
    removeMemoConnection();
    
    // 清理全局变量
    isEnabled = false;
    observers = {};
    editorNode = null;
    connectionCleanup = null;
    
    // 移除相关样式
    const sbResizerStyles = document.getElementById('sb-resizer-styles');
    if (sbResizerStyles) sbResizerStyles.remove();
    
    // 移除相关类名
    document.querySelectorAll('.protyle-content.Sv-memo').forEach(el => {
        el.classList.remove('Sv-memo');
    });
}

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

// 导出清理函数
export { cleanupSidebarMemo };
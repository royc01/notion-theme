// ========================================
// 模块：导图拖拽功能
// ========================================

import { i18n } from './i18n.js';

// 拖拽功能防抖
export const dragDebounce = (fn) => {
    let timer = null;
    return (...args) => {
        if (timer) cancelAnimationFrame(timer);
        timer = requestAnimationFrame(() => fn(...args));
    };
};

// SVG图标常量
const SVG_ICONS = {
    COLLAPSE: `<svg viewBox="0 0 32 32" width="16" height="16">
        <path d="M16 24L8 16L16 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    MAXIMIZE: `<svg><use xlink:href="#iconFullscreen"></use></svg>`,
    MINIMIZE: `<svg><use xlink:href="#iconFullscreenExit"></use></svg>`
};

// 拖拽相关样式定义
const DRAGGABLE_STYLES = `[custom-f="dt"][data-draggable] { --dt-scale: 1; }
[custom-f="dt"] [data-type="NodeListItem"][data-draggable] {
cursor: grab;
}
/* 只在根列表项上应用变换 */
[custom-f="dt"] [data-type="NodeListItem"][data-draggable]:not([data-type="NodeListItem"] [data-type="NodeListItem"]) {
transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(var(--dt-scale, 1));
}
[custom-f="dt"][data-animating] [data-type="NodeListItem"][data-draggable]:not([data-type="NodeListItem"] [data-type="NodeListItem"]) {
transition: transform 0.25s ease;
}`;

// 注入拖拽样式
const ensureDTStyles = () => {
    if (window.__dtStylesInjected) return;
    const style = document.createElement("style");
    style.id = "dt-inline-styles";
    style.textContent = DRAGGABLE_STYLES;
    document.head.appendChild(style);
    window.__dtStylesInjected = true;
};

// 创建通用按钮的工厂函数
const createButton = (className, htmlContent, uniqueId) => {
    const button = document.createElement('div');
    button.className = className;
    button.innerHTML = htmlContent;
    button.setAttribute('data-id', uniqueId);
    
    // 阻止拖拽事件影响按钮点击
    ['mousedown', 'pointerdown'].forEach(event => {
        button.addEventListener(event, e => {
            e.stopPropagation();
            if (event === 'pointerdown') e.stopImmediatePropagation();
        });
    });
    
    return button;
};

// 更新折叠按钮内容
const updateCollapseButton = (btn, isFolded, childCount) => {
    btn.innerHTML = isFolded ? (childCount || '') : SVG_ICONS.COLLAPSE;
};

// 统一清理元素上所有相关属性和事件
const cleanupElement = (element) => {
    // 移除拖拽相关属性
    element.removeAttribute('data-draggable');
    
    // 清理样式属性
    element.style.removeProperty('--tx');
    element.style.removeProperty('--ty');
    element.style.removeProperty('--dt-scale');
    element.style.removeProperty('cursor');
    
    // 清理数据属性
    delete element.dataset.tx;
    delete element.dataset.ty;
    
    // 移除事件监听器
    ['wheel', 'dblclick', 'pointerdown'].forEach(name => {
        if (element[`_${name.charAt(0).toUpperCase()}${name.slice(1)}`]) {
            element.removeEventListener(name, element[`_${name.charAt(0).toUpperCase()}${name.slice(1)}`]);
            delete element[`_${name.charAt(0).toUpperCase()}${name.slice(1)}`];
        }
    });
    
    // 断开并清理观察器
    if (element._collapseObservers) {
        element._collapseObservers.forEach(observer => observer.disconnect());
        element._collapseObservers = null;
    }
    
    // 移除按钮
    const collapseBtn = element.querySelector('.collapse-btn.protyle-custom');
    if (collapseBtn) collapseBtn.remove();
    
    const maximizeBtn = element.querySelector('.maximize-btn.protyle-custom');
    if (maximizeBtn) maximizeBtn.remove();
};

// 创建并添加折叠按钮的通用函数
const addCollapseButton = (targetElement, isListButton = false) => {
    // 检查是否在导图模式下，如果不是则不添加折叠按钮
    if (!targetElement.closest('[custom-f="dt"]')) return;
    
    // 检查是否已经有折叠按钮
    if (targetElement.querySelector?.('.collapse-btn.protyle-custom')) return;

    // 获取关联的列表项和子列表
    let listItem, subList, list;
    if (isListButton) {
        list = targetElement;
        if (!list.parentElement || !list.parentElement.closest('[data-type="NodeList"]')) return;
        listItem = list.parentElement.closest('[data-type="NodeListItem"]');
        if (!listItem) return;
    } else {
        listItem = targetElement;
        subList = listItem.querySelector(':scope > .list');
        if (!subList) return;
    }

    // 创建折叠按钮
    const uniqueId = `collapse-btn-${listItem.getAttribute('data-node-id') || Date.now()}`;
    const collapseBtn = createButton('collapse-btn protyle-custom', SVG_ICONS.COLLAPSE, uniqueId);

    // 添加点击事件
    collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const nodeId = listItem.getAttribute('data-node-id');
        if (nodeId) {
            const fold = listItem.getAttribute('fold');
            const newFoldState = fold === '1' ? '0' : '1';
            
            // 直接发送API请求设置折叠状态
            fetch('/api/attr/setBlockAttrs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ""}`
                },
                body: JSON.stringify({
                    id: nodeId,
                    attrs: { fold: newFoldState }
                })
            }).then(() => {
                // 更新本地属性
                listItem.setAttribute('fold', newFoldState);
            });
        }
    });

    // 插入按钮到DOM
    if (isListButton) {
        const paragraph = listItem.querySelector(':scope > [data-type="NodeParagraph"]');
        if (paragraph) {
            if (getComputedStyle(paragraph).position === 'static') {
                paragraph.style.position = 'relative';
            }
            paragraph.appendChild(collapseBtn);
        } else {
            const parent = list.parentElement;
            if (parent && getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }
            parent.insertBefore(collapseBtn, list);
        }
    } else {
        if (getComputedStyle(listItem).position === 'static') {
            listItem.style.position = 'relative';
        }
        listItem.appendChild(collapseBtn);
        if (subList && getComputedStyle(subList).position === 'static') {
            subList.style.position = 'relative';
        }
    }

    // 更新按钮内容的函数
    const updateButtonIcon = () => {
        const isFolded = listItem.getAttribute('fold') === '1';
        const childItems = isListButton ? 
            list.querySelectorAll(':scope > .li') : 
            subList.querySelectorAll(':scope > .li');
        updateCollapseButton(collapseBtn, isFolded, childItems.length);
    };

    // 初始化按钮状态
    updateButtonIcon();

    // 使用MutationObserver监听属性变化
    const observer = new MutationObserver(() => updateButtonIcon());
    observer.observe(listItem, { attributes: true, attributeFilter: ['fold'] });

    // 存储observer引用，以便后续清理
    if (isListButton) {
        if (!list._collapseObservers) list._collapseObservers = [];
        list._collapseObservers.push(observer);
    } else {
        if (!listItem._collapseObservers) listItem._collapseObservers = [];
        listItem._collapseObservers.push(observer);
    }
};

// 创建并添加最大化按钮的函数
const addMaximizeButton = (targetElement) => {
    // 检查是否已经添加了最大化按钮
    if (targetElement.querySelector?.('.maximize-btn.protyle-custom')) return;

    // 创建最大化按钮
    const uniqueId = `maximize-btn-${targetElement.getAttribute('data-node-id') || Date.now()}`;
    const maximizeBtn = createButton('maximize-btn protyle-custom', SVG_ICONS.MAXIMIZE, uniqueId);

    // 添加点击事件
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        targetElement.classList.toggle('savor-mindmap-fullscreen');
        maximizeBtn.innerHTML = targetElement.classList.contains('savor-mindmap-fullscreen') ? 
            SVG_ICONS.MINIMIZE : SVG_ICONS.MAXIMIZE;
    });

    // 将按钮添加到目标元素
    if (getComputedStyle(targetElement).position === 'static') {
        targetElement.style.position = 'relative';
    }
    targetElement.appendChild(maximizeBtn);
};

// 初始化拖拽功能
export const initDraggable = (element) => {
    // 选择所有层级的 NodeListItem，而不仅仅是直接子级
    const listItems = element.querySelectorAll('[data-type="NodeListItem"]');
    if (!listItems.length) return;

    ensureDTStyles();

    // 初始化容器状态
    if (!element.hasAttribute("data-draggable")) {
        element.setAttribute("data-draggable", "true");
        element._scale = 1;
        element.style.setProperty("--dt-scale", "1");

        // 滚轮缩放和双击重置
        element.addEventListener("wheel", element._onWheel = e => {
            if (e.target.getAttribute("contenteditable") === "true" || !e.altKey) return;
            e.preventDefault();
            element._scale = Math.min(Math.max((element._scale || 1) * (e.deltaY > 0 ? 0.9 : 1.1), 0.1), 5);
            element.style.setProperty("--dt-scale", String(element._scale));
        }, { passive: false });
        
        element.addEventListener("dblclick", element._onDoubleClick = e => {
            if (e.target.getAttribute("contenteditable") === "true") return;
            element._scale = 1;
            element.style.setProperty("--dt-scale", "1");
            element.setAttribute("data-animating", "true");
            // 只重置根列表项的坐标
            element.querySelectorAll('[data-type="NodeListItem"]:not([data-type="NodeListItem"] [data-type="NodeListItem"])').forEach(item => {
                item.style.removeProperty("--tx");
                item.style.removeProperty("--ty");
                item.dataset.tx = "0";
                item.dataset.ty = "0";
            });
            setTimeout(() => element.removeAttribute("data-animating"), 260);
        });
    }

    // 标记所有子项为可拖拽（包括嵌套的）
    listItems.forEach(item => {
        if (!item.hasAttribute("data-draggable")) 
            item.setAttribute("data-draggable", "true");
    });
    
    // 为每个NodeList元素添加折叠按钮
    element.querySelectorAll('[data-type="NodeList"]').forEach(list => addCollapseButton(list, true));

    // 为导图容器添加最大化按钮
    if (element.hasAttribute('custom-f') && element.getAttribute('custom-f') === 'dt') {
        addMaximizeButton(element);
    }

    // 指针事件处理
    if (!element._onItemPointerDown) {
        element.addEventListener("pointerdown", element._onItemPointerDown = e => {
            // 限制鼠标左键和非编辑元素
            if ((e.pointerType === "mouse" && e.button !== 0) || 
                e.target.getAttribute?.("contenteditable") === "true" || 
                e.target.closest?.('[data-type="a"]') ||
                e.target.closest?.('.protyle-action--task')) return;
            
            // 找到被点击的列表项
            const clickedItem = e.target.closest?.('[data-type="NodeListItem"]');
            if (!clickedItem || !element.contains(clickedItem)) return;
            
            // 获取根列表项（最顶层的列表项）
            let rootItem = clickedItem;
            while (rootItem.parentElement && rootItem.parentElement.closest?.('[data-type="NodeListItem"]')) {
                rootItem = rootItem.parentElement.closest('[data-type="NodeListItem"]');
            }
            
            // 如果根项不存在或不在当前元素内，则返回
            if (!rootItem || !element.contains(rootItem)) return;

            // 拖拽阈值和初始位置（只针对根项）
            let moved = false;
            const baseTx = parseFloat(rootItem.dataset.tx || "0");
            const baseTy = parseFloat(rootItem.dataset.ty || "0");
            const startX = e.clientX - baseTx;
            const startY = e.clientY - baseTy;

            let rafId = 0;
            
            // 处理鼠标移动
            const onPointerMove = (ev) => {
                const deltaX = Math.abs(ev.clientX - startX);
                const deltaY = Math.abs(ev.clientY - startY);
                
                // 超过阈值才触发拖拽
                if (!moved && (deltaX > 5 || deltaY > 5)) {
                    e.preventDefault();
                    clickedItem.style.cursor = "grabbing";
                    moved = true;
                }
                
                // 执行拖拽，但移动的是根项
                if (moved) {
                    rafId && cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        const tx = ev.clientX - startX;
                        const ty = ev.clientY - startY;
                        rootItem.dataset.tx = String(tx);
                        rootItem.dataset.ty = String(ty);
                        rootItem.style.setProperty("--tx", `${tx}px`);
                        rootItem.style.setProperty("--ty", `${ty}px`);
                    });
                }
            };

            // 处理鼠标释放和取消
            const onPointerUp = () => {
                rootItem.releasePointerCapture?.(e.pointerId);
                rootItem.removeEventListener("pointermove", onPointerMove);
                rootItem.removeEventListener("pointerup", onPointerUp);
                rootItem.removeEventListener("pointercancel", onPointerUp);
                element.removeEventListener("pointerleave", onPointerLeave);
                clickedItem.style.cursor = "";
            };

            // 处理鼠标离开容器区域
            const onPointerLeave = (ev) => {
                if (moved) {
                    onPointerUp();
                }
            };

            // 添加事件监听器到根项上
            rootItem.addEventListener("pointermove", onPointerMove);
            rootItem.addEventListener("pointerup", onPointerUp);
            rootItem.addEventListener("pointercancel", onPointerUp);
            element.addEventListener("pointerleave", onPointerLeave);
            
            // 设置指针捕获以确保能接收到事件
            rootItem.setPointerCapture?.(e.pointerId);
        });
    }
};

// 更新导图提示文本
const updateMapTips = () => {
    document.querySelectorAll('[custom-f="dt"]').forEach(el => {
        el.setAttribute('data-i18n-tip', i18n.t("list2map.tip"));
    });
};

// 初始化观察器
const initObserver = () => {
    // 如果主观察器已经存在，则先断开连接
    if (window._mindmapMainObserver) {
        window._mindmapMainObserver.disconnect();
    }
    
    // 如果提示文本观察器已经存在，则先断开连接
    if (window._listMapTipObserver) {
        window._listMapTipObserver.disconnect();
    }
    
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === "attributes" && mutation.target.getAttribute("custom-f") === "dt") {
                initDraggable(mutation.target);
            } else if (mutation.type === "childList") {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const attr = node.getAttribute?.("custom-f");
                        attr === "dt" && initDraggable(node);
                        node.querySelectorAll?.(`[custom-f="dt"]`)?.forEach(initDraggable);
                    }
                });
            } else if (mutation.type === "attributes" && mutation.attributeName === "fold") {
                // 当折叠状态改变时，确保按钮仍然存在
                const target = mutation.target;
                if (target.matches('[data-type="NodeListItem"]')) {
                    addCollapseButton(target);
                } else if (target.matches('[data-type="NodeList"]')) {
                    addCollapseButton(target, true);
                }
            } else if (mutation.type === "attributes" && mutation.attributeName === "custom-f") {
                // 当custom-f属性改变时，如果是从dt变为其他值，则清理相关属性
                const target = mutation.target;
                if (mutation.oldValue === "dt" && target.getAttribute("custom-f") !== "dt") {
                    cleanupDraggable(target);
                }
                // 当custom-f属性从其他值变为dt时，初始化拖拽功能
                else if (mutation.oldValue !== "dt" && target.getAttribute("custom-f") === "dt") {
                    initDraggable(target);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["custom-f", "fold"],
        attributeOldValue: true
    });

    // 存储主观察器引用，以便后续清理
    window._mindmapMainObserver = observer;

    // 初始化提示文本观察器
    window._listMapTipObserver = new MutationObserver(() => setTimeout(updateMapTips, 16));
    window._listMapTipObserver.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ["custom-f"] 
    });

    document.querySelectorAll(`[custom-f="dt"]`).forEach(initDraggable);
    
    // 更新提示文本
    updateMapTips();
};

// 添加主题切换处理函数
const handleThemeChange = () => {
    // 先清理所有现有的导图元素
    document.querySelectorAll(`[custom-f="dt"]`).forEach(cleanupDraggable);
    
    // 清理所有观察器（如果存在）
    if (window._mindmapMainObserver) {
        window._mindmapMainObserver.disconnect();
        window._mindmapMainObserver = null;
    }
    
    if (window._listMapTipObserver) {
        window._listMapTipObserver.disconnect();
        window._listMapTipObserver = null;
    }
    
    // 重新初始化观察器
    initObserver();
    
    // 重新初始化所有导图元素
    document.querySelectorAll(`[custom-f="dt"]`).forEach(initDraggable);
    
    // 更新提示文本
    updateMapTips();
};

// 监听主题切换事件
window.addEventListener('themechange', handleThemeChange, { passive: true });

// 初始化导图拖拽功能
export const initMindmapDrag = async () => {
    // 等待i18n资源加载完成
    await i18n.ready();
    
    // 设置防抖函数
    window.dragDebounce = dragDebounce;
    
    // 初始化观察器
    initObserver();
};

// ========================================
// 模块：清理导图拖拽功能
// ========================================

// 清理导图拖拽功能
export const cleanupDraggable = (element) => {
    // 清理所有列表项的拖拽相关属性（包括嵌套的）
    element.querySelectorAll('[data-type="NodeListItem"]').forEach(item => {
        cleanupElement(item);
        // 只清理根列表项的坐标属性
        if (!item.matches('[data-type="NodeListItem"] [data-type="NodeListItem"]')) {
            item.style.removeProperty("--tx");
            item.style.removeProperty("--ty");
            delete item.dataset.tx;
            delete item.dataset.ty;
        }
    });
    
    // 清理所有列表容器的相关属性
    element.querySelectorAll('[data-type="NodeList"]').forEach(list => {
        cleanupElement(list);
    });

    // 清理根元素自身属性
    cleanupElement(element);
    element._scale = 1;
    element.removeAttribute("data-i18n-tip");
};

// 清理导图拖拽功能
export const cleanupMindmapDrag = () => {
    // 清理导图拖拽相关的样式和功能
    try {
        document.getElementById('dt-inline-styles')?.remove();
        window.__dtStylesInjected = false;
        
        // 清理主观察器（如果存在）
        if (window._mindmapMainObserver) {
            window._mindmapMainObserver.disconnect();
            window._mindmapMainObserver = null;
        }
        
        // 清理所有已设置拖拽属性的元素
        document.querySelectorAll('[custom-f="dt"][data-draggable]').forEach(cleanupDraggable);
        
        // 清理提示文本观察器
        if (window._listMapTipObserver) {
            window._listMapTipObserver.disconnect();
            window._listMapTipObserver = null;
        }
    } catch (e) {
        // 清理导图拖拽功能时出错: e
    }
};

// 导出清理函数到全局作用域
window.cleanupMindmapDrag = cleanupMindmapDrag;
// ========================================
// 模块：导图拖拽功能
// ========================================

import { i18n } from './i18n.js';

// 拖拽功能防抖（已简化）
export const dragDebounce = (fn) => {
    let timer = null;
    return (...args) => {
        if (timer) cancelAnimationFrame(timer);
        timer = requestAnimationFrame(() => fn(...args));
    };
};

// 注入拖拽样式
const ensureDTStyles = () => {
    if (window.__dtStylesInjected) return;
    const style = document.createElement("style");
    style.id = "dt-inline-styles";
    style.textContent = `[custom-f="dt"][data-draggable] { --dt-scale: 1; }
[custom-f="dt"] [data-type="NodeListItem"][data-draggable] {
cursor: grab;
transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(var(--dt-scale, 1));
}
[custom-f="dt"][data-animating] [data-type="NodeListItem"][data-draggable] {
transition: transform 0.25s ease;
}`;
    document.head.appendChild(style);
    window.__dtStylesInjected = true;
};

// 创建并添加折叠按钮的通用函数
const addCollapseButton = (targetElement, isListButton = false) => {
    // 更严格的检查是否已经有折叠按钮，通过唯一的类名标识
    if (targetElement.querySelector?.('.collapse-btn.protyle-custom')) return;

    // 获取关联的列表项和子列表
    let listItem, subList, list;
    if (isListButton) {
        // 对于列表按钮
        list = targetElement;
        if (!list.parentElement || !list.parentElement.closest('[data-type="NodeList"]')) return;
        listItem = list.parentElement.closest('[data-type="NodeListItem"]');
        if (!listItem) return;
    } else {
        // 对于列表项按钮
        listItem = targetElement;
        subList = listItem.querySelector(':scope > .list');
        if (!subList) return;
    }

    // 创建折叠按钮
    const collapseBtn = document.createElement('div');
    collapseBtn.className = 'collapse-btn protyle-custom';
    collapseBtn.innerHTML = `
        <svg viewBox="0 0 32 32" width="16" height="16">
            <path d="M16 24L8 16L16 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    // 添加唯一的data-id属性，用于进一步防止重复
    const uniqueId = `collapse-btn-${listItem.getAttribute('data-node-id') || Date.now()}`;
    collapseBtn.setAttribute('data-id', uniqueId);

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

    // 阻止拖拽事件影响按钮点击
    collapseBtn.addEventListener('mousedown', e => e.stopPropagation());
    collapseBtn.addEventListener('pointerdown', e => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    });

    // 插入按钮到DOM
    if (isListButton) {
        // 将按钮插入到正确位置：在NodeParagraph元素内部
        const paragraph = listItem.querySelector(':scope > [data-type="NodeParagraph"]');
        if (paragraph) {
            // 在插入前再次检查是否已存在相同ID的按钮
            if (paragraph.querySelector(`.collapse-btn.protyle-custom[data-id="${uniqueId}"]`)) return;
            paragraph.appendChild(collapseBtn);
            if (getComputedStyle(paragraph).position === 'static') {
                paragraph.style.position = 'relative';
            }
        } else {
            const parent = list.parentElement;
            if (parent && getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }
            // 在插入前再次检查是否已存在相同ID的按钮
            if (parent.querySelector(`.collapse-btn.protyle-custom[data-id="${uniqueId}"]`)) return;
            parent.insertBefore(collapseBtn, list);
            const buttonParent = collapseBtn.parentElement;
            if (buttonParent && getComputedStyle(buttonParent).position === 'static') {
                buttonParent.style.position = 'relative';
            }
        }
    } else {
        // 将按钮添加到列表项
        if (getComputedStyle(listItem).position === 'static') {
            listItem.style.position = 'relative';
        }
        // 在插入前再次检查是否已存在相同ID的按钮
        if (listItem.querySelector(`.collapse-btn.protyle-custom[data-id="${uniqueId}"]`)) return;
        listItem.appendChild(collapseBtn);
        if (subList && getComputedStyle(subList).position === 'static') {
            subList.style.position = 'relative';
        }
    }

    // 更新按钮内容的函数
    const updateButtonIcon = () => {
        const isFolded = listItem.getAttribute('fold') === '1';
        
        if (isFolded) {
            // 折叠状态：显示子项数量
            const childItems = isListButton ? 
                list.querySelectorAll(':scope > .li') : 
                subList.querySelectorAll(':scope > .li');
            const childCount = childItems.length;
            collapseBtn.innerHTML = childCount;
        } else {
            // 展开状态：显示箭头图标
            collapseBtn.innerHTML = `
                <svg viewBox="0 0 32 32" width="16" height="16">
                    <path d="M16 24L8 16L16 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    };

    // 初始化按钮状态
    updateButtonIcon();

    // 使用MutationObserver监听属性变化
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'fold') {
                updateButtonIcon();
            }
        });
    });

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

// 初始化拖拽功能
export const initDraggable = (element) => {
    const listItems = element.querySelectorAll(':scope > [data-type="NodeListItem"]');
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
            element.querySelectorAll('[data-type="NodeListItem"]').forEach(item => {
                item.style.removeProperty("--tx");
                item.style.removeProperty("--ty");
                item.dataset.tx = "0";
                item.dataset.ty = "0";
            });
            setTimeout(() => element.removeAttribute("data-animating"), 260);
        });
    }

    // 标记子项为可拖拽
    listItems.forEach(item => {
        if (!item.hasAttribute("data-draggable")) 
            item.setAttribute("data-draggable", "true");
    });
    
    // 为每个NodeList元素添加折叠按钮
    const nodeLists = element.querySelectorAll('[data-type="NodeList"]');
    nodeLists.forEach(list => {
        addCollapseButton(list, true);
    });

    // 指针事件处理
    if (!element._onItemPointerDown) {
        element.addEventListener("pointerdown", element._onItemPointerDown = e => {
            // 限制鼠标左键和非编辑元素
            if ((e.pointerType === "mouse" && e.button !== 0) || 
                e.target.getAttribute?.("contenteditable") === "true" || 
                e.target.closest?.('[data-type="a"]')) return;
            
            const listItem = e.target.closest?.('[data-type="NodeListItem"]');
            if (!listItem || !element.contains(listItem)) return;

            // 拖拽阈值和初始位置
            let moved = false;
            const baseTx = parseFloat(listItem.dataset.tx || "0");
            const baseTy = parseFloat(listItem.dataset.ty || "0");
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
                    listItem.style.cursor = "grabbing";
                    moved = true;
                }
                
                // 执行拖拽
                if (moved) {
                    rafId && cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        const tx = ev.clientX - startX;
                        const ty = ev.clientY - startY;
                        listItem.dataset.tx = String(tx);
                        listItem.dataset.ty = String(ty);
                        listItem.style.setProperty("--tx", `${tx}px`);
                        listItem.style.setProperty("--ty", `${ty}px`);
                    });
                }
            };

            // 处理鼠标释放和取消
            const onPointerUp = () => {
                listItem.releasePointerCapture?.(e.pointerId);
                listItem.removeEventListener("pointermove", onPointerMove);
                listItem.removeEventListener("pointerup", onPointerUp);
                listItem.removeEventListener("pointercancel", onPointerUp);
                element.removeEventListener("pointerleave", onPointerLeave);
                listItem.style.cursor = "grab";
            };

            // 处理鼠标离开容器区域
            const onPointerLeave = (ev) => {
                // 只有在拖拽状态下才处理
                if (moved) {
                    onPointerUp();
                }
            };

            // 添加事件监听器
            listItem.addEventListener("pointermove", onPointerMove);
            listItem.addEventListener("pointerup", onPointerUp);
            listItem.addEventListener("pointercancel", onPointerUp);
            element.addEventListener("pointerleave", onPointerLeave);
            
            // 设置指针捕获以确保能接收到事件
            listItem.setPointerCapture?.(e.pointerId);
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
                    addCollapseButtonToList(target);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["custom-f", "fold"]
    });

    document.querySelectorAll(`[custom-f="dt"]`).forEach(initDraggable);
    
    // 更新提示文本
    updateMapTips();
};

// 添加主题切换处理函数
const handleThemeChange = () => {
    // 先清理所有现有的导图元素
    document.querySelectorAll(`[custom-f="dt"]`).forEach(cleanupDraggable);
    
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
    
    if (typeof window.dragDebounce === "undefined") {
        window.dragDebounce = dragDebounce;
        initObserver();
        
        // 存储观察器引用，以便后续清理
        window._listMapTipObserver = new MutationObserver(() => setTimeout(updateMapTips, 16));
        window._listMapTipObserver.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ["custom-f"] 
        });
    }
};

// ========================================
// 模块：清理导图拖拽功能
// ========================================

// 清理导图拖拽功能
export const cleanupDraggable = (element) => {
    // 重置所有列表项和NodeList元素
    [...element.querySelectorAll('[data-type="NodeListItem"]'), 
     ...element.querySelectorAll('[data-type="NodeList"]')].forEach(target => {
        // 移除折叠按钮
        const collapseBtn = target.querySelector('.collapse-btn.protyle-custom');
        if (collapseBtn) collapseBtn.remove();
        
        // 断开并清理观察器
        if (target._collapseObservers) {
            target._collapseObservers.forEach(observer => observer.disconnect());
            target._collapseObservers = null;
        }
        
        // 如果是列表项，还需要清理位置属性
        if (target.matches('[data-type="NodeListItem"]')) {
            target.style.removeProperty("--tx");
            target.style.removeProperty("--ty");
            delete target.dataset.tx;
            delete target.dataset.ty;
            target.removeAttribute("data-draggable");
        }
    });

    // 移除自身属性
    element.removeAttribute("data-draggable");
    element._scale = 1;
    element.style.removeProperty("--dt-scale");

    // 清理事件监听器
    ['wheel', 'dblclick', 'pointerdown'].forEach(name => {
        if (element[`_${name.charAt(0).toUpperCase()}${name.slice(1)}`]) {
            element.removeEventListener(name, element[`_${name.charAt(0).toUpperCase()}${name.slice(1)}`]);
            delete element[`_${name.charAt(0).toUpperCase()}${name.slice(1)}`];
        }
    });
};

// 清理导图拖拽功能
export const cleanupMindmapDrag = () => {
    // 清理导图拖拽相关的样式和功能
    try {
        document.getElementById('dt-inline-styles')?.remove();
        window.__dtStylesInjected = false;
        
        // 清理所有已设置拖拽属性的元素
        document.querySelectorAll('[custom-f="dt"][data-draggable]').forEach(cleanupDraggable);
        
        // 统一清理所有NodeListItem和NodeList元素
        [...document.querySelectorAll('[data-type="NodeListItem"][data-draggable]'), 
         ...document.querySelectorAll('[data-type="NodeList"]')].forEach(target => {
            // 移除拖拽属性
            if (target.matches('[data-type="NodeListItem"]')) {
                target.removeAttribute('data-draggable');
                target.style.removeProperty('--tx');
                target.style.removeProperty('--ty');
                delete target.dataset.tx;
                delete target.dataset.ty;
            }
            
            // 移除折叠按钮（使用与创建时相同的类名）
            const collapseBtn = target.querySelector('.collapse-btn.protyle-custom');
            if (collapseBtn) {
                collapseBtn.remove();
            }
            
            // 断开并清理观察器
            if (target._collapseObservers) {
                target._collapseObservers.forEach(observer => observer.disconnect());
                target._collapseObservers = null;
            }
        });
        
        // 清理提示文本观察器
        if (window._listMapTipObserver) {
            window._listMapTipObserver.disconnect();
            window._listMapTipObserver = null;
        }
    } catch (e) {
        // 清理导图拖拽功能时出错: e
    }
};
// ========================================
// 模块：列表折叠内容预览查看
// ========================================

import { debounce } from './utils.js';

// 模块状态变量
let listPreviewActive = false;
let listPreviewHandler = null;
let foldObserver = null;

// 初始化列表折叠内容预览查看功能
export const initListPreview = () => {
    // 在初始化之前先清理之前的实例
    if (listPreviewActive) {
        disableListPreview();
    }
    
    listPreviewActive = true;
    
    listPreviewHandler = debounce(collapsedListPreviewEvent, 100);
    // 使用原生事件监听器替代 window.theme.BodyEventRunFun
    document.body.addEventListener("mouseover", listPreviewHandler);
    
    // 监听折叠状态变化
    foldObserver = new MutationObserver(debounce(collapsedListPreviewEvent, 100));
    foldObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['fold']
    });
    
    // 页面加载完成后初始化一次
    setTimeout(collapsedListPreviewEvent, 500);
};

// 禁用列表折叠内容预览查看功能
export const disableListPreview = () => {
    if (!listPreviewActive) return;
    
    listPreviewActive = false;
    listPreviewHandler = null;
    
    // 断开观察器
    if (foldObserver) {
        foldObserver.disconnect();
        foldObserver = null;
    }
    
    cleanupListPreview();
    document.querySelectorAll('[triggerBlock]').forEach(el => el.remove());
};

// 折叠列表预览事件处理
const collapsedListPreviewEvent = () => {
    // 简单检查确保功能处于激活状态
    if (!listPreviewActive) {
        return;
    }
    
    const foldedItems = [
        ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-node-id].li[fold='1']"),
        ...document.querySelectorAll("[data-oid] [data-node-id].li[fold='1']"),
        ...document.querySelectorAll("#searchPreview [data-node-id].li[fold='1']")
    ];
    
    const previewTargets = foldedItems.reduce((arr, item) => {
        const el = item.children[1];
        if (el && ["p", "h1", "h2", "h3", "h4", "h5", "h6"].includes(el.className)) {
            const contentElement = el.children[0];
            if (contentElement) {
                arr.push(contentElement);
            }
        }
        return arr;
    }, []);
    
    cleanupListPreview();
    previewTargets.forEach(registerPreviewEvents);
    
    // 立即为所有折叠项设置data-child-count属性
    foldedItems.forEach(item => {
        const contentElement = item.children[1];
        if (contentElement) {
            const targetElement = contentElement.children[0];
            if (targetElement) {
                // 统计折叠的直接子项数量
                const foldedChildren = item.querySelectorAll(':scope > .list > .li');
                const childCount = foldedChildren.length;
                
                // 查找具有 data-type="NodeParagraph" 或者是标题类型(NodeHeading)的元素
                const parentElement = item.querySelector('[data-type="NodeParagraph"], [data-type="NodeHeading"]');
                if (parentElement) {
                    // 将子项数量作为属性插入到 contenteditable 的 div 元素中
                    const contentEditableDiv = parentElement.querySelector('div[contenteditable]');
                    if (contentEditableDiv) {
                        contentEditableDiv.setAttribute('data-child-count', childCount);
                    }
                }
            }
        }
    });
};

// 清理列表预览
const cleanupListPreview = () => {
    [
        ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [ListPreview]"),
        ...document.querySelectorAll("[data-oid] [ListPreview]"),
        ...document.querySelectorAll("#searchPreview [ListPreview]")
    ].forEach(element => {
        const parent = element.parentElement;
        if (!parent || parent.getAttribute("fold") == null || parent.getAttribute("fold") == "0") {
            element.removeAttribute("ListPreview");
            if (element.children[0]) {
                element.children[0].removeEventListener("mouseenter", handleMouseEnter);
            }
            if (parent?.parentElement) {
                parent.parentElement.removeEventListener("mouseleave", handleMouseLeave);
            }
            Array.from(parent?.parentElement?.children || []).forEach(child => {
                if (child.getAttribute?.("triggerBlock") != null) {
                    child.remove();
                }
            });
        }
    });
};

// 注册预览事件
const registerPreviewEvents = (element) => {
    const parent = element.parentElement, grandParent = parent?.parentElement;
    if (!parent || !grandParent) return;
    
    if (parent.getAttribute("ListPreview") != null) {
        element.removeEventListener("mouseenter", handleMouseEnter);
        grandParent.removeEventListener("mouseleave", handleMouseLeave);
    }
    
    parent.setAttribute("ListPreview", true);
    // 确保功能处于激活状态才注册事件
    if (listPreviewActive) {
        element.addEventListener("mouseenter", handleMouseEnter);
        grandParent.addEventListener("mouseleave", handleMouseLeave);
    }
};

// 鼠标进入事件处理
const handleMouseEnter = (e) => {
    // 确保功能处于激活状态
    if (!listPreviewActive) {
        return;
    }
    
    const obj = e.target, parent = obj.parentElement, grandParent = parent?.parentElement;
    if (!grandParent) return;
    if ([...grandParent.children].some(child => child.getAttribute?.("triggerBlock") != null)) return;
    
    // 创建临时div来计算位置
    const tempDiv = document.createElement("div");
    obj.appendChild(tempDiv);
    tempDiv.style.cssText = "display:inline-block;width:0px;height:16px;";
    const X = tempDiv.offsetLeft, Y = tempDiv.offsetTop;
    tempDiv.remove();
    
    createTriggerBlock(grandParent, obj, X + 2, Y + 2);
};

// 鼠标离开事件处理
function handleMouseLeave(e) {
    e.target.querySelectorAll('[triggerBlock]').forEach(el => el.remove());
}

// 创建触发块
const createTriggerBlock = (container, refObj, left, top) => {
    // 确保功能处于激活状态
    if (!listPreviewActive) {
        return;
    }
    
    const previewID = container.getAttribute("data-node-id");
    if (!previewID) return;
    
    // 统计折叠的直接子项数量
    const foldedChildren = container.querySelectorAll(':scope > .list > .li');
    const childCount = foldedChildren.length;
    
    const triggerBlock = document.createElement("div");
    if (!triggerBlock) return;
    
    triggerBlock.setAttribute("triggerBlock", "true");
    triggerBlock.className = "triggerBlock protyle-custom";
    triggerBlock.style.cssText = `position:absolute;width:20px;height:15px;display:flex;z-index:999;cursor:pointer;WebkitUserModify:read-only;background:transparent;top:${top}px;left:${left}px;`;
    triggerBlock.innerHTML = `<span data-type='a' class='list-A' data-href='siyuan://blocks/${previewID}' style='font-size:15px;line-height:15px;color:transparent;text-shadow:none;border:none;'>####</span>`;
    
    // 查找具有 data-type="NodeParagraph" 或者是标题类型(NodeHeading)的元素
    const targetElement = container.querySelector('[data-type="NodeParagraph"], [data-type="NodeHeading"]');
    if (targetElement) {
        // 将子项数量作为属性插入到 contenteditable 的 div 元素中
        const contentEditableDiv = targetElement.querySelector('div[contenteditable]');
        if (contentEditableDiv) {
            contentEditableDiv.setAttribute('data-child-count', childCount);
        }
        targetElement.appendChild(triggerBlock);
    } else {
        container.appendChild(triggerBlock);
    }
};

// 将禁用函数也添加到window对象上，以便在destroyTheme中正确调用
window.disableListPreview = disableListPreview;
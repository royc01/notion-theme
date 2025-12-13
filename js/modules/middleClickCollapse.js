// ========================================
// 模块：鼠标中键折叠/展开功能
// ========================================

// 查找可编辑父元素的工具函数
const findEditableParent = (node) => {
    return node.closest('[contenteditable="true"], .protyle-wysiwyg');
};

// 初始化鼠标中键折叠/展开功能
export const initMiddleClickCollapse = () => {
    // 在初始化之前先清理之前的实例
    if (window.theme && window.theme._collapseHandler) {
        cleanupMiddleClickCollapse();
    }

    const DEBOUNCE_TIME = 300;
    let lastClickTime = 0;

    const collapseHandler = (e) => {
        if (e.button !== 1 || e.shiftKey || e.altKey || Date.now() - lastClickTime < DEBOUNCE_TIME) return;
        lastClickTime = Date.now();

        // 查找可编辑块和目标元素
        const editable = findEditableParent(e.target);
        if (!editable) return;

        const found = editable.closest('[data-type="NodeListItem"], [data-type="NodeHeading"]');
        if (!found) return;

        e.preventDefault();

        // 处理列表项或标题的折叠/展开
        const dataType = found.getAttribute("data-type");
        if (dataType === "NodeListItem") {
            const nodeId = found.getAttribute("data-node-id");
            if (!nodeId || !found.querySelector(':scope > .list')) return;
            
            const fold = found.getAttribute("fold");
            const newFold = fold === "1" ? "0" : "1";
            
            // 直接发送API请求设置折叠状态
            fetch('/api/attr/setBlockAttrs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ""}`
                },
                body: JSON.stringify({
                    id: nodeId,
                    attrs: { fold: newFold }
                })
            }).then(() => {
                found.setAttribute('fold', newFold);
            });
        } else if (dataType === "NodeHeading") {
            // 查找并点击同级的折叠按钮
            const foldBtn = found.closest(".protyle")
                ?.querySelector(".protyle-gutters")
                ?.querySelector('[data-type="fold"]');
            foldBtn?.click();
        }
    };

    if (!window.theme) {
        window.theme = {};
    }
    window.theme._collapseHandler = collapseHandler;
    document.body.addEventListener("mousedown", collapseHandler);
};

// 添加清理函数
export const cleanupMiddleClickCollapse = () => {
    if (window.theme && window.theme._collapseHandler) {
        document.body.removeEventListener("mousedown", window.theme._collapseHandler);
        window.theme._collapseHandler = null;
    }
};

// 将清理函数也添加到window对象上，以便在destroyTheme中正确调用
window.cleanupMiddleClickCollapse = cleanupMiddleClickCollapse;
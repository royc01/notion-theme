// ========================================
// 模块：鼠标中键折叠/展开功能
// ========================================

// 查找可编辑父元素的工具函数
const findEditableParent = (node) => {
    const editableSelectors = ['[contenteditable="true"]', '.protyle-wysiwyg'];
    return editableSelectors.reduce((found, selector) => 
        found || node.closest(selector), null);
};

// 初始化鼠标中键折叠/展开功能
export const initMiddleClickCollapse = () => {
    if (window.theme && window.theme._collapseHandler) return;

    const DEBOUNCE_TIME = 300;
    let lastClickTime = 0;

    const collapseHandler = (e) => {
        if (e.button !== 1 || e.shiftKey || e.altKey) return;
        const now = Date.now();
        if (now - lastClickTime < DEBOUNCE_TIME) return;
        lastClickTime = now;

        // 查找可编辑块
        const editable = findEditableParent(e.target);
        if (!editable) return;

        // 查找列表项或标题
        const found = editable.closest('[data-type="NodeListItem"], [data-type="NodeHeading"]');
        if (!found) return;

        e.preventDefault();

        // 列表项折叠/展开
        if (found.getAttribute("data-type") === "NodeListItem") {
            const nodeId = found.getAttribute("data-node-id");
            if (!nodeId) return;
            // 只有存在.list子元素时才允许折叠
            const hasList = found.querySelector(':scope > .list');
            if (!hasList) return;
            const fold = found.getAttribute("fold");
            // 直接发送API请求设置折叠状态
            fetch('/api/attr/setBlockAttrs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ""}`
                },
                body: JSON.stringify({
                    id: nodeId,
                    attrs: { fold: fold === "1" ? "0" : "1" }
                })
            }).then(() => {
                // 更新本地属性
                found.setAttribute('fold', fold === "1" ? "0" : "1");
            });
        }
        // 标题折叠/展开
        else if (found.getAttribute("data-type") === "NodeHeading") {
            // 查找同级的折叠按钮
            const protyle = found.closest(".protyle");
            const gutters = protyle && protyle.querySelector(".protyle-gutters");
            const foldBtn = gutters && gutters.querySelector('[data-type="fold"]');
            if (foldBtn) foldBtn.click();
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
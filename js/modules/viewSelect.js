// ========================================
// 模块：视图选择UI
// ========================================

import { i18n } from './i18n.js';

// 视图按钮配置
const viewButtons = {
    NodeList: [
        { id: "GraphView", attrName: "f", attrValue: "dt", icon: "iconFiles", labelKey: "转换为导图" },
        { id: "TableView", attrName: "f", attrValue: "bg", icon: "iconTable", labelKey: "转换为表格" },
        { id: "kanbanView", attrName: "f", attrValue: "kb", icon: "iconMenu", labelKey: "转换为看板" },
        { id: "timelineView", attrName: "f", attrValue: "tl", icon: "iconList", labelKey: "转换为时间线" },
        { id: "DefaultView", attrName: "f", attrValue: "", icon: "iconList", labelKey: "恢复为列表" }
    ],
    NodeTable: [
        { id: "FixWidth", attrName: "f", attrValue: "", icon: "iconTable", labelKey: "默认宽度" },
        { id: "FullWidth", attrName: "f", attrValue: "full", icon: "iconTable", labelKey: "页面宽度" },
        { separator: true },
        { id: "vHeader", attrName: "t", attrValue: "vbiaotou", icon: "iconSuper", labelKey: "竖向表头样式" },
        { id: "Removeth", attrName: "t", attrValue: "biaotou", icon: "iconSuper", labelKey: "空白表头样式" },
        { id: "Defaultth", attrName: "t", attrValue: "", icon: "iconSuper", labelKey: "恢复表头样式" }
    ]
};

// 创建视图选择菜单
const ViewSelect = (selectid, selecttype) => {
    const button = document.createElement("button");
    button.id = "viewselect";
    button.className = "b3-menu__item";
    button.innerHTML = `
        <svg class="b3-menu__icon"><use xlink:href="#iconGlobalGraph"></use></svg>
        <span class="b3-menu__label">${i18n.t("视图选择")}</span>
        <svg class="b3-menu__icon b3-menu__icon--arrow"><use xlink:href="#iconRight"></use></svg>
    `;
    
    const submenu = document.createElement("button");
    submenu.id = "viewselectSub";
    submenu.className = "b3-menu__submenu";
    
    const menuItems = document.createElement("div");
    menuItems.className = "b3-menu__items";
    
    const buttons = viewButtons[selecttype] || [];
    
    menuItems.innerHTML = buttons.map(btn => {
        if (btn.separator) {
            return `<button class="b3-menu__separator"></button>`;
        } else {
            return `
                <button class="b3-menu__item" data-view-item="1" data-node-id="${selectid}"
                        data-attr-name="${btn.attrName}" data-attr-value="${btn.attrValue}">
                    <svg class="b3-menu__icon"><use xlink:href="#${btn.icon}"></use></svg>
                    <span class="b3-menu__label">${i18n.t(btn.labelKey)}</span>
                </button>
            `;
        }
    }).join("");
    
    submenu.appendChild(menuItems);
    button.appendChild(submenu);
    return button;
};

// 获取选中的块信息
const getBlockSelected = () => {
    const node = document.querySelector(".protyle-wysiwyg--select");
    return node?.dataset?.nodeId ? {
        id: node.dataset.nodeId,
        type: node.dataset.type,
        subtype: node.dataset.subtype
    } : null;
};

// 清除转换数据
const clearTransformData = (id, blocks) => {
    try {
        const positions = JSON.parse(localStorage.getItem("dt-positions") || "{}");
        if (positions[id]) {
            delete positions[id];
            localStorage.setItem("dt-positions", JSON.stringify(positions));
            // 注意：cleanupDraggable函数需要在其他模块中定义
        }
    } catch (error) {
        // 清除transform数据出错: error
    }
};

// 统一API请求函数
const apiRequest = async (url, data) => {
    try {
        return await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${window.siyuan?.config?.api?.token ?? ""}`
            },
            body: JSON.stringify(data)
        });
    } catch (e) { /* API请求失败: e */ }
};

// API请求队列
const apiRequestQueue = new Map();

// 设置思源块属性
const 设置思源块属性 = async (id, attrs) => {
    const key = `${id}-${JSON.stringify(attrs)}`;
    if (apiRequestQueue.has(key)) return;
    apiRequestQueue.set(key, true);
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await apiRequest("/api/attr/setBlockAttrs", { id, attrs });
        apiRequestQueue.delete(key);
    } catch (e) {
        setTimeout(() => apiRequestQueue.delete(key), 1000);
    }
};

// 插入菜单项
const InsertMenuItem = (selectid, selecttype) => {
    const commonMenu = document.querySelector("#commonMenu .b3-menu__items");
    if (!commonMenu) return;
    
    const readonly = commonMenu.querySelector(`[data-id="updateAndCreatedAt"]`);
    const selectview = commonMenu.querySelector(`[id="viewselect"]`);
    
    if (readonly && !selectview) {
        const separator = document.createElement("button");
        separator.className = "b3-menu__separator";
        
        commonMenu.insertBefore(ViewSelect(selectid, selecttype), readonly);
        commonMenu.insertBefore(separator, readonly);
    }
};

// 菜单监控处理器
let menuHandler = null;
let viewSelectClickHandler = null;

// 初始化菜单监控
export const initViewSelect = () => {
    if (menuHandler) return;
    
    // 存储事件监听器引用，以便后续清理
    menuHandler = () => {
        requestAnimationFrame(() => {
            const selectinfo = getBlockSelected();
            if (selectinfo && (selectinfo.type === "NodeList" || selectinfo.type === "NodeTable")) {
                InsertMenuItem(selectinfo.id, selectinfo.type);
            }
        });
    };
    
    window.addEventListener("mouseup", menuHandler);
    
    // 统一的事件委托，处理视图选择子项点击
    viewSelectClickHandler = (event) => {
        const item = event.target.closest('.b3-menu__item[data-view-item="1"]');
        if (!item) return;
        const id = item.dataset.nodeId;
        const attrName = "custom-" + item.dataset.attrName;
        const attrValue = item.dataset.attrValue;
        const blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`);
        clearTransformData(id, blocks);
        if (blocks?.length > 0) {
            blocks.forEach(block => block.setAttribute(attrName, attrValue));
            if (attrValue === "") {
                // 不需要清理导图拖拽功能，通过CSS控制按钮显示/隐藏
            }
            设置思源块属性(id, { [attrName]: attrValue });
        }
    };
    document.addEventListener("click", viewSelectClickHandler, true);
};

// 清理视图选择功能
export const cleanupViewSelect = () => {
    if (menuHandler) {
        window.removeEventListener("mouseup", menuHandler);
        menuHandler = null;
    }
    if (viewSelectClickHandler) {
        document.removeEventListener("click", viewSelectClickHandler, true);
        viewSelectClickHandler = null;
    }
};


// ========================================
// 模块：打字机模式功能
// ========================================

import { throttle } from './utils.js';

let typewriterModeActive = false, typewriterHandler = null;

// 启用打字机模式
export const enableTypewriterMode = () => {
    if (typewriterModeActive) return;
    typewriterModeActive = true;
    typewriterHandler = throttle(() => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        let node = sel.anchorNode || sel.getRangeAt(0).startContainer;
        node = node.nodeType === 3 ? node.parentElement : node;
        const line = node.closest(".p, .h1, .h2, .h3, .h4, .h5, .h6, .li");
        if (!line) return;
        line.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }, 100);
    document.addEventListener("selectionchange", typewriterHandler);
};

// 禁用打字机模式
export const disableTypewriterMode = () => {
    if (!typewriterModeActive) return;
    typewriterModeActive = false;
    if (typewriterHandler) {
        document.removeEventListener("selectionchange", typewriterHandler);
        typewriterHandler = null;
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
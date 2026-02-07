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
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editor = document.querySelector(".protyle-content") || document.documentElement;
        const editorRect = editor.getBoundingClientRect();
        const scrollTop = editor.scrollTop || document.documentElement.scrollTop || document.body.scrollTop;
        const editorCenter = editorRect.top + editorRect.height / 2;
        const cursorPosition = rect.top + rect.height / 2;
        const scrollAmount = scrollTop + (cursorPosition - editorCenter);
        if (editor === document.documentElement || editor === document.body) {
            window.scrollTo({ top: scrollAmount, behavior: "smooth" });
        } else {
            editor.scrollTo({ top: scrollAmount, behavior: "smooth" });
        }
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
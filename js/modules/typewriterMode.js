// ========================================
// 模块：打字机模式功能
// ========================================

import { throttle } from './utils.js';
import { config } from './config.js';

const TYPEWRITER_SHORTCUT_KEY = 'typewriterModeShortcut';
const DEFAULT_TYPEWRITER_SHORTCUT = 'Ctrl+Alt+T';

let typewriterModeActive = false, typewriterHandler = null, typewriterEnterHandler = null, typewriterShortcutHandler = null;

const normalizeShortcut = (shortcut) => {
    const parts = String(shortcut || '').trim().split('+').map(part => part.trim()).filter(Boolean);
    if (!parts.length) return null;

    const modifiers = new Set();
    let key = null;
    for (const part of parts) {
        const normalized = part.toLowerCase();
        if (normalized === 'ctrl' || normalized === 'control') modifiers.add('Ctrl');
        else if (normalized === 'alt' || normalized === 'option') modifiers.add('Alt');
        else if (normalized === 'shift') modifiers.add('Shift');
        else if (normalized === 'meta' || normalized === 'cmd' || normalized === 'command' || normalized === 'win') modifiers.add('Meta');
        else if (!key) key = part.length === 1 ? part.toUpperCase() : part;
        else return null;
    }

    if (!key || !modifiers.size) return null;
    return [...['Ctrl', 'Alt', 'Shift', 'Meta'].filter(modifier => modifiers.has(modifier)), key].join('+');
};

export const getTypewriterShortcut = () => normalizeShortcut(config.get(TYPEWRITER_SHORTCUT_KEY)) || DEFAULT_TYPEWRITER_SHORTCUT;

export const setTypewriterShortcut = (shortcut) => {
    const normalized = normalizeShortcut(shortcut);
    if (!normalized) return false;
    config.set(TYPEWRITER_SHORTCUT_KEY, normalized);
    return true;
};

const matchesShortcut = (event, shortcut) => {
    const parts = shortcut.split('+');
    const key = parts.pop();
    const has = modifier => parts.includes(modifier);
    if (event.ctrlKey !== has('Ctrl') || event.altKey !== has('Alt') || event.shiftKey !== has('Shift') || event.metaKey !== has('Meta')) return false;

    const eventKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    return eventKey === key || event.code === key;
};

export const toggleTypewriterMode = () => {
    if (typewriterModeActive) {
        disableTypewriterMode();
        config.set('typewriterMode', '0');
        document.getElementById('typewriterMode')?.classList.remove('button_on');
    } else {
        enableTypewriterMode();
        config.set('typewriterMode', '1');
        document.getElementById('typewriterMode')?.classList.add('button_on');
    }
};

const getTypewriterEditor = (selection) => {
    if (!selection || !selection.rangeCount) return document.documentElement;

    const range = selection.getRangeAt(0);
    const node = range.startContainer || range.commonAncestorContainer;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const editor = element?.closest?.(".protyle-content");
    if (editor) return editor;

    return document.querySelector(".layout__wnd--active .protyle-content")
        || document.documentElement;
};

const getCaretRect = (range, selection) => {
    let rect = range.getBoundingClientRect();
    if (rect.height > 0) return rect;

    const rects = range.getClientRects();
    if (rects.length > 0 && rects[0].height > 0) return rects[0];

    const node = selection?.focusNode || range.startContainer || range.commonAncestorContainer;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const line = element?.closest?.("[data-node-id]") || element?.closest?.("[contenteditable='true']");
    if (line) {
        rect = line.getBoundingClientRect();
        if (rect.height > 0) return rect;
    }
    return null;
};

const syncTypewriterScroll = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const rect = getCaretRect(range, sel);
    if (!rect) return;
    const editor = getTypewriterEditor(sel);
    const editorRect = editor.getBoundingClientRect();
    const scrollTop = editor === document.documentElement || editor === document.body
        ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
        : editor.scrollTop;
    const editorCenter = editorRect.top + editorRect.height / 2;
    const cursorPosition = rect.top + rect.height / 2;
    const scrollAmount = scrollTop + (cursorPosition - editorCenter);
    if (editor === document.documentElement || editor === document.body) {
        window.scrollTo({ top: scrollAmount, behavior: "smooth" });
    } else {
        editor.scrollTo({ top: scrollAmount, behavior: "smooth" });
    }
};

// 启用打字机模式
export const enableTypewriterMode = () => {
    if (typewriterModeActive) return;
    typewriterModeActive = true;
    typewriterHandler = throttle(() => requestAnimationFrame(syncTypewriterScroll), 100);
    typewriterEnterHandler = (event) => {
        if (event.key !== "Enter") return;
        const target = event.target;
        if (!target?.closest?.(".protyle-content")) return;
        requestAnimationFrame(syncTypewriterScroll);
    };
    document.addEventListener("selectionchange", typewriterHandler);
    document.addEventListener("keyup", typewriterEnterHandler, true);
};

// 禁用打字机模式
export const disableTypewriterMode = () => {
    if (!typewriterModeActive) return;
    typewriterModeActive = false;
    if (typewriterHandler) {
        document.removeEventListener("selectionchange", typewriterHandler);
        typewriterHandler = null;
    }
    if (typewriterEnterHandler) {
        document.removeEventListener("keyup", typewriterEnterHandler, true);
        typewriterEnterHandler = null;
    }
};

// 初始化打字机模式模块
export const initTypewriterModeModule = () => {
    typewriterShortcutHandler = (event) => {
        if (event.isComposing || event.repeat || !matchesShortcut(event, getTypewriterShortcut())) return;
        event.preventDefault();
        event.stopPropagation();
        toggleTypewriterMode();
    };
    document.addEventListener('keydown', typewriterShortcutHandler, true);
    window.enableTypewriterMode = enableTypewriterMode;
    window.disableTypewriterMode = disableTypewriterMode;
    window.toggleTypewriterMode = toggleTypewriterMode;
    window.getTypewriterShortcut = getTypewriterShortcut;
    window.setTypewriterShortcut = setTypewriterShortcut;
    window.cleanupTypewriterMode = cleanupTypewriterMode;
};

// 清理打字机模式功能
export const cleanupTypewriterMode = () => {
    // 禁用打字机模式
    disableTypewriterMode();
    if (typewriterShortcutHandler) {
        document.removeEventListener('keydown', typewriterShortcutHandler, true);
        typewriterShortcutHandler = null;
    }
    
    // 清理全局变量
    window.enableTypewriterMode = null;
    window.disableTypewriterMode = null;
    window.toggleTypewriterMode = null;
    window.getTypewriterShortcut = null;
    window.setTypewriterShortcut = null;
    window.cleanupTypewriterMode = null;
};

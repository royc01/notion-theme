// ========================================
// 工具函数模块
// ========================================

export const debounce = (fn, delay) => {
    let timer = null;
    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

export const throttle = (fn, delay) => {
    let lastTime = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastTime >= delay) {
            fn(...args);
            lastTime = now;
        }
    };
};

export const $ = (selector) => selector.startsWith('#') ? 
    document.getElementById(selector.substring(1)) : 
    document.querySelector(selector);

export const $$ = (selector) => document.querySelectorAll(selector);

// 初始化工具函数到全局作用域
export const initUtils = () => {
    window.debounce = debounce;
    window.throttle = throttle;
    window.Savor$ = $;
    window.Savor$$ = $$;
};

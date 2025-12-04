// ========================================
// 国际化支持模块
// ========================================

export const i18n = (() => {
    let lang = (window.siyuan?.config?.lang || 'en').toLowerCase();
    if (lang === 'zh_cht') lang = 'zh_CHT';
    else if (lang.startsWith('zh')) lang = 'zh_CN';
    else lang = 'en';
    let dict = {};
    let ready = fetch(`/appearance/themes/Savor/i18n/${lang}.json`)
        .then(res => res.ok ? res.json() : {})
        .then(json => { dict = json; })
        .catch(error => {
            console.warn('[Savor] 语言文件加载失败:', error);
            dict = {};
        });
    return {
        t: (key) => dict[key] || key,
        ready: () => ready
    };
})();

export const initI18n = () => {
    // 确保i18n对象正确挂载到window对象上
    window.i18n = i18n;
    
    // 同时也确保在页面加载完成后能够正确初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.i18n = i18n;
        });
    }
};
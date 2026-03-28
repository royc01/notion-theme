// Savor 主题模块化入口文件

(() => {
    const startSavorInit = () => {
        import('./js/main.js').then(module => {
            module.initAll();
        }).catch(error => {
            // 模块加载失败: error
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSavorInit, { once: true });
    } else {
        startSavorInit();
    }
})();

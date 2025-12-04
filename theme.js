﻿// Savor 主题模块化入口文件

document.addEventListener('DOMContentLoaded', () => {
    import('./js/main.js').then(module => {
        module.initAll();
    }).catch(error => {
        // 模块加载失败: error
    });
});

// 确保在页面加载完成后也尝试初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    import('./js/main.js').then(module => {
        module.initAll();
    }).catch(error => {
        // 模块加载失败: error
    });
}


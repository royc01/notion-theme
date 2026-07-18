// ========================================
// 模块：垂直页签功能
// ========================================

// 垂直页签宽度调节功能
export const tabbarResize = {
    resizer: null, resizeTarget: null, isResizing: false, startX: 0, startWidth: 0, tabbar: null,
    MIN: 150, MAX: 600,
    init() {
        this.remove(false);
        const tabbar = document.querySelector(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)");
        if (tabbar) this.create(tabbar);
    },
    create(tabbar) {
        tabbar.style.position = "relative";
        this.resizeTarget = tabbar;
        tabbar.addEventListener("mousedown", this.handleMouseDown);
        document.addEventListener("mousemove", this.move);
        document.addEventListener("mouseup", this.stop);
    },
    handleMouseDown: e => {
        const tabbar = e.currentTarget;
        const rect = tabbar.getBoundingClientRect();
        if (e.button !== 0 || e.clientX < rect.right - 6) return;
        tabbarResize.start(e, tabbar);
    },
    start(e, tabbar) {
        e.preventDefault();
        Object.assign(this, { isResizing: true, startX: e.clientX, tabbar, startWidth: tabbar.offsetWidth });
        document.body.classList.add("tabbar-resizing");
    },
    move: e => {
        if (!tabbarResize.isResizing || !tabbarResize.tabbar) return;
        let w = tabbarResize.startWidth + (e.clientX - tabbarResize.startX);
        w = Math.max(tabbarResize.MIN, Math.min(w, tabbarResize.MAX));
        tabbarResize.tabbar.style.width = w + "px";
    },
    stop: () => {
        if (!tabbarResize.isResizing) return;
        tabbarResize.isResizing = false;
        document.body.classList.remove("tabbar-resizing");
        tabbarResize.tabbar = null;
    },
    remove(reset = true) {
        document.removeEventListener("mousemove", this.move);
        document.removeEventListener("mouseup", this.stop);
        this.resizeTarget?.removeEventListener("mousedown", this.handleMouseDown);
        document.getElementById("vertical-resize-handle")?.remove();
        document.body.classList.remove("tabbar-resizing");
        if (reset) document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabbar => {
            tabbar.style.width = "";
            tabbar.style.position = "";
        });
        Object.assign(this, { resizer: null, resizeTarget: null, isResizing: false, tabbar: null });
    }
};

// 初始化垂直页签功能
export const initTabbarVertical = () => {
    window.tabbarResize = tabbarResize;
    window.cleanupTabbarVertical = cleanupTabbarVertical;
};

// 清理垂直页签功能
export const cleanupTabbarVertical = () => {
    // 清理宽度调节功能
    if (typeof window.tabbarResize?.remove === 'function') {
        try {
            window.tabbarResize.remove();
        } catch (e) {
            // tabbarResize清理失败: e
        }
    }
    
    // 清理全局变量
    window.tabbarResize = null;
};

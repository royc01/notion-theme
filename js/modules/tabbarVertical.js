// ========================================
// 模块：垂直页签功能
// ========================================

// 垂直页签宽度调节功能
export const tabbarResize = {
    resizer: null, resizeTarget: null, resizeTargets: [], observer: null, isResizing: false, startX: 0, startWidth: 0, tabbar: null,
    MIN: 150, MAX: 600,
    init() {
        this.remove(false);
        this.bindAll();
        const layoutCenter = document.querySelector(".layout__center");
        if (layoutCenter) {
            this.observer = new MutationObserver(() => this.bindAll());
            this.observer.observe(layoutCenter, { childList: true, subtree: true });
        }
    },
    bindAll() {
        document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)")
            .forEach(tabbar => {
                if (!this.resizeTargets.includes(tabbar)) this.create(tabbar);
            });
    },
    create(tabbar) {
        tabbar.style.position = "relative";
        this.resizeTarget = tabbar;
        const resizer = document.createElement("div");
        resizer.className = "vertical-resize-handle";
        resizer.setAttribute("aria-hidden", "true");
        tabbar.append(resizer);
        this.resizer = resizer;
        this.resizeTargets.push(tabbar);
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
        this.resizer = tabbar.querySelector(".vertical-resize-handle");
        this.resizer?.classList.add("is-active");
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
        tabbarResize.resizer?.classList.remove("is-active");
        document.body.classList.remove("tabbar-resizing");
        Object.assign(tabbarResize, { tabbar: null, resizer: null });
    },
    remove(reset = true) {
        this.observer?.disconnect();
        document.removeEventListener("mousemove", this.move);
        document.removeEventListener("mouseup", this.stop);
        this.resizeTargets.forEach(tabbar => {
            tabbar.removeEventListener("mousedown", this.handleMouseDown);
            tabbar.querySelector(".vertical-resize-handle")?.remove();
        });
        document.body.classList.remove("tabbar-resizing");
        if (reset) document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabbar => {
            tabbar.style.width = "";
            tabbar.style.position = "";
        });
        Object.assign(this, { resizer: null, resizeTarget: null, resizeTargets: [], observer: null, isResizing: false, tabbar: null });
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

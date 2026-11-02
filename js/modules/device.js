// ========================================
// Shared device and viewport detection
// ========================================

const MOBILE_USER_AGENT_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const matchesMedia = (query) => {
    try {
        return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
    } catch (_) {
        return false;
    }
};

const getViewportWidth = () => {
    const widths = [window.innerWidth, window.screen?.width].filter(value => Number.isFinite(value) && value > 0);
    return widths.length ? Math.min(...widths) : Number.POSITIVE_INFINITY;
};

export const isOfficialMobileLayout = () => !!document.getElementById("editor");

export const isTouchCapable = () => {
    return "ontouchstart" in window
        || navigator.maxTouchPoints > 0
        || matchesMedia("(pointer: coarse)")
        || matchesMedia("(hover: none)");
};

export const isMobileUserAgent = () => MOBILE_USER_AGENT_RE.test(navigator.userAgent || "");

const isDesktopClient = () => {
    const frontend = document.documentElement.getAttribute("data-frontend");
    return frontend === "desktop"
        || frontend === "desktop-window"
        || /\bElectron\b/i.test(navigator.userAgent || "");
};

export const isLikelyMobileBrowser = () => {
    // 桌面客户端启动时窗口可能尚未恢复尺寸，触摸能力和临时窄视口不能作为移动端依据。
    if (isOfficialMobileLayout() || isDesktopClient()) return false;

    return isMobileUserAgent()
        || (isTouchCapable() && getViewportWidth() <= 900);
};

export const shouldUseMobileThemeLayout = () => {
    return isOfficialMobileLayout() || isLikelyMobileBrowser();
};

export const shouldLimitDesktopEnhancements = () => shouldUseMobileThemeLayout();

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

export const isLikelyMobileBrowser = () => {
    if (isOfficialMobileLayout()) return false;

    return isMobileUserAgent()
        || (isTouchCapable() && getViewportWidth() <= 900);
};

export const shouldUseMobileThemeLayout = () => {
    return isOfficialMobileLayout() || isLikelyMobileBrowser();
};

export const shouldLimitDesktopEnhancements = () => shouldUseMobileThemeLayout();

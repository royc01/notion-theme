// ========================================
// 模块：移动端和平台判断功能
// ========================================

import { initMobileAndPlatformFeatures, cleanupMobileMenu } from './mobileMenu.js';

/**
 * 判断是否为移动端设备
 * @returns {boolean} 是否为移动端
 */
export const isMobile = () => {
    // 通过检查是否存在 #editor 元素来判断是否为移动端
    return !!document.getElementById("editor");
};

/**
 * 判断是否为Mac系统
 * @returns {boolean} 是否为Mac系统
 */
export const isMac = () => {
    return navigator.platform.toUpperCase().indexOf("MAC") > -1;
};

/**
 * 判断是否为Windows系统
 * @returns {boolean} 是否为Windows系统
 */
export const isWindows = () => {
    return navigator.platform.toUpperCase().indexOf("WIN") > -1;
};

/**
 * 判断是否为Linux系统
 * @returns {boolean} 是否为Linux系统
 */
export const isLinux = () => {
    return navigator.platform.toUpperCase().indexOf("LINUX") > -1;
};

/**
 * 获取平台类型
 * @returns {'mobile' | 'mac' | 'windows' | 'linux' | 'unknown'} 平台类型
 */
export const getPlatform = () => {
    if (isMobile()) return 'mobile';
    if (isMac()) return 'mac';
    if (isWindows()) return 'windows';
    if (isLinux()) return 'linux';
    return 'unknown';
};

/**
 * 判断是否为桌面端
 * @returns {boolean} 是否为桌面端
 */
export const isDesktop = () => {
    return !isMobile();
};

/**
 * 判断是否为触摸设备
 * @returns {boolean} 是否为触摸设备
 */
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * 获取设备类型
 * @returns {'touch' | 'mouse'} 设备类型
 */
export const getDeviceType = () => {
    return isTouchDevice() ? 'touch' : 'mouse';
};

// 初始化平台判断功能
export const initPlatformDetection = () => {
    window.SavorPlatform = {
        isMobile,
        isMac,
        isWindows,
        isLinux,
        getPlatform,
        isDesktop,
        isTouchDevice,
        getDeviceType
    };
    
    // 添加平台相关的CSS类到body元素
    const platform = getPlatform();
    const deviceType = getDeviceType();
    
    document.body.classList.add(`platform-${platform}`);
    document.body.classList.add(`device-${deviceType}`);
    
    // 初始化移动端和平台相关功能
    initMobileAndPlatformFeatures();
};

// 清理平台判断功能
export const cleanupPlatformDetection = () => {
    
    // 移除添加的CSS类
    const platform = window.SavorPlatform?.getPlatform?.() || 'unknown';
    const deviceType = window.SavorPlatform?.getDeviceType?.() || 'mouse';
    
    document.body.classList.remove(`platform-${platform}`);
    document.body.classList.remove(`device-${deviceType}`);
    
    // 清理移动端菜单功能
    cleanupMobileMenu();
    
    // 清理全局变量
    window.SavorPlatform = null;
};

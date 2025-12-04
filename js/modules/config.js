// ========================================
// 配置管理模块
// ========================================

import { debounce } from './utils.js';
import { 写入文件, 获取文件 } from './fileOps.js';

export const config = {
    data: {},
    save: debounce(function() {
        写入文件("/data/snippets/Savor.config.json", JSON.stringify(config.data, undefined, 4));
    }, 300),
    set(key, value) {
        if (config.data[key] === value) return;
        config.data[key] = value;
        config.save();
    },
    get(key) {
        return config.data[key] ?? null;
    },
    async load() {
        const result = await 获取文件("/data/snippets/Savor.config.json");
        if (result) {
            config.data = typeof result === "string" ? JSON.parse(result) : result;
        } else {
            config.data = { "Savor": 1 };
            config.save();
        }
    }
};

export const initConfig = async () => {
    window.config = config;
    await config.load();
};
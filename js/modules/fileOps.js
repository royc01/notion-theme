// ========================================
// 文件操作模块
// ========================================

export const fileOps = {
    async get(path, callback = null) {
        try {
            const response = await fetch("/api/file/getFile", {
                body: JSON.stringify({ path }),
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Token ${window.siyuan?.config?.api?.token ?? ""}` 
                } 
            });
            const data = response.ok ? await response.json() : null;
            callback?.(data);
            return data;
        } catch (error) {
            // API 请求失败: error
            callback?.(null);
            return null;
        }
    },
    
    async put(path, data, callback = null) {
        // 简化FormData创建
        const formData = new FormData();
        formData.append("path", path);
        formData.append("file", new File([data], path.split("/").pop()));
        formData.append("isDir", false);
        formData.append("modTime", Date.now());
        
        try {
            await fetch("/api/file/putFile", {
                body: formData,
                method: "POST",
                headers: { Authorization: `Token ${window.siyuan.config.api.token ?? ""}` },
            });
            callback && setTimeout(callback, 200);
        } catch (error) {
            // 写入文件出错: error
        }
    }
};

export const 获取文件 = fileOps.get;
export const 写入文件 = fileOps.put;

// 初始化文件操作到全局作用域
export const initFileOps = () => {
    window.fileOps = fileOps;
    window.获取文件 = 获取文件;
    window.写入文件 = 写入文件;
};
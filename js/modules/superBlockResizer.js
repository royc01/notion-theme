// ========================================
// 模块：超级块宽度调节
// ========================================

import { throttle } from './utils.js';

// 常量定义
const HANDLE_CLASS = 'sb-resize-handle';
const SB_CLASS = 'sb-resize-container';
const MIN_PERCENT = 10;

// 样式注入
function ensureStyles() {
    if (document.getElementById('sb-resizer-styles')) return;
    const st = document.createElement('style');
    st.id = 'sb-resizer-styles';
    st.textContent = `
    .${SB_CLASS}{position:relative;}
    .${HANDLE_CLASS}{position:absolute;top:0;bottom:0;width:20px;margin-left:-6px;cursor:col-resize;z-index:1;background:transparent;opacity:0;pointer-events:auto;transition:opacity 0.3s ease;}
    .${HANDLE_CLASS}::after{content:'';position:absolute;top:8px;bottom:8px;left:3px;width:5px;border-radius:3px;background:var(--b3-border-color);opacity:0.5;}
    .sb-resizing *{user-select:none!important;}
    .${HANDLE_CLASS}:hover{opacity: 1;}
    .sb-percentage{position:absolute;top:7px;right:5px;background:var(--Sv-theme-surface);color:var(--b3-theme-on-background);padding:2px 6px;border-radius:6px;font-size:12px;pointer-events:none;z-index:2;opacity:0;transition:opacity 0.3s ease;}
    .sb-resizing .sb-percentage{opacity:1;}
    .sb-add-column-btn{position:absolute;top:2px;bottom:0;right:-30px;width:20px;margin:auto 0;border-radius:6px;background:var(--b3-border-color);color:var(--Sv-list-counter-color);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;opacity:0;transition:opacity 0.3s ease, transform 0.2s ease;user-select:none!important;border:none;font-size:24px;}
    .sb-add-column-btn::before{content:'';position:absolute;left:-15px;top:0;width:25px;height:100%;background:transparent;}
    .sb-add-column-btn:hover{opacity:0.6!important;}
    `;                        
    document.head.appendChild(st);
}

// 核心工具函数
const isColLayout = sb => sb?.getAttribute?.('data-sb-layout') === 'col';

// 获取列信息
const getColumns = sb => {
    if (!isColLayout(sb)) return [];
    let cols = Array.from(sb.children).filter(el => el?.dataset?.nodeId && el.offsetParent !== null);
    if (cols.length < 2 && sb.firstElementChild) {
        const firstChild = sb.firstElementChild;
        if (firstChild?.dataset?.type === 'NodeSuperBlock' && firstChild?.getAttribute?.('data-sb-layout') === 'row') {
            return cols;
        }
        const nested = Array.from(firstChild.children).filter(el => el?.dataset?.nodeId && el.offsetParent !== null);
        if (nested.length >= 2) cols = nested;
    }
    return cols;
};

const getGap = host => {
    try {
        const cs = getComputedStyle(host);
        let g = parseFloat(cs.columnGap);
        if (!isFinite(g) && cs.gap) g = parseFloat(cs.gap.split(' ')[1] || cs.gap.split(' ')[0]);
        return isFinite(g) ? g : 0;
    } catch (_) { return 0; }
};

// 宽度操作
const readWidth = el => {
    const ds = parseFloat(el?.dataset?.sbPct || '');
    if (isFinite(ds)) return ds;
    const style = el?.getAttribute?.('style') || '';
    const mCalc = style.match(/width\s*:\s*calc\(([-\d.]+)%\s*-\s*([-\d.]+)px\)/i);
    if (mCalc && isFinite(parseFloat(mCalc[1]))) return parseFloat(mCalc[1]);
    const mPct = style.match(/width\s*:\s*([-\d.]+)%/i);
    return mPct && isFinite(parseFloat(mPct[1])) ? parseFloat(mPct[1]) : NaN;
};

const setWidth = (sb, col, percent) => {
    const v = Math.max(0, isFinite(percent) ? percent : 0);
    const vRound = Math.round(v * 1000) / 1000;
    const host = col?.parentElement || sb;
    const count = getColumns(sb).length || 1;
    const gapShare = count > 0 ? (getGap(host) * (count - 1)) / count : 0;
    Object.assign(col.style, { flex: '0 0 auto', width: `calc(${vRound}% - ${Math.round(gapShare * 10) / 10}px)` });
    col.dataset.sbPct = String(vRound);
};

const measureWidths = (sb, cols) => {
    const host = cols[0]?.parentElement || sb;
    const w = host.getBoundingClientRect().width || 1;
    const gapShare = cols.length > 0 ? (getGap(host) * (cols.length - 1)) / cols.length : 0;
    return cols.map(col => ((col.getBoundingClientRect().width + gapShare) / w) * 100);
};

// 简化 normalizeWidths 函数
const normalizeWidths = (values, min = MIN_PERCENT, total = 100) => {
    const n = values.length;
    if (!n) return [];
    const avg = total / n;
    return values.map(x => isFinite(x) && x > 0 ? x : avg);
};

// 简化的宽度保存
const saveWidth = async (colEl, pct, gapShare) => {
    const id = colEl?.dataset?.nodeId;
    if (!id) return;
    const vRound = Math.round(pct * 1000) / 1000, gapRound = Math.round((gapShare || 0) * 10) / 10;
    Object.assign(colEl.style, { flex: '0 0 auto', width: `calc(${vRound}% - ${gapRound}px)`, flexBasis: 'auto' });
    colEl.dataset.sbPct = String(vRound);
    try { 
        // 这里需要替换成实际的思源API调用函数
        // await 设置思源块属性(id, { 'style': colEl.getAttribute('style') || '' }); 
    } catch (e) {}
};

const clearWidth = async (colEl) => {
    const id = colEl?.dataset?.nodeId; 
    if (!id) return;
    ['width','flex'].forEach(prop => colEl.style.removeProperty(prop));
    delete colEl.dataset.sbPct;
    if (!colEl.getAttribute('style')) colEl.removeAttribute('style');
    try { 
        // 这里需要替换成实际的思源API调用函数
        // await 设置思源块属性(id, { 'style': colEl.getAttribute('style') || '' }); 
    } catch (_) {}
};

// 通用元素移除函数
const removeElements = (sb, selector) => sb.querySelectorAll(':scope > ' + selector).forEach(el => el.remove());

// 手柄管理
const positionHandles = async (sb) => {
    const cols = getColumns(sb);
    const hasMultiple = cols.length >= 2;
    
    if (!hasMultiple) { 
        removeElements(sb, '.' + HANDLE_CLASS);
        removeElements(sb, '.sb-add-column-btn');
        return; 
    }
    
    const rect = sb.getBoundingClientRect();
    const need = cols.length - 1;
    const existing = sb.querySelectorAll(':scope > .' + HANDLE_CLASS);
    
    if (existing.length === need) {
        for (let i = 0; i < need; i++) {
            const leftRect = cols[i].getBoundingClientRect();
            const rightRect = cols[i + 1].getBoundingClientRect();
            const centerX = ((leftRect.right + rightRect.left) / 2) - rect.left;
            existing[i].style.left = centerX + 'px';
        }
    } else {
        removeElements(sb, '.' + HANDLE_CLASS);
        for (let i = 0; i < need; i++) {
            const leftRect = cols[i].getBoundingClientRect();
            const rightRect = cols[i + 1].getBoundingClientRect();
            const centerX = ((leftRect.right + rightRect.left) / 2) - rect.left;
            const handle = document.createElement('div');
            handle.className = HANDLE_CLASS;
            handle.style.left = centerX + 'px';
            attachDrag(sb, handle, cols[i], cols[i + 1]);
            sb.appendChild(handle);
        }
    }

    removeElements(sb, '.sb-add-column-btn');
    const isTopLevel = !sb.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]:not(:scope)');
    if (cols.length > 0 && isTopLevel) {
        const lastCol = cols[cols.length - 1];
        const btn = document.createElement('div');
        btn.className = 'sb-add-column-btn protyle-custom';
        btn.textContent = '+';
        btn.type = 'div';
        btn.setAttribute('contenteditable', 'false');
        sb.appendChild(btn);

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.blur();
            if (window.getSelection) window.getSelection().removeAllRanges();
            
            // 获取最后一个列块的ID和父级超级块
            const lastID = lastCol.getAttribute('data-node-id');
            const parentSB = lastCol.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]');
            
            if (lastID) {
                try {
                    // 准备请求头
                    const headers = {
                        'Content-Type': 'application/json'
                    };
                    
                    // 添加认证令牌（如果存在）
                    if (window.siyuan?.config?.api?.token) {
                        headers['Authorization'] = `Token ${window.siyuan.config.api.token}`;
                    }
                    
                    // 调用思源API插入新块
                    const response = await fetch('/api/block/insertBlock', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({
                            dataType: 'markdown',
                            data: '',
                            previousID: lastID
                        })
                    });
                    
                    if (response.ok) {
                        // 插入成功后重新扫描超级块并更新调节杆
                        setTimeout(() => {
                            scheduleScan();
                            if (parentSB) {
                                positionHandles(parentSB);
                            }
                        }, 100);
                    } else {
                        console.error('插入新列失败，服务器返回:', response.status, response.statusText);
                    }
                } catch (error) {
                    console.error('插入新列失败:', error);
                }
            }
        });
    }
};

// 拖拽功能
const attachDrag = (sb, handle, leftEl, rightEl) => {
    let startX = 0, containerWidth = 0, startLeft = 0, startRight = 0, moved = false;

    const onPointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        const rect = sb.getBoundingClientRect();
        containerWidth = rect.width || 1;
        startX = e.clientX;
        const cols = getColumns(sb);
        const saved = cols.map(readWidth);
        const measured = measureWidths(sb, cols);
        const baseline = normalizeWidths(saved.some(v => isFinite(v)) ? saved : measured, MIN_PERCENT, 100);
        const li = cols.indexOf(leftEl), ri = cols.indexOf(rightEl);
        startLeft = baseline[li] ?? 50;
        startRight = baseline[ri] ?? 50;
        moved = false;
        sb.classList.add('sb-resizing');
        cols.forEach(c => c.style.transition = 'none');
        handle.setPointerCapture?.(e.pointerId);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp, { once: true });
    };

    const onPointerMove = throttle((e) => {
        const dx = e.clientX - startX;
        const dxPct = (dx / (containerWidth || 1)) * 100;
        if (Math.abs(dx) < 1) return;
        moved = true;
        const pairBudget = (startLeft + startRight);
        const min = Math.min(MIN_PERCENT, pairBudget / 2);
        let newLeft = Math.min(Math.max(min, startLeft + dxPct), pairBudget - min);
        const newRight = pairBudget - newLeft;
        const cols = getColumns(sb);
        const li = cols.indexOf(leftEl), ri = cols.indexOf(rightEl);
        if (li >= 0) setWidth(sb, cols[li], newLeft);
        if (ri >= 0) setWidth(sb, cols[ri], newRight);
        if (!sb.querySelector('.sb-percentage')) {
            cols.forEach(col => {
                if (!col.querySelector('.sb-percentage')) {
                    const percentEl = document.createElement('div');
                    percentEl.className = 'sb-percentage';
                    col.appendChild(percentEl);
                }
            });
        }
        const percents = measureWidths(sb, cols);
        cols.forEach((col, i) => {
            const percentEl = col.querySelector('.sb-percentage');
            if (percentEl) percentEl.textContent = Math.round(percents[i]) + '%';
        });
        requestAnimationFrame(() => positionHandles(sb));
    }, 16);

    const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        sb.classList.remove('sb-resizing');
        const cols = getColumns(sb);
        if (moved) {
            const host = cols[0]?.parentElement || sb;
            const gap = getGap(host);
            const gapShare = cols.length > 0 ? (gap * (cols.length - 1)) / cols.length : 0;
            // 只保存拖动过的左右侧块的宽度
            const li = cols.indexOf(leftEl), ri = cols.indexOf(rightEl);
            if (li >= 0) {
                const percentLeft = ((leftEl.getBoundingClientRect().width + gapShare) / (host.getBoundingClientRect().width || 1)) * 100;
                saveWidth(leftEl, Math.round(percentLeft * 1000) / 1000, gapShare);
            }
            if (ri >= 0) {
                const percentRight = ((rightEl.getBoundingClientRect().width + gapShare) / (host.getBoundingClientRect().width || 1)) * 100;
                saveWidth(rightEl, Math.round(percentRight * 1000) / 1000, gapShare);
            }
        }
        setTimeout(() => sb.querySelectorAll('.sb-percentage').forEach(el => el.remove()), 300);
        cols.forEach(c => c.style.removeProperty('transition'));
        positionHandles(sb);
    };

    const onDoubleClick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const cols = getColumns(sb);
        if (cols.length < 2) return;
        // 双击瞬间隐藏调整杆
        handle.style.opacity = '0';
        handle.style.transition = 'opacity 0s';
        
        const targetPercents = cols.map(() => 100 / cols.length);
        cols.forEach(c => c.style.transition = 'width 0.25s ease');
        targetPercents.forEach((p, i) => setWidth(sb, cols[i], p));
        setTimeout(async () => {
            cols.forEach(c => c.style.removeProperty('transition'));
            cols.forEach(c => clearWidth(c));
            positionHandles(sb);
            handle.style.opacity = '';
            handle.style.removeProperty('transition');
        }, 260);
    };
    handle.addEventListener('dblclick', onDoubleClick, { capture: true });
    
    handle.addEventListener('pointerdown', onPointerDown);
};

const applySaved = async (sb) => {
    const cols = getColumns(sb);
    const hasMultiple = cols.length >= 2;
    if (!hasMultiple) {
        if (cols.length === 1) { cols[0].style.cssText = ''; delete cols[0].dataset.sbPct; }
        return;
    }
    const saved = cols.map(readWidth);
    if (saved.some(v => isFinite(v))) cols.forEach((c, i) => { if (isFinite(saved[i])) setWidth(sb, c, saved[i]); });
};

const initSuperBlock = async (sb) => {
    if (!sb || sb._sbResizerInit || !isColLayout(sb)) return;
    sb._sbResizerInit = true;
    sb.classList.add(SB_CLASS);
    const cols = getColumns(sb);
    sb._lastColsCount = cols.length;
    await applySaved(sb);
    if (!sb._hoverHandlersAdded) {
        const showHandlers = () => {
            positionHandles(sb);
            sb._lastColsCount = cols.length;
        };
        const hideHandlers = () => {
            removeElements(sb, '.' + HANDLE_CLASS);
            removeElements(sb, '.sb-add-column-btn');
        };
        sb.addEventListener('mouseenter', showHandlers);
        sb.addEventListener('mouseleave', hideHandlers);
        sb._showHandlers = showHandlers;
        sb._hideHandlers = hideHandlers;
        sb._hoverHandlersAdded = true;
        
        // 初始化最后一列的悬浮检测
        handleLastColumnHover();
        sb._handleLastColumnHover = handleLastColumnHover;
    }
    
    function handleLastColumnHover() {
        const cols = getColumns(sb);
        if (cols.length === 0) return;
        const lastCol = cols[cols.length - 1];
        if (!lastCol || sb._lastColHandlers) return;
        
        const mouseMove = (e) => {
            const rect = lastCol.getBoundingClientRect();
            const isNearRightEdge = e.clientX > rect.right - 30 && e.clientX < rect.right + 10;
            const btn = sb.querySelector('.sb-add-column-btn');
            if (btn) btn.style.opacity = isNearRightEdge ? '1' : '0';
        };
        
        const hideBtn = () => {
            const btn = sb.querySelector('.sb-add-column-btn');
            if (btn) btn.style.opacity = '0';
        };
        
        lastCol.addEventListener('mousemove', mouseMove);
        lastCol.addEventListener('mouseleave', hideBtn);
        sb._lastColHandlers = { mouseMove, hideBtn, lastCol };
    }
};

let bodyObserver = null;
let scanScheduled = false;

const scan = async () => {
    scanScheduled = false;
    try {
        const blocksToClear = [];
        document.querySelectorAll('.protyle-wysiwyg [data-node-id][data-sb-pct], .protyle-wysiwyg [data-node-id][style*="width"]').forEach(block => {
            if (block.dataset.sbPct && !block.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]')) blocksToClear.push(block);
            const parentSB = block.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]');
            if (parentSB) {
                const columns = getColumns(parentSB);
                if (columns.length === 1 && columns[0] === block) blocksToClear.push(block);
            }
            if (block.dataset.type === 'NodeSuperBlock' && block.dataset.sbLayout === 'col') {
                const parentEl = block.parentElement;
                if (parentEl && parentEl.getAttribute?.('data-type') !== 'NodeSuperBlock') blocksToClear.push(block);
            }
        });
        if (blocksToClear.length > 0) {
            blocksToClear.forEach(block => { 
                ['width','flex'].forEach(prop => block.style.removeProperty(prop));
                delete block.dataset.sbPct;
                if (!block.getAttribute('style')) block.removeAttribute('style');
            });
        }
        
        const superBlocks = document.querySelectorAll('.protyle-wysiwyg [data-type="NodeSuperBlock"][data-sb-layout="col"]');
        const initPromises = [];
        superBlocks.forEach(sb => {
            const cols = getColumns(sb);
            if (cols.length !== sb._lastColsCount) {
                initPromises.push(initSuperBlock(sb));
            } else if (!sb._sbResizerInit) {
                initPromises.push(initSuperBlock(sb));
            }
        });
        if (initPromises.length > 0) await Promise.all(initPromises);
    } catch (e) {
        // 超级块扫描出错: e
    }
};

const scheduleScan = () => {
    if (scanScheduled) return;
    scanScheduled = true;
    setTimeout(() => { scanScheduled = false; scan(); }, 50);
};

// 启动和停止
export const start = () => {
    ensureStyles();
    scan();
    if (!bodyObserver) {
        bodyObserver = new MutationObserver(mutations => {
            let shouldScan = false;
            for (const x of mutations) {
                if (x.type === 'childList' && x.target?.closest?.('.protyle-wysiwyg')) { shouldScan = true; break; }
                if (x.type === 'attributes' && x.target?.matches?.('[data-type="NodeSuperBlock"]')) { shouldScan = true; break; }
            }
            if (shouldScan) scheduleScan();
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-type', 'data-sb-layout'] });
    }
    const handleThemeChange = () => {
        document.querySelectorAll('[data-type="NodeSuperBlock"][data-sb-layout="col"]').forEach(sb => {
            delete sb._sbResizerInit; delete sb._lastColsCount; delete sb._hoverHandlersAdded;
            if (sb._showHandlers) {
                sb.removeEventListener('mouseenter', sb._showHandlers);
                sb.removeEventListener('mouseleave', sb._hideHandlers);
                delete sb._showHandlers; delete sb._hideHandlers;
            }
            initSuperBlock(sb);
        });
    };
    if (!window._superBlockThemeChangeHandler) {
        window._superBlockThemeChangeHandler = handleThemeChange;
        window.addEventListener('themechange', handleThemeChange);
    }
};

export const stop = () => {
    bodyObserver?.disconnect(); bodyObserver = null;
    if (window._superBlockThemeChangeHandler) {
        window.removeEventListener('themechange', window._superBlockThemeChangeHandler);
        delete window._superBlockThemeChangeHandler;
    }
    
    // 简化清理逻辑
    document.querySelectorAll('.' + SB_CLASS).forEach(sb => {
        sb.classList.remove(SB_CLASS);
        removeElements(sb, '.' + HANDLE_CLASS);
        removeElements(sb, '.sb-add-column-btn');
        
        // 统一清理事件处理器
        if (sb._showHandlers) {
            sb.removeEventListener('mouseenter', sb._showHandlers);
            sb.removeEventListener('mouseleave', sb._hideHandlers);
            delete sb._showHandlers; delete sb._hideHandlers; delete sb._hoverHandlersAdded;
        }
        
        if (sb._lastColHandlers) {
            const { mouseMove, hideBtn, lastCol } = sb._lastColHandlers;
            if (mouseMove) lastCol.removeEventListener('mousemove', mouseMove);
            if (hideBtn) lastCol.removeEventListener('mouseleave', hideBtn);
            delete sb._lastColHandlers;
        }
        
        delete sb._handleLastColumnHover;
    });
    
    scanScheduled = false;
};

export const refresh = scan;
export const cleanup = stop;

// 初始化超级块宽度调节功能
export const initSuperBlockResizer = () => {
    
    // 将函数添加到全局作用域
    window.superBlockResizer = {
        start,
        stop,
        refresh,
        cleanup
    };
    
    // 启动功能
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
};


// 超级块宽度调节模块
import { throttle, debounce } from './utils.js';

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
}

// 宽度操作
const readWidth = el => {
    const ds = parseFloat(el?.dataset?.sbPct || '');
    if (isFinite(ds)) return ds;
    const style = el?.getAttribute?.('style') || '';
    const mCalc = style.match(/width\s*:\s*calc\(([-\d.]+)%\s*-\s*([\d.]+)px\)/i);
    if (mCalc && isFinite(parseFloat(mCalc[1]))) return parseFloat(mCalc[1]);
    const mPct = style.match(/width\s*:\s*([\d.]+)%/i);
    return mPct && isFinite(parseFloat(mPct[1])) ? parseFloat(mPct[1]) : NaN;
}

const setWidth = (sb, col, percent) => {
    const v = Math.max(0, isFinite(percent) ? percent : 0);
    const vRound = Math.round(v * 1000) / 1000;
    const host = col?.parentElement || sb;
    const count = getColumns(sb).length || 1;
    const gapShare = count > 0 ? (getGap(host) * (count - 1)) / count : 0;
    Object.assign(col.style, { flex: '0 0 auto', width: `calc(${vRound}% - ${Math.round(gapShare * 10) / 10}px)` });
    col.dataset.sbPct = String(vRound);
}

const measureWidths = (sb, cols) => {
    const host = cols[0]?.parentElement || sb;
    const w = host.getBoundingClientRect().width || 1;
    const gapShare = cols.length > 0 ? (getGap(host) * (cols.length - 1)) / cols.length : 0;
    return cols.map(col => ((col.getBoundingClientRect().width + gapShare) / w) * 100);
}

// normalizeWidths 函数
const normalizeWidths = (values, min = MIN_PERCENT, total = 100) => {
    const n = values.length; if (!n) return [];
    const effMin = Math.min(min, total / n);
    let v = values.map(x => Math.max(0, isFinite(x) ? x : 0));
    const nonEmpty = v.filter(x => x > 0), emptyCount = v.length - nonEmpty.length;
    if (emptyCount > 0) {
        const avg = Math.max(0, total - nonEmpty.reduce((a, b) => a + b, 0)) / emptyCount;
        v = v.map(x => x > 0 ? x : avg);
    }
    v = v.map(x => Math.max(effMin, x));
    const sum = v.reduce((a,b) => a + b, 0), base = effMin * n;
    const varSum = Math.max(0, sum - base), targetVar = Math.max(0, total - base);
    if (varSum === 0) return v.map(() => effMin);
    const factor = targetVar / varSum;
    return v.map(x => effMin + (x - effMin) * factor);
}

// 宽度保存
const saveWidth = async (colEl, pct, gapShare) => {
    const id = colEl?.dataset?.nodeId;
    if (!id) return;
    const vRound = Math.round(pct * 1000) / 1000, gapRound = Math.round((gapShare || 0) * 10) / 10;
    Object.assign(colEl.style, { flex: '0 0 auto', width: `calc(${vRound}% - ${gapRound}px)`, flexBasis: 'auto' });
    colEl.dataset.sbPct = String(vRound);
    try { 
        await fetch('/api/attr/setBlockAttrs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, attrs: { 'style': colEl.getAttribute('style') || '' } })
        });
    } catch (e) {}
}

const clearWidth = async (colEl) => {
    const id = colEl?.dataset?.nodeId; 
    if (!id) return;
    ['width','flex'].forEach(prop => colEl.style.removeProperty(prop));
    delete colEl.dataset.sbPct;
    if (!colEl.getAttribute('style')) colEl.removeAttribute('style');
    try { 
        await fetch('/api/attr/setBlockAttrs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, attrs: { 'style': colEl.getAttribute('style') || '' } })
        });
    } catch (_) {}
}

// 元素移除函数
const removeElements = (sb, selector) => sb.querySelectorAll(':scope > ' + selector).forEach(el => el.remove())

const positionHandles = async (sb) => {
    const cols = getColumns(sb);
    if (cols.length < 2) { 
        removeElements(sb, '.' + HANDLE_CLASS);
        removeElements(sb, '.sb-add-column-btn');
        return; 
    }
    
    const rect = sb.getBoundingClientRect();
    const need = cols.length - 1;
    const existingHandles = sb.querySelectorAll(':scope > .' + HANDLE_CLASS);
    
    // 优化DOM操作，只在必要时创建新的手柄
    if (existingHandles.length !== need) {
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
    } else {
        // 只更新手柄位置，不重新创建
        for (let i = 0; i < need; i++) {
            const leftRect = cols[i].getBoundingClientRect();
            const rightRect = cols[i + 1].getBoundingClientRect();
            const centerX = ((leftRect.right + rightRect.left) / 2) - rect.left;
            existingHandles[i].style.left = centerX + 'px';
        }
    }

    // 移除旧的添加列按钮并创建新的按钮
    removeElements(sb, '.sb-add-column-btn');
    const isTopLevel = !sb.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]:not(:scope)');
    if (cols.length > 0 && isTopLevel) {
        const lastCol = cols[cols.length - 1];
        // 复用现有的按钮元素，避免重复创建
        let btn = sb.querySelector('.sb-add-column-btn');
        if (!btn) {
            btn = document.createElement('div');
            btn.className = 'sb-add-column-btn protyle-custom';
            btn.textContent = '+';
            btn.type = 'div';
            btn.setAttribute('unselectable', 'on');
            btn.setAttribute('contenteditable', 'false');
            sb.appendChild(btn);
            
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.blur();
                if (window.getSelection) window.getSelection().removeAllRanges();
                const lastID = lastCol.getAttribute('data-node-id');
                if (lastID) {
                    try {
                        const response = await fetch('/api/block/insertBlock', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ''}` },
                            body: JSON.stringify({ dataType: 'markdown', data: '', previousID: lastID })
                        });
                        if (response.ok) setTimeout(() => scheduleScan(), 100);
                    } catch (error) { /* 插入新块失败 */ }
                }
            });
        }
    }
}

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
    }

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
}

const applySaved = async (sb) => {
    const cols = getColumns(sb); 
    if (cols.length < 2) {
        if (cols.length === 1) { cols[0].style.cssText = ''; delete cols[0].dataset.sbPct; }
        return;
    }
    const saved = cols.map(readWidth);
    if (saved.some(v => isFinite(v))) cols.forEach((c, i) => { if (isFinite(saved[i])) setWidth(sb, c, saved[i]); });
}

const initSuperBlock = async (sb) => {
    if (!sb || sb._sbResizerInit || !isColLayout(sb)) return;
    sb._sbResizerInit = true;
    sb.classList.add(SB_CLASS);
    const cols = getColumns(sb);
    sb._lastColsCount = cols.length;
    await applySaved(sb);
    if (!sb._hoverHandlersAdded) {
        sb._hoverHandlersAdded = true;
        const showHandles = () => {
            if (sb.classList.contains('sb-resizing')) return;
            if (cols.length >= 2) positionHandles(sb);
        };
        const hideHandles = () => {
            if (sb.classList.contains('sb-resizing')) return;
            setTimeout(() => {
                if (!sb.matches(':hover') && !sb.classList.contains('sb-resizing')) {
                    removeElements(sb, '.' + HANDLE_CLASS);
                    removeElements(sb, '.sb-add-column-btn');
                }
            }, 100);
        };
        
        sb.addEventListener('mouseenter', showHandles);
        sb.addEventListener('mouseleave', hideHandles);
        sb._showHandlers = showHandles; sb._hideHandlers = hideHandles;
    }
}

let bodyObserver = null;
let scanScheduled = false;

const scan = async () => {
    scanScheduled = false;
    try {
        const blocksToClear = [];
        document.querySelectorAll('.protyle-wysiwyg [data-node-id][data-sb-pct], .protyle-wysiwyg [data-node-id][style*="width"]').forEach(block => {
            if (block.dataset.sbPct && !block.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]')) blocksToClear.push(block);
            const parentSB = block.closest('[data-type="NodeSuperBlock"][data-sb-layout="col"]');
            if (parentSB && getColumns(parentSB).length === 1 && getColumns(parentSB)[0] === block) blocksToClear.push(block);
            if (block.dataset.type === 'NodeSuperBlock' && block.dataset.sbLayout === 'col') {
                const parentEl = block.parentElement;
                if (parentEl && parentEl.getAttribute?.('data-type') !== 'NodeSuperBlock') blocksToClear.push(block);
            }
        });
        if (blocksToClear.length > 0) {
            blocksToClear.forEach(block => { 
                try { 
                    block.style.transition = 'width 0.25s ease'; 
                    block.style.width = '100%'; 
                } catch(_) {} 
            });
            setTimeout(() => {
                blocksToClear.forEach(block => { try { block.style.removeProperty('transition'); } catch(_) {} });
                blocksToClear.forEach(block => clearWidth(block));
            }, 260);
        }
    } catch (_) {}
    
    const colSuperBlocks = document.querySelectorAll('.protyle-wysiwyg [data-type="NodeSuperBlock"][data-sb-layout="col"]');
    const initPromises = [];
    for (const sb of colSuperBlocks) {
        if (!sb._sbResizerInit) {
            initPromises.push(initSuperBlock(sb));
        } else {
            const cols = getColumns(sb), existingCols = sb._lastColsCount || 0;
            if (cols.length !== existingCols) {
                // 处理列数变化的情况
                if (cols.length === 1) {
                    // 如果只剩一列，清除宽度设置
                    const onlyCol = cols[0];
                    onlyCol.style.transition = 'width 0.25s ease';
                    setWidth(sb, onlyCol, 100);
                    setTimeout(() => { 
                        onlyCol.style.removeProperty('transition'); 
                        clearWidth(onlyCol); 
                    }, 260);
                }
                sb._lastColsCount = cols.length;
            }
        }
    }
    if (initPromises.length > 0) await Promise.all(initPromises);
}

// 防抖函数优化性能
const scheduleScan = debounce(() => {
    if (scanScheduled) return;
    scanScheduled = true;
    setTimeout(() => { scanScheduled = false; scan(); }, 30);
}, 30);

export const start = () => {
    ensureStyles();
    setTimeout(() => scan(), 100);
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
            setTimeout(() => initSuperBlock(sb), 100);
        });
    };
    window._superBlockThemeChangeHandler = handleThemeChange;
    window.addEventListener('themechange', handleThemeChange, { passive: true });
    setTimeout(() => window.dispatchEvent(new Event('themechange')), 500);
    window.siyuan?.eventBus?.on('loaded-protyle', () => setTimeout(scheduleScan, 200));
}

export const stop = () => {
    try { window.siyuan?.eventBus?.off('loaded-protyle', scan); } catch (_) {}
    bodyObserver?.disconnect(); bodyObserver = null;
    if (window._superBlockThemeChangeHandler) {
        window.removeEventListener('themechange', window._superBlockThemeChangeHandler);
        delete window._superBlockThemeChangeHandler;
    }
    document.querySelectorAll('.' + SB_CLASS).forEach(sb => {
        sb.classList.remove(SB_CLASS); removeElements(sb, '.sb-add-column-btn');
        if (sb._showHandlers) {
            sb.removeEventListener('mouseenter', sb._showHandlers);
            sb.removeEventListener('mouseleave', sb._hideHandlers);
            delete sb._showHandlers; delete sb._hideHandlers; delete sb._hoverHandlersAdded;
        }
    });
    document.querySelectorAll('.' + HANDLE_CLASS).forEach(el => el.remove());
    document.querySelectorAll('.sb-add-column-btn').forEach(btn => btn.remove());
    scanScheduled = false;
}

export const refresh = scan;
export const cleanup = stop;

export const initSuperBlockResizer = () => {
    window.superBlockResizer = { start, stop, refresh, cleanup };
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
}


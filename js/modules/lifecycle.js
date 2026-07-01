const cleanupStack = [];

const runCleanup = cleanup => {
    try {
        cleanup?.();
    } catch (error) {
        console.warn('[Savor] cleanup failed:', error);
    }
};

export const addCleanup = cleanup => {
    if (typeof cleanup !== 'function') return () => {};
    cleanupStack.push(cleanup);
    return () => {
        const index = cleanupStack.indexOf(cleanup);
        if (index >= 0) cleanupStack.splice(index, 1);
        runCleanup(cleanup);
    };
};

export const addEvent = (target, type, handler, options) => {
    target?.addEventListener?.(type, handler, options);
    return addCleanup(() => target?.removeEventListener?.(type, handler, options));
};

export const addTimeout = (handler, delay, ...args) => {
    const id = window.setTimeout(handler, delay, ...args);
    addCleanup(() => window.clearTimeout(id));
    return id;
};

export const addObserver = (target, options, callback) => {
    if (!target || typeof MutationObserver !== 'function') return null;
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    addCleanup(() => observer.disconnect());
    return observer;
};

export const addEventBus = (eventName, handler) => {
    window.siyuan?.eventBus?.on?.(eventName, handler);
    return addCleanup(() => window.siyuan?.eventBus?.off?.(eventName, handler));
};

export const destroyLifecycle = () => {
    while (cleanupStack.length) {
        runCleanup(cleanupStack.pop());
    }
};

export const initLifecycle = () => {
    window.Savor = window.Savor || {};
    window.Savor.lifecycle = {
        addCleanup,
        addEvent,
        addTimeout,
        addObserver,
        addEventBus,
        destroy: destroyLifecycle
    };
};

import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { isLikelyMobileBrowser, shouldUseMobileThemeLayout } from '../js/modules/device.js';

const originalGlobals = new Map(['window', 'document', 'navigator'].map(key => [
    key, Object.getOwnPropertyDescriptor(globalThis, key)
]));

afterEach(() => {
    for (const [key, descriptor] of originalGlobals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
    }
});

const setDevice = ({ frontend = '', userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    width = 720, touch = true, editor = false } = {}) => {
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true, value: { userAgent, maxTouchPoints: touch ? 5 : 0 }
    });
    globalThis.window = {
        innerWidth: width,
        screen: { width: 1920 },
        matchMedia: () => ({ matches: touch }),
        ...(touch ? { ontouchstart: null } : {})
    };
    globalThis.document = {
        documentElement: { getAttribute: name => name === 'data-frontend' ? frontend : null },
        getElementById: id => id === 'editor' && editor ? {} : null
    };
};

for (const frontend of ['desktop', 'desktop-window']) {
    test(`${frontend}: a narrow touch window keeps the desktop layout during startup`, () => {
        setDevice({ frontend });
        assert.equal(isLikelyMobileBrowser(), false);
        assert.equal(shouldUseMobileThemeLayout(), false);
        window.innerWidth = 1440;
        assert.equal(shouldUseMobileThemeLayout(), false);
    });
}

test('Electron keeps the desktop layout before frontend attributes are available', () => {
    setDevice({ userAgent: 'SiYuan/3.8.9 https://b3log.org/siyuan Electron Mozilla/5.0' });
    assert.equal(shouldUseMobileThemeLayout(), false);
});

test('the official mobile editor keeps its layout on a wide screen', () => {
    setDevice({ frontend: 'mobile', editor: true, width: 1200 });
    assert.equal(isLikelyMobileBrowser(), false);
    assert.equal(shouldUseMobileThemeLayout(), true);
});

test('a mobile browser user agent selects the mobile layout even on a wide screen', () => {
    setDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile', width: 1200 });
    assert.equal(shouldUseMobileThemeLayout(), true);
});

test('iPadOS with a desktop user agent still gets the mobile browser layout', () => {
    setDevice({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', width: 820 });
    assert.equal(isLikelyMobileBrowser(), true);
});

test('desktop browsers keep their layout without both a narrow viewport and touch', () => {
    setDevice({ touch: false });
    assert.equal(shouldUseMobileThemeLayout(), false);
    setDevice({ width: 1440 });
    assert.equal(shouldUseMobileThemeLayout(), false);
});

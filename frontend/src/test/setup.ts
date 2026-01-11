import '@testing-library/jest-dom';

// Mock matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

// Mock localStorage
const localStorageMock = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = () =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    } as Response);

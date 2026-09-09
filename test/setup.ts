import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia or ResizeObserver, both of which the
// real app relies on (reduced-motion detection, mobile breakpoint, and the
// card-collision measurement in OrbitRoom). Polyfill minimally so tests can
// actually exercise real component code instead of crashing on setup.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error - minimal polyfill for the test environment only
window.ResizeObserver = MockResizeObserver;

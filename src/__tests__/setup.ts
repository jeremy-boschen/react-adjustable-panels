import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = () => ({
  width: 1000,
  height: 600,
  top: 0,
  left: 0,
  bottom: 600,
  right: 1000,
  x: 0,
  y: 0,
  toJSON: () => {},
});

// Polyfill Touch for browsers where it's not available or not constructable
// Real browsers (Chrome, Firefox, Safari) all support Touch, but test environments vary
if (typeof Touch === 'undefined' || !globalThis.Touch) {
  // @ts-expect-error - Polyfilling Touch for test environment
  globalThis.Touch = class Touch {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    pageX: number;
    pageY: number;
    radiusX: number;
    radiusY: number;
    rotationAngle: number;
    force: number;

    constructor(touchInit: TouchInit) {
      this.identifier = touchInit.identifier;
      this.target = touchInit.target;
      this.clientX = touchInit.clientX ?? 0;
      this.clientY = touchInit.clientY ?? 0;
      this.screenX = touchInit.screenX ?? 0;
      this.screenY = touchInit.screenY ?? 0;
      this.pageX = touchInit.pageX ?? 0;
      this.pageY = touchInit.pageY ?? 0;
      this.radiusX = touchInit.radiusX ?? 0;
      this.radiusY = touchInit.radiusY ?? 0;
      this.rotationAngle = touchInit.rotationAngle ?? 0;
      this.force = touchInit.force ?? 1;
    }
  };
}

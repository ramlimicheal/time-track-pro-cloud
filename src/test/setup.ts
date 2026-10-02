import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { transferableAbortController } from "node:util";

afterEach(() => { cleanup(); });

if (typeof window !== "undefined") {
  // Use Node's signal implementation with Node's Request in router tests.
  Object.defineProperty(globalThis, "AbortController", { configurable: true, writable: true,
    value: class { constructor() { return transferableAbortController(); } },
  });
  Object.defineProperty(window, "matchMedia", { writable: true, value: (query: string) => ({
    matches: false, media: query, onchange: null, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; },
  }) });
}

/**
 * typescript-eslint still imports the TypeScript 6 compiler API.
 * The app keeps TypeScript 7 for `tsc` and `next build`. This hook
 * runs only for `npm run lint`.
 */
const Module = require("module");
const path = require("path");

const ts6Entry = require.resolve("@typescript/typescript6");
const original = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "typescript") return ts6Entry;
  if (request.startsWith("typescript/")) {
    const subpath = request.slice("typescript/".length);
    return path.join(path.dirname(ts6Entry), "..", subpath);
  }
  return original.call(this, request, parent, isMain, options);
};

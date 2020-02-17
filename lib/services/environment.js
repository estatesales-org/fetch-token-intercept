'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isReactNative = isReactNative;
exports.isNode = isNode;
exports.isWeb = isWeb;
exports.isWorker = isWorker;
// Uses Emscripten stategy for determining environment
function isReactNative() {
  return (typeof navigator === 'undefined' ? 'undefined' : _typeof(navigator)) === 'object' && navigator.product === 'ReactNative';
}

function isNode() {
  return (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && typeof require === 'function';
}

function isWeb() {
  return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object';
}

function isWorker() {
  return typeof importScripts === 'function';
}
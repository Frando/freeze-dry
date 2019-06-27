'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fromCss = require('./from-css.js');

Object.defineProperty(exports, 'extractLinksFromCss', {
  enumerable: true,
  get: function get() {
    return _fromCss.extractLinksFromCss;
  }
});
Object.defineProperty(exports, 'extractLinksFromCssSynced', {
  enumerable: true,
  get: function get() {
    return _fromCss.extractLinksFromCssSynced;
  }
});

var _fromDom = require('./from-dom.js');

Object.defineProperty(exports, 'extractLinksFromDom', {
  enumerable: true,
  get: function get() {
    return _fromDom.extractLinksFromDom;
  }
});
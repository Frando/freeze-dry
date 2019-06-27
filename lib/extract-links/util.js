"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Combined map and flatten.
 */
var flatMap = exports.flatMap = function flatMap(arr, f) {
  return arr.map(f).reduce(function (newArr, item) {
    return newArr.concat(item);
  }, []);
};
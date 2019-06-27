'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _attributeLists = require('./attribute-lists.js');

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Helper for combining two object's element lists.
var mergeAttributeInfos = function mergeAttributeInfos(info1, info2) {
    return info1 === info2 ? info1 : (0, _extends3.default)({}, info1, info2, {
        elements: (0, _util.uniq)(info1.elements.concat(info2.elements))
    });
};

// Export the union of all attributes.
exports.default = (0, _util.mergeWith)(mergeAttributeInfos)(_attributeLists.whatwg, _attributeLists.html52, _attributeLists.html40);
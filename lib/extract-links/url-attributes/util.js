"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uniq = exports.omit = exports.mergeWith = undefined;

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Some simple helpers inspired by lodash/fp.

/**
 * Merge two objects, with a custom function for resolving conflicts.
 * @param {(any, any) => any} mergeValues - Function to resolve the conflict whenever two objects
 * both have a value for some key. The returned value will be the one used in the resulting object.
 * @param {...Object} object - Objects that will be shallowly merged, starting with the leftmost one
 * @returns {Object} A new object, with values of the given objects merged in to it.
 */
var mergeWith = exports.mergeWith = function mergeWith(mergeValues) {
    return function () {
        for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
            objects[_key] = arguments[_key];
        }

        var result = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var object = _step.value;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = Object.entries(object)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
                            key = _step2$value[0],
                            value = _step2$value[1];

                        result[key] = result[key] ? mergeValues(result[key], value) : value;
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return result;
    };
};

/**
 * Return a clone of the object with given keys omitted.
 * @param {string[]} keys - The keys to omit when copying the object
 * @=>
 * @param {Object} object
 * @returns {Object} A shallow copy of object without the listed keys
 */
var omit = exports.omit = function omit(keys) {
    return function (object) {
        var entries = Object.entries(object);
        var result = {};
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = entries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _step3$value = (0, _slicedToArray3.default)(_step3.value, 2),
                    key = _step3$value[0],
                    value = _step3$value[1];

                if (!keys.includes(key)) {
                    result[key] = value;
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return result;
    };
};

/**
 * Return a clone of the array, with duplicate values removed.
 * @param {Array} - array
 * @returns {Array} newArray - copy of the array without duplicates
 */
var uniq = exports.uniq = function uniq(array) {
    var newArray = [];
    var seen = new Set();
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = array[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var value = _step4.value;

            if (!seen.has(value)) {
                seen.add(value);
                newArray.push(value);
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return newArray;
};
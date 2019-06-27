'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deepProxy = exports.makeListenerProxy = exports.deepSyncingProxy = exports.syncingProxy = exports.transformingCache = exports.syncingParsedView = exports.parsedView = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _package = require('../package.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Allows manipulating tokens within a string.
 * @param {string => Object[]} parse - given a string, must return an array of objects { token,
 * index, note? }
 * @=>
 * @param {string} value - the string to be parsed.
 * @returns {Object[]} tokens - the array of { token, index, note? } objects as returned by
 * parse(value), where each token field is writable, and with a special toString() method that
 * reconstructs the original string using the current values of the tokens.
 * @example
 * const view = parsedView(extractUrls)('bla http://example.com blub')
 * view.forEach(tokenInfo => { tokenInfo.token = tokenInfo.token.replace(/^https?:/, 'dat:') })
 * view.toString() // 'bla dat://example.com blub'
 */
var parsedView = exports.parsedView = function parsedView(parse) {
    return function (value) {
        var parsedValue = parse(value);

        // Split the string into tokens and 'glue' (the segments before, between and after the tokens).
        var tokens = [];
        var glueStrings = [];
        var start = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function _loop() {
                var _ref = _step.value;
                var token = _ref.token,
                    index = _ref.index,
                    note = _ref.note;

                glueStrings.push(value.substring(start, index));
                tokens.push({
                    token: token,
                    get index() {
                        return index;
                    },
                    get note() {
                        return note;
                    }
                });
                start = index + token.length;
            };

            for (var _iterator = parsedValue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _loop();
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

        glueStrings.push(value.substring(start));

        tokens.toString = function () {
            // Glue everything back together, with the current values of the tokens.
            var newValue = glueStrings[0];
            tokens.forEach(function (_ref2, i) {
                var token = _ref2.token;

                newValue += token + glueStrings[i + 1];
            });
            return newValue;
        };
        return tokens;
    };
};

/**
 * Like parsedView, but helps syncing the string with another variable/state/attribute/...
 * It reads the string using get() at any operation, and afterward writes it back using set(string).
 * @param {string => Object[]} options.parse - parser to apply to the string, should return an array
 * of objects { token, index, note? }
 * @param {() => string} options.get - string getter; invoked whenever a token is accessed.
 * @param {string => void} options.set - string setter; invoked when any of its tokens was modified.
 */
// Some abstractions to easily deal with values that are extracted from strings that can be updated.
// Intended to, for example, create a live view on the URLs inside an element's style or srcset
// attribute, that allows both reading and writing the URLs in place.

var syncingParsedView = exports.syncingParsedView = function syncingParsedView(_ref3) {
    var parse = _ref3.parse,
        get = _ref3.get,
        set = _ref3.set;
    return deepSyncingProxy(transformingCache({
        get: get,
        set: set,
        transform: parsedView(parse),
        untransform: function untransform(stringView) {
            return stringView.toString();
        }
    }));
};

/**
 * Transparently handles getting+transforming and untransforming+setting of a variable.
 * The result is nearly equivalent to the following: {
 *   get: () => transform(get()),
 *   set: value => set(untransform(value)),
 * }
 * ..except it remembers the last value to only run transform() or set() when needed.
 * @param {() => T1} options.get - getter for the current untransformed value.
 * @param {T1 => void} options.set - setter to update the current untransformed value.
 * @param {T1 => T2} options.transform - the transformation to apply.
 * @param {T2 => T1} options.untransform - the exact inverse of transformation.
 * @param {(T1, T1) => boolean} [options.isEqual] - compares equality of two untransformed values.
 * Defaults to (new, old) => new === old.
 * @returns {Object} A pair of functions { get, set }.
 */
var transformingCache = exports.transformingCache = function transformingCache(_ref4) {
    var _get = _ref4.get,
        _set = _ref4.set,
        transform = _ref4.transform,
        untransform = _ref4.untransform,
        _ref4$isEqual = _ref4.isEqual,
        isEqual = _ref4$isEqual === undefined ? function (a, b) {
        return a === b;
    } : _ref4$isEqual;

    var uninitialised = Symbol('uninitialised');
    var lastValue = uninitialised;
    var lastTransformedValue = void 0;
    return {
        get: function get() {
            var newValue = _get();
            if (lastValue === uninitialised || !isEqual(newValue, lastValue)) {
                lastTransformedValue = transform(newValue);
            }
            lastValue = newValue;
            return lastTransformedValue;
        },

        // trustCache allows skipping the get(); for optimisation in case you can guarantee that the
        // value has not changed since the previous get or set (e.g. in an atomic update).
        set: function set(transformedValue) {
            var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                _ref5$trustCache = _ref5.trustCache,
                trustCache = _ref5$trustCache === undefined ? false : _ref5$trustCache;

            // Idea: return directly if the transformed value is equal and known to be immutable.
            var newValue = untransform(transformedValue);
            var currentValue = trustCache ? lastValue : _get();
            if (currentValue === uninitialised || !isEqual(newValue, currentValue)) {
                _set(newValue);
            }
            lastValue = newValue;
            lastTransformedValue = transformedValue;
        }
    };
};

/**
 * A Proxy that appears as the object returned by get(), *at any moment*, and writes back changes
 * using set(object).
 * @param {() => Object} get - getter for the object; is run before any operation on the object.
 * @param {Object => void} set - setter for the object; is run after any operation on the object.
 * @returns {Proxy} The proxy.
 */
var syncingProxy = exports.syncingProxy = function syncingProxy(_ref6) {
    var get = _ref6.get,
        set = _ref6.set;

    // Get the current object to ensure the proxy's initial target has correct property descriptors.
    // (changing e.g. from a normal object to an Array causes trouble)
    var initialTarget = get();

    var _mutableProxyFactory = (0, _package.mutableProxyFactory)(initialTarget),
        proxy = _mutableProxyFactory.proxy,
        getTarget = _mutableProxyFactory.getTarget,
        setTarget = _mutableProxyFactory.setTarget;

    var refreshProxyTarget = function refreshProxyTarget() {
        var object = get();
        setTarget(object);
    };
    var writeBack = function writeBack() {
        var object = getTarget();
        set(object);
    };

    return makeListenerProxy(refreshProxyTarget, writeBack)(proxy);
};

/**
 * Like syncingProxy, this appears as the object return by get(), at any moment. It also proxies any
 * member object, so that e.g. proxy.a.b will be updated to correspond to get().a.b at any moment.
 * @param {() => Object} get - getter to obtain the object; is run before any operation on the
 * object or any of its members (or members' members, etc.).
 * @param {Object => void} set - setter to update the object; is run after any operation on the
 * object or any of its members (or members' members, etc.).
 * @returns {Proxy} The proxy.
 */
var deepSyncingProxy = exports.deepSyncingProxy = function deepSyncingProxy(_ref7) {
    var get = _ref7.get,
        set = _ref7.set,
        _ref7$alwaysSet = _ref7.alwaysSet,
        alwaysSet = _ref7$alwaysSet === undefined ? false : _ref7$alwaysSet;

    var rootObject = void 0;
    // We will reload the whole object before any operation on any (sub)object.
    var getRootObject = function getRootObject() {
        rootObject = get();
    };
    // We write back the whole object after any operation on any (sub)object.
    var writeBack = function writeBack() {
        set(rootObject);
    };

    var createProxy = function createProxy(object, path) {
        // Create a mutable proxy, using object as the initial target.
        var _mutableProxyFactory2 = (0, _package.mutableProxyFactory)(object),
            proxy = _mutableProxyFactory2.proxy,
            setTarget = _mutableProxyFactory2.setTarget;

        var refreshProxyTarget = function refreshProxyTarget() {
            // Update the root object.
            getRootObject();
            // Walk to the corresponding object within the root object.
            var target = rootObject;
            if (!isNonNullObject(target)) throw new TypeError('Expected get()' + path + ' to be an object, but get() is ' + target + '.');
            var properties = path.split('.').slice(1);
            for (var i in properties) {
                target = target[properties[i]];
                if (!isNonNullObject(target)) {
                    var pathSoFar = '.' + properties.slice(0, i + 1).join('.');
                    throw new TypeError('Expected get()' + path + ' to be an object, but get()' + pathSoFar + ' is ' + target + '.');
                }
            }
            // Swap this proxy's target to the found object (we can leave other proxies outdated).
            setTarget(target);
        };
        var writeBackIfMutating = function writeBackIfMutating(method, args) {
            // If the operation would have mutated a normal object, trigger a set()-sync
            if (modifyingOperations.includes(method)) {
                writeBack();
            }
        };
        var afterHook = alwaysSet ? writeBack : writeBackIfMutating;
        return makeListenerProxy(refreshProxyTarget, afterHook)(proxy);
    };

    // Get the current object to ensure the proxy's initial target has correct property descriptors.
    // (changing e.g. from a normal object to an Array causes trouble)
    var initialRootObject = get();
    return deepProxy(createProxy)(initialRootObject);
};

function isNonNullObject(value) {
    return (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object' && value !== null;
}

// Operations which modify an object (if not performing tricks with getters or Proxies)
// (XXX hand-picked from the Reflect.* methods, potentially misguided)
var modifyingOperations = ['set', 'delete', 'defineProperty', 'deleteProperty', 'preventExtensions', 'setPrototypeOf'];

/**
 * A proxy to the object, that runs the given hooks before and after every operation on the object.
 * @param {(method: string, args[]) => void} before - is run before any operation on the object.
 * Gets passed the name of the method that will be invoked, and its arguments.
 * @param {(method: string, args[]) => void} after - is run after any operation on the object.
 * Gets passed the name of the method that will be invoked, and its arguments.
 * @=>
 * @param {Object} object - the object to be proxied.
 * @returns {Proxy} The proxy to the given object.
 */
var makeListenerProxy = exports.makeListenerProxy = function makeListenerProxy() {
    var before = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    var after = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
    return function (object) {
        var handler = Object.assign.apply(Object, [{}].concat((0, _toConsumableArray3.default)(Object.getOwnPropertyNames(Reflect).map(function (method) {
            return (0, _defineProperty3.default)({}, method, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                before(method, args);
                var result = Reflect[method].apply(null, args);
                after(method, args);
                return result;
            });
        }))));
        return new Proxy(object, handler);
    };
};

/**
 * A higher order proxy to have a proxy also wrap every attribute in the same type of proxy.
 * @param {(Object, path: string) => Proxy} createProxy
 * @=>
 * @param {Object} object - the object which, and whose members, will be wrapped using createProxy.
 * @returns {Proxy} A proxy around the proxy of the object.
 */
var deepProxy = exports.deepProxy = function deepProxy(createProxy) {
    var _createDeepProxy = function createDeepProxy(object, path) {
        var target = createProxy(object, path);
        return new Proxy(target, {
            // Trap the get() method, to also wrap any subobjects using createProxy.
            get: function get(target, property, receiver) {
                var value = Reflect.get(target, property, receiver);
                if (value instanceof Object && target.hasOwnProperty(property) // ignore .prototype, etc.
                && typeof property === 'string' // would we want to support Symbols?
                ) {
                        // Wrap the object using createProxy; but recursively.
                        var innerProxy = _createDeepProxy(value, path + '.' + property);
                        return innerProxy;
                    } else {
                    return value;
                }
            }
        });
    };
    // Memoize to not create duplicate proxies of the same object (so that proxy.x === proxy.x).
    // FIXME Path could be an array, but then memoize should deep-compare arrays. For now, do not
    // put periods into property names!
    // (note that we do want path to be part of the memoization key: if two paths currently hold the
    // same object, they should result in two proxies because this situation might change)
    _createDeepProxy = (0, _package.memoize)(_createDeepProxy);

    return function (object) {
        return _createDeepProxy(object, '');
    };
};
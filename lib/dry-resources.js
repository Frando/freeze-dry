'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeLinksAbsolute = exports.allResourcesInTree = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.default = dryResources;

var _index = require('./make-dom-static/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(allResourcesInTree);

/**
 * "Dry" the resource+subresources to make them static and context-free.
 * @param {Object} rootResource - the resource object including its subresources.
 * @returns nothing; the resource will be mutated.
 */
function dryResources(rootResource) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = allResourcesInTree(rootResource)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var resource = _step.value;

            // Make all (possibly relative) URLs absolute.
            makeLinksAbsolute(resource);

            // If the resource is a DOM, remove scripts, contentEditable, etcetera.
            if (resource.doc) {
                (0, _index2.default)(resource.doc);
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
}

// A depth-first iterator through the tree of resource+subresources
function allResourcesInTree(resource) {
    var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, link;

    return _regenerator2.default.wrap(function allResourcesInTree$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return resource;

                case 2:
                    _iteratorNormalCompletion2 = true;
                    _didIteratorError2 = false;
                    _iteratorError2 = undefined;
                    _context.prev = 5;
                    _iterator2 = resource.links[Symbol.iterator]();

                case 7:
                    if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                        _context.next = 14;
                        break;
                    }

                    link = _step2.value;

                    if (!link.resource) {
                        _context.next = 11;
                        break;
                    }

                    return _context.delegateYield(allResourcesInTree(link.resource), 't0', 11);

                case 11:
                    _iteratorNormalCompletion2 = true;
                    _context.next = 7;
                    break;

                case 14:
                    _context.next = 20;
                    break;

                case 16:
                    _context.prev = 16;
                    _context.t1 = _context['catch'](5);
                    _didIteratorError2 = true;
                    _iteratorError2 = _context.t1;

                case 20:
                    _context.prev = 20;
                    _context.prev = 21;

                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }

                case 23:
                    _context.prev = 23;

                    if (!_didIteratorError2) {
                        _context.next = 26;
                        break;
                    }

                    throw _iteratorError2;

                case 26:
                    return _context.finish(23);

                case 27:
                    return _context.finish(20);

                case 28:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this, [[5, 16, 20, 28], [21,, 23, 27]]);
}

function makeLinksAbsolute(resource) {
    resource.links.forEach(function (link) {
        link.target = link.absoluteTarget;
    });
}

exports.allResourcesInTree = allResourcesInTree;
exports.makeLinksAbsolute = makeLinksAbsolute; // only for tests
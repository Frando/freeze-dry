'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Recursively inlines all subresources as data URLs.
 * @param {Object} resource - the resource object representing the DOM with its subresources.
 * @param {Object} options
 * @returns nothing; the resource will be mutated.
 */
var deepInlineSubresources = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(resource) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var blobToURL;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        blobToURL = options.blobToURL || _universal.blobToDataURL;
                        _context3.next = 3;
                        return (0, _package.whenAllSettled)(resource.links.map(function () {
                            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(link) {
                                var dataUrl;
                                return _regenerator2.default.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                if (link.isSubresource) {
                                                    _context2.next = 4;
                                                    break;
                                                }

                                                return _context2.abrupt('return');

                                            case 4:
                                                if (link.resource) {
                                                    _context2.next = 6;
                                                    break;
                                                }

                                                return _context2.abrupt('return');

                                            case 6:
                                                _context2.next = 8;
                                                return deepInlineSubresources(link.resource, options);

                                            case 8:
                                                _context2.next = 10;
                                                return blobToURL(link.resource.blob, resource);

                                            case 10:
                                                dataUrl = _context2.sent;


                                                setLinkTarget(link, dataUrl, options);

                                            case 12:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this);
                            }));

                            return function (_x5) {
                                return _ref4.apply(this, arguments);
                            };
                        }()));

                    case 3:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function deepInlineSubresources(_x3) {
        return _ref3.apply(this, arguments);
    };
}();

var _package = require('./package.js');

var _universal = require('./universal.js');

var _setMementoTags = require('./set-memento-tags.js');

var _setMementoTags2 = _interopRequireDefault(_setMementoTags);

var _index = require('./set-content-security-policy/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Serialises the DOM resource+subresources into a single, self-contained string of HTML.
 * @param {Object} resource - the resource object representing the DOM with its subresources. Will
 * be mutated.
 * @returns {string} html - the resulting HTML.
 */
exports.default = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resource) {
        var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            addMetadata = _ref2.addMetadata,
            keepOriginalAttributes = _ref2.keepOriginalAttributes,
            snapshotTime = _ref2.snapshotTime,
            blobToURL = _ref2.blobToURL,
            getCsp = _ref2.getCsp;

        var csp, html;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return deepInlineSubresources(resource, { keepOriginalAttributes: keepOriginalAttributes, blobToURL: blobToURL });

                    case 2:

                        if (addMetadata) {
                            // Add metadata about the snapshot to the snapshot itself.
                            (0, _setMementoTags2.default)(resource.doc, { originalUrl: resource.url, datetime: snapshotTime });
                        }

                        // Set a strict Content Security Policy in a <meta> tag.
                        csp = void 0;

                        if (getCsp) csp = getCsp(resource);else csp = ["default-src 'none'", // By default, block all connectivity and scripts.
                        "img-src data:", // Allow inlined images.
                        "media-src data:", // Allow inlined audio/video.
                        "style-src data: 'unsafe-inline'", // Allow inlined styles.
                        "font-src data:", // Allow inlined fonts.
                        "frame-src data:"].join('; ');
                        if (csp) (0, _index2.default)(resource.doc, csp);

                        // Return the resulting DOM as a string
                        html = resource.string;
                        return _context.abrupt('return', html);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    function createSingleFile(_x) {
        return _ref.apply(this, arguments);
    }

    return createSingleFile;
}();

function setLinkTarget(link, target) {
    var _ref5 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        keepOriginalAttributes = _ref5.keepOriginalAttributes;

    // Optionally, remember the attribute's original value (if applicable).
    // TODO should this be done elsewhere? Perhaps the link.target setter?
    if (keepOriginalAttributes && link.from.element && link.from.attribute) {
        var noteAttribute = 'data-original-' + link.from.attribute;
        // Multiple links may be contained in one attribute (e.g. a srcset); we must act
        // only at the first one, therefore we check for existence of the noteAttribute.
        // XXX This also means that if the document already had 'data-original-...' attributes,
        // we leave them as is; this may or may not be desirable (e.g. it helps toward idempotency).
        if (!link.from.element.hasAttribute(noteAttribute)) {
            var originalValue = link.from.element.getAttribute(link.from.attribute);
            link.from.element.setAttribute(noteAttribute, originalValue);
        }
    }

    // Replace the link target with the data URL. Note that link.target is a setter that will update
    // the resource itself.
    link.target = target;

    // Remove integrity attribute, if any. (should only be necessary if the content of the
    // subresource has been modified, but we keep things simple and blunt)
    // TODO should this be done elsewhere? Perhaps the link.target setter?
    if (link.from.element && link.from.element.hasAttribute('integrity')) {
        link.from.element.removeAttribute('integrity');
        // (we could also consider modifying or even adding integrity attributes..)
    }
}
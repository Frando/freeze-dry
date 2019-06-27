'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.extractLinksFromDom = extractLinksFromDom;

var _getBaseUrl = require('./get-base-url.js');

var _getBaseUrl2 = _interopRequireDefault(_getBaseUrl);

var _parseTools = require('./parse-tools.js');

var _fromCss = require('./from-css.js');

var _index = require('./url-attributes/index.js');

var _index2 = _interopRequireDefault(_index);

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Extracts links from an HTML Document.
 * @param {Document} doc - the Document to extract links from.
 * @param {Object} [options]
 * @param {string} [options.docUrl] - can be specified to override doc.URL
 * @returns {Object[]} The extracted links. Each link provides a live, editable view on one URL
 * inside the DOM.
 */
function extractLinksFromDom(doc) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        docUrl = _ref.docUrl;

    var baseUrl = docUrl !== undefined ? (0, _getBaseUrl2.default)(doc, docUrl) : undefined; // No override; functions will read the correct value from <node>.baseURI.

    var rootElement = doc.documentElement; // = the <html> element.
    var links = [].concat((0, _toConsumableArray3.default)(extractLinksFromAttributes({ rootElement: rootElement, baseUrl: baseUrl, docUrl: docUrl })), (0, _toConsumableArray3.default)(extractLinksFromStyleAttributes({ rootElement: rootElement, baseUrl: baseUrl })), (0, _toConsumableArray3.default)(extractLinksFromStyleTags({ rootElement: rootElement, baseUrl: baseUrl })));
    return links;
}

function extractLinksFromAttributes(_ref2) {
    var rootElement = _ref2.rootElement,
        baseUrl = _ref2.baseUrl,
        docUrl = _ref2.docUrl;

    // For each known attribute type, we find all elements having it.
    // Note the 'style' attribute is handled separately, in extractLinksFromStyleAttributes below.
    var links = (0, _util.flatMap)(Object.values(_index2.default), function (attributeInfo) {
        var attribute = attributeInfo.attribute,
            elementNames = attributeInfo.elements;

        var selector = elementNames.map(function (name) {
            return name + '[' + attribute + ']';
        }) // Only find elements having the attribute set.
        .join(', ');
        var elements = Array.from(rootElement.querySelectorAll(selector));
        var links = (0, _util.flatMap)(elements, function (element) {
            return linksInAttribute({ element: element, attributeInfo: attributeInfo, baseUrl: baseUrl, docUrl: docUrl });
        });
        return links; // links of this attribute type
    });
    return links; // links in all attributes of all elements
}

// Gets the links (usually just one) inside the specified attribute of the given element.
function linksInAttribute(_ref3) {
    var element = _ref3.element,
        attributeInfo = _ref3.attributeInfo,
        baseUrl = _ref3.baseUrl,
        docUrl = _ref3.docUrl;
    var attribute = attributeInfo.attribute,
        parse = attributeInfo.parse,
        makeAbsolute = attributeInfo.makeAbsolute;

    // Get a live&editable view on the URL(s) in the attribute.

    var parsedAttributeView = (0, _parseTools.syncingParsedView)({
        parse: parse,
        get: function get() {
            return element.getAttribute(attribute);
        },
        set: function set(value) {
            element.setAttribute(attribute, value);
        }
    });

    var links = parsedAttributeView.map(function (tokenView) {
        return {
            get target() {
                return tokenView.token;
            },
            set target(newUrl) {
                tokenView.token = newUrl;
            },
            get absoluteTarget() {
                return makeAbsolute(this.target, element, baseUrl, docUrl);
            },

            get from() {
                var index = tokenView.index;
                return {
                    get element() {
                        return element;
                    },
                    get attribute() {
                        return attribute;
                    },
                    get rangeWithinAttribute() {
                        return [index, index + tokenView.token.length];
                    }
                };
            },

            // These values are constant, but we use getters anyway to emphasise they are read-only.
            get isSubresource() {
                return attributeInfo.isSubresource;
            },
            get subresourceType() {
                return attributeInfo.subresourceType;
            }
        };
    });
    return links;
}

function extractLinksFromStyleAttributes(_ref4) {
    var rootElement = _ref4.rootElement,
        baseUrl = _ref4.baseUrl;

    // TODO try using element.style instead of parsing the attribute value ourselves.
    var querySelector = '*[style]';
    var elements = Array.from(rootElement.querySelectorAll(querySelector));
    var links = (0, _util.flatMap)(elements, function (element) {
        // Extract the links from the CSS using a live&editable view on the attribute value.
        var cssLinks = (0, _fromCss.extractLinksFromCssSynced)({
            get: function get() {
                return element.getAttribute('style');
            },
            set: function set(newValue) {
                element.setAttribute('style', newValue);
            },
            baseUrl: baseUrl || element.baseURI
        });

        // Tweak the links to describe the 'from' info from the DOM's perspective.
        var links = cssLinks.map(function (link) {
            return (
                // Use javascript's prototype inheritance, overriding the `from` property descriptor.
                Object.create(link, {
                    from: {
                        get: function get() {
                            return {
                                get element() {
                                    return element;
                                },
                                get attribute() {
                                    return 'style';
                                },
                                get rangeWithinAttribute() {
                                    return link.from.range;
                                }
                            };
                        }
                    }
                })
            );
        });

        return links; // links in the style attribute of *this* element
    });
    return links; // links in the style attributes of *all* elements
}

function extractLinksFromStyleTags(_ref5) {
    var rootElement = _ref5.rootElement,
        baseUrl = _ref5.baseUrl;

    var querySelector = 'style[type="text/css" i], style:not([type])';
    var elements = Array.from(rootElement.querySelectorAll(querySelector));

    var links = (0, _util.flatMap)(elements, function (element) {
        // Extract the links from the CSS using a live&editable view on the content.
        var cssLinks = (0, _fromCss.extractLinksFromCssSynced)({
            get: function get() {
                return element.textContent;
            },
            set: function set(newValue) {
                element.textContent = newValue;
            },
            baseUrl: baseUrl || element.baseURI
        });

        // Tweak the links to describe the 'from' info from the DOM's perspective.
        var links = cssLinks.map(function (link) {
            return (
                // Use javascript's prototype inheritance, overriding the `from` property descriptor.
                Object.create(link, {
                    from: {
                        get: function get() {
                            return {
                                get element() {
                                    return element;
                                },
                                get rangeWithinTextContent() {
                                    return link.from.range;
                                }
                            };
                        }
                    }
                })
            );
        });

        return links; // links in this style element
    });
    return links; // links in all <style> tags
}
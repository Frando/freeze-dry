'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Recursively fetch the subresources of a DOM resource.
 * @param {Object} resource - the resource object representing the DOM with its subresources.
 * @param {Function} [options.fetchResource] - custom function for fetching resources; should be
 * API-compatible with the global fetch(), but may also return { blob, url } instead of a Response.
 * @returns nothing; subresources are stored in the links of the given resource.
 */
var crawlSubresourcesOfDom = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resource, options) {
        var supportedSubresourceTypes, linksToCrawl;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        supportedSubresourceTypes = ['image', 'document', 'style', 'video', 'font'];

                        // TODO Avoid fetching all resolutions&formats of the same image/video?

                        linksToCrawl = resource.links.filter(function (link) {
                            return link.isSubresource;
                        }).filter(function (link) {
                            return supportedSubresourceTypes.includes(link.subresourceType);
                        });

                        // Start recursively and concurrently crawling the resources.

                        _context.next = 4;
                        return crawlSubresources(linksToCrawl, options);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function crawlSubresourcesOfDom(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var crawlSubresources = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(links, options) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return (0, _package.whenAllSettled)(links.map(function (link) {
                            return crawlSubresource(link, options);
                        }));

                    case 2:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function crawlSubresources(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var crawlSubresource = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(link, options) {
        var crawlers, crawler;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        crawlers = {
                            image: crawlLeafSubresource, // Images cannot have subresources (actually, SVGs can! TODO)
                            document: crawlFrame,
                            style: crawlStylesheet,
                            video: crawlLeafSubresource, // Videos cannot have subresources (afaik; maybe they can?)
                            font: crawlLeafSubresource // Fonts cannot have subresources (afaik; maybe they can?)
                        };
                        crawler = crawlers[link.subresourceType];

                        if (!(crawler === undefined)) {
                            _context3.next = 4;
                            break;
                        }

                        throw new Error('Not sure how to crawl subresource of type ' + link.subresourceType);

                    case 4:
                        _context3.next = 6;
                        return crawler(link, options);

                    case 6:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function crawlSubresource(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

var crawlLeafSubresource = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(link, options) {
        var fetchedResource;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return fetchSubresource(link.absoluteTarget, options);

                    case 2:
                        fetchedResource = _context4.sent;

                        link.resource = {
                            url: fetchedResource.url,
                            blob: fetchedResource.blob,
                            links: []
                        };

                    case 4:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function crawlLeafSubresource(_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}();

var crawlFrame = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(link, options) {
        var fetchedResource, html, parser, innerDoc, innerDocUrl, innerDocResource;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if (link.resource) {
                            _context5.next = 15;
                            break;
                        }

                        _context5.next = 3;
                        return fetchSubresource(link.absoluteTarget, options);

                    case 3:
                        fetchedResource = _context5.sent;
                        _context5.next = 6;
                        return (0, _universal.blobToText)(fetchedResource.blob);

                    case 6:
                        html = _context5.sent;
                        parser = new DOMParser();
                        innerDoc = parser.parseFromString(html, 'text/html');
                        // Note that the final URL may differ from link.absoluteTarget in case of redirects.

                        innerDocUrl = fetchedResource.url;

                        // Create a mutable resource for this frame, similar to the resource captureDom() returns.

                        _context5.t0 = innerDocUrl;
                        _context5.t1 = innerDoc;
                        _context5.t2 = (0, _index.extractLinksFromDom)(innerDoc, { docUrl: innerDocUrl });
                        innerDocResource = {
                            url: _context5.t0,
                            doc: _context5.t1,

                            get blob() {
                                return new _universal.Blob([this.string], { type: 'text/html' });
                            },
                            get string() {
                                // TODO Add <meta charset> if absent? Or html-encode characters as needed?
                                return (0, _package.documentOuterHTML)(innerDoc);
                            },
                            links: _context5.t2
                        };


                        link.resource = innerDocResource;

                    case 15:
                        _context5.next = 17;
                        return crawlSubresourcesOfDom(link.resource, options);

                    case 17:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function crawlFrame(_x9, _x10) {
        return _ref5.apply(this, arguments);
    };
}();

var crawlStylesheet = function () {
    var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(link, options) {
        var fetchedResource, stylesheetUrl, originalStylesheetText, links, getCurrentStylesheetText, parsedCss, stylesheetResource;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return fetchSubresource(link.absoluteTarget, options);

                    case 2:
                        fetchedResource = _context6.sent;

                        // Note that the final URL may differ from link.absoluteTarget in case of redirects.
                        stylesheetUrl = fetchedResource.url;
                        _context6.next = 6;
                        return (0, _universal.blobToText)(fetchedResource.blob);

                    case 6:
                        originalStylesheetText = _context6.sent;
                        links = void 0;
                        getCurrentStylesheetText = void 0;

                        try {
                            parsedCss = _package.postcss.parse(originalStylesheetText);

                            links = (0, _index.extractLinksFromCss)(parsedCss, stylesheetUrl);
                            getCurrentStylesheetText = function getCurrentStylesheetText() {
                                return parsedCss.toResult().css;
                            };
                        } catch (err) {
                            // CSS is corrupt. Pretend there are no links.
                            links = [];
                            getCurrentStylesheetText = function getCurrentStylesheetText() {
                                return originalStylesheetText;
                            };
                        }

                        _context6.t0 = stylesheetUrl;
                        _context6.t1 = links;
                        stylesheetResource = {
                            url: _context6.t0,

                            get blob() {
                                return new _universal.Blob([this.string], { type: 'text/css' });
                            },
                            get string() {
                                return getCurrentStylesheetText();
                            },
                            links: _context6.t1
                        };


                        link.resource = stylesheetResource;

                        // Recurse to crawl the subresources of this stylesheet.
                        _context6.next = 16;
                        return crawlSubresources(stylesheetResource.links, options);

                    case 16:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function crawlStylesheet(_x11, _x12) {
        return _ref6.apply(this, arguments);
    };
}();

var fetchSubresource = function () {
    var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(url, options) {
        var fetchFunction, resourceOrResponse, resource;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        fetchFunction = options.fetchResource || self.fetch;
                        // TODO investigate whether we should supply origin, credentials, ...

                        _context7.next = 3;
                        return fetchFunction(url, {
                            cache: 'force-cache',
                            redirect: 'follow'
                        });

                    case 3:
                        resourceOrResponse = _context7.sent;
                        _context7.next = 6;
                        return (0, _universal.responseToBlob)(resourceOrResponse);

                    case 6:
                        _context7.t0 = _context7.sent;
                        _context7.t1 = resourceOrResponse.url;
                        resource = {
                            blob: _context7.t0,
                            url: _context7.t1
                        };
                        return _context7.abrupt('return', resource);

                    case 10:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function fetchSubresource(_x13, _x14) {
        return _ref7.apply(this, arguments);
    };
}();

var _package = require('./package.js');

var _index = require('./extract-links/index.js');

var _universal = require('./universal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = crawlSubresourcesOfDom;
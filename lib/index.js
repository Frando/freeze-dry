'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _captureDom = require('./capture-dom.js');

var _captureDom2 = _interopRequireDefault(_captureDom);

var _crawlSubresources = require('./crawl-subresources.js');

var _crawlSubresources2 = _interopRequireDefault(_crawlSubresources);

var _dryResources = require('./dry-resources.js');

var _dryResources2 = _interopRequireDefault(_dryResources);

var _createSingleFile = require('./create-single-file.js');

var _createSingleFile2 = _interopRequireDefault(_createSingleFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Freeze dry an HTML Document
 * @param {Document} [doc=window.document] - HTML Document to be freeze-dried. Remains unmodified.
 * @param {Object} [options]
 * @param {number} [options.timeout=Infinity] - Maximum time (in milliseconds) spent on fetching the
 * page's subresources. The resulting HTML will have only succesfully fetched subresources inlined.
 * @param {string} [options.docUrl] - URL to override doc.URL.
 * @param {boolean} [options.addMetadata=true] - Whether to note the snapshotting time and the
 * document's URL in an extra meta and link tag.
 * @param {boolean} [options.keepOriginalAttributes=true] - Whether to preserve the value of an
 * element attribute if its URLs are inlined, by noting it as a new 'data-original-...' attribute.
 * For example, <img src="bg.png"> would become <img src="data:..." data-original-src="bg.png">.
 * Note this is an unstandardised workaround to keep URLs of subresources available; unfortunately
 * URLs inside stylesheets are still lost.
 * @param {Date} [options.now] - Override the snapshot time (only relevant when addMetadata=true).
 * @param {Function} [options.fetchResource] - Custom function for fetching resources; should be
 * API-compatible with the global fetch(), but may also return { blob, url } instead of a Response.
 * @returns {string} html - The freeze-dried document as a self-contained, static string of HTML.
 */
exports.default = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.document;

        var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref2$timeout = _ref2.timeout,
            timeout = _ref2$timeout === undefined ? Infinity : _ref2$timeout,
            docUrl = _ref2.docUrl,
            _ref2$addMetadata = _ref2.addMetadata,
            addMetadata = _ref2$addMetadata === undefined ? true : _ref2$addMetadata,
            _ref2$keepOriginalAtt = _ref2.keepOriginalAttributes,
            keepOriginalAttributes = _ref2$keepOriginalAtt === undefined ? true : _ref2$keepOriginalAtt,
            fetchResource = _ref2.fetchResource,
            blobToURL = _ref2.blobToURL,
            _ref2$now = _ref2.now,
            now = _ref2$now === undefined ? new Date() : _ref2$now;

        var resource, html;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // Step 1: Capture the DOM (as well as DOMs inside frames).
                        resource = (0, _captureDom2.default)(doc, { docUrl: docUrl });

                        // TODO Allow continuing processing elsewhere (background script, worker, nodejs, ...)

                        // Step 2: Fetch subresources, recursively.

                        _context.next = 3;
                        return maxWait(timeout)((0, _crawlSubresources2.default)(resource, { fetchResource: fetchResource }));

                    case 3:
                        // TODO Upon timeout, abort the pending fetches on platforms that support this.

                        // Step 3: "Dry" the resources to make them static and context-free.
                        (0, _dryResources2.default)(resource);

                        // Step 4: Compile the resource tree to produce a single, self-contained string of HTML.
                        _context.next = 6;
                        return (0, _createSingleFile2.default)(resource, {
                            addMetadata: addMetadata,
                            keepOriginalAttributes: keepOriginalAttributes,
                            blobToURL: blobToURL,
                            snapshotTime: now
                        });

                    case 6:
                        html = _context.sent;
                        return _context.abrupt('return', html);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    function freezeDry() {
        return _ref.apply(this, arguments);
    }

    return freezeDry;
}();

var maxWait = function maxWait(timeout) {
    return timeout === Infinity ? function (promise) {
        return promise;
    } : function (promise) {
        return Promise.race([promise, new Promise(function (resolve) {
            return setTimeout(resolve, timeout);
        })]);
    };
};
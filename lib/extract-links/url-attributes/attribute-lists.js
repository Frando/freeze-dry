'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.whatwg = exports.html52 = exports.html40 = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _splitTokenList = require('./split-token-list.js');

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Default properties for the attributes listed below.
// Lists of html attributes that can contain one or more URLs.

var defaultItem = {
    // The name of the attribute
    // attribute: (no default value, required)

    // The elements this attribute can appear on, as an array of CSS Selectors
    elements: ['*'],

    // Parser for the attribute value, returns an array of zero, one, or multiple URLs.
    // Each url is an object { token, index }, to help replacing the url on the right spot.
    // (to e.g. replace the correct 5 in <meta http-equiv="refresh" content="5; url=5">)
    parse: function parse(value) {
        // Default is to expect a single URL (+ possibly whitespace).
        var url = value.trim();
        if (url.length === 0) return [];
        var index = value.indexOf(url[0]); // probably 0; otherwise the number of leading spaces.
        return [{ token: url, index: index }];
    },

    // Whether the attribute's URL refers to an "external resource"; i.e. something that is to be
    // considered "part of"/"transcluded into" the current document, rather than just referred to.
    // Might be slightly subjective in some cases.
    isSubresource: false,

    // How the subresource is used; corresponds to what is now called the 'destination' in the WHATWG
    // fetch spec (https://fetch.spec.whatwg.org/#concept-request-destination as of 2018-05-17)
    subresourceType: undefined,

    // Turn the extracted (possibly) relative URL into an absolute URL.
    makeAbsolute: function makeAbsolute(url, element) {
        var baseUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : element.baseURI;
        var documentURL = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : element.ownerDocument.URL;

        // Normally, the URL is simply relative to the document's base URL.
        return new URL(url, baseUrl).href;
    }
};

// Helper for URL attributes that are defined to be relative to the element's 'codebase' attribute.
var makeAbsoluteUsingCodebase = function makeAbsoluteUsingCodebase(url, element) {
    for (var _len = arguments.length, etc = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        etc[_key - 2] = arguments[_key];
    }

    // Read the value of the codebase attribute, and turn it into an absolute URL.
    var codebaseValue = element.getAttribute('codebase');
    if (codebaseValue) {
        var _html40$codebase$pars = html40.codebase.parse(codebaseValue),
            _html40$codebase$pars2 = (0, _slicedToArray3.default)(_html40$codebase$pars, 1),
            codebaseUrlLocation = _html40$codebase$pars2[0];

        if (codebaseUrlLocation) {
            var _html40$codebase;

            var codebaseUrl = codebaseUrlLocation.token;
            var codebaseAbsoluteUrl = (_html40$codebase = html40.codebase).makeAbsolute.apply(_html40$codebase, [codebaseUrl, element].concat(etc));
            return new URL(url, codebaseAbsoluteUrl).href;
        }
    }
    // If there is no (valid) codebase attribute, interpret relative URLs as usual.
    return defaultItem.makeAbsolute.apply(defaultItem, [url, element].concat(etc));
};

// HTML 4.0
// Mostly derived from https://www.w3.org/TR/REC-html40/index/attributes.html
var html40 = exports.html40 = {
    action: (0, _extends3.default)({}, defaultItem, {
        attribute: 'action',
        elements: ['form']
    }),
    applet_archive: (0, _extends3.default)({}, defaultItem, {
        attribute: 'archive',
        elements: ['applet'],
        parse: _splitTokenList.splitByComma,
        isSubresource: true,
        // subresourceType? No idea.
        makeAbsolute: makeAbsoluteUsingCodebase
        // See https://www.w3.org/TR/REC-html40/struct/objects.html#adef-archive-APPLET
    }),
    object_archive: (0, _extends3.default)({}, defaultItem, {
        attribute: 'archive',
        elements: ['object'],
        parse: _splitTokenList.splitByWhitespace,
        isSubresource: true,
        // subresourceType? No idea.
        makeAbsolute: makeAbsoluteUsingCodebase
        // See https://www.w3.org/TR/REC-html40/struct/objects.html#adef-archive-OBJECT
    }),
    background: (0, _extends3.default)({}, defaultItem, {
        attribute: 'background',
        elements: ['body'],
        isSubresource: true,
        subresourceType: 'image'
    }),
    cite: (0, _extends3.default)({}, defaultItem, {
        attribute: 'cite',
        elements: ['blockquote', 'q', 'del', 'ins']
    }),
    classid: (0, _extends3.default)({}, defaultItem, {
        attribute: 'classid',
        elements: ['object'],
        isSubresource: true, // I guess?
        // subresourceType? No idea.
        makeAbsolute: makeAbsoluteUsingCodebase
    }),
    codebase: (0, _extends3.default)({}, defaultItem, {
        attribute: 'codebase',
        elements: ['object', 'applet']
    }),
    data: (0, _extends3.default)({}, defaultItem, {
        attribute: 'data',
        elements: ['object'],
        isSubresource: true,
        subresourceType: 'object',
        makeAbsolute: makeAbsoluteUsingCodebase
        // See https://www.w3.org/TR/REC-html40/struct/objects.html#adef-data
    }),
    href: (0, _extends3.default)({}, defaultItem, {
        attribute: 'href',
        elements: ['a', 'area', 'base', 'link:not([rel~=icon i]):not([rel~=stylesheet i])']
        // Note: some links are resources, see below.
    }),
    link_icon_href: (0, _extends3.default)({}, defaultItem, {
        attribute: 'href',
        elements: ['link[rel~=icon i]'],
        isSubresource: true,
        subresourceType: 'image'
    }),
    link_stylesheet_href: (0, _extends3.default)({}, defaultItem, {
        attribute: 'href',
        elements: ['link[rel~=stylesheet i]'],
        isSubresource: true,
        subresourceType: 'style'
    }),
    longdesc: (0, _extends3.default)({}, defaultItem, {
        attribute: 'longdesc',
        elements: ['img', 'frame', 'iframe']
    }),
    profile: (0, _extends3.default)({}, defaultItem, {
        attribute: 'profile',
        elements: ['head']
    }),
    img_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['img', 'input[type=image i]'],
        isSubresource: true,
        subresourceType: 'image'
    }),
    frame_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['frame', 'iframe'],
        isSubresource: true,
        subresourceType: 'document'
    }),
    script_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['script'],
        isSubresource: true,
        subresourceType: 'script'
    }),
    // It seems usemap can only contain within-document URLs; hence omitting it from this list.
    // usemap: {
    //     ...defaultItem,
    //     attribute: 'usemap',
    //     elements: ['img', 'input', 'object'],
    // },

    // Some attributes that are not listed as Type=%URI in
    // <https://www.w3.org/TR/REC-html40/index/attributes.html>, but seem to belong here.
    param_ref_value: (0, _extends3.default)({}, defaultItem, {
        attribute: 'value',
        elements: ['param[valuetype=ref i]']
        // Note: "The URI must be passed to the object as is, i.e., unresolved."
        // See https://www.w3.org/TR/REC-html40/struct/objects.html#adef-valuetype
    }),
    meta_refresh_content: (0, _extends3.default)({}, defaultItem, {
        attribute: 'content',
        elements: ['meta[http-equiv=refresh i]'],
        parse: function parse(value) {
            // Example: <meta http-equiv="refresh" content="2; url=http://www.example.com">
            // To match many historical syntax variations, we try to follow whatwg's algorithm.
            // See <https://html.spec.whatwg.org/multipage/semantics.html#shared-declarative-refresh-steps>
            var match = value.match(/^(\s*[\d.]+\s*[;,\s]\s*(?:url\s*=\s*)?('|")?\s*)(.+)/i);

            if (!match) return []; // Probably a normal refresh that stays on the same page.

            // If the URL was preceded by a quote, truncate it at the next quote.
            var quote = match[2];
            var url = match[3];
            if (quote && url.includes(quote)) {
                url = url.slice(0, url.indexOf(quote));
            }

            var index = match[1].length;
            url = url.trim(); // url could not start with whitespace, so index remains correct.
            return [{ token: url, index: index }];
        }
    })

    // HTML 5.2.
    // Derived from https://www.w3.org/TR/2017/REC-html52-20171214/fullindex.html#attributes-table
};var html52 = exports.html52 = {
    action: html40.action,
    cite: html40.cite,
    data: (0, _extends3.default)({}, html40.data, {
        makeAbsolute: defaultItem.makeAbsolute // html5 drops the codebase attribute
    }),
    formaction: (0, _extends3.default)({}, defaultItem, {
        attribute: 'formaction',
        elements: ['button', 'input']
    }),
    href: html40.href,
    // See https://www.w3.org/TR/2017/REC-html52-20171214/links.html#sec-link-types
    link_icon_href: html40.link_icon_href,
    link_stylesheet_href: html40.link_stylesheet_href,
    longdesc: (0, _extends3.default)({}, html40.longdesc, { // minus frame/iframe
        elements: ['img']
    }),
    manifest: (0, _extends3.default)({}, defaultItem, {
        attribute: 'manifest',
        elements: ['html'],
        isSubresource: true,
        // subresourceType? Maybe 'manifest'? Confusion with <link rel=manifest>
        makeAbsolute: function makeAbsolute(url, element, _) {
            var documentURL = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : element.ownerDocument.URL;

            // The manifest is not influenced by a <base href="..."> tag.
            return new URL(url, documentURL).href;
        }
    }),
    poster: (0, _extends3.default)({}, defaultItem, {
        attribute: 'poster',
        elements: ['video'],
        isSubresource: true,
        subresourceType: 'image'
    }),
    audio_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['audio', 'audio>source'],
        isSubresource: true,
        subresourceType: 'audio'
    }),
    embed_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['embed'],
        isSubresource: true,
        subresourceType: 'embed'
    }),
    frame_src: (0, _extends3.default)({}, html40.frame_src, { // minus the <frame> element
        elements: ['iframe']
    }),
    img_src: html40.img_src,
    script_src: html40.script_src,
    track_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['track'],
        isSubresource: true,
        subresourceType: 'track'
    }),
    video_src: (0, _extends3.default)({}, defaultItem, {
        attribute: 'src',
        elements: ['video', 'video>source'],
        isSubresource: true,
        subresourceType: 'video'
    }),
    srcset: (0, _extends3.default)({}, defaultItem, {
        attribute: 'srcset',
        elements: ['img', 'picture>source'],
        // Example: <img srcset="http://image 2x, http://other-image 1.5x" ...>
        // TODO implement more sophisticated srcset parsing.
        // See https://html.spec.whatwg.org/multipage/images.html#parsing-a-srcset-attribute
        parse: _splitTokenList.splitByCommaPickFirstTokens,
        isSubresource: true,
        subresourceType: 'image'
    }),

    // Not listed in the attributes index, but seems to belong here.
    meta_refresh_content: html40.meta_refresh_content

    // WHATWG as of 2018-04-20
    // https://html.spec.whatwg.org/multipage/indices.html#attributes-3 of 2018-04-20
};var whatwg = exports.whatwg = (0, _extends3.default)({}, (0, _util.omit)('longdesc')(html52), {

    itemprop: (0, _extends3.default)({}, defaultItem, {
        attribute: 'itemprop',
        parse: function parse(value) {
            return (0, _splitTokenList.splitByWhitespace)(value).filter(function (_ref) {
                var token = _ref.token;
                return token.includes(':');
            }); // tokens without colon are property names.
        },
        // Can only contain absolute urls.
        makeAbsolute: function makeAbsolute(url) {
            return url;
        }
    }),
    itemtype: (0, _extends3.default)({}, defaultItem, {
        attribute: 'itemtype',
        parse: _splitTokenList.splitByWhitespace,
        // May only contain absolute urls.
        makeAbsolute: function makeAbsolute(url) {
            return url;
        }
    }),
    itemid: (0, _extends3.default)({}, defaultItem, {
        attribute: 'itemid'
    }),
    ping: (0, _extends3.default)({}, defaultItem, {
        attribute: 'ping',
        elements: ['a', 'area']
    })

    // Notes to self about link types that declare external resources.
    // Regarding link types in the WHATWG spec:
    //   The preloading-related links might be nice to archive if we start supporting scripts: we
    //   could hardcode their URL:value combination into an injected fetch replacement function.
    //   Preloading relation types: modulepreload, preconnect, prefetch, preload, prerender
    //   Another type: dns-prefetch; Seems even further off, does not actually load any resource.
    //   Also, rel=pingback is listed as an external resource link. No idea why.
    //   See https://html.spec.whatwg.org/multipage/links.html#linkTypes
    // Other:
    //   A few other possibly interesting link relation types to external resources.
    //   (hand-picked from <http://microformats.org/wiki/index.php?title=existing-rel-values&oldid=66721>)
    //   apple-touch-icon / apple-touch-icon-precomposed / apple-touch-startup-image
    //   enclosure (similar to prefetch etc?)
    //   pgpkey / publickey

});
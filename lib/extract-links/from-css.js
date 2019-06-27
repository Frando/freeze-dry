'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extractLinksFromCss = extractLinksFromCss;
exports.extractLinksFromCssSynced = extractLinksFromCssSynced;

var _package = require('../package.js');

var _parseTools = require('./parse-tools.js');

/**
 * Extract links from a stylesheet.
 * @param {Object} parsedCss - An AST as produced by postcss.parse()
 * @param {string} baseUrl - the absolute URL for interpreting any relative URLs in the stylesheet.
 * @returns {Object[]} The extracted links. Each link provides a live, editable view on one URL
 * inside the stylesheet.
 */
function extractLinksFromCss(parsedCss, baseUrl) {
    var links = [];

    // Grab all @import urls
    parsedCss.walkAtRules('import', function (atRule) {
        var valueAst = void 0;
        try {
            valueAst = (0, _package.postCssValuesParser)(atRule.params).parse();
        } catch (err) {
            return; // We ignore values we cannot parse.
        }

        var urlNode = void 0;
        var firstNode = valueAst.nodes[0].nodes[0];
        if (firstNode.type === 'string') {
            urlNode = firstNode;
        } else if (firstNode.type === 'func' && firstNode.value === 'url') {
            var argument = firstNode.nodes[1]; // nodes[0] is the opening parenthesis.
            if (argument.type === 'string' || argument.type === 'word') {
                urlNode = argument; // For either type, argument.value is our URL.
            }
        }

        if (urlNode) {
            links.push({
                get target() {
                    return urlNode.value;
                },
                set target(newUrl) {
                    urlNode.value = newUrl;
                    atRule.params = valueAst.toString();
                },
                get absoluteTarget() {
                    return new URL(this.target, baseUrl).href;
                },
                get isSubresource() {
                    return true;
                },
                get subresourceType() {
                    return 'style';
                },
                get from() {
                    // TODO combine atRule.source.start.{line|column} with urlNode.sourceIndex
                    // But.. those numbers are not updated when the AST is mutated. Hopeless.
                    // (if urlNode.type === 'string', offset by 1 to account for the quote)
                    return {};
                }
            });
        }
    });

    // Grab every url(...) inside a property value; also gets those within @font-face.
    parsedCss.walkDecls(function (decl) {
        // TODO Possible future optimisation: only parse props known to allow a URL.
        var valueAst = void 0;
        try {
            valueAst = (0, _package.postCssValuesParser)(decl.value).parse();
        } catch (err) {
            return; // We ignore values we cannot parse.
        }

        valueAst.walk(function (functionNode) {
            // walkFunctionNodes seems broken? Testing manually then.
            if (functionNode.type !== 'func') return;
            if (functionNode.value !== 'url') return;

            var subresourceType = void 0;
            if (decl.prop === 'src' && decl.parent.type === 'atrule' && decl.parent.name === 'font-face') {
                subresourceType = 'font';
            } else {
                // As far as I know, all other props that can contain a url specify an image.
                subresourceType = 'image';
            }

            var argument = functionNode.nodes[1]; // nodes[0] is the opening parenthesis.
            if (argument.type === 'string' || argument.type === 'word') {
                var urlNode = argument; // For either type, argument.value is our URL.

                links.push({
                    get target() {
                        return urlNode.value;
                    },
                    set target(newUrl) {
                        urlNode.value = newUrl;
                        decl.value = valueAst.toString();
                    },
                    get absoluteTarget() {
                        return new URL(this.target, baseUrl).href;
                    },
                    get isSubresource() {
                        return true;
                    },
                    get subresourceType() {
                        return subresourceType;
                    },
                    get from() {
                        // TODO combine decl.source.start.{line|column} with urlNode.sourceIndex
                        // But.. those numbers are not updated when the AST is mutated. Hopeless.
                        // (if urlNode.type === 'string', offset by 1 to account for the quote)
                        return {};
                    }
                });
            }
        });
    });

    return links;
}

/**
 * Create a live&editable view on the links in a stylesheet.
 * @param options
 * @param {() => string} options.get - getter to obtain the current content of the stylesheet. This
 * may be called many times, so keep it light; e.g. just reading a variable or style attribute.
 * @param {string => void} options.set - setter that is called, whenever a link is modified, with
 * the new value of the whole stylesheet.
 * @param {string} options.baseUrl - the absolute URL for interpreting any relative URLs in the
 * stylesheet.
 */
function extractLinksFromCssSynced(_ref) {
    var getCssString = _ref.get,
        setCssString = _ref.set,
        baseUrl = _ref.baseUrl;

    // We run two steps: string to AST to links; each getter is cached. Changes to links will
    // update the AST automatically, but we do have to write back the AST to the string.
    // cssString <===|===> parsedCss <------|===> links
    //            set|get             mutate|get

    // Wrap get and set so we can get and set the AST directly, without reparsing when unnecessary.
    var _transformingCache = (0, _parseTools.transformingCache)({
        get: getCssString,
        set: setCssString,
        transform: function transform(cssString) {
            return _package.postcss.parse(cssString);
        },
        untransform: function untransform(parsedCss) {
            return parsedCss.toResult().css;
        }
    }),
        getParsedCss = _transformingCache.get,
        setParsedCss = _transformingCache.set;

    // Memoise, such that when we get the AST from cache, we get the extracted links from cache too.


    var memoizedExtractLinksFromCss = (0, _package.memoizeOne)(extractLinksFromCss);

    // Make a proxy so that `links` is always up-to-date and its modifications are written back.
    // For the curious: note that wrapping {get,set}parsedCss in a deepSyncingProxy would not work:
    // access to its members would be wrapped, but a method like walkAtRules would not wrap the
    // arguments to its callback, so operations performed on them would not be noticed. Therefore,
    // we manually remember currentParsedCss and set() it whenever (any member of) the links object
    // has been operated on.
    var currentParsedCss = void 0;
    var links = (0, _parseTools.deepSyncingProxy)({
        get: function get() {
            try {
                currentParsedCss = getParsedCss();
            } catch (err) {
                // Corrupt CSS is treated as containing no links at all.
                currentParsedCss = null;
                return [];
            }
            return memoizedExtractLinksFromCss(currentParsedCss, baseUrl);
        },
        set: function set(links) {
            // No need to use the given argument; any of links's setters will have already updated
            // the AST (i.e. currentParsedCss), so that is the thing we have to sync now.
            if (currentParsedCss !== null) {
                setParsedCss(currentParsedCss);
            }
        }
    });
    return links;
}
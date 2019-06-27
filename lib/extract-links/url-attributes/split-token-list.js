"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var splitByRegex = function splitByRegex(regex) {
    return function (value) {
        var tokens = [];
        var remainder = value;
        var remainderIndex = 0;
        while (remainder.length > 0) {
            var match = remainder.match(regex);
            // No check for match===null needed; the regexes given below produce a match on any string.
            var leadingWhitespace = match[1];
            var token = match[2];
            if (token.length > 0) {
                // I suppose we can simply omit empty (= invalid?) tokens..
                tokens.push({
                    token: token,
                    index: remainderIndex + leadingWhitespace.length
                });
            }
            var charactersSeen = match[0].length;
            remainder = remainder.slice(charactersSeen);
            remainderIndex += charactersSeen;
        }
        return tokens;
    };
};

// Split by whitespace, return values and their indices
// E.g. 'aaa bbb' => [{ token: 'aaa', index: 0 }, { token: 'bbb', index: 4 }]
var splitByWhitespace = exports.splitByWhitespace = splitByRegex(/^(\s*)([^]*?)(\s*)(\s|$)/);

// Split string by commas, strip whitespace, and return the index of every found token.
// E.g. splitByComma('aaa, bbb') === [{ token: 'aaa', index: 0 }, { token: 'bbb', index: 5 }]
var splitByComma = exports.splitByComma = splitByRegex(/^(\s*)([^]*?)(\s*)(,|$)/);

// Split by commas, then split each token by whitespace and only keep the first piece.
// E.g. 'aaa bbb, ccc' => [{ token: 'aaa', index: 0 }, { token: 'ccc', index: 9 }]
// Used for parsing srcset: <img srcset="http://image 2x, http://other-image 1.5x" ...>
var splitByCommaPickFirstTokens = exports.splitByCommaPickFirstTokens = splitByRegex(/^(\s*)(\S*)([^]*?)(,|$)/);
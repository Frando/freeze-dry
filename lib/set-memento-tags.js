'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = setMementoTags;
/**
 * Add provenance metadata to the DOM, using the terminology of the Memento protocol.
 * Note however that the Memento spec only discusses HTTP headers; we take the freedom to use <meta>
 * and <link> tags to 'embed' these headers inside the document itself.
 * @param {Document} doc - The Document to add tags to.
 * @param {Object} options
 * @param {Date} [options.datetime] - The moment the page was snapshotted.
 * @param {string} [options.originalUrl] - The page's original location.
 * @returns nothing; doc is mutated.
 */
function setMementoTags(doc, _ref) {
    var originalUrl = _ref.originalUrl,
        datetime = _ref.datetime;

    // Ensure a head element exists.
    if (!doc.head) {
        var head = doc.createElement('head');
        doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
    }

    if (originalUrl) {
        // https://tools.ietf.org/html/rfc7089#section-2.2.1
        var linkEl = doc.createElement('link');
        linkEl.setAttribute('rel', 'original');
        linkEl.setAttribute('href', originalUrl);
        doc.head.insertBefore(linkEl, doc.head.firstChild);
    }

    if (datetime) {
        // https://tools.ietf.org/html/rfc7089#section-2.1.1
        var metaEl = doc.createElement('meta');
        metaEl.setAttribute('http-equiv', 'Memento-Datetime');
        metaEl.setAttribute('content', datetimeToString(datetime));
        doc.head.insertBefore(metaEl, doc.head.firstChild);
    }
}

// Produces an RFC 1123 datetime string, hard-coded to use GMT as its timezone, as Memento requires.
function datetimeToString(datetime) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var zeropad = function zeropad(l) {
        return function (n) {
            return '' + Array(l - ('' + n).length).fill('0').join('') + n;
        };
    };
    var datetimeString = weekdays[datetime.getUTCDay()] + ', ' + zeropad(2)(datetime.getUTCDate()) + ' ' + months[datetime.getUTCMonth()] + ' ' + zeropad(4)(datetime.getUTCFullYear()) + ' ' + zeropad(2)(datetime.getUTCHours()) + ':' + zeropad(2)(datetime.getUTCMinutes()) + ':' + zeropad(2)(datetime.getUTCSeconds()) + ' GMT';
    return datetimeString;
}

exports.datetimeToString = datetimeToString; // merely for testing
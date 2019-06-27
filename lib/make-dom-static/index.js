'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeDomStatic;

var _removeScripts = require('./remove-scripts.js');

var _removeScripts2 = _interopRequireDefault(_removeScripts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Remove interactivity from a document.
 * @param {Document} doc - the Document to be modified.
 * @returns nothing; doc is mutated.
 */
function makeDomStatic(doc) {
    // Remove all javascript.
    (0, _removeScripts2.default)(doc.documentElement);

    // If noscript content was not shown, we do not want it to show in the snapshot either. Also, we
    // capture pages after scripts executed (presumably), so noscript content is likely undesired.
    // TODO We should know whether noscript content was visible, and if so keep it in the doc.
    // TODO Keep noscript content in fetched iframe docs, as scripts have not been executed there?
    var noscripts = Array.from(doc.querySelectorAll('noscript'));
    noscripts.forEach(function (element) {
        return element.parentNode.removeChild(element);
    });

    // Disable editing on editable elements
    var editableElements = Array.from(doc.querySelectorAll('*[contenteditable]'));
    editableElements.forEach(function (element) {
        element.contentEditable = 'false';
        // TODO Reapply any style rules that matched only when contenteditable was set.
        // (perhaps set data-original-contenteditable, and clone any such rules accordingly?)
    });

    // TODO any other changes we may want to consider? Disable form inputs? Disable links that were
    // javascript triggers only? Disable CSS hover interactions?
}
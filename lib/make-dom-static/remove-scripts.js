'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = removeScripts;
/**
 * Tries to remove all kinds of scripts contained in the given rootElement.
 * @param {Element} rootElement
 * @returns nothing; rootElement is mutated.
 */
function removeScripts(rootElement) {
    removeScriptElements(rootElement);
    removeEventHandlers(rootElement);
    removeJavascriptHrefs(rootElement);
}

// Removes all <script> elements in rootElement.
function removeScriptElements(rootElement) {
    var scripts = Array.from(rootElement.querySelectorAll('script'));
    scripts.forEach(function (element) {
        return element.parentNode.removeChild(element);
    });
}

// Removes event handlers (onclick, onload, etcetera) from rootElement and all elements it contains.
function removeEventHandlers(rootElement) {
    var elements = Array.from(rootElement.querySelectorAll('*'));
    elements.forEach(function (element) {
        // A crude approach: any attribute starting with 'on' is removed.
        Array.from(element.attributes).filter(function (attribute) {
            return attribute.name.toLowerCase().startsWith('on');
        }).forEach(function (attribute) {
            element.removeAttribute(attribute.name);
        });
    });
}

// Disables all links with a 'javascript:' href.
function removeJavascriptHrefs(rootElement) {
    var linkElements = Array.from(rootElement.querySelectorAll('a, area'));
    linkElements.filter(function (element) {
        return element.href.startsWith('javascript:');
    })
    // .filter(element => element.getAttribute('href').trim().toLowerCase().startsWith('javascript:'))
    .forEach(function (element) {
        // We should keep some href value there to not change the link's appearance, but it
        // should not be resolvable. Keeping the 'javascript:' there, for lack of a better idea.
        element.setAttribute('href', 'javascript:');
    });
}
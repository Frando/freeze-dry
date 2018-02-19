import whenAllSettled from 'when-all-settled'
import { fetchSubresource, urlToDataUrl, stringToDataUrl } from './common'


// Finds all url(...) occurrances in a string of CSS, then fetches and inlines
// them as data URLs.
// Returns the processed (and possibly much larger) string of CSS.
async function inlineStylesheetContents({stylesheetText, stylesheetUrl}) {
    const cssFindUrlsPattern = /url\s*\(\s*('|")?\s*([^"')]+?)\s*\1\s*\)/ig
    const cssExtractUrlPattern = /url\s*\(\s*('|")?\s*([^"')]+?)\s*\1\s*\)/i
    const cssUrls = stylesheetText.match(cssFindUrlsPattern)
    if (!cssUrls) {
        return stylesheetText
    }
    const urls = cssUrls.map(urlString => {
        const match = urlString.match(cssExtractUrlPattern)
        return match
            ? new URL(match[2], stylesheetUrl)
            : undefined
    })
    const dataUrls = await Promise.all(urls.map(url => urlToDataUrl(url)))
    dataUrls.forEach((dataUrl, i) => {
        stylesheetText = stylesheetText.replace(cssUrls[i], `url("${dataUrl}")`)
    })
    return stylesheetText
}

// In every <link rel="stylesheet"> tag, inline the stylesheet as a data URL,
// and inline every URL within that stylesheet.
async function inlineLinkedStylesheets({rootElement, docUrl}) {
    const querySelector = 'link[rel~="stylesheet"][href]'
    const linkElements = Array.from(rootElement.querySelectorAll(querySelector))
    const jobs = linkElements.map(async linkEl => {
        const href = linkEl.getAttribute('href')
        const stylesheetUrl = new URL(href, docUrl)
        let newHref
        try {
            // Fetch the stylesheet itself.
            const response = await fetchSubresource(stylesheetUrl)
            const stylesheetText = await response.text()
            // Fetch and replace URLs inside the stylesheet.
            const newStylesheetText = await inlineStylesheetContents({
                stylesheetText,
                stylesheetUrl,
            })
            newHref = await stringToDataUrl(newStylesheetText, 'text/css')
        } catch (err) {
            newHref = 'about:invalid'
        }
        // Remove the link's integrity hash, if any, as we may have changed the content.
        linkEl.removeAttribute('integrity')
        // Remember the original reference to the stylesheet
        linkEl.setAttribute('data-original-href', href)
        // Inline the stylesheet into the link element.
        linkEl.setAttribute('href', newHref)
    })
    await whenAllSettled(jobs)
}

// In every <style>...</style> block, inline any URLs it contains.
async function inlineStyleTagContents({rootElement, docUrl}) {
    const querySelector = 'style[type="text/css"],style:not([type])'
    const styleElements = Array.from(rootElement.querySelectorAll(querySelector))
    const jobs = styleElements.map(async styleEl => {
        let stylesheetText = styleEl.innerHTML
        stylesheetText = await inlineStylesheetContents({
            stylesheetText,
            stylesheetUrl: docUrl,
        })
        styleEl.innerHTML = stylesheetText
    })
    await whenAllSettled(jobs)
}

// In every <sometag style="..."> inline style, inline any URLs it contains.
async function inlineInlineStyleContents({rootElement, docUrl}) {
    const querySelector = '*[style]'
    const elements = Array.from(rootElement.querySelectorAll(querySelector))
    const jobs = elements.map(async element => {
        let inlineStyleText = element.getAttribute('style')
        inlineStyleText = await inlineStylesheetContents({
            stylesheetText: inlineStyleText,
            stylesheetUrl: docUrl,
        })
        element.setAttribute('style', inlineStyleText)
    })
    await whenAllSettled(jobs)
}

export default async function inlineStyles({rootElement, docUrl}) {
    const jobs = [
        inlineLinkedStylesheets({rootElement, docUrl}),
        inlineStyleTagContents({rootElement, docUrl}),
        inlineInlineStyleContents({rootElement, docUrl}),
    ]
    await whenAllSettled(jobs)
}

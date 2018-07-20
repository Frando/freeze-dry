import whenAllSettled from 'when-all-settled'
import documentOuterHTML from 'document-outerhtml'

import { extractLinksFromDom, extractLinksFromCss } from './extract-links'

/**
 * Recursively fetch the subresources of a DOM resource.
 * @param {Object} resource - the resource object representing the DOM with its subresources.
 * @returns nothing; subresources are stored in the links of the given resource.
 */
async function crawlSubresourcesOfDom(resource) {
    const supportedSubresourceTypes = ['image', 'document', 'style', 'video']

    // TODO Avoid fetching all resolutions&formats of the same image/video?
    const linksToCrawl = resource.links
        .filter(link => link.isSubresource)
        .filter(link => supportedSubresourceTypes.includes(link.subresourceType))

    // Start recursively and concurrently crawling the resources.
    await whenAllSettled(linksToCrawl.map(crawlSubresource))
}
export default crawlSubresourcesOfDom

async function crawlSubresource(link) {
    const crawlers = {
        image: crawlLeafSubresource, // Images cannot have subresources (actually, SVGs can! TODO)
        document: crawlFrame,
        style: crawlStylesheet,
        video: crawlLeafSubresource, // Videos cannot have subresources (afaik; maybe they can?)
    }
    const crawler = crawlers[link.subresourceType]
    if (crawler === undefined) {
        throw new Error(`Not sure how to crawl subresource of type ${link.subresourceType}`)
    }
    await crawler(link)
}

async function crawlLeafSubresource(link) {
    const response = await fetchSubresource(link.absoluteTarget)
    const blob = await response.blob()
    link.resource = {
        url: response.url, // may differ from link.absoluteTarget in case of redirects.
        blob,
        links: [],
    }
}

async function crawlFrame(link) {
    // Maybe this link already has a resource: we try to capture (i)frame content in captureDom().
    if (!link.resource) {
        // Apparently we could not capture the frame's DOM in the initial step. To still do the best
        // we can, we fetch and parse the framed document's html source and work with that.
        const response = await fetchSubresource(link.absoluteTarget)
        const html = await response.text()
        const parser = new DOMParser()
        const innerDoc = parser.parseFromString(html, 'text/html')
        const innerDocUrl = response.url // may differ from link.absoluteTarget in case of redirects

        // Create a resource object for this frame, similar to the resource captureDom() returns.
        const innerDocResource = {
            url: innerDocUrl,
            doc: innerDoc,
            get blob() { return new Blob([this.string], { type: 'text/html' }) },
            get string() {
                // TODO Add <meta charset> if absent? Or html-encode characters as needed?
                return documentOuterHTML(innerDoc)
            },
            links: extractLinksFromDom(innerDoc, { docUrl: innerDocUrl }),
        }

        link.resource = innerDocResource
    }

    await crawlSubresourcesOfDom(link.resource)
}

async function crawlStylesheet(link) {
    const response = await fetchSubresource(link.absoluteTarget)
    const stylesheetUrl = response.url // may differ from link.absoluteTarget in case of redirects.

    // stylesheetText is mutable, as it will be updated when we change its links.
    let stylesheetText = await response.text()

    // Create a live&editable view on the links in the stylesheet.
    const links = extractLinksFromCss({
        get: () => stylesheetText,
        set: newValue => { stylesheetText = newValue },
        baseUrl: stylesheetUrl,
    })

    const stylesheetResource = {
        url: stylesheetUrl,
        get blob() { return new Blob([this.string], { type: 'text/css' }) },
        get string() { return stylesheetText },
        links,
    }

    link.resource = stylesheetResource

    // Recurse to crawl the subresources of this stylesheet.
    await whenAllSettled(stylesheetResource.links.map(crawlSubresource))
}

async function fetchSubresource(url) {
    // TODO investigate whether we should supply origin, credentials, perhaps
    // use content.fetch (in Firefox extensions), etcetera.
    const response = await self.fetch(url, {
        cache: 'force-cache',
        redirect: 'follow',
    })
    return response
}

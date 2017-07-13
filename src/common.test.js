/* eslint-env jest */

import { dataURLToBlob } from 'blob-util'
import * as responseToDataUrl from 'response-to-data-url'

import { inlineUrlsInAttributes, urlToDataUrl, removeNode } from './common'


const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg=='

beforeEach(() => {
    fetch.resetMocks()
})

describe('removeNode', () => {
    test('should remove the node', () => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(
            '<html><head></head><body></body></html>',
            'text/html'
        )
        removeNode(doc.querySelector('head'))
        expect(doc.querySelector('head')).toBeNull()
    })
})

describe('urlToDataUrl', () => {
    test('should return a dataUrl given a URL', async () => {
        const someDataUrl = 'data:text/html,<h1>bananas</h1>'
        const spy = jest.spyOn(responseToDataUrl, 'default').mockImplementation(async () => {
            return someDataUrl
        })
        const dataUrl = await urlToDataUrl('https://example.com/page')
        expect(dataUrl).toBe(someDataUrl)
        spy.mockRestore()
    })

    test('should return a "about:invalid" upon failure', async () => {
        const spy = jest.spyOn(responseToDataUrl, 'default').mockImplementation(async () => {
            throw new Error('mock error')
        })
        const dataUrl = await urlToDataUrl('http://example.com')
        expect(dataUrl).toBe('about:invalid')
        spy.mockRestore()
    })

    test('should return a "about:invalid" when fetching fails', async () => {
        fetch.mockRejectOnce()
        const dataUrl = await urlToDataUrl('http://example.com')
        expect(dataUrl).toBe('about:invalid')
    })
})

describe('inlineUrlsInAttributes', () => {
    const docUrl = 'https://example.com/page'
    const parser = new DOMParser()
    let imageBlob

    beforeAll(async () => {
        imageBlob = await dataURLToBlob(imageDataUrl)
    })

    test('should change the URL in <img> tag to a dataUrl', async () => {
        fetch.mockResponseOnce(imageBlob)
        const doc = parser.parseFromString(
            '<html><body><img src="public/image/background.png" alt="background" /></body></html>',
            'text/html'
        )
        const rootElement = doc.documentElement
        await inlineUrlsInAttributes({elements: 'img', attributes: 'src', rootElement, docUrl})
        expect(rootElement.querySelector('img').getAttribute('data-original-src')).toBe('public/image/background.png')
        expect(rootElement.querySelector('img').getAttribute('src')).toBe(imageDataUrl)
    })

    test('should change the URL in the <link> tag to a dataUrl', async () => {
        fetch.mockResponseOnce(imageBlob)
        const doc = parser.parseFromString(
            '<html><head><link rel="icon" href="public/image/favicon.ico"></head></html>',
            'text/html'
        )
        const rootElement = doc.documentElement
        await inlineUrlsInAttributes({elements: 'link', attributes: 'href', rootElement, docUrl})
        expect(rootElement.querySelector('link').getAttribute('data-original-href')).toBe('public/image/favicon.ico')
        expect(rootElement.querySelector('link').getAttribute('href')).toBe(imageDataUrl)
    })

    test('should remove the attribute integrity from the tag', async () => {
        const doc = parser.parseFromString(
            `<html>
                <head>
                    <link
                        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"
                        rel="stylesheet"
                        integrity="sha256-MfvZlkHCEqatNoGiOXveE8FIwMzZg4W85qfrfIFBfYc="
                    >
                </head>
            </html>`,
            'text/html'
        )
        const rootElement = doc.documentElement
        await inlineUrlsInAttributes({elements: 'link', attributes: 'href', fixIntegrity: true, rootElement, docUrl})
        expect(rootElement.querySelector('link').getAttribute('integrity')).toBeNull()
    })
})

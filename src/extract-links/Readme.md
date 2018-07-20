# extract-links

This code was written for freeze-dry, but with reusability in mind, to aid in any project that wants to list and/or modify the links defined in a web page. It could be packaged & published by itself if there is demand for it.

Note that in this project, the word link means *any* reference to another resource; so not just the links defined by `<a>` tags, but also the `src` of an `<img>` or a `url(...)` inside a `<style>` tag. So basically everything that a web browser would interpret as a URL.

## Usage

### For a DOM Document

    extractLinksFromDom(doc, { docUrl })

Pass a Document as `doc`; gives back an array of links (described below).

Optionally, you can specify `docUrl` if you wish to override the URL that will be used to interpret
relative links. Otherwise `doc.URL` will be used (in either case, a `<base href="...">` tag would
still take precedence).

Usage example: (assume the document just contains `<a href="/page"><img src="img.png"></a>`)

    const links = extractLinksFromDom(window.document)
    // links[0].target === '/page'
    // links[1].target === 'img.png'

    links[1].target = 'other.png'
    // Now the document contains `<a href="page"><img src="other.png"></a>`

### For a stylesheet

    extractLinksFromCss({ set, get, baseUrl })

Stylesheets are taken in their string form (using [CSSOM] is a future possibility). However, because Javascript strings are immutable but we do want to have the same features as with links in the DOM, you do not pass the stylesheet as a string. Rather, you pass a getter and setter, that will access or replace the stylesheet string. Also, you should pass a `baseUrl` for interpreting any relative links the stylesheet may contain.

Example usage:

    let stylesheetString = `body { background: url('bg.png'); }`
    const links = extractLinksFromCss({
        get: () => stylesheetString,
        set: newValue => { stylesheetString = newValue },
        baseUrl: stylesheetUrl,
    })

    links[0].target = 'other.png'
    // stylesheetString === `body { background: url('other.png'); }`

## Properties of a link

The properties of link are 'live' views on the link in the document, always reflecting the current value. Except for `target`, all properties are read-only.

- `target`: the link's target URL. This is the exact value as it appears in the document, and may thus be a relative URL. This property can be written to, which will modify the document.

- `absoluteTarget`: the link's target URL as an absolute URL. This takes into account factors like the <base href="..."> tag, so usually you may prefer to use `absoluteTarget` rather than `target`.

- `from`: information needed to find the link in the DOM or stylesheet, for scenarios where one
  needs to do more than just reading or modifying the link target.

  <details>

  In order to point to the various types of places a link URL may be located, the `from` property
  can take different forms. For links in the DOM:
  - if defined in an element's attribute:
    `{ element, attribute, rangeWithinAttribute: [ start, end ] }`
  - if defined in text (only possible inside a `<style>` tag):
    `{ element, rangeWithinTextContent: [ start, end ] }`

  For links in a CSS stylesheet (i.e. using `extractLinksFromCss`):
  - `{ range: [ start, end ] }`

  As usual, range ends are exclusive; so `start - end === link.target.length` holds.
  </details>

- `isSubresource`: a boolean indicating whether the resource being linked to is normally considered
  a subresource of the document. For example, the `src` of an `<img>` tag specifies a subresource
  because the image is considered *part of* the document, while the `href` of an `<a>` or the
  `action` of a `<form>` merely *point to* another resource. See the [attribute lists][] in the
  source code for details.

- `subresourceType`: if `isSubresource === true`, this is a string indicating the type of resource (`'image'`, `'style'`, ...). This corresponds to what is now called the 'destination' in the [WHATWG fetch spec][].

## How the live view works

Extracted links remain coupled with the DOM/stylesheet, so e.g. `link.target` will always return its current target, and setting its target will mutate the DOM/stylesheet.

However, the links array itself will not update when links are inserted or removed, so e.g. a newly inserted `<a>` element will not appear in the previously extracted array of links; similar to the behaviour of `Document.querySelectorAll` (this behaviour could be changed in the future).

<details><summary><b>
Caveat: changing attributes/stylesheets containing multiple links
</b></summary>

Sometimes a single string define multiple links, such as the `srcset` of an `<img>`, the `style` of
any element, as well as the text content of a `<style>` element or stylesheet. Because there is no
identifier to distinguish the individual links, the links are identified by their index in the array
of extracted links. This means that if by modifying the attribute/stylesheet you insert or remove a
link, previously extracted links will now correspond to different links than you may expect.

Say, our body contains:

    <img id="myImage" srcset="normal.png" srcset="huge.png 8x, large.png 2x">

And we run:

    const links = extractLinksFromDom(window.document)
    const srcsetLinks = links.filter(link => link.from.attribute === 'srcset')

    const largeLink = srcsetLinks[1]
    // largeLink.target === 'large.png'

    myImage.setAttribute('srcset', 'huge.png 8x, big.png 4x, large.png 2x')
    // largeLink.target === 'big.png'

Perhaps to your surprise, `largeLink.target === 'big.png'`, because that is now the second link in
the `srcset`. In any case, we would have to run extractLinksFromDom again to get all three links.
</details>

[WHATWG fetch spec]: https://fetch.spec.whatwg.org/#concept-request-destination (as of 2018-05-17)
[attribute lists]: url-attributes/attribute-lists.js
[CSSOM]: https://www.w3.org/TR/cssom-1/

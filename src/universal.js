import { blobToDataURL as browserBlobToDataUrl } from './package'

export class Blob {
  constructor (strings, opts) {
    this.opts = opts || {}
    this.type = this.opts.type
    let buf = Buffer.alloc(0)
    strings.forEach(str => {
      buf = Buffer.concat([buf, Buffer.from(str)])
    })
    this.buf = buf
  }

  toBuffer () {
    return this.buf
  }
}

export async function blobToText(blob) {
    let text
    if (blob instanceof Blob) {
      text = blob.toBuffer().toString()
    } else {
      text = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(reader.error)
          reader.readAsText(blob) // TODO should we know&tell which encoding to use?
      })
    }
    return text
}

export async function responseToBlob (resourceOrResponse) {
  if (resourceOrResponse.arrayBuffer) {
    let buf = await resourceOrResponse.arrayBuffer()
    return new Blob([buf])
  } else {
    return typeof resourceOrResponse.blob === 'function'
      ? await resourceOrResponse.blob()
      : resourceOrResponse.blob
  }

}

export async function blobToDataURL (blob) {
  if (blob.toBuffer) {
    let base64String = blob.toBuffer().toString('base64')
    return 'data:' + blob.type + ';base64,' + base64String;
  } else {
    return browserBlobToDataUrl(blob)
  }
}

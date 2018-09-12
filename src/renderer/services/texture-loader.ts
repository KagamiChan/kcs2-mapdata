import fs from 'fs-extra'
import { each, entries, findIndex, fromPairs, get, map, some } from 'lodash'
import path from 'path'
import { BaseTexture, Rectangle, Texture } from 'pixi.js'
import url from 'url'

import { IFrameOrSpriteSourceSize, IFrames, IImage } from '../../../types'

const fileUrl = (str = '') => {
  let pathName = path.resolve(str).replace(/\\/g, '/')
  if (pathName[0] !== '/') {
    pathName = '/' + pathName
  }
  return url.format({
    pathname: pathName,
    protocol: 'file',
    slashes: true,
  })
}

class TextureLoader {
  protected imageUris: string[]
  protected infoUris: string[]
  protected prefixes: string[]

  protected images: BaseTexture[]
  protected frames: IFrames[]

  constructor(imageUri: string, infoUri: string, prefix?: string) {
    this.imageUris = [imageUri]
    this.infoUris = [infoUri]

    this.prefixes = [prefix || path.basename(imageUri, path.extname(imageUri))]

    this.images = [BaseTexture.fromImage(fileUrl(imageUri))]
    const info = fs.readJSONSync(infoUri)
    this.frames = [info.frames]
  }

  public get = (id: string | number, prefix?: string): Texture => {
    let frame: IFrameOrSpriteSourceSize | undefined
    let index: number | undefined

    each(this.frames, (frames, i) => {
      frame = get(frames, [`${prefix || this.prefixes[i]}_${id}`, 'frame'])
      if (frame) {
        index = i
        return false // this stops the loop
      }
    })

    if (!frame) {
      console.warn('empty texture, check id ', id)
      return Texture.EMPTY
    }
    const rect = new Rectangle(frame.x, frame.y, frame.w, frame.h)
    return new Texture(this.images[index!], rect)
  }

  public has = (id: string | number, prefix?: string): boolean => {
    return some(this.frames, (frames, i) => `${prefix || this.prefixes[i]}_${id}` in frames)
  }

  /**
   * extend a texture by another texture with same prefix
   * mainly use for merging secret resources
   */
  public extend = (extra: TextureLoader) => {
    this.imageUris = this.imageUris.concat(extra.imageUris)
    this.infoUris = this.infoUris.concat(extra.infoUris)

    this.prefixes = this.prefixes.concat(extra.prefixes)
    this.images = this.images.concat(extra.images)
    this.frames = this.frames.concat(extra.frames)
  }
}

export default TextureLoader

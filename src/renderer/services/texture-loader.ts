import fs from 'fs-extra'
import { entries, fromPairs, get, map } from 'lodash'
import path from 'path'
import { BaseTexture, Rectangle, Texture } from 'pixi.js'
import url from 'url'

import { IFrames, IImage } from '../../../types'

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
  protected imageUri = ''
  protected infoUri = ''
  protected prefix = ''

  protected image: BaseTexture
  protected info: IImage
  protected frames: IFrames

  constructor(imageUri: string, infoUri: string) {
    this.imageUri = imageUri
    this.infoUri = infoUri

    this.prefix = path.basename(imageUri, path.extname(imageUri))

    this.image = BaseTexture.fromImage(fileUrl(imageUri))
    this.info = fs.readJSONSync(infoUri)
    this.frames = this.info.frames
  }

  public get = (id: string | number): Texture => {
    const frame = get(this.frames, [`${this.prefix}_${id}`, 'frame'])
    if (!frame) {
      console.warn('empty texture, check id ', id)
      return Texture.EMPTY
    }
    const rect = new Rectangle(frame.x, frame.y, frame.w, frame.h)
    return new Texture(this.image, rect)
  }
}

export default TextureLoader

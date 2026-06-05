import { each, get, some } from 'lodash'
import { BaseTexture, Rectangle, Texture } from 'pixi.js'

import { IFrameOrSpriteSourceSize, IFrames } from '../../../types'

class TextureLoader {
  protected imageUris: string[]
  protected infoUris: string[]
  protected prefixes: string[]

  protected images: BaseTexture[]
  protected frames: IFrames[]

  private constructor(imageUris: string[], infoUris: string[], prefixes: string[], images: BaseTexture[], frames: IFrames[]) {
    this.imageUris = imageUris
    this.infoUris = infoUris
    this.prefixes = prefixes
    this.images = images
    this.frames = frames
  }

  static async create(imageUri: string, infoUri: string, prefix?: string): Promise<TextureLoader> {
    const { electronAPI } = window
    const fileUrl = await electronAPI.fileUrl(imageUri)
    const ext = await electronAPI.pathExtname(imageUri)
    const prefix2 = prefix || await electronAPI.pathBasename(imageUri, ext)
    const images = [BaseTexture.fromImage(fileUrl)]
    const info = await electronAPI.readJson(infoUri)
    const frames = [info.frames]
    return new TextureLoader([imageUri], [infoUri], [prefix2], images, frames)
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

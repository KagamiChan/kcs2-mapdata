import { entries, filter, fromPairs, get, isString, map } from 'lodash'
import { Texture } from 'pixi.js'

class TextureLoader {
  private textures: { [key: string]: Texture } = {}
  private loaded = false

  constructor(
    private readonly imagePath: string,
    private readonly jsonPath: string,
    private readonly prefix: string
  ) {}

  public async load() {
    if (this.loaded) {
      return
    }

    const json = await window.fs.readJson(this.jsonPath)
    const image = await window.fs.readImage(this.imagePath)

    // Convert Buffer to data URL
    const dataUrl = `data:image/png;base64,${image.toString('base64')}`
    const texture = Texture.from(dataUrl)

    this.textures = fromPairs(
      map(entries(json.frames), ([name, frame]: [string, any]) => [
        name,
        new Texture(
          texture.baseTexture,
          frame.frame,
          frame.rotated,
          frame.trimmed,
          frame.spriteSourceSize,
          frame.sourceSize
        ),
      ])
    )

    this.loaded = true
  }

  public get(name: string): Texture {
    return this.textures[`${this.prefix}_${name}`] || Texture.EMPTY
  }

  public extend(other: TextureLoader) {
    this.textures = { ...this.textures, ...other.textures }
  }
}

export default TextureLoader

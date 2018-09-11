import fs from 'fs-extra'
import { entries, get, isString, keyBy, map, padStart } from 'lodash'
import path from 'path'
import {
  IFrameOrSpriteSourceSize,
  IImage,
  ILine,
  IMapInfo,
  ISecretMapInfo,
  ISpotsEntity,
} from '../../../types'

interface IDataEntry {
  imageLink: string
  spots: ISpotsEntity[]
  frames: IFrameOrSpriteSourceSize[]
  secretImageLink: string | undefined
  secretImageInfo: IImage
  secretLabels: ILine[]
}

interface IMapLoader {
  cache: { [key: string]: IDataEntry }
  load: (id: string) => Promise<IDataEntry>
}

class MapLoader implements IMapLoader {
  public cache: IMapLoader['cache'] = {}

  public load = async (mapId: string) => {
    if (mapId in this.cache) {
      return this.cache[mapId]
    }
    const world = padStart(String(Math.floor(+mapId / 10)), 3, '0')
    const area = padStart(String(+mapId % 10), 2, '0')

    const imageLink = `file://${path.resolve(__dirname, `../../maps/${world}/${area}_image.png`)}`
    const info: IMapInfo = await fs.readJSON(
      path.resolve(__dirname, `../../maps/${world}/${area}_info.json`),
    )
    const imageInfo: IImage = await fs.readJSON(
      path.resolve(__dirname, `../../maps/${world}/${area}_image.json`),
    )

    const hasSecret = await fs.pathExists(
      path.resolve(__dirname, `../../maps/${world}/${area}_info_secret.json`),
    )

    let secretImageLink
    let secretInfo
    let secretImageInfo

    if (hasSecret) {
      secretImageLink = `file://${path.resolve(
        __dirname,
        `../../maps/${world}/${area}_image_secret.png`,
      )}`
      secretInfo = await fs.readJSON(
        path.resolve(__dirname, `../../maps/${world}/${area}_info_secret.json`),
      )
      secretImageInfo = await fs.readJSON(
        path.resolve(__dirname, `../../maps/${world}/${area}_image_secret.json`),
      )
    }

    const { spots = [] } = info
    const frames: IFrameOrSpriteSourceSize[] = map(info.bg, name =>
      get(imageInfo.frames, [`map${world}${area}_${isString(name) ? name : name.img}`, 'frame']),
    )
    const result: IDataEntry = {
      frames,
      imageLink,
      secretImageInfo,
      secretImageLink,
      secretLabels: get(secretInfo, 'labels', []),
      spots: spots.concat(get(secretInfo, 'spots', [])),
    }
    this.cache[mapId] = result
    return result
  }
}

const mapLoader = new MapLoader()

export default mapLoader

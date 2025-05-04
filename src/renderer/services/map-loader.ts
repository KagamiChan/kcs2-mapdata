import { entries, filter, fromPairs, get, isString, map } from 'lodash'
import { Texture } from 'pixi.js'
import path from 'path'

import TextureLoader from './texture-loader'

import { IMapInfo, ISpotsEntity } from '../../../types'
import mergeInfo from '../utils/merge-info'

interface IDataEntry {
  image: TextureLoader
  info: IMapInfo
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
    const world = path.dirname(mapId).split('/').pop()
    const area = path.basename(mapId, path.extname(mapId))

    const mapImage = new TextureLoader(
      path.resolve(window.ROOT, `./maps/${world}/${area}_image.png`),
      path.resolve(window.ROOT, `./maps/${world}/${area}_image.json`),
      `map${world}${area}`,
    )
    await mapImage.load()

    let info: IMapInfo = await window.fs.readJson(
      path.resolve(window.ROOT, `./maps/${world}/${area}_info.json`),
    )

    let secret = map(info.spots, 'secret').length

    try {
      const complement = await window.fs.readJson(
        path.resolve(window.ROOT, `./maps/${world}/${area}_info_complement.json`),
      )
      info = mergeInfo<IMapInfo>(info, complement)
    } catch (e) {
      // do nothing
    }

    let drained = false
    while (!drained) {
      try {
        const secretInfo = await window.fs.readJson(
          path.resolve(window.ROOT, `./maps/${world}/${area}_info${secret}.json`),
        )
        const secretImage = new TextureLoader(
          path.resolve(window.ROOT, `./maps/${world}/${area}_image${secret}.png`),
          path.resolve(window.ROOT, `./maps/${world}/${area}_image${secret}.json`),
          `map${world}${area}${secret}`,
        )
        await secretImage.load()
        mapImage.extend(secretImage)
        secret++
      } catch (e) {
        drained = true
      }
    }

    const data = { image: mapImage, info }
    this.cache[mapId] = data
    return data
  }
}

const mapLoader = new MapLoader()

export default mapLoader

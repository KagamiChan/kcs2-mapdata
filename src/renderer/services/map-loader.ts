import fs from 'fs-extra'
import { padStart, size } from 'lodash'
import path from 'path'
import { IMapInfo } from '../../../types'
import mergeInfo from '../utils/merge-info'
import TextureLoader from './texture-loader'

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
    const world = padStart(String(Math.floor(+mapId / 10)), 3, '0')
    const area = padStart(String(+mapId % 10), 2, '0')

    const image = new TextureLoader(
      path.resolve(window.ROOT, `./maps/${world}/${area}_image.png`),
      path.resolve(window.ROOT, `./maps/${world}/${area}_image.json`),
      `map${world}${area}`,
    )

    let info: IMapInfo = await fs.readJSON(
      path.resolve(window.ROOT, `./maps/${world}/${area}_info.json`),
    )

    let secret = size(info.spots)

    try {
      const complement = await fs.readJSON(
        path.resolve(window.ROOT, `./maps/${world}/${area}_info_complement.json`),
      )
      info = mergeInfo<IMapInfo>(info, complement)
    } catch (e) {
      // do nothing
    }

    let drained = false
    while (!drained) {
      try {
        const secretInfo = await fs.readJSON(
          path.resolve(window.ROOT, `./maps/${world}/${area}_info${secret}.json`),
        )

        info = mergeInfo<IMapInfo>(info, secretInfo)
        const secretImage = new TextureLoader(
          path.resolve(window.ROOT, `./maps/${world}/${area}_image${secret}.png`),
          path.resolve(window.ROOT, `./maps/${world}/${area}_image${secret}.json`),
          `map${world}${area}`,
        )
        image.extend(secretImage)

        secret += size(secretInfo.spots)
      } catch (e) {
        drained = true
      }
    }

    const result: IDataEntry = {
      image,
      info,
    }
    this.cache[mapId] = result
    return result
  }
}

const mapLoader = new MapLoader()

export default mapLoader

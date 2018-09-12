import fs from 'fs-extra'
import { entries, get, isString, keyBy, map, padStart } from 'lodash'
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

    const hasSecret = await fs.pathExists(
      path.resolve(window.ROOT, `./maps/${world}/${area}_info_secret.json`),
    )

    if (hasSecret) {
      const secretImage = new TextureLoader(
        path.resolve(window.ROOT, `./maps/${world}/${area}_image_secret.png`),
        path.resolve(window.ROOT, `./maps/${world}/${area}_image_secret.json`),
        `map${world}${area}`,
      )
      image.extend(secretImage)
      const secretInfo = await fs.readJSON(
        path.resolve(window.ROOT, `./maps/${world}/${area}_info_secret.json`),
      )

      info = mergeInfo<IMapInfo>(info, secretInfo)
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

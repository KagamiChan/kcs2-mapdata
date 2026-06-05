import { padStart, size } from 'lodash'
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
    const { electronAPI } = window
    const root = await electronAPI.getRoot()
    const world = padStart(String(Math.floor(+mapId / 10)), 3, '0')
    const area = padStart(String(+mapId % 10), 2, '0')

    const imagePng = await electronAPI.pathResolve(root, `./maps/${world}/${area}_image.png`)
    const imageJson = await electronAPI.pathResolve(root, `./maps/${world}/${area}_image.json`)
    const image = await TextureLoader.create(imagePng, imageJson, `map${world}${area}`)

    const infoPath = await electronAPI.pathResolve(root, `./maps/${world}/${area}_info.json`)
    let info: IMapInfo = await electronAPI.readJson(infoPath)

    let secret = size(info.spots)

    try {
      const complementPath = await electronAPI.pathResolve(root, `./maps/${world}/${area}_info_complement.json`)
      const complement = await electronAPI.readJson(complementPath)
      info = mergeInfo<IMapInfo>(info, complement)
    } catch (e) {
      // do nothing
    }

    let drained = false
    while (!drained) {
      try {
        const secretInfoPath = await electronAPI.pathResolve(root, `./maps/${world}/${area}_info${secret}.json`)
        const secretInfo = await electronAPI.readJson(secretInfoPath)

        info = mergeInfo<IMapInfo>(info, secretInfo)
        const secretPng = await electronAPI.pathResolve(root, `./maps/${world}/${area}_image${secret}.png`)
        const secretJson = await electronAPI.pathResolve(root, `./maps/${world}/${area}_image${secret}.json`)
        const secretImage = await TextureLoader.create(secretPng, secretJson, `map${world}${area}`)
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

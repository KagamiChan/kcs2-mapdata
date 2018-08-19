import fs from 'fs-extra'
import { entries, get, keyBy, map, padStart } from 'lodash'
import path from 'path'
import { IFrameOrSpriteSourceSize, IMapImage, IMapInfo, ISpotsEntity } from '../../types'

interface IDataEntry {
  imageLink: string
  spots: ISpotsEntity[]
  frames: IFrameOrSpriteSourceSize[]
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
    const imageInfo: IMapImage = await fs.readJSON(
      path.resolve(__dirname, `../../maps/${world}/${area}_image.json`),
    )
    const { spots = [] } = info
    const frames: IFrameOrSpriteSourceSize[] = map(info.bg, name =>
      get(imageInfo.frames, [`map${world}${area}_${name}`, 'frame']),
    )
    const result: IDataEntry = {
      frames,
      imageLink,
      spots,
    }
    this.cache[mapId] = result
    return result
  }
}

const mapLoader = new MapLoader()

export default mapLoader

import * as fs from 'fs-extra'
import * as _ from 'lodash'
import path from 'path'

const OUT_DIR = path.join(__dirname, 'out')
const DATA_DIR = path.join(__dirname, 'data')

const main = () => {
  const worldDirs = fs.readdirSync(OUT_DIR)
  const finalPoi: any = {}
  _.each(worldDirs, worldId => {
    const WORLD_DIR = path.join(OUT_DIR, worldId)
    const mapDirs = fs.readdirSync(WORLD_DIR)
    _.each(mapDirs, mapId => {
      const title = _.get(mapId.match(/(\d+)-\d/g), 0)
      if (!title) {
        return
      }
      const poi = fs.readJsonSync(`${WORLD_DIR}/${mapId}/poi.json`)
      finalPoi[title] = poi
    })
  })
  fs.outputJsonSync(`${DATA_DIR}/final.json`, finalPoi)
}

main()

import axios, { AxiosResponse } from 'axios'
import Promise from 'bluebird'
import chalk from 'chalk'
import fs from 'fs-extra'
import { padStart, size } from 'lodash'
import path from 'path'
import ProgressBar from 'progress'
import { IConstMapInfo, IMapInfo } from './types'

const SERVER = 'w01y.kancolle-server.com'

const getMap = async () => {
  const MAP_PREFIX = `http://${SERVER}/kcs2/resources/map`
  const DATA_FOLDER = path.resolve(__dirname, './maps')

  const start2 = await fs.readJson(path.resolve(DATA_FOLDER, 'start2.json'))

  const mapInfo: IConstMapInfo[] = start2.api_mst_mapinfo

  const bar = new ProgressBar(chalk.blue('maps [:bar] :percent :etas'), {
    complete: '=',
    incomplete: ' ',
    total: mapInfo.length,
    width: 40,
  })

  await Promise.map(
    mapInfo,
    async ({ api_no, api_maparea_id }) => {
      const mapArea = padStart(String(api_maparea_id), 3, '0')
      const mapId = padStart(String(api_no), 2, '0')

      let mapImage
      let mapMeta
      let mapData
      try {
        mapImage = await axios.get<Buffer>(`${MAP_PREFIX}/${mapArea}/${mapId}_image.png`, {
          responseType: 'arraybuffer',
        })
        mapMeta = await axios.get<object>(`${MAP_PREFIX}/${mapArea}/${mapId}_image.json`)
        mapData = await axios.get<IMapInfo>(`${MAP_PREFIX}/${mapArea}/${mapId}_info.json`)
      } catch (e) {
        if (e.response.status === 404) {
          console.error('404 for', mapArea, mapId)
          bar.tick()
          return Promise.resolve()
        }
        return Promise.reject(new Error('download fail'))
      }

      await fs.ensureDir(path.join(DATA_FOLDER, mapArea))

      await fs.writeFile(path.join(DATA_FOLDER, mapArea, `${mapId}_image.png`), mapImage.data)
      await fs.writeJson(path.join(DATA_FOLDER, mapArea, `${mapId}_image.json`), mapMeta.data, {
        spaces: 2,
      })
      await fs.writeJson(path.join(DATA_FOLDER, mapArea, `${mapId}_info.json`), mapData.data, {
        spaces: 2,
      })

      // find out the secret
      let secret = size(mapData.data.spots)

      if (api_maparea_id > 6) {
        let drained = false
        while (!drained) {
          try {
            const extraImage = await axios.get<Buffer>(
              `${MAP_PREFIX}/${mapArea}/${mapId}_image${secret}.png`,
              {
                responseType: 'arraybuffer',
              },
            )
            const extraMeta = await axios.get<object>(
              `${MAP_PREFIX}/${mapArea}/${mapId}_image${secret}.json`,
            )
            const extraData = await axios.get<IMapInfo>(
              `${MAP_PREFIX}/${mapArea}/${mapId}_info${secret}.json`,
            )

            await fs.writeFile(
              path.join(DATA_FOLDER, mapArea, `${mapId}_image${secret}.png`),
              extraImage.data,
            )
            await fs.writeJson(
              path.join(DATA_FOLDER, mapArea, `${mapId}_image${secret}.json`),
              extraMeta.data,
              {
                spaces: 2,
              },
            )
            await fs.writeJson(
              path.join(DATA_FOLDER, mapArea, `${mapId}_info${secret}.json`),
              extraData.data,
              {
                spaces: 2,
              },
            )
            secret += size(extraData.data.spots)
          } catch (e) {
            if (e.response.status === 404) {
              drained = true
              console.error('404 for secret', mapArea, mapId)
            } else {
              console.error(e)
              return Promise.reject(new Error('download fail'))
            }
          }
        }
      }
      bar.tick()
    },
    { concurrency: 2 },
  )

  bar.terminate()
}

getMap()

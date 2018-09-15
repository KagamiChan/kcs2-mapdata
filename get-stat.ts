import Promise from 'bluebird'
import fs from 'fs-extra'
import HttpsProxyAgent from 'https-proxy-agent'
import { fromPairs, keyBy, map, pick } from 'lodash'
import fetch from 'node-fetch'
import path from 'path'

import { IConstMapInfo, IMapstatItem } from './types'

const proxy = process.env.https_proxy || process.env.http_proxy
const httpsAgent = proxy ? new HttpsProxyAgent(proxy) : undefined

const getStat = async () => {
  const DATA_FOLDER = path.resolve(__dirname, './maps')

  const start2 = await fs.readJson(path.resolve(DATA_FOLDER, 'start2.json'))

  const mapInfo: IConstMapInfo[] = start2.api_mst_mapinfo

  const mapStat = await Promise.map(
    mapInfo,
    async ({ api_id }) => {
      const resp = await fetch(`https://www.2ds.tv/api/map/get_cell_list?id=${api_id}`, {
        agent: httpsAgent,
      })

      const stat: IMapstatItem = await resp.json()
      const result = map(stat.cells, cell => pick(cell, ['cell_id', 'event_id', 'event_kind']))

      console.info('GET', api_id)

      return [api_id, keyBy(result, 'cell_id')]
    },
    { concurrency: 2 },
  )

  return fs.outputJson(path.join(DATA_FOLDER, 'stat.json'), fromPairs(mapStat), { spaces: 2 })
}

getStat()

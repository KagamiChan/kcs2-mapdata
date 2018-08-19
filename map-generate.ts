import chalk from 'chalk'
import fs from 'fs-extra'
import _ from 'lodash'
import path from 'path'
import { IDraws, IFrameItem, IMapImage, IMapInfo, INsmap, IRoute, ISpotData, ISpots } from './types'

let ROUTE: IRoute = {}
let SPOTS: ISpots = {}
let DRAWS: IDraws = []
const SCALE = 1
const FIT_TOLERANCE = 0.7

const MAP_DIR = path.join(__dirname, 'maps')

const extract = (mapData: { image: IMapImage; info: IMapInfo }) => {
  try {
    let startPointCounter = 1
    _.each(mapData.info.spots, (spot, spotIndex) => {
      const end = [spot.x, spot.y]
      let start: number[] | null = []
      if (!spot.line) {
        start = null
      } else {
        const frameReg = spot.line!.img
          ? new RegExp(`(\\w+)_${spot.line!.img}`)
          : new RegExp(`(\\w+)_route_${spot.no}`)
        const sprite: IFrameItem | undefined = _.find(mapData.image.frames, (frame, key) => {
          return frameReg.test(key)
        })
        if (!sprite) {
          throw new Error(`no sprite found: ${spot.line.img}, check regExp!`)
        }
        const [routeSpriteW, routeSpriteH] = [sprite.sourceSize.w, sprite.sourceSize.h]
        const [spriteCenterX, spriteCenterY] = [
          spot.x + spot.line.x + Math.round(routeSpriteW / 2),
          spot.y + spot.line.y + Math.round(routeSpriteH / 2),
        ]
        start = [(spriteCenterX - spot.x) * 2 + spot.x, (spriteCenterY - spot.y) * 2 + spot.y]
      }
      ROUTE[spot.no] = { start, end }
      if (!SPOTS[end.join()]) {
        SPOTS[end.join()] = {
          coord: end,
          index: spotIndex,
          name: [spot.no, ...end].join('_'),
          start: start === null ? String(startPointCounter++) : null,
          tag: [],
        }
      }
    })
  } catch (err) {
    console.error(chalk.red(err))
    process.exitCode = 1
  }
}

const fitting = () => {
  // Fit spots
  const nsmap: INsmap = {}
  _.forIn(SPOTS, ({ name }, id) => {
    if (nsmap[name] == null) {
      nsmap[name] = []
    }
    nsmap[name].push(id)
  })
  _.forIn(nsmap, (ids, name) => {
    if (ids.length === 1) {
      return
    }
    const id =
      ids.find(index => {
        const [x, y] = SPOTS[index].coord
        return x % 10 === 0 && y % 10 === 0
      }) || ids[0]
    const idCoord = SPOTS[id].coord
    console.warn(chalk.yellow(`Merging spots ${ids.join('/')} to ${id}`))
    for (const oid of ids) {
      if (oid === id) {
        continue
      }
      delete SPOTS[oid]
      _.forIn(ROUTE, route => {
        const { start, end } = route
        if (start && start.join() === oid) {
          route.start = idCoord
        }
        if (end && end.join() === oid) {
          route.end = idCoord
        }
      })
    }
  })
  // Fit Route
  _.forIn(ROUTE, ({ start }, routeId) => {
    if (start == null) {
      return
    }
    const distance: { [key: string]: number } = {}
    let mid: null | string = null
    let mdst: null | number = null // id of minimum distance
    _.forIn(SPOTS, ({ coord }, spotId) => {
      distance[spotId] = Math.sqrt(
        Math.pow(coord[0] - start[0], 2) + Math.pow(coord[1] - start[1], 2),
      )
      if (mid == null || distance[spotId] < distance[mid]) {
        mid = spotId
        mdst = distance[spotId]
      }
    })
    _.forIn(distance, (dst, did) => {
      if (did === mid) {
        return
      }
      if (mdst! > dst * FIT_TOLERANCE) {
        console.warn(
          chalk.yellow(
            `[WARN] Fit route over tolerance. Route=${routeId}, Min=${mid}:${mdst!.toFixed(
              2,
            )}, Cur=${did}:${dst.toFixed(2)}`,
          ),
        )
      }
    })
    ROUTE[routeId].start = SPOTS[mid!].coord
  })
}

const addSpotName = (dir: string) => {
  try {
    if (!fs.existsSync(`${dir}/spots.json`)) {
      fs.outputJsonSync(`${dir}/spots.json`, {})
    }
    const spotJsonData = fs.readJsonSync(`${dir}/spots.json`)
    const named = spotJsonData as ISpotData
    const unamed: ISpotData = {}
    _.forIn(SPOTS, (spot, id) => {
      if (named[id] != null) {
        SPOTS[id].name = named[id]
      } else {
        unamed[id] = spot.coord.join('_')
        SPOTS[id].name = unamed[id]
      }
    })
    if (Object.keys(unamed).length > 0) {
      fs.outputJsonSync(`${dir}/spots_unamed.json`, unamed)
      console.warn(
        chalk.yellow(
          [`Unamed spot found! Please set their name in "spots.json"`, `  at ${dir}`].join('\n'),
        ),
      )
    }
  } catch (err) {
    console.error(chalk.red(err), '\n', chalk.red(`at ${dir}`))
  }
}

/**
 * try to auto generate spot name
 * works well in normal circumstances, except maps as special as 1-6
 * should check out the data after auto spotted
 */
const autoSpotName = (dir: string) => {
  try {
    const autoNamed: ISpotData = {}
    _.forIn(SPOTS, (spot, id) => {
      const name = String.fromCharCode(64 + spot.index)
      const overFlowFlag = name.charCodeAt(0) > 90
      autoNamed[id] = spot.start ? spot.start : overFlowFlag ? spot.name : name
      SPOTS[id].name = autoNamed[id]
      if (overFlowFlag) {
        console.warn(
          chalk.yellow(
            '[WARN] Spot name is out of [A-Z], check it manually\n',
            `  at ${dir}/spots.json , ${spot.name}`,
          ),
        )
      }
    })
    fs.outputJsonSync(`${dir}/spots.json`, autoNamed)
  } catch (err) {
    console.error(chalk.red(err), '\n', chalk.red(`at ${dir}`))
  }
}

const syncSpotNameFromAnnotaion = (dir: string) => {
  const DATA_DIR = path.join(__dirname, 'data', 'notation.json')
  if (!fs.existsSync(DATA_DIR)) {
    console.error(chalk.red('[ERROR] annotation file not found!'))
    process.exit(1)
  }
  const notation = fs.readJsonSync(DATA_DIR)
  const matched = dir.match(/map\d-\d$/g)
  if (!matched) {
    console.error(chalk.red(`[ERROR] can't match dir to map id:\n  ${dir}`))
    process.exit(1)
  }
  const [worldId, mapId] = matched![0].match(/\d/g)!
  const spotsInfoFromAnnotaion = notation[`${worldId}${mapId}`]
  fs.outputJsonSync(`${dir}/spots.json`, spotsInfoFromAnnotaion)
}

const addSpotDistance = (dir: string) => {
  if (!fs.existsSync(`${dir}/celldata.json`)) {
    throw new Error(`celldata.json not found!`)
  }
  const MSAPI = fs.readJsonSync(`${dir}/celldata.json`)
  for (const { api_no, api_distance } of MSAPI.api_cell_data) {
    if (api_no == null || api_distance == null) {
      continue
    }
    const route = ROUTE[api_no]
    const id = route.end.join()
    const spot = SPOTS[id]
    if (spot.tag.includes(api_distance) === false) {
      spot.tag.push(api_distance)
    }
  }
}

const drawRoute = () => {
  DRAWS.push(`
<defs>
  <marker id="arrow" refX="7" refY="2" markerWidth="6" markerHeight="9" orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,4 L7,2 z" fill="#000" />
  </marker>
</defs>`)
  _.forIn(ROUTE, ({ start, end }, id) => {
    if (start == null) {
      return
    }
    const s = start.map(n => n / SCALE)
    const e = end.map(n => n / SCALE)
    const m = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2]
    DRAWS.push(
      `<line x1="${s[0]}" y1="${s[1]}" x2="${e[0]}" y2="${
        e[1]
      }" stroke="black" stroke-width="2" marker-end="url(#arrow)" />`,
    )
    DRAWS.push(`<text x="${m[0]}" y="${m[1]}" font-family="sans-serif" font-size="12">${id}</text>`)
  })
}

const drawSpots = () => {
  _.forIn(SPOTS, ({ coord, start, name, tag }) => {
    const color = start ? '#fd0' : '#d00'
    const c = coord.map(n => n / SCALE) // coord

    const t = name + (tag.length > 0 ? `(${tag.join()})` : '') // text
    const fontSize = name.length > 1 ? 12 : 16
    DRAWS.push(`<circle cx="${c[0]}" cy="${c[1]}" r="5" style="fill:${color};"/>`)
    DRAWS.push(
      `<text class="label" x="${c[0]}" y="${c[1] +
        fontSize}" fill="${color}" font-family="sans-serif" font-weight="bold" font-size="${fontSize}">${t}</text>`,
    )
  })
}

const drawSpotIcons = (dir: string) => {
  if (!fs.existsSync(`${dir}/celldata.json`)) {
    throw new Error(`celldata.json not found!`)
  }
  DRAWS.push(
    `<defs>
  <image id="spot2"  x="-10.0" y="-10.0" width="20" height="20" xlink:href="spoticons/2.png" />
  <image id="spot3"  x="-10.0" y="-10.0" width="20" height="20" xlink:href="spoticons/3.png" />
  <image id="spot4"  x="-10.0" y="-10.0" width="20" height="20" xlink:href="spoticons/4.png" />
  <image id="spot5"  x="-18.0" y="-25.0" width="37" height="40" xlink:href="spoticons/5.png" />
  <image id="spot6"  x="-10.0" y="-10.0" width="20" height="20" xlink:href="spoticons/6.png" />
  <image id="spot7"  x="-35.0" y="-22.0" width="71" height="45" xlink:href="spoticons/7.png" />
  <image id="spot8"  x="-25.0" y="-25.0" width="49" height="49" xlink:href="spoticons/8.png" />
  <image id="spot9"  x="-10.0" y="-10.0" width="20" height="20" xlink:href="spoticons/9.png" />
  <image id="spot10" x="-24.0" y="-20.0" width="57" height="32" xlink:href="spoticons/10.png"/>
</defs>`,
  )
  const MSAPI = fs.readJsonSync(`${dir}/celldata.json`)
  for (const { api_no, api_color_no } of MSAPI.api_cell_data) {
    if (api_color_no < 2 || api_color_no > 10) {
      continue
    }
    const route = ROUTE[api_no]
    const spot = route.end
    spot[0] += 340
    spot[1] += 440
    const [x, y] = spot.map(n => n / SCALE)
    DRAWS.push(`<use xlink:href="#spot${api_color_no}" x="${x}" y="${y}"/>`)
  }
}

const drawDone = (dir: string) => {
  if (DRAWS.length > 0) {
    fs.outputFileSync(
      `${dir}/draw.svg`,
      `<?xml version="1.0"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="720">
<style type="text/css"> <![CDATA[
  .label {
    stroke: black;
    stroke-width: 0.3px;
  }
]]> </style>
${DRAWS.join('\n')}
</svg>`,
    )
  }
}

const genpoi = (dir: string) => {
  const route: { [key: string]: [string | null, string] } = {}
  _.forIn(ROUTE, ({ start, end }, id) => {
    route[id] = [start ? SPOTS[start.join()].name : null, SPOTS[end.join()].name]
  })
  const spots: { [key: string]: [number, number, string] } = {}
  _.forIn(SPOTS, ({ coord, start, name }, id) => {
    const type = start ? 'start' : ''
    spots[name] = [coord[0], coord[1], type]
  })
  fs.outputJsonSync(`${dir}/poi.json`, { route, spots })
}

const main = () => {
  const mapdir = fs.readdirSync(MAP_DIR)
  _.each(_.filter(mapdir, i => !Number.isNaN(parseInt(i, 10))), wordldId => {
    try {
      const worldMapDir = fs.readdirSync(path.join(MAP_DIR, wordldId))
      const mapDataArr = _.chain(worldMapDir)
        .map(i => i.slice(0, 2))
        .uniq()
        .map(mapId => ({
          image: fs.readJsonSync(path.join(MAP_DIR, wordldId, `${mapId}_image.json`)) as IMapImage,
          info: fs.readJsonSync(path.join(MAP_DIR, wordldId, `${mapId}_info.json`)) as IMapInfo,
        }))
        .value()
      _.each(mapDataArr, mapData => {
        extract(mapData)
        const PROCEDURE: { [key: string]: Array<(...args: any[]) => void> } = {
          '': [addSpotName, fitting, drawRoute, drawSpots, drawDone],
          autoname: [autoSpotName, fitting, drawRoute, drawSpots, drawDone],
          dst: [addSpotName, addSpotDistance, fitting, drawSpots, drawDone],
          genpoi: [addSpotName, fitting, genpoi],
          icon: [addSpotName, fitting, drawSpotIcons, drawDone],
          sync: [syncSpotNameFromAnnotaion, addSpotName, fitting, genpoi],
        }
        const cmd = process.argv[2] || ''
        const outDir = path.join(__dirname, 'out', wordldId, mapData.info.bg[0])
        for (const procedure of PROCEDURE[cmd]) {
          procedure.call(null, outDir)
        }
        ROUTE = {}
        SPOTS = {}
        DRAWS = []
      })
    } catch (err) {
      console.error(chalk.red(err), err.stack)
      process.exitCode = 1
    }
  })
}

main()

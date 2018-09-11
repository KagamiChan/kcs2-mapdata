import { ModelConfig } from '@rematch/core'
import fs from 'fs-extra'
import { sortBy, uniqBy } from 'lodash'
import path from 'path'

let notationsState = {}

try {
  notationsState = fs.readJSONSync(path.resolve(window.ROOT, './data/notation.json'))
} catch (e) {
  // do nothing
}

/**
 * mapId is composition of world id and map id, e.g. '23' '371'
 */
export const mapId: ModelConfig<string> = {
  reducers: {
    change: (state, payload: string) => payload,
  },
  state: '11',
}

/**
 * mapCell is the cell coordinates of a certain map
 * mapCell format: ${x},${y}
 */
export const mapCell: ModelConfig<string> = {
  reducers: {
    change: (state, payload: string) => payload,
  },
  state: '0,0',
}

export interface INotationMap {
  [key: string]: string
}

export interface INotation {
  [key: string]: INotationMap
}

/**
 * notations is the relationship of map cell and alphabetic name
 * keyed by mapId
 * the relation format: ${x}_${y}: label
 */
export const notations: ModelConfig<INotation> = {
  reducers: {
    updateMany: (state, payload) => ({ ...state, ...payload }),
    updateOne: (state, { id, data }) => ({ ...state, [id]: data }),
  },
  state: notationsState,
}

export interface IMapItem {
  label: string
  value: string
}

export const mapList: ModelConfig<IMapItem[]> = {
  reducers: {
    update: (state, payload) =>
      sortBy(uniqBy([...state, ...payload], 'value'), item => parseInt(item.value, 10)),
  },
  state: [],
}

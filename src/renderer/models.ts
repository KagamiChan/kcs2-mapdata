import { init, ModelConfig } from '@rematch/core'

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
 * mapCell is the cell no of a certain map
 */
export const mapCell: ModelConfig<number> = {
  reducers: {
    change: (state, payload: number) => payload,
  },
  state: -1,
}

export interface INotation {
  [key: string]: string
}

/**
 * notations is the relationship of map cell and alphabetic name
 */
export const notations: ModelConfig<INotation> = {
  reducers: {
    update: (state, payload: object) => ({ ...state, ...payload }),
  },
  state: {},
}

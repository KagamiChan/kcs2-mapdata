import { init, ModelConfig } from '@rematch/core'

/**
 * mapId is composition of world id and map id, e.g. '23' '371'
 */
export const mapId: ModelConfig<string> = {
  reducers: {
    change: (state, payload: string) => payload,
  },
  state: '',
}

/**
 * mapCell is the cell no of a certain map
 */
export const mapCell: ModelConfig<string> = {
  reducers: {
    change: (state, payload: string) => payload,
  },
  state: '',
}

/**
 * notations is the relationship of map cell and alphabetic name
 */
export const notations: ModelConfig<object> = {
  reducers: {
    update: (state, payload: object) => ({ ...state, ...payload }),
  },
  state: {},
}

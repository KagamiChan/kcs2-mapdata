import { init, RematchRootState } from '@rematch/core'
import * as models from './models'

const store = init({
  models,
})

export default store
export const { dispatch } = store
export type RootState = RematchRootState<typeof models>

import { OverlayToaster, Toaster } from '@blueprintjs/core'

let toaster: Toaster | null = null

export const ensureToaster = async () => {
  if (toaster) {
    return toaster
  }
  toaster = await OverlayToaster.createAsync()
  return toaster
}

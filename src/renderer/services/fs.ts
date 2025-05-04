import remote from '@electron/remote'

export const fs = remote.require('fs-extra') as typeof import('fs-extra')

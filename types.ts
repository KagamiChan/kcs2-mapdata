export interface IRoute {
  [key: string]: {
    start: number[] | null
    end: number[]
  }
}

export interface ISpots {
  [key: string]: {
    coord: number[]
    index: number
    start: string | null
    name: string
    tag: Array<number | string>
  }
}

export type IDraws = string[]

export interface INsmap {
  [key: string]: string[]
}

export interface IImage {
  frames: IFrames
  meta: IMeta
}

export interface IFrames {
  [key: string]: IFrameItem
}

export interface IFrameItem {
  frame: IFrameOrSpriteSourceSize
  rotated: boolean
  trimmed: boolean
  spriteSourceSize: IFrameOrSpriteSourceSize
  sourceSize: ISourceSizeOrSize
}

export interface IFrameOrSpriteSourceSize {
  x: number
  y: number
  w: number
  h: number
}

export interface ISourceSizeOrSize {
  w: number
  h: number
}

export interface IMeta {
  app: string
  image: string
  format: string
  size: ISourceSizeOrSize
  scale: number
}

export interface IBGInfo {
  name: string
  img: string
}

export interface IMapInfo {
  bg: Array<string | IBGInfo>
  spots?: ISpotsEntity[]
  labels?: ILine[]
  enemies?: IEnemy[]
  airbase?: {
    x: number
    y: number
  }
}

export interface ISpotsEntity {
  no: number
  x: number
  y: number
  line?: ILine
  direction?: string
  route?: {
    img: string
  }
  color?: number
}

export interface ILine {
  x: number
  y: number
  img?: string
}

export interface IEnemy {
  no: number
  x: number
  y: number
  img: string
}

export interface ISpotData {
  [key: string]: string
}

export interface IConstMapInfo {
  api_no: number
  api_maparea_id: number
  api_id: number
}

export interface IMapstatItem {
  levels: number[]
  cells: ICellOrBoss[]
  boss: ICellOrBoss
}
export interface ICellOrBoss {
  cell_id: string
  event_id: number
  event_kind: number
  icon: Icon
}
export interface Icon {
  type: string
  path: string
  hash: string
}

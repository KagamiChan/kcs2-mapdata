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

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
    start: boolean
    name: string
    tag: Array<number | string>
  }
}

export type IDraws = string[]

export interface INsmap {
  [key: string]: string[]
}

export interface IMapImage {
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

export interface IMapInfo {
  bg: string[]
  spots?: ISpotsEntity[]
}

export interface ISpotsEntity {
  no: number
  x: number
  y: number
  line?: ILine
  direction?: string
}

export interface ILine {
  x: number
  y: number
  img?: string
}

export interface ISpotData {
  [key: string]: string
}

import { Container, Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import { compact, entries, filter, fromPairs, get, keyBy, map, rest, split } from 'lodash'
import path from 'path'
import { BaseTexture, Point, Rectangle, TextStyle, Texture } from 'pixi.js'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import mapLoader from '../services/map-loader'
import TextureLoader from '../services/texture-loader'

import { INotationMap } from '../redux/models'
import { RootState } from '../redux/store'

import { IFrameOrSpriteSourceSize, IImage, ILine, ISpotsEntity } from '../../../types'

const mapTexture = new TextureLoader(
  path.resolve(window.ROOT, './data/map_common.png'),
  path.resolve(window.ROOT, './data/map_common.json'),
)

const getMapTexture = (t: number) => {
  switch (t) {
    case -1:
      return mapTexture.get(133)
    case 1:
      return mapTexture.get(126)
    case 2:
    case 6:
      return mapTexture.get(129)
    case 3:
      return mapTexture.get(131)
    case 4:
      return mapTexture.get(132)
    case 5:
      return mapTexture.get(120)
    case 7:
      return mapTexture.get(100)
    case 8:
      return mapTexture.get(119)
    case 9:
      return mapTexture.get(130)
    case 10:
      return mapTexture.get(95)
    case 11:
      return mapTexture.get(134)
    case 12:
      return mapTexture.get(135)
    case -2:
      return mapTexture.get(128)
    case -3:
      return mapTexture.get(125)
    default:
      return Texture.EMPTY
  }
}

const getXY = (cell: string) => split(cell, ',').map(Number)

const Wrapper = styled.div`
  grid-area: preview;
`

const textStyle = new TextStyle({
  fill: 'white',
  fontFamily: '"Lucida Console", Monaco, monospace',
  fontSize: 30,
  fontWeight: 'bold',
  strokeThickness: 8,
})

interface IProps extends DispatchProp {
  mapCell: string
  notations: INotationMap
  mapId: string
}

interface IState {
  imageLink: string
  frames: IFrameOrSpriteSourceSize[]
  secretImageLink: string | undefined
  secretImageInfo: IImage | null
  spots: ISpotsEntity[]
  secretLabels: ILine[]
}

class Preview extends Component<IProps, IState> {
  public state: IState = {
    frames: [],
    imageLink: '',
    secretImageInfo: null,
    secretImageLink: '',
    secretLabels: [],
    spots: [],
  }

  public componentDidMount() {
    this.loadMapData()
  }
  public componentDidUpdate(prevProps: IProps) {
    if (prevProps.mapId !== this.props.mapId) {
      this.loadMapData()
    }
  }

  public loadMapData = async () => {
    const { mapId } = this.props

    const data = await mapLoader.load(mapId)

    const { imageLink, frames, spots, secretImageLink, secretImageInfo, secretLabels } = data

    this.setState({
      frames,
      imageLink,
      secretImageInfo,
      secretImageLink,
      secretLabels,
      spots,
    })
  }

  public render() {
    const { imageLink, frames, spots, secretImageInfo, secretImageLink, secretLabels } = this.state
    const { mapCell, notations } = this.props

    const secrets = filter(spots, s => get(s, 'route.img'))

    const secretFrames = fromPairs(
      map(entries(get(secretImageInfo, 'frames', {})), ([k, v]) => [
        k
          .split('_')
          .slice(1)
          .join('_'),
        v,
      ]),
    )

    let secretTexture: BaseTexture

    if (secretImageLink) {
      secretTexture = BaseTexture.fromImage(secretImageLink)
    }

    const [mapX = 0, mapY = 0] = getXY(mapCell)
    return (
      <Wrapper>
        <Stage width={1200} height={720}>
          <Container>
            {map(frames, ({ x, y }) => (
              <Sprite key={`${x}${y}`} x={-x} y={-y} texture={Texture.fromImage(imageLink)} />
            ))}
          </Container>
          <Container>
            {map(secrets, (s: ISpotsEntity) => {
              const frame = secretFrames[s.route!.img].frame
              const rect = new Rectangle(frame.x, frame.y, frame.w, frame.h)

              return (
                <Sprite
                  key={s.no}
                  x={s.x + s.line!.x}
                  y={s.y + s.line!.y}
                  texture={new Texture(secretTexture, rect)}
                />
              )
            })}
            {map(spots, (s: ISpotsEntity) => {
              if (!s.color) {
                return
              }
              const texture = getMapTexture(s.color!)

              return (
                <Sprite
                  key={s.no}
                  x={s.x - texture.width / 2}
                  y={s.y - texture.height / 2}
                  texture={texture}
                />
              )
            })}
            {map(secretLabels, l => {
              const frame = secretFrames[l.img!].frame
              const rect = new Rectangle(frame.x, frame.y, frame.w, frame.h)
              return (
                <Sprite key={l.img} x={l.x} y={l.y} texture={new Texture(secretTexture, rect)} />
              )
            })}
          </Container>
          <Container>
            {mapX > 0 &&
              mapY > 0 && (
                <Graphics
                  draw={g => {
                    g.clear()
                      .beginFill(0x00ff00)
                      .drawStar(mapX, mapY, 6, 20, 10)
                      .endFill()
                  }}
                />
              )}
            {map(entries(notations), ([s, note]) => {
              const [pX = 0, pY = 0] = getXY(s)
              return <Text key={s} text={note} style={textStyle} x={pX + 20} y={pY - 20} />
            })}
          </Container>
        </Stage>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapCell: state.mapCell,
  mapId: state.mapId,
  notations: get(state.notations, state.mapId, {}),
}))(Preview)

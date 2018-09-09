import { Container, Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import { compact, entries, filter, fromPairs, get, keyBy, map, rest, split } from 'lodash'
import { BaseTexture, Point, Rectangle, TextStyle, Texture } from 'pixi.js'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'
import mapLoader from './map-loader'

import { INotationMap } from './models'
import { RootState } from './store'

import { IFrameOrSpriteSourceSize, ILine, IMapImage, ISpotsEntity } from '../../types'

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
  secretImageInfo: IMapImage | null
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

import { Container, Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import { entries, get, keyBy, map, split } from 'lodash'
import { TextStyle, Texture } from 'pixi.js'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'
import mapLoader from './map-loader'

import { INotationMap } from './models'
import { RootState } from './store'

import { IFrameOrSpriteSourceSize } from '../../types'

const getXY = (cell: string) => split(cell, '_').map(Number)

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
}

class Preview extends Component<IProps, IState> {
  public state: IState = {
    frames: [],
    imageLink: '',
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

    const { imageLink, frames } = data

    this.setState({
      frames,
      imageLink,
    })
  }

  public render() {
    const { imageLink, frames } = this.state
    const { mapCell, notations } = this.props

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

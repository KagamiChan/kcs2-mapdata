import { Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import fs from 'fs-extra'
import { entries, get, keyBy, map, padStart } from 'lodash'
import path from 'path'
import { TextStyle, Texture } from 'pixi.js'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'
import mapLoader from './map-loader'

import { INotation } from './models'
import { RootState } from './store'

const Wrapper = styled.div`
  grid-area: preview;
`

const textStyle = new TextStyle({
  fill: 'white',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: 30,
  fontWeight: 'bold',
  strokeThickness: 8,
})

interface IProps extends DispatchProp {
  mapCell: string
  notations: INotation
  mapId: string
}

interface IImageFrame {
  x: number
  y: number
}

interface IState {
  imageLink: string
  spots: object
  frames: IImageFrame[]
}

class Preview extends Component<IProps, IState> {
  public state: IState = {
    frames: [],
    imageLink: '',
    spots: {},
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

    this.setState(data)
  }

  public render() {
    const { imageLink, spots, frames } = this.state
    const { mapCell, notations } = this.props
    return (
      <Wrapper>
        <Stage width={1200} height={720}>
          {map(frames, ({ x, y }) => (
            <Sprite key={`${x}${y}`} x={-x} y={-y} texture={Texture.fromImage(imageLink)} />
          ))}
          <Graphics
            draw={g => {
              g.clear()
                .beginFill(0x00ff00)
                .drawStar(get(spots, [mapCell, 'x']), get(spots, [mapCell, 'y']), 6, 20, 10)
                .endFill()
            }}
          />
          {map(entries(notations), ([no, note]) => (
            <Text
              key={no}
              text={note}
              style={textStyle}
              x={get(spots, [no, 'x']) + 20}
              y={get(spots, [no, 'y']) - 20}
            />
          ))}
        </Stage>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapCell: state.mapCell,
  mapId: state.mapId,
  notations: state.notations,
}))(Preview)

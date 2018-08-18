import { Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import fs from 'fs-extra'
import { entries, get, keyBy, map } from 'lodash'
import path from 'path'
import { TextStyle, Texture } from 'pixi.js'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import { INotation } from './models'
import { RootState } from './store'

const Wrapper = styled.div`
  grid-area: preview;
`

const mapImage = `file://${path.resolve(__dirname, '../../maps/001/01_image.png')}`
const info = fs.readJSONSync(path.resolve(__dirname, '../../maps/001/01_info.json'))
const spots = keyBy(info.spots, 'no')

const textStyle = new PIXI.TextStyle({
  fill: 'white',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: 30,
  fontWeight: 'bold',
  strokeThickness: 8,
})

interface IProps extends DispatchProp {
  mapCell: string
  notations: INotation
}

class Preview extends Component<IProps, {}> {
  public render() {
    const { mapCell, notations } = this.props
    return (
      <Wrapper>
        <Stage width={1200} height={720}>
          <Sprite texture={Texture.fromImage(mapImage)} />
          <Sprite x={-1205} y={0} texture={Texture.fromImage(mapImage)} />
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
  notations: state.notations,
}))(Preview)

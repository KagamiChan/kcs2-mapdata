import { Graphics, Sprite, Stage } from '@inlet/react-pixi'
import fs from 'fs-extra'
import { get, keyBy } from 'lodash'
import path from 'path'
import PIXI, { Graphics as PixiGraphics, Texture } from 'pixi.js'
import React, { Component, createRef } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import { RootState } from './store'

const Wrapper = styled.div`
  grid-area: preview;
`

const map = `file://${path.resolve(__dirname, '../../maps/001/01_image.png')}`
const info = fs.readJSONSync(path.resolve(__dirname, '../../maps/001/01_info.json'))
const spots = keyBy(info.spots, 'no')

interface IProps extends DispatchProp {
  mapCell: string
}

class Preview extends Component<IProps, {}> {
  public render() {
    const { mapCell } = this.props
    return (
      <Wrapper>
        <Stage width={1200} height={720}>
          <Sprite texture={Texture.fromImage(map)} />
          <Sprite x={-1205} y={0} texture={Texture.fromImage(map)} />
          <Graphics
            draw={g => {
              g.clear()
                .beginFill(0x00ff00)
                .drawStar(get(spots, [mapCell, 'x']), get(spots, [mapCell, 'y']), 6, 20, 10)
                .endFill()
            }}
          />
        </Stage>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapCell: state.mapCell,
}))(Preview)

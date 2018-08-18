import React, { Component } from 'react'
import styled from 'styled-components'
import { Stage, Sprite } from 'react-pixi-fiber'
import { Texture } from 'pixi.js'
import path from 'path'
import fs from 'fs-extra'

const Wrapper = styled.div`
  grid-area: preview;
`


const map = `file://${path.resolve(__dirname, '../../maps/001/01_image.png')}`


class Preview extends Component<{}, {}> {
  render() {
    return (
      <Wrapper>
        <Stage width={1200} height={720}>
          <Sprite texture={Texture.fromImage(map)} />
          <Sprite x={-1205} y={0} texture={Texture.fromImage(map)} />
        </Stage>
      </Wrapper>
    )
  }
}

export default Preview

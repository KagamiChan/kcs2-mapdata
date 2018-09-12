import { Button } from '@blueprintjs/core'
import { remote } from 'electron'
import fs from 'fs-extra'
import React, { Component } from 'react'
import styled from 'styled-components'

const { dialog } = remote

const Wrapper = styled.div`
  grid-area: footer;
  display: flex;
`

const Container = styled.div`
  padding-top: 1em;
`

class Footer extends Component<{}> {
  public handleCapture = () => {
    const canvas: HTMLCanvasElement | null = document.querySelector('canvas')
    if (!canvas) {
      return
    }
    remote.getCurrentWebContents().capturePage(
      {
        height: canvas.clientHeight,
        width: canvas.clientWidth,
        x: canvas.offsetLeft,
        y: canvas.offsetTop,
      },
      img => {
        const buf = img.toPNG()
        dialog.showSaveDialog(
          {
            filters: [
              {
                extensions: ['png'],
                name: 'PNG imgae file',
              },
            ],
            title: 'where to svae the file',
          },
          filename => {
            if (!filename) {
              return
            }
            fs.outputFileSync(filename, buf)
          },
        )
      },
    )
  }

  public render() {
    return (
      <Wrapper>
        <Container>
          <Button onClick={this.handleCapture}>Capture current canvas</Button>
        </Container>
      </Wrapper>
    )
  }
}

export default Footer

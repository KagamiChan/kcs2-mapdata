import { Button } from '@blueprintjs/core'
import { remote } from 'electron'
import fs from 'fs-extra'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

const { dialog } = remote

const Wrapper = styled.div`
  grid-area: footer;
  display: flex;
`

const Container = styled.div`
  button {
    margin: 1ex;
  }
`

class Footer extends Component<DispatchProp> {
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

  public handleResetEnemyPositions = () => {
    this.props.dispatch({ type: 'enemyPositions/clear' })
  }

  public render() {
    return (
      <Wrapper>
        <Container>
          <Button onClick={this.handleCapture}>Capture current canvas</Button>
          <Button onClick={this.handleResetEnemyPositions}>Reset Enemy Position</Button>
        </Container>
      </Wrapper>
    )
  }
}

export default connect()(Footer)

import { Button } from '@blueprintjs/core'
import { remote } from 'electron'
import fs from 'fs-extra'
import React, { Component, RefObject } from 'react'
import { Connect } from 'react-redux'
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

interface IProps {
  previewRef: RefObject<Connect>
}

class Footer extends Component<IProps> {
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
    if (this.props.previewRef.current) {
      const preview = this.props.previewRef.current.getWrappedInstance()
      preview.handleResetEnemyPositions()
    }
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

export default Footer

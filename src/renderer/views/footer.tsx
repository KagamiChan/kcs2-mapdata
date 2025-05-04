import { Button } from '@blueprintjs/core'
import remote from '@electron/remote'
import { fs } from '../services/fs'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'
import toaster from '../services/toaster'

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
  public handleCapture = async () => {
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
      async img => {
        const buf = img.toPNG()
        const result = await dialog.showSaveDialog({
          filters: [
            {
              extensions: ['png'],
              name: 'PNG image file',
            },
          ],
          title: 'Where to save the file',
        })
        if (!result.canceled && result.filePath) {
          try {
            await fs.writeJson(result.filePath, buf)
            toaster.show({ message: 'Screenshot saved', intent: 'success' })
          } catch (error) {
            console.error('Error saving screenshot:', error)
            toaster.show({ message: 'Error saving screenshot', intent: 'danger' })
          }
        }
      },
    )
  }

  public handleResetEnemyPositions = () => {
    this.props.dispatch({ type: 'enemyPositions/clear' })
    toaster.show({ message: 'Cleared', intent: 'success' })
  }

  public render() {
    return (
      <Wrapper>
        <Container>
          <Button onClick={this.handleCapture}>Capture</Button>
          <Button onClick={this.handleResetEnemyPositions}>Reset Enemy Positions</Button>
        </Container>
      </Wrapper>
    )
  }
}

export default connect()(Footer)

import { Button } from '@blueprintjs/core'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'
import toaster from '../services/toaster'

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
    const { electronAPI } = window
    const buf = await electronAPI.capturePage({
      height: canvas.clientHeight,
      width: canvas.clientWidth,
      x: canvas.offsetLeft,
      y: canvas.offsetTop,
    })
    if (!buf) return

    const result = await electronAPI.showSaveDialog({
      filters: [
        {
          extensions: ['png'],
          name: 'PNG image file',
        },
      ],
      title: 'Where to save the file',
    })
    if (!result || result.canceled || !result.filePath) {
      return
    }
    await electronAPI.writeFile(result.filePath, buf)
    toaster.show({ message: 'Captured', intent: 'success' })
  }

  public handleResetEnemyPositions = () => {
    this.props.dispatch({ type: 'enemyPositions/clear' })
    toaster.show({ message: 'Cleared', intent: 'success' })
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

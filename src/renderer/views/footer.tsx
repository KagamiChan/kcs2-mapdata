import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import { IEnemyPositions } from '../redux/models'
import { RootState } from '../redux/store'
import toaster from '../services/toaster'

interface IProps extends DispatchProp {
  enemyPositions: IEnemyPositions
}

const FooterContainer = styled.div`
  grid-area: footer;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
` as any

const FooterButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  margin-left: 8px;

  &:hover {
    background-color: #f0f0f0;
  }
` as any

class Footer extends Component<IProps> {
  public handleResetEnemyPositions = () => {
    this.props.dispatch({ type: 'enemyPositions/clear' })
    toaster.show({ message: 'Enemy positions reset', intent: 'success' })
  }

  public render() {
    return (
      <FooterContainer>
        <FooterButton onClick={this.handleResetEnemyPositions}>
          Reset Enemy Positions
        </FooterButton>
      </FooterContainer>
    )
  }
}

export default connect((state: RootState) => ({
  enemyPositions: state.enemyPositions,
}))(Footer)

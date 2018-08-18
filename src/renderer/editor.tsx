import fs from 'fs-extra'
import { last, map, upperCase } from 'lodash'
import path from 'path'
import React, { ChangeEvent, Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import { INotation } from './models'
import { RootState } from './store'

const Wrapper = styled.div`
  grid-area: editor;
  padding-left: 1em;
`

const info = fs.readJSONSync(path.resolve(__dirname, '../../maps/001/01_info.json'))

interface IProps extends DispatchProp {
  notations: INotation
}

class Editor extends Component<IProps, {}> {
  public handleFocus = (id: string) => () => {
    this.props.dispatch({ type: 'mapCell/change', payload: id })
  }

  public handleChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    this.props.dispatch({
      payload: { ...this.props.notations, [id]: last(upperCase(e.currentTarget.value)) },
      type: 'notations/update',
    })
  }

  public render() {
    const { notations } = this.props
    return (
      <Wrapper>
        <table>
          <thead>
            <th>Point</th>
            <th>Reading</th>
          </thead>
          <tbody>
            {map(info.spots, s => (
              <tr key={s.no}>
                <td>{s.no}</td>
                <td>
                  <input
                    type="text"
                    value={notations[s.no] || ''}
                    onFocus={this.handleFocus(s.no)}
                    onChange={this.handleChange(s.no)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  notations: state.notations,
}))(Editor)

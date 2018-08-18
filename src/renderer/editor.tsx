import fs from 'fs-extra'
import { map } from 'lodash'
import path from 'path'
import React, { Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

const Wrapper = styled.div`
  grid-area: editor;
  padding-left: 1em;
`

const info = fs.readJSONSync(path.resolve(__dirname, '../../maps/001/01_info.json'))

interface IProps extends DispatchProp {}

class Editor extends Component<IProps, {}> {
  public handleFocus = (id: string) => () => {
    this.props.dispatch({ type: 'mapCell/change', payload: id })
  }

  public render() {
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
                  <input type="text" onFocus={this.handleFocus(s.no)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Wrapper>
    )
  }
}

export default connect()(Editor)

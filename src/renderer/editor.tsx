import { Button } from '@blueprintjs/core'
import fs from 'fs-extra'
import { fromPairs, get, map, uniq, upperCase } from 'lodash'
import path from 'path'
import React, { ChangeEvent, Component, createRef, KeyboardEvent } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import fileWriter from './file-writer'
import mapLoader from './map-loader'
import { INotationMap } from './models'
import store, { RootState } from './store'
import toaster from './toaster'

const Wrapper = styled.div`
  grid-area: editor;
  padding-left: 1em;
`

const Control = styled.div`
  text-align: center;
  button {
    margin: 1ex;
  }
`

const codeA = 'A'.charCodeAt(0)

/**
 * converts index to alphabetic
 * @param index
 */
const parseIndex = (index: number): string => {
  // we assume the first point is a start
  if (index === 0) {
    return '1'
  }
  const num = index - 1
  const a = Math.floor(num / 26) - 1
  const b = (num % 26) + codeA
  return [a === -1 ? '' : String.fromCharCode(a + codeA), String.fromCharCode(b)].join('')
}

interface IProps extends DispatchProp {
  notations: INotationMap
  mapId: string
}

interface IState {
  spots: string[]
}

class Editor extends Component<IProps, IState> {
  public state: IState = {
    spots: [],
  }

  public list = createRef<HTMLTableSectionElement>()

  public componentDidMount() {
    this.updateData()
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.mapId !== prevProps.mapId) {
      this.updateData()
    }
  }

  public handleFocus = (id: string) => () => {
    this.props.dispatch({ type: 'mapCell/change', payload: id })
  }

  public handleChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    this.props.dispatch({
      payload: {
        data: { ...this.props.notations, [id]: upperCase(e.currentTarget.value) },
        id: this.props.mapId,
      },
      type: 'notations/updateOne',
    })
  }

  public handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    // enter, arrow down or arrow right
    if ([13, 40, 39].includes(e.keyCode)) {
      e.preventDefault()
      if (this.list.current) {
        const next: HTMLInputElement | null = this.list.current.querySelector(
          `input[itemid="${index + 1}"]`,
        )
        if (next) {
          next.focus()
        }
      }
      return
    }
    // arrow up or arrow left
    if ([38, 37].includes(e.keyCode)) {
      e.preventDefault()
      if (this.list.current) {
        const next: HTMLInputElement | null = this.list.current.querySelector(
          `input[itemid="${index - 1}"]`,
        )
        if (next) {
          next.focus()
        }
      }
    }
  }

  public handleAutofill = () => {
    const data = fromPairs(map(this.state.spots, (s, index) => [s, parseIndex(index)]))
    this.props.dispatch({
      payload: {
        data,
        id: this.props.mapId,
      },
      type: 'notations/updateOne',
    })
  }

  public handleSave = () => {
    const data = store.getState()

    fileWriter.write(
      path.resolve(__dirname, '../../data/notation.json'),
      JSON.stringify(data.notations, null, 2),
      {},
      () => {
        toaster.show({ message: 'Saved', intent: 'success' })
      },
    )
  }

  public handleReload = async () => {
    const data = await fs.readJson(path.resolve(__dirname, '../../data/notation.json'))
    this.props.dispatch({
      payload: data,
      type: 'notations/updateMany',
    })
    toaster.show({ message: 'Reloaded', intent: 'success' })
  }

  public updateData = async () => {
    const { mapId } = this.props
    const data = await mapLoader.load(mapId)

    this.setState({
      spots: uniq(map(data.spots, s => `${s.x}_${s.y}`)),
    })
  }

  public render() {
    const { spots } = this.state
    const { notations } = this.props
    return (
      <Wrapper>
        <table>
          <thead>
            <th>Point</th>
            <th>Reading</th>
          </thead>
          <tbody ref={this.list}>
            {map(spots, (s, index: number) => (
              <tr key={s}>
                <td>{s}</td>
                <td>
                  <input
                    itemID={String(index)}
                    type="text"
                    value={notations[s] || ''}
                    onFocus={this.handleFocus(s)}
                    onChange={this.handleChange(s)}
                    onKeyDown={this.handleKeyDown(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <Control>
          <Button intent="danger" onClick={this.handleReload}>
            Reload
          </Button>
          <Button onClick={this.handleAutofill}>Autofill</Button>
          <Button intent="success" onClick={this.handleSave}>
            Save
          </Button>
        </Control>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapId: state.mapId,
  notations: get(state.notations, state.mapId, {}),
}))(Editor)

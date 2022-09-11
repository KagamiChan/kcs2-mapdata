import { Button, Switch } from '@blueprintjs/core'
import fs from 'fs-extra'
import { findIndex, fromPairs, get, map, toUpper, uniq, range, size } from 'lodash'
import path from 'path'
import React, { ChangeEvent, Component, createRef, FormEvent, KeyboardEvent } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import { IMapItem, INotationMap } from '../redux/models'
import store, { RootState } from '../redux/store'
import fileWriter from '../services/file-writer'
import mapLoader from '../services/map-loader'
import toaster from '../services/toaster'

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

/**
 * converts index to alphabetic, ex. parseSequentialIndex(0, 'C') => 'C', parseSequentialIndex(1, 'C') => 'D'
 * @param index
 * @param start the character at -1
 */
 const parseSequentialIndex = (index: number, start: string): string => {
  const startCode = toUpper(start).charCodeAt(0)
  const num = index + startCode - codeA
  const a = Math.floor(num / 26) - 1
  const b = (num % 26) + codeA
  return [a === -1 ? '' : String.fromCharCode(a + codeA), String.fromCharCode(b)].join('')
}

interface IProps extends DispatchProp {
  notations: INotationMap
  mapId: string
  mapList: IMapItem[]
}

interface IState {
  spots: string[]
  next: string
  prev: string
  sequentialEdit: boolean
}

class Editor extends Component<IProps, IState> {
  public static getDerivedStateFromProps(nextProps: IProps) {
    const { mapId, mapList } = nextProps

    const index = findIndex(mapList, m => m.value === mapId)

    const prev = get(mapList, [index - 1, 'value'], '')
    const next = get(mapList, [index + 1, 'value'], '')

    return {
      next,
      prev,
    }
  }

  public state: IState = {
    next: '',
    prev: '',
    spots: [],
    sequentialEdit: false,
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
    const currentIndex = findIndex(this.state.spots, s => s === id)
    const currentCharacter = get(/([a-zA-Z]+)/g.exec(e.target.value), 1)
    if (this.state.sequentialEdit && currentCharacter) {
      const sequentialUpdates = fromPairs(range(currentIndex + 1, size(this.state.spots)).map(
        i => [this.state.spots[i], parseSequentialIndex(i - currentIndex, currentCharacter)]
      ))
      this.props.dispatch({
        payload: {
          data: { ...this.props.notations, ...sequentialUpdates, [id]: toUpper(e.currentTarget.value) },
          id: this.props.mapId,
        },
        type: 'notations/updateOne',
      })
    } else {
      this.props.dispatch({
        payload: {
          data: { ...this.props.notations, [id]: toUpper(e.currentTarget.value) },
          id: this.props.mapId,
        },
        type: 'notations/updateOne',
      })
    }
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
      path.resolve(window.ROOT, './data/notation.json'),
      JSON.stringify(data.notations, null, 2),
      {},
      () => {
        toaster.show({ message: 'Saved', intent: 'success' })
      },
    )
  }

  public handleReload = async () => {
    const data = await fs.readJson(path.resolve(window.ROOT, './data/notation.json'))
    this.props.dispatch({
      payload: data,
      type: 'notations/updateMany',
    })
    toaster.show({ message: 'Reloaded', intent: 'success' })
  }

  public handleGoPrev = () =>
    this.props.dispatch({ type: 'mapId/change', payload: this.state.prev })

  public handleGoNext = () =>
    this.props.dispatch({ type: 'mapId/change', payload: this.state.next })

  public updateData = async () => {
    const { mapId } = this.props
    const data = await mapLoader.load(mapId)

    this.setState({
      spots: uniq(map(data.info.spots, s => `${s.x},${s.y}`)),
    })
  }

  public handleEditModeChange = (e: FormEvent<HTMLInputElement>) => {
    this.setState({
      sequentialEdit: e.currentTarget.checked,
    })
  }

  public render() {
    const { spots, prev, next, sequentialEdit } = this.state
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
          <Switch onChange={this.handleEditModeChange} checked={sequentialEdit} label="Sequential edit" />
        </Control>
        <Control>
          {prev && <Button onClick={this.handleGoPrev}>Prev.</Button>}
          <Button intent="danger" onClick={this.handleReload}>
            Reload
          </Button>
          <Button onClick={this.handleAutofill}>Autofill</Button>
          <Button intent="success" onClick={this.handleSave}>
            Save
          </Button>
          {next && <Button onClick={this.handleGoNext}>Next</Button>}
        </Control>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapId: state.mapId,
  mapList: state.mapList,
  notations: get(state.notations, state.mapId, {}),
}))(Editor)

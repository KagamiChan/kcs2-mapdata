import { get, last, map, uniq, upperCase } from 'lodash'
import React, { ChangeEvent, Component, createRef, KeyboardEvent } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'
import { ISpotsEntity } from '../../types'

import mapLoader from './map-loader'
import { INotationMap } from './models'
import { RootState } from './store'

const Wrapper = styled.div`
  grid-area: editor;
  padding-left: 1em;
`

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
        data: { ...this.props.notations, [id]: last(upperCase(e.currentTarget.value)) },
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
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapId: state.mapId,
  notations: get(state.notations, state.mapId, {}),
}))(Editor)

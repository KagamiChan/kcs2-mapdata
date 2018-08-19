import fs from 'fs-extra'
import { map, padStart, sortBy } from 'lodash'
import path from 'path'
import React, { ChangeEvent, Component } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import { RootState } from './store'

const Wrapper = styled.div`
  grid-area: header;
  display: flex;
  align-items: center;
`

interface IMapItem {
  label: string
  value: string
}

interface IProps extends DispatchProp {
  mapList: IMapItem[]
  mapId: string
}

class Header extends Component<IProps> {
  public componentDidMount = () => {
    this.readMapList()
  }

  public readMapList = async () => {
    const DATA_FOLDER = path.resolve(__dirname, '../../maps')
    const start2 = await fs.readJson(path.resolve(DATA_FOLDER, './start2.json'))

    const mapConst = start2.api_mst_mapinfo

    const mapList = map(
      sortBy(mapConst, 'api_id'),
      ({ api_maparea_id, api_no, api_name, api_id }) => {
        const mapArea = padStart(String(api_maparea_id), 3, '0')
        const mapId = padStart(String(api_no), 2, '0')
        return {
          label: `${api_maparea_id}-${api_no}\t${api_name}`,
          value: String(api_id),
        }
      },
    )

    this.props.dispatch({ type: 'mapList/update', payload: mapList })
  }

  public handleChangeMap = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.currentTarget
    this.props.dispatch({ type: 'mapId/change', payload: value })
    this.props.dispatch({ type: 'mapCell/change', payload: '' })
  }

  public render() {
    const { mapList, mapId } = this.props
    return (
      <Wrapper>
        <div>
          Map Selection:
          <select onChange={this.handleChangeMap} value={mapId}>
            {map(mapList, ({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Wrapper>
    )
  }
}

export default connect((state: RootState) => ({
  mapId: state.mapId,
  mapList: state.mapList,
}))(Header)

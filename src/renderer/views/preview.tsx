import { Container, Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import FontFaceObserver from 'fontfaceobserver'
import fs from 'fs-extra'
import { entries, filter, fromPairs, get, isString, map, split } from 'lodash'
import path from 'path'
import { Container as PixiContainer, DisplayObject, interaction, TextStyle, Texture } from 'pixi.js'
import React, { Component, createRef } from 'react'
import { connect, DispatchProp } from 'react-redux'
import styled from 'styled-components'

import mapLoader from '../services/map-loader'
import TextureLoader from '../services/texture-loader'

import { IEnemyPositions, INotationMap } from '../redux/models'
import { RootState } from '../redux/store'

import { IEnemy, IMapInfo, ISpotsEntity } from '../../../types'

const mapTexture = new TextureLoader(
  path.resolve(window.ROOT, './data/map_common.png'),
  path.resolve(window.ROOT, './data/map_common.json'),
)

// align with main.js 4.1.1.6, map_common 4.1.0.0
const getMapTexture = (t: number) => {
  switch (t) {
    case -1:
      return mapTexture.get(133) // default white
    case 1:
      return mapTexture.get(126) // blue, battle avoid
    case 2:
    case 6:
      return mapTexture.get(129) // green, resource get
    case 3:
      return mapTexture.get(131) // purple, resource loss
    case 4:
      return mapTexture.get(132) // red, battle
    case 5:
      return mapTexture.get(120) // boss
    case 7:
      return mapTexture.get(100) // air battle
    case 8:
      return mapTexture.get(119) // sortie end (1-6)
    case 9:
      return mapTexture.get(130) // air reconn
    case 10:
      return mapTexture.get(95) // long distance air battle
    case 11:
      return mapTexture.get(134) // purple, night battle
    case 12:
      return mapTexture.get(135) // night to day
    case -2:
      return mapTexture.get(128) // red, battle
    case -3:
      return mapTexture.get(125) // start
    default:
      return Texture.EMPTY
  }
}

export const getSpotKind = (eventId: number = -100, detailId: number = -100) => {
  if (eventId === 4) {
    // 4=通常戦闘
    if (detailId === 2) {
      return 14
    } // 2=夜戦
    if (detailId === 4) {
      return 8
    } // 4=航空戦
    if (detailId === 5) {
      return 15
    } // 5=敵連合艦隊戦
    if (detailId === 6) {
      return 11
    } // 6=長距離空襲戦
  }
  if (eventId === 6) {
    // 6=気のせいだった
    if (detailId === 1) {
      // 1="敵影を見ず。"
      return 7
    } else if (detailId === 2) {
      // 2=能動分岐
      return 12
    }
  } else if (eventId === 7) {
    // 7=航空戦or航空偵察
    if (detailId === 0) {
      // 4=航空戦
      return 13
    }
  }
  return eventId + 1
}

const spotKindColorMap: { [key: number]: number } = {
  1: -3,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 1,
  8: 7,
  9: 8,
  10: 9,
  11: 10,
  12: 1,
  13: 9,
  14: 11,
  15: 4,
}

const airbaseTexture = mapTexture.get(81)

const getXY = (cell: string) => split(cell, ',').map(Number)

const getEnemyName = (enemy: IEnemy): string => String(enemy.no) + enemy.img

const Wrapper = styled.div`
  grid-area: preview;
`

interface ICellStat {
  cell_id: string
  event_id: number
  event_kind: number
}

interface ISpotStat {
  [key: string]: {
    [key: string]: ICellStat
  }
}

interface IProps extends DispatchProp {
  enemyPositions: IEnemyPositions
  mapCell: string
  notations: INotationMap
  mapId: string
}

interface IState {
  mapImage: TextureLoader | null
  mapInfo: IMapInfo | null
  currentEnemy: string
  stat: ISpotStat
}

class Preview extends Component<IProps, IState> {
  public enemyLayer = createRef<any>()

  public textStyle = new TextStyle({
    fill: 'white',
    fontFamily: '"Lucida Console", Monaco, monospace',
    fontSize: 30,
    fontWeight: 'bold',
    strokeThickness: 8,
  })

  public state: IState = {
    currentEnemy: '',
    mapImage: null,
    mapInfo: null,
    stat: {},
  }

  private data: interaction.InteractionData | null = null

  public componentDidMount() {
    this.loadMapData()

    const font = new FontFaceObserver('IBM Plex Mono')
    font.load().then(() => {
      console.info('pixi.js font loaded')
      this.textStyle = new TextStyle({
        fill: 'white',
        fontFamily: 'IBM Plex Mono',
        fontSize: 30,
        fontWeight: 'bold',
        strokeThickness: 8,
      })
      this.forceUpdate()
    })
  }

  public componentDidUpdate(prevProps: IProps) {
    if (prevProps.mapId !== this.props.mapId) {
      this.loadMapData()
      this.handleResetEnemyPositions()
    }
  }

  public loadMapData = async () => {
    const { mapId } = this.props

    const data = await mapLoader.load(mapId)

    const stat = await fs.readJSON(path.resolve(__dirname, '../../../maps/stat.json'))

    this.setState({
      mapImage: data.image,
      mapInfo: data.info,
      stat,
    })
  }

  public handleDragStart = (name: string) => (e: interaction.InteractionEvent) => {
    this.data = e.data
    this.setState({
      currentEnemy: name,
    })
  }

  public handleDragEnd = () => {
    this.data = null
    this.setState({
      currentEnemy: '',
    })
  }

  public handleDragMove = () => {
    if (this.state.currentEnemy && this.data && this.enemyLayer.current) {
      const { x, y } = this.data.getLocalPosition(this.enemyLayer.current as DisplayObject)
      this.props.dispatch({
        payload: {
          data: {
            x,
            y,
          },
          id: this.state.currentEnemy,
        },
        type: 'enemyPositions/updateOne',
      })
    }
  }

  public handleResetEnemyPositions = () => {
    this.props.dispatch({ type: 'enemyPositions/clear' })
  }

  public render() {
    const { mapImage, mapInfo, currentEnemy, stat } = this.state
    const { mapCell, notations, enemyPositions, mapId } = this.props

    if (mapImage === null || mapInfo === null) {
      return (
        <Wrapper>
          <Stage key="placeholder" width={1200} height={720} options={{ transparent: true }} />
        </Wrapper>
      )
    }

    const [mapX = 0, mapY = 0] = getXY(mapCell)

    const currentStat = stat[mapId] || {}

    return (
      <Wrapper>
        <Stage key="main" width={1200} height={720} options={{ transparent: true }}>
          <Container>
            {map(mapInfo.bg, back => {
              const name = isString(back) ? back : back.img
              return <Sprite key={name} x={0} y={0} texture={mapImage.get(name)} />
            })}
          </Container>
          <Container>
            {map(filter(mapInfo.spots, s => get(s, 'route.img')), (s: ISpotsEntity) => (
              <Sprite
                key={s.no}
                x={s.x + s.line!.x}
                y={s.y + s.line!.y}
                texture={mapImage.get(s.route!.img)}
              />
            ))}
            {map(filter(mapInfo.spots, s => s.color), (s: ISpotsEntity) => {
              const texture = getMapTexture(s.color!)

              return (
                <Sprite
                  key={s.no}
                  x={s.x - Math.round(texture.width / 2)}
                  y={s.y - Math.round(texture.height / 2)}
                  texture={texture}
                />
              )
            })}
            {map(entries(notations), ([s, note]) => {
              const [x = 0, y = 0] = getXY(s)
              const eventId = get(currentStat, [note, 'event_id'])
              const detailId = get(currentStat, [note, 'event_kind'])
              const color = spotKindColorMap[getSpotKind(eventId, detailId)]
              const texture = getMapTexture(color!)

              // boss cell icon is translated a little to make it cover the original spot icon
              return (
                <Sprite
                  key={s}
                  x={x - Math.round(texture.width / 2)}
                  y={y - Math.round(texture.height / 2) - (color === 5 ? 2 : 0)}
                  texture={texture}
                />
              )
            })}
            {map(mapInfo.labels, l => (
              <Sprite key={l.img} x={l.x} y={l.y} texture={mapImage.get(l.img!)} />
            ))}
            {mapInfo.airbase && (
              <Sprite
                x={mapInfo.airbase.x - airbaseTexture.width / 2}
                y={mapInfo.airbase.y - airbaseTexture.height / 2}
                texture={airbaseTexture}
              />
            )}
          </Container>
          <Container ref={this.enemyLayer}>
            {map(mapInfo.enemies, e => {
              return (
                <Sprite
                  key={getEnemyName(e)}
                  x={get(enemyPositions, [getEnemyName(e), 'x'], e.x)}
                  y={get(enemyPositions, [getEnemyName(e), 'y'], e.y)}
                  alpha={currentEnemy === getEnemyName(e) ? 0.75 : 1}
                  texture={mapImage.get(e.img)}
                  interactive={true}
                  pointerdown={this.handleDragStart(getEnemyName(e))}
                  pointerup={this.handleDragEnd}
                  pointerupoutside={this.handleDragEnd}
                  pointermove={this.handleDragMove}
                />
              )
            })}
          </Container>
          <Container>
            {mapX > 0 &&
              mapY > 0 && (
                <Graphics
                  draw={g => {
                    g.clear()
                      .beginFill(0x00ff00)
                      .drawStar(mapX, mapY, 6, 20, 10)
                      .endFill()
                  }}
                />
              )}
            {map(entries(notations), ([s, note]) => {
              const [pX = 0, pY = 0] = getXY(s)
              return <Text key={s} text={note} style={this.textStyle} x={pX + 20} y={pY - 20} />
            })}
          </Container>
        </Stage>
      </Wrapper>
    )
  }
}

export default connect(
  (state: RootState) => ({
    enemyPositions: state.enemyPositions,
    mapCell: state.mapCell,
    mapId: state.mapId,
    notations: get(state.notations, state.mapId, {}),
  }),
  null,
  null,
  { withRef: true },
)(Preview)

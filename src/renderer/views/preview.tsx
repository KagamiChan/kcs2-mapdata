import { Container, Graphics, Sprite, Stage, Text } from '@inlet/react-pixi'
import FontFaceObserver from 'fontfaceobserver'
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
      return mapTexture.get(130) // transport
    case 10:
      return mapTexture.get(95) // air raid
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

const airbaseTexture = mapTexture.get(81)

const getXY = (cell: string) => split(cell, ',').map(Number)

const getEnemyName = (enemy: IEnemy): string => String(enemy.no) + enemy.img

const Wrapper = styled.div`
  grid-area: preview;
`

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

    this.setState({
      mapImage: data.image,
      mapInfo: data.info,
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
    const { mapImage, mapInfo, currentEnemy } = this.state
    const { mapCell, notations, enemyPositions } = this.props

    if (mapImage === null || mapInfo === null) {
      return (
        <Wrapper>
          <Stage key="placeholder" width={1200} height={720} options={{ transparent: true }} />
        </Wrapper>
      )
    }

    const [mapX = 0, mapY = 0] = getXY(mapCell)

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
                  x={s.x - texture.width / 2}
                  y={s.y - texture.height / 2}
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

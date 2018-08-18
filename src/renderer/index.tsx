import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import React from 'react'
import ReactDOM from 'react-dom'
import styled, { injectGlobal } from 'styled-components'

import Preview from './preview'
import Editor from './editor'

injectGlobal`
  html, body, #app {
    height: 100%;
  }
`

const Container = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1200px auto;
  grid-template-rows: 40px 720px auto;
  grid-template-areas:
    "header haeder"
    "preview editor"
    "footer footer";
`

const App = () => <Container><Preview/><Editor /></Container>

ReactDOM.render(<App />, document.querySelector('#app'))

import '@blueprintjs/core/lib/css/blueprint.css'
import 'normalize.css/normalize.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import styled, { injectGlobal } from 'styled-components'
import './static/webfont.css'

import Editor from './views/editor'
import Footer from './views/footer'
import Header from './views/header'
import Preview from './views/preview'

import store from './redux/store'

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  html, body, #app {
    height: 100%;
    font-family: 'IBM Plex Sans';
  }
`

const Container = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1200px auto;
  grid-template-rows: 40px 720px auto;
  grid-template-areas:
    'header haeder'
    'preview editor'
    'footer footer';
`

const App = () => (
  <Provider store={store}>
    <Container>
      <Header />
      <Preview />
      <Editor />
      <Footer />
    </Container>
  </Provider>
)

ReactDOM.render(<App />, document.querySelector('#app'))

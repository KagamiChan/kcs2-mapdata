declare module 'http-proxy-agent' {
  import { Agent } from 'http'

  class HttpProxyAgent extends Agent {
    constructor(url: string)
  }
  export default HttpProxyAgent
}

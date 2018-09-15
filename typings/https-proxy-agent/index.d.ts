declare module 'https-proxy-agent' {
  import { Agent } from 'http'

  class HttpsProxyAgent extends Agent {
    constructor(url: string)
  }
  export default HttpsProxyAgent
}

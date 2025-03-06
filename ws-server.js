const { WebSocketServer } = require("ws");

class WSServer {
  constructor(wss_port) {
    const wss = new WebSocketServer({
      port: wss_port,
    });
    this.wss = wss;

    wss.on("connection", (conn) => {
      conn.on("message", (data, isBinary)=>{

        
      });
    });
  }
}

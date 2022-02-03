class Connection{
  constructor(state, render, socketURL){
    this.turtleSocket = new WebSocket(socketURL);
    const turtleSocket = this.turtleSocket;

    this.state = state;

    turtleSocket.onmessage = function (event) {
      const data = JSON.parse(event.data);
    
      if (data.length > 0){
        console.log(data);
    
        for (let d = 0; d < data.length; d ++) {
          if (data[d][0] === "block") {
            state.addBlocks(render, data[d][1]);
          }
          if (data[d][0] === "pos") {
            state.setPos(data[d][1]);
          }
          if (data[d][0] === "inventory") {
            state.setInventory(render, data[d][1]);
          }
          if (data[d][0] === "turtles") {
            console.log("Setting turtles!");
            state.turtleNames = data[d][1];
    
            for (let i = 0; i < state.turtleNames.length; i ++){
              state.reverseNames[state.turtleNames[i]] = i;
            }
          }
        }
      }
    }

    turtleSocket.onopen = function (event) {
      turtleSocket.send("Controller");
    };
  }
}

module.exports = Connection;
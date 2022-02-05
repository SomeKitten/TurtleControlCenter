class Connection {
  constructor(state, render, socketURL) {
    this.turtleSocket = new WebSocket(socketURL);
    const turtleSocket = this.turtleSocket;

    this.state = state;

    turtleSocket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.blocks !== undefined) {
        state.addBlocks(render, data.blocks);
      }
      if (data.pos !== undefined) {
        state.setPos(data.pos);
      }
      if (data.inventory !== undefined) {
        state.setInventory(render, data.inventory);
      }
      if (data.turtles !== undefined) {
        state.turtleNames = data.turtles;

        for (let i = 0; i < state.turtleNames.length; i++) {
          state.reverseNames[state.turtleNames[i]] = i;
        }
      }
    };

    turtleSocket.onopen = function (event) {
      turtleSocket.send("Controller");
    };
  }
}

module.exports = Connection;

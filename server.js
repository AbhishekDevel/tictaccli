const io = require("socket.io")(80);
let waitForOtherPlayer2 = false;
function setGame(player1 = null, player2 = null,){
  let gamestatelength =
    gamestate.length;
  const gamedata = {"Player1":player1,"Player2": player2,"Gamestate": [" "," "," "," "," "," "," "," "," "], }
  gamestate.push({"id":gamestatelength , gamedata});
  waitForOtherPlayer2 = true;
}

function startgame(gameid){
  const game = gamestate.filter((obj => obj.id == gameid));
  const pl1 = game[0].gamedata.Player1;
  const pl2 = game[0].gamedata.Player2;
  const gms = game[0].gamedata.Gamestate
  io.to(pl1).emit("player2-connect","player 2 is conneted.");
  for(let i = 0; i<9; i++){
    if(i % 2 !== 0){
      io.to(pl1).emit("draw-board", gms);
      socket.on("player1-move", data => {
        game.Gamestate[data] = "X"
        io.to(gameid).emit("player2-connect", "Player 1 move")
        io.to(gameid).emit("draw-board", gamestate[game].gamedata.Gamestate)
      })
    }else{
      
    }
  }
}

const gamestate = []

io.on("connection", socket => {
  socket.emit("choose-from-list", ["1. Create a new game","2. Join as player 2 in existing game","3. Be a spectator"]);
  socket.on("choose-number", data =>{
    if(gamestate.length < 10 && data < 4){
      if(parseInt(data) == 1){
        setGame(player1 = socket.id)
      if(waitForOtherPlayer2){
        socket.send("Waiting for second Player")
      }
      }else if(parseInt(data) == 2){
        if(gamestate.length >= 1){
          const filterlistwithp2null = gamestate.filter((obj => obj.gamedata.Player2 == null))
        socket.emit("choose-from-existing-game", Object.keys(filterlistwithp2null));
        }
        socket.on("gameid-choice", data => {
          objectindex = gamestate.findIndex((obj => obj.id == data))
            gamestate[objectindex].gamedata.Player2 = socket.id
          startgame(objectindex)
          socket.send("waiting for player1 to move")
        })
      }else if(parseInt(data) == 3){
        const filtergamelist = gamestate.filter((obj => obj.gamedata.Player1 !== null && obj.gamedata.Player2 !== null));
        if(filtergamelist.length > 0 ){
        socket.emit("choose-from-existing-game-for-spectator",Object.keys(filtergamelist));
        socket.on("gameid-for-spectator", data => {
          socket.join(data)
          socket.send(`You are watching Match with Game Id ${data}`)
          const gameindex = gamestate.findIndex((obj => obj.id == data))
          socket.send(`${gamestate[gameindex].gamedata.Player1} is Player1 and ${gamestate[gameindex].gamedata.Player2} is Player2`)
          socket.emit("draw-board", gamestate[gameindex].gamedata.Gamestate)
        })
                                                }else{
          socket.send("No game to show")
          socket.emit("choose-from-list",["1. Create a new game","2. Join as player 2 in existing game","3. Be a spectator"])
                                                }
      }
    }else{
      socket.emit("choose-from-list", ["Sorry server is full or you enter wrong choice, choose from 1-3","1. Create a new game","2. Join as player 2 in existing game","3. Be a spectator"]);
    }
  })
  socket.on("message", data => {
    console.log(data)});
});

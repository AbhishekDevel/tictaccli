const io = require("socket.io")(80);

let player1: string | null;
let player2: string | null;


function setGame(player1 = null, player2 = null,): void {
  let gamestatelength: number = gamestate.length;
  const gamedata: { "Player1": string | null; "Player2": string | null; "Gamestate": string[] } = { "Player1": player1, "Player2": player2, "Gamestate": [" ", " ", " ", " ", " ", " ", " ", " ", " "], };
  gamestate.push({ "id": gamestatelength, gamedata });
}

function player1move(gameid, pl1, pl2, gms) {
  if (whosechance > 9) {
    return;
  }
  io.to(pl1).emit("player1-move", [gameid, pl1, pl2, gms]);
};

function player2move(gameid, pl1, pl2, gms) {
  io.to(pl2).emit("player2-move", [gameid, pl1, pl2, gms])
};


function startgame(gameid: number): void {
  let game: any[] = gamestate.filter((obj => obj.id == gameid));
  const pl1: string = game[0].gamedata.Player1;
  const pl2: string = game[0].gamedata.Player2;
  let gms: string[] = game[0].gamedata.Gamestate
  io.to(pl1).emit("player2-connect", "player 2 is connected");
  player1move(gameid, pl1, pl2, gms);
}

const gamestate: any[] = []
let whosechance: number = 1;

io.on("connection", (socket: any) => {
  socket.emit("choose-from-list", ["1. Create a new game", "2. Join as player 2 in existing game", "3. Be a spectator"]);
  socket.on("player1-move-index", (indexlist: any[]) => {
    gamestate[indexlist[0]].gamedata.Gamestate[indexlist[3] - 1] = "X";
    let game = gamestate.filter((obj => obj.id == indexlist[0]));
    let gms = game[0].gamedata.Gamestate;
    whosechance = whosechance + 1;
    io.to(indexlist[0]).emit("draw-board", gms);
    player2move(indexlist[0], indexlist[1], indexlist[2], gms);
  });
  socket.on("player2-move-index", (indexlist: any[]) => {
    gamestate[indexlist[0]].gamedata.Gamestate[indexlist[3] - 1] = "O";
    let game = gamestate.filter((obj => obj.id == indexlist[0]));
    let gms = game[0].gamedata.Gamestate;
    whosechance = whosechance + 1;
    io.to(indexlist[0]).emit("draw-board", gms)
    player1move(indexlist[0], indexlist[1], indexlist[2], gms);
  });
  socket.on("choose-number", (data: number) => {
    if (gamestate.length < 10 && data < 4) {
      if (data == 1) {
        setGame(player1 = socket.id);
        socket.send("Waiting for second Player");
      } else if (data == 2) {
        if (gamestate.length >= 1) {
          const filterlistwithp2null = gamestate.filter((obj => obj.gamedata.Player2 == null))
          socket.emit("choose-from-existing-game", Object.keys(filterlistwithp2null));
        }
        socket.on("gameid-choice", (data: number) => {
          let objectindex: number = gamestate.findIndex((obj => obj.id == data))
          gamestate[objectindex].gamedata.Player2 = socket.id
          socket.send("waiting for player1 to move");
          startgame(objectindex);
        });
      } else if (data == 3) {
        const filtergamelist: any[] = gamestate.filter((obj => obj.gamedata.Player1 !== null && obj.gamedata.Player2 !== null));
        if (filtergamelist.length > 0) {
          socket.emit("choose-from-existing-game-for-spectator", Object.keys(filtergamelist));
          socket.on("gameid-for-spectator", (data: number) => {
            socket.join(data)
            socket.send(`You are watching Match with Game Id ${data}`)
            const gameindex: number = gamestate.findIndex((obj => obj.id == data))
            socket.send(`${gamestate[gameindex].gamedata.Player1} is Player1 and ${gamestate[gameindex].gamedata.Player2} is Player2`)
            socket.emit("draw-board", gamestate[gameindex].gamedata.Gamestate)
          })
        } else {
          socket.send("No game to show")
          socket.emit("choose-from-list", ["1. Create a new game", "2. Join as player 2 in existing game", "3. Be a spectator"])
        }
      }
    } else {
      socket.emit("choose-from-list", ["Sorry server is full or you enter wrong choice, choose from 1-3", "1. Create a new game", "2. Join as player 2 in existing game", "3. Be a spectator"]);
    }
  })
  socket.on("message", (data: any) => {
    console.log(data)
  });
});
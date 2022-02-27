var io = require("socket.io")(80);
var player1;
var player2;
function setGame(player1, player2) {
    if (player1 === void 0) { player1 = null; }
    if (player2 === void 0) { player2 = null; }
    var gamestatelength = gamestate.length;
    var gamedata = { "Player1": player1, "Player2": player2, "Gamestate": [" ", " ", " ", " ", " ", " ", " ", " ", " "] };
    gamestate.push({ "id": gamestatelength, gamedata: gamedata });
}
function player1move(gameid, pl1, pl2, gms) {
    if (whosechance > 9) {
        return;
    }
    io.to(pl1).emit("player1-move", [gameid, pl1, pl2, gms]);
}
;
function player2move(gameid, pl1, pl2, gms) {
    io.to(pl2).emit("player2-move", [gameid, pl1, pl2, gms]);
}
;
function startgame(gameid) {
    var game = gamestate.filter((function (obj) { return obj.id == gameid; }));
    var pl1 = game[0].gamedata.Player1;
    var pl2 = game[0].gamedata.Player2;
    var gms = game[0].gamedata.Gamestate;
    io.to(pl1).emit("player2-connect", "player 2 is connected");
    player1move(gameid, pl1, pl2, gms);
}
var gamestate = [];
var whosechance = 1;
io.on("connection", function (socket) {
    socket.emit("choose-from-list", ["1. Create a new game", "2. Join as player 2 in existing game", "3. Be a spectator"]);
    socket.on("player1-move-index", function (indexlist) {
        gamestate[indexlist[0]].gamedata.Gamestate[indexlist[3] - 1] = "X";
        var game = gamestate.filter((function (obj) { return obj.id == indexlist[0]; }));
        var gms = game[0].gamedata.Gamestate;
        whosechance = whosechance + 1;
        io.to(indexlist[0]).emit("draw-board", gms);
        player2move(indexlist[0], indexlist[1], indexlist[2], gms);
    });
    socket.on("player2-move-index", function (indexlist) {
        gamestate[indexlist[0]].gamedata.Gamestate[indexlist[3] - 1] = "O";
        var game = gamestate.filter((function (obj) { return obj.id == indexlist[0]; }));
        var gms = game[0].gamedata.Gamestate;
        whosechance = whosechance + 1;
        io.to(indexlist[0]).emit("draw-board", gms);
        player1move(indexlist[0], indexlist[1], indexlist[2], gms);
    });
    socket.on("choose-number", function (data) {
        if (gamestate.length < 10 && data < 4) {
            if (data == 1) {
                setGame(player1 = socket.id);
                socket.send("Waiting for second Player");
            }
            else if (data == 2) {
                if (gamestate.length >= 1) {
                    var filterlistwithp2null = gamestate.filter((function (obj) { return obj.gamedata.Player2 == null; }));
                    socket.emit("choose-from-existing-game", Object.keys(filterlistwithp2null));
                }
                socket.on("gameid-choice", function (data) {
                    var objectindex = gamestate.findIndex((function (obj) { return obj.id == data; }));
                    gamestate[objectindex].gamedata.Player2 = socket.id;
                    socket.send("waiting for player1 to move");
                    startgame(objectindex);
                });
            }
            else if (data == 3) {
                var filtergamelist = gamestate.filter((function (obj) { return obj.gamedata.Player1 !== null && obj.gamedata.Player2 !== null; }));
                if (filtergamelist.length > 0) {
                    socket.emit("choose-from-existing-game-for-spectator", Object.keys(filtergamelist));
                    socket.on("gameid-for-spectator", function (data) {
                        socket.join(data);
                        socket.send("You are watching Match with Game Id " + data);
                        var gameindex = gamestate.findIndex((function (obj) { return obj.id == data; }));
                        socket.send(gamestate[gameindex].gamedata.Player1 + " is Player1 and " + gamestate[gameindex].gamedata.Player2 + " is Player2");
                        socket.emit("draw-board", gamestate[gameindex].gamedata.Gamestate);
                    });
                }
                else {
                    socket.send("No game to show");
                    socket.emit("choose-from-list", ["1. Create a new game", "2. Join as player 2 in existing game", "3. Be a spectator"]);
                }
            }
        }
        else {
            socket.emit("choose-from-list", ["Sorry server is full or you enter wrong choice, choose from 1-3", "1. Create a new game", "2. Join as player 2 in existing game", "3. Be a spectator"]);
        }
    });
    socket.on("message", function (data) {
        console.log(data);
    });
});

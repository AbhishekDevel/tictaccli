var io = require("socket.io-client");
var ps = require("prompt-sync");
var prmt = ps();
var socket = io("ws://localhost:80");
function drawBoard(tic) {
    for (var i = 0; i < 3; i++) {
        var t = i * 3;
        console.log(" " + tic[t] + " | " + tic[t + 1] + " | " + tic[t + 2]);
        console.log("-".repeat(12));
    }
}
socket.on("connect", function () {
    socket.send("Hello!");
});
socket.on("choose-from-list", function (data) {
    console.log(data.join("\n"));
    var chooseNumber = parseInt(prmt("Choose from 1-3=> "));
    socket.emit("choose-number", chooseNumber);
});
socket.on("draw-board", function (data) {
    drawBoard(data);
});
socket.on("choose-from-existing-game", function (data) {
    console.log("Choose From existing game Id\n Below list of existing game.");
    console.log(data.join("\n"));
    var chooseNumber = parseInt(prmt("Choose any game Id from above=> "));
    socket.emit("gameid-choice", chooseNumber);
});
socket.on("choose-from-existing-game-for-spectator", function (data) {
    console.log("Choose From Ongoing Game Id\nBelow list of ongoing game.");
    console.log(data.join("\n"));
    var chooseNumber = parseInt(prmt("Choose Any Game Id from above=> "));
    socket.emit("gameid-for-spectator", chooseNumber);
});
socket.on("player1-move", function (data) {
    drawBoard(data[3]);
    var chooseNumber = parseInt(prmt("Choose Your Move"));
    socket.emit("player1-move-index", [data[0], data[1], data[3], chooseNumber]);
});
socket.on("player2-move", function (data) {
    drawBoard(data[3]);
    var chooseNumber = parseInt(prmt("Choose Your Move"));
    socket.emit("player2-move-index", [data[0], data[1], data[0], chooseNumber]);
});
socket.on("player2-connect", function (data) {
    console.log(data);
});
socket.on("message", function (data) {
    console.log(data);
});

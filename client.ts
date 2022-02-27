const io = require("socket.io-client");
const ps = require("prompt-sync");
const prmt = ps();
const socket = io("ws://localhost:80");

function drawBoard(tic: string[]){
    for(let i: number=0; i<3; i++){
      let t: number = i*3
        console.log(" "+tic[t]+" | "+tic[t+1]+" | "+tic[t+2]);
  console.log("-".repeat(12));
}
}

socket.on("connect", () => {
   socket.send("Hello!");
});

socket.on("choose-from-list", (data: string[]) =>{
  console.log(data.join("\n"));
  let chooseNumber: number = parseInt(prmt("Choose from 1-3=> "));
  socket.emit("choose-number",chooseNumber);
});

socket.on("draw-board", (data: string[]) =>{
  drawBoard(data)
});

socket.on("choose-from-existing-game", (data: number[]) => {
  console.log("Choose From existing game Id\n Below list of existing game.");
  console.log(data.join("\n"));
  let chooseNumber: number = parseInt(prmt("Choose any game Id from above=> "));
  socket.emit("gameid-choice", chooseNumber);
});

socket.on("choose-from-existing-game-for-spectator", (data: number[]) => {
  console.log("Choose From Ongoing Game Id\nBelow list of ongoing game.");
  console.log(data.join("\n"));
  let chooseNumber: number = parseInt(prmt("Choose Any Game Id from above=> "));
  socket.emit("gameid-for-spectator", chooseNumber)
});

socket.on("player1-move", (data: any[])=>{
  drawBoard(data[3]);
  let chooseNumber: number= parseInt(prmt("Choose Your Move"));
  socket.emit("player1-move-index", [data[0],data[1],data[2],chooseNumber]);
});

socket.on("player2-move", (data: any[])=>{
  drawBoard(data[3]);
  let chooseNumber: number = parseInt(prmt("Choose Your Move"));
  socket.emit("player2-move-index",[data[0],data[1],data[2],chooseNumber]);
});


socket.on("player2-connect", (data: string) =>{
  console.log(data);
})

socket.on("message", (data: any)=>{
  console.log(data);
})
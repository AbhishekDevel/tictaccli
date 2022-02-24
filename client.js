const io = require("socket.io-client");
const ps = require("prompt-sync");
const prompt = ps() 
const socket = io("ws://localhost:80");

function drawBoard(tic){
    for(let i=0;i<3;i++){
      let t = i*3
        console.log(" "+tic[t]+" | "+tic[t+1]+" | "+tic[t+2]);
  console.log("-".repeat(12));
}
}

socket.on("connect", () => {
   socket.send("Hello!");
});
socket.on("choose-from-list", data =>{
  console.log(data.join("\n"));
  const chooseNumber = prompt("Choose from 1-3=> ");
  socket.emit("choose-number",chooseNumber);
});
socket.on("draw-board", data =>{
  drawBoard(data)
})
socket.on("choose-from-existing-game", data => {
  console.log("Choose From existing game Id\n Below list of existing game.");
  console.log(data.join("\n"));
  const chooseNumber = prompt("Choose any game Id from above.")
  socket.emit("gameid-choice", chooseNumber)
})

socket.on("choose-from-existing-game-for-spectator", data => {
  console.log("Choose From Ongoing Game Id\nBelow list of ongoing game.");
  console.log(data.join("\n"));
  const chooseNumber = prompt("Choose Any Game Id from above")
  socket.emit("gameid-for-spectator", chooseNumber)
})

socket.on("player2-connect", data =>{
  console.log(data);
})

socket.on("message", data=>{
  console.log(data);
})

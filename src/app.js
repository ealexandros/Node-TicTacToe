const express = require("express");
const path = require('path');
const socket = require("socket.io");

const app = express();
const port = 3000;

const server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
const io = socket(server);

let move_history = ["", "", "", "", "", "", "", "", ""];
let current_player = 0;
var winCombos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let number_players = [];

let won = false;
let draw = false;

// Make a public folder
app.use(express.static(__dirname+'/public'));

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname+'/view/index.html'));
});

const check_for_winner = () => {
    let winner = -1;
    winCombos.forEach((values, index) => {
        if(move_history[values[0]] == move_history[values[1]] && move_history[values[0]] == move_history[values[2]])
            if(move_history[values[0]] == "X")
                winner = number_players[1];
            else if(move_history[values[0]] == "O")
                winner = number_players[0];
    });
    return winner;
}

const check_for_draw = () => {
    let spots = 0;
    move_history.forEach((value, index) => {
        if(value == "") spots++;
    });
    if(spots > 0)
        return false;
    else
        return true;
}

io.on("connection", (socket) => {
    socket.on("new user", (data) => {
        socket.userId = data;
        number_players.push(data);
        if(number_players.length > 1) io.emit("found player", number_players[0]);
    });

    socket.on("move", (data) => {
        if(number_players.length > 1){
            let player = data["player"];
            let position = data["move"];

            if(number_players.indexOf(player) == current_player && won == false && draw == false && move_history[position] == ""){
                move_history[position] = (current_player == 1) ? "X": "O";
                io.emit("get data", move_history);
                (current_player == 1) ? current_player = 0 : current_player = 1;

                let winner = check_for_winner();
                draw = check_for_draw();
                if(winner != -1) io.emit("won", winner);
                if(draw) io.emit("draw", 1);
            }
        }
    });
  
    socket.on("disconnect", () => {
        number_players.splice(number_players.indexOf(socket.userId), 1);
        move_history = ["", "", "", "", "", "", "", "", ""];
        io.emit("player left", move_history);
    });
});

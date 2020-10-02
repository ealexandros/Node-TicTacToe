const socket = io();

const username = Math.floor(Math.random() * 1000000);

const new_move = (position) => {
    socket.emit("move", {"player": username, "move": position});
};

const new_player = () => {
    socket.emit("new user", username);
}
new_player();

const change_message = () => {
    let infoId = document.getElementById("info");
    if(infoId.textContent == "It is your turn!")
        infoId.innerHTML = "It is the enemys turn!";
    else
        infoId.innerHTML = "It is your turn!";
}

socket.on("found player", (data) => {
    if(data == username)
        document.getElementById("info").innerHTML = "It is your turn!";
    else
        document.getElementById("info").innerHTML = "It is the enemys turn!";
});

socket.on("player left", (data) => {
    document.getElementById("info").innerHTML = "The enemy player left the Game";
    data.forEach((value, index) => {
        document.getElementById(String(index)).innerHTML = value;
    });
});

socket.on("won", (data) => {
    if(data == username)
        document.getElementById("info").innerHTML = "You won!";
    else
        document.getElementById("info").innerHTML = "You lost..";
});

socket.on("draw", (data) => {
    document.getElementById("info").innerHTML = "It is a Draw!";
});

socket.on("get data", (data) => {
    change_message();
    data.forEach((value, index) => {
        if(value != -1) document.getElementById(String(index)).innerHTML = value;
    });
});
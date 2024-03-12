const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { getRandomColor } = require("./utils");

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers += 1;

    socket.emit('connection', activeUsers.length);

    socket.on('registration', ({ name, idx }) => {
        io.emit('registration', { name, idx, color: getRandomColor(0.15) });
    })

    socket.on('move', ({ start, end }) => {
        socket.broadcast.emit('move', {start, end})
    })

    socket.on('disconnect', () => {
        activeUsers -= 1;
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
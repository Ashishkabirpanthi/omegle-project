const express = require('express');
const app = express();
const path = require('path');
const indexRouter = require('./routes');

const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/", indexRouter);

let waitingusers = [];
let roomnames = {
};

io.on('connection', function(socket){
    socket.on('joinroom', function(){
        if(waitingusers.length > 0){
            let partner = waitingusers.shift();
            const roomname = `${socket.id}-${partner.id}`;
            socket.join(roomname);
            partner.join(roomname);
            io.to(roomname).emit("joined" ,roomname);
        }
        else{
            waitingusers.push(socket);
            console.log("you are in waiting-list");
        };
    });

    socket.on('message', function(data){
        socket.broadcast.to(data.room).emit("message", data.message);
    })

    socket.on('disconnect', function(socket){
        let index = waitingusers.findIndex(index => index === socket.id);
    });
})
server.listen(3000, () => console.log('Server is running on port 3000'));
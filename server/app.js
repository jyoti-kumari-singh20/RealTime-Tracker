const express=require('express');
const app= express();
const path=require('path');
const http=require("http");

const socketio=require("socket.io");

// socketio runs on http server
const server=http.createServer(app);

// call socket io
const io=socketio(server);

app.set("view engine","ejs");

// serve static files
app.use(express.static(path.join(__dirname,"../public")));
const users = {};
io.on("connection",function(socket){
    console.log("User connected:", socket.id);
    Object.keys(users).forEach(id => {
    socket.emit("receive-location", {
        id,
        ...users[id]
    });
});
    socket.on("send-location", (data) => {
    users[socket.id] = {
        latitude: data.latitude,
        longitude: data.longitude
    };
    io.emit("receive-location", {
        id: socket.id,
        ...users[socket.id]
    });
    
});
    socket.on("disconnect",function(){
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("user-disconnected",socket.id);
    })
});
app.get("/",function(req,res){
    res.render("index");
});
const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{
    console.log("Server running on port", PORT);
});


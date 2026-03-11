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
app.set(express.static(path.join(__dirname,"public")));

io.on("connection",function(socket){
    socket.on("send-location",(data)=>{
        io.emit("receive-location",{id:socket.id,...data});
    });
    socket.on("disconnect",function(){
        io.emit("user-disconnected",socket.id);
    })
});
app.get("/",function(req,res){
    res.render("index");
});

server.listen(3000,()=>{
    console.log("Server running on port 3000");
});

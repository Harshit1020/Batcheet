const io = require("socket.io")();
const socketapi = {
    io: io
};
// Add your socket.io logic here!
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", id, myname);

        socket.on("messagesend", (message) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log(myname);
            socket.broadcast.to(roomId).emit("AddName", myname);
        });

        socket.on("disconnect", () => {
            socket.broadcast.to(roomId).emit("user-disconnected", id);
        });
    });
});

// end of socket.io logic

module.exports = socketapi;
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user sends their location
  socket.on("sendLocation", (data: { 
    userId: string; 
    latitude: number; 
    longitude: number 
  }) => {
    // Broadcast to all OTHER users
    socket.broadcast.emit("receiveLocation", data);
  });

  socket.on("disconnect", () => {
    // Tell others this user left
    io.emit("userDisconnected", { userId: socket.id });
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("Socket.io server running on port 3001");
});
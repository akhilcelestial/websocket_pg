const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const cors = require("cors");
const db = require('./query')
const socketPort = 8000;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
const { emit } = require("process");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
   cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"],
   },
});
app.use(cors());
app.get('/', (request, response) => {
  response.json({ info: 'Our app is up and running' })
})


const emitMostRecentMessges = () => {
  db.getSocketMessages()
     .then((result) => io.emit("chat message", result))
     .catch(console.log);
};


// connects, creates message, and emits top 10 messages
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("chat message", (msg) => {
     db.createSocketMessage(JSON.parse(msg))
        .then((_) => {
           emitMostRecentMessges();
        })
        .catch((err) => io.emit(err));
});


// close event when user disconnects from app
socket.on("disconnect", () => {
  console.log("user disconnected");
});
});

// Displays in terminal which port the socketPort is running on
server.listen(socketPort, () => {
console.log(`listening on *:${socketPort}`);
});



app.get("/messages", db.getMessages);
app.post("/messages", db.createMessage);
app.listen(port, () => {
  console.log(`App running on ${port}.`)
})


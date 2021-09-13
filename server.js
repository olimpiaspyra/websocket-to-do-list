const express = require('express');
const cors = require('cors');
const socket = require('socket.io');

const app = express();
app.use(cors());

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const tasks = [];

io.on('connection', (socket) => {
  console.log('New client - its id: ', socket.id);
  io.to(socket.id).emit('updateData', tasks);

  socket.on('addTask', ({id, name}) => {
    tasks.push({id, name});
    console.log('Add new task: ', {id, name})
    socket.broadcast.emit('addTask', {id, name});
  });

  socket.on('removeTask', (id) => {
    const index = tasks.indexOf(tasks.find(task => task.id === id));
    console.log('Remove task - its id:', id);
    tasks.splice(index, 1);
    socket.broadcast.emit('removeTask', id);
  });
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});

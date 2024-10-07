const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Add CORS support
const connectDB = require('./config/db'); // Import connectDB function
const app = express();

// Import task routes
const taskRoutes = require('./routes/taskRoutes');

// Create the server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins (you can specify your frontend URL here)
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB using the external config
connectDB(); // Replaces the inline mongoose.connect code

// Middleware
app.use(cors()); // Use CORS
app.use(express.json());

// Use the task routes
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Real-time socket handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle real-time task updates
  socket.on('taskUpdated', (task) => {
    io.emit('updateTasks', task); // Broadcast the updated task to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

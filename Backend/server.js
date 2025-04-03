// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes

// Load environment variables from .env file
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend origin
    credentials: true
}));
// ** IMPORTANT: Increase JSON body limit for Base64 strings **
app.use(express.json({ limit: '10mb' })); // Adjust '10mb' as needed
app.use(express.urlencoded({ extended: false, limit: '10mb' })); // Also for URL-encoded if used

// Define Routes
app.get('/api', (req, res) => res.send('Quiz API Running')); // Simple test route
app.use('/api/quizzes', quizRoutes); // Mount quiz routes
app.use('/api/users', userRoutes); // Mount user routes <--- ADD THIS LINE

// Basic Error Handling (can be enhanced)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000; // Use port from .env or default

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
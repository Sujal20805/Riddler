// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const { protect } = require('./middleware/authMiddleware'); // If needed globally

dotenv.config(); // Load environment variables from .env file

connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your Vite frontend dev server
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // If you need to handle cookies/sessions later
}));

// Increase payload size limit for Base64 images if necessary
app.use(express.json({ limit: '50mb' })); // Allow larger JSON payloads
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Allow larger URL-encoded payloads


// API Routes
app.get('/api', (req, res) => { // Simple test route
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);


// --- Basic Error Handling Middleware --- (Place after routes)
// 404 Not Found Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// General Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Use existing status code if set, otherwise default to 500
    res.status(statusCode);
    res.json({
        message: err.message,
        // Provide stack trace only in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
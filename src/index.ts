import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vectorRoutes from './routes/vector.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vector', vectorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
import { Router } from 'express';
import { splitTextAndUpsert, queryByText } from '../services/vector.service.js';

const router = Router();

// Route to create and upsert vectors
router.post('/upsert', async (req, res) => {
    try {
        const { id, nombre, descripcion, chunkSize } = req.body;
        
        if (!id || !nombre || !descripcion) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await splitTextAndUpsert(id, nombre, descripcion, chunkSize);
        res.json({ message: 'Vectors created and upserted successfully' });
    } catch (error) {
        console.error('Error in upsert route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to query vectors
router.post('/query', async (req, res) => {
    try {
        const { queryText, topK } = req.body;
        
        if (!queryText) {
            return res.status(400).json({ error: 'Query text is required' });
        }

        const results = await queryByText(queryText, topK);
        res.json(results);
    } catch (error) {
        console.error('Error in query route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

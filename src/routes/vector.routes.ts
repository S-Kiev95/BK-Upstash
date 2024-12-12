import { Router } from 'express';
import { splitTextAndUpsert, queryByText } from '../services/vector.service.js';

const router = Router();

// Route to create and upsert vectors
router.post('/upsert', async (req, res) => {
    try {
        const { id, nombre, descripcion, costo, chunkSize } = req.body;
        
        if (!id || !nombre || !descripcion || !costo) {
            return res.status(400).json(false);
        }

        const result = await splitTextAndUpsert(id, nombre, descripcion, costo, chunkSize);
        res.json(result);
    } catch (error) {
        console.error('Error in upsert route:', error);
        res.json(false);
    }
});

// Route to query vectors
router.post('/query', async (req, res) => {
    try {
        const { queryText, topK } = req.body;
        
        if (!queryText) {
            return res.status(400).json(false);
        }

        const results = await queryByText(queryText, topK);
        if (results === false) {
            return res.json(false);
        }
        res.json(results);
    } catch (error) {
        console.error('Error in query route:', error);
        res.json(false);
    }
});

// Route to query multiple products
router.post('/queryMultiple', async (req, res) => {
    try {
        const { productos } = req.body;
        
        if (!Array.isArray(productos)) {
            return res.json(false);
        }

        const results = [];
        const notFound = [];
        let total = 0;
        
        for (const producto of productos) {
            if (!producto.nombreProducto || typeof producto.cantidad !== 'number') {
                return res.json(false);
            }

            const queryResult = await queryByText(producto.nombreProducto);
            if (queryResult === false) {
                return res.json(false);
            }
            
            if (queryResult && queryResult.length > 0) {
                const firstResult = queryResult[0];
                if (firstResult?.metadata?.costo != null && !isNaN(firstResult.metadata.costo)) {
                    const subtotal = firstResult.metadata.costo * producto.cantidad;
                    total += subtotal;
                    
                    results.push({
                        id: firstResult.metadata.id,
                        nombre: firstResult.metadata.text,
                        cantidad: producto.cantidad,
                        costo: firstResult.metadata.costo,
                        subtotal: subtotal
                    });
                } else {
                    console.warn(`No valid cost found for product: ${producto.nombreProducto}`);
                }
            } else {
                notFound.push(producto.nombreProducto);
            }
        }

        res.json({
            found: results,
            notFound: notFound,
            total: total
        });
    } catch (error) {
        console.error('Error in queryMultiple route:', error);
        res.json(false);
    }
});

export default router;

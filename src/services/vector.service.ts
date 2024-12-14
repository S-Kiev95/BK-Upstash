import { OpenAI } from 'openai';
import { Index } from '@upstash/vector';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

type Metadata = {
    id: string,
    nombre: string,
    descripcion: string,
    costo: number,
    precioBase: number,
    text: string
}

const index = new Index<Metadata>({
    url: process.env.UPSTASH_VECTOR_URL!,
    token: process.env.UPSTASH_VECTOR_TOKEN!,
});

// Función para generar embeddings para un texto dado
async function generateEmbeddings(text: string) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
            dimensions: 256,
        });
        if (response.data && response.data.length > 0 && response.data[0].embedding) {
            return response.data[0].embedding;
        } else {
            console.error("Estructura de respuesta inesperada:", JSON.stringify(response, null, 2));
            throw new Error("Estructura de respuesta inesperada, embedding no encontrado.");
        }
    } catch (error) {
        console.error("Error generando embeddings:", error);
        throw error;
    }
}

// Función para dividir texto en fragmentos, generar embeddings y actualizar el índice
export async function splitTextAndUpsert(id: string, nombre: string, descripcion: string, costo: number, precioBase: number, chunkSize = 1000) {
    try {
        const text = `${nombre} ${descripcion}`;
        const chunks = text.match(new RegExp(".{1," + chunkSize + "}", "g")) || [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunkId = `${id}-${i + 1}`;
            const embedding = await generateEmbeddings(chunks[i]);
            
            await index.upsert([{
                id: chunkId,
                vector: embedding,
                metadata: { 
                    id: id,
                    nombre: nombre,
                    descripcion: descripcion,
                    costo: costo,
                    precioBase: precioBase,
                    text: chunks[i] 
                },
            }]);
            
            console.log(`Registro actualizado con ID: ${chunkId}, Texto: ${chunks[i]}`);
        }
        return true;
    } catch (error) {
        console.error("Error en splitTextAndUpsert:", error);
        return false;
    }
}

// Función para consultar el índice por texto y recuperar los K elementos más similares
export async function queryByText(queryText: string, topK = 1) {
    try {
        const queryEmbedding = await generateEmbeddings(queryText);
        const results = await index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true,
        });
        console.log("Resultado", JSON.stringify(results, null, 2));
        return results;
    } catch (error) {
        console.error("Error consultando texto:", error);
        return false;
    }
}

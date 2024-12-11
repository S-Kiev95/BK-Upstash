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
    text: string
}

const index = new Index<Metadata>({
    url: process.env.UPSTASH_VECTOR_URL!,
    token: process.env.UPSTASH_VECTOR_TOKEN!,
});

// Function to generate embeddings for a given text
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
            console.error("Unexpected response structure:", JSON.stringify(response, null, 2));
            throw new Error("Unexpected response structure, embedding not found.");
        }
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw error;
    }
}

// Function to split text into chunks, generate embeddings, and upsert to index
export async function splitTextAndUpsert(id: string, nombre: string, descripcion: string, chunkSize = 1000) {
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
                    text: chunks[i] 
                },
            }]);
            
            console.log(`Record upserted with ID: ${chunkId}, Text: ${chunks[i]}`);
        }
    } catch (error) {
        console.error("Error in splitTextAndUpsert:", error);
        throw error;
    }
}

// Function to query the index by text and retrieve top K similar items
export async function queryByText(queryText: string, topK = 1) {
    const queryEmbedding = await generateEmbeddings(queryText);
    try {
        const results = await index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true,
        });
        console.log("Result", JSON.stringify(results, null, 2));
        return results;
    } catch (error) {
        console.error("Error querying text:", error);
        throw error;
    }
}

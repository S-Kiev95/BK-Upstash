# Upstash Vector Backend

Este es un backend en Node.js que utiliza Upstash Vector Database y OpenAI para generar y consultar embeddings vectoriales.

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crea un archivo `.env` con las siguientes variables:
```
OPENAI_API_KEY=your-openai-api-key
UPSTASH_VECTOR_URL=your-upstash-vector-url
UPSTASH_VECTOR_TOKEN=your-upstash-vector-token
PORT=3000
```

3. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## API Endpoints

### POST /api/vector/upsert
Crea y almacena vectores a partir de texto.

Ejemplo de request:
```json
{
    "id": "1",
    "nombre": "Ejemplo",
    "descripcion": "Esta es una descripción de ejemplo",
    "chunkSize": 1000
}
```

### POST /api/vector/query
Consulta vectores similares.

Ejemplo de request:
```json
{
    "queryText": "texto a buscar",
    "topK": 1
}
```

## Tecnologías Utilizadas

- Node.js
- TypeScript
- Express
- OpenAI API
- Upstash Vector Database

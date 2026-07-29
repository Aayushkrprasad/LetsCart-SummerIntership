// Vector Embedding & Cosine Similarity Engine (384-dimensional vectors)

export function generateEmbedding(text = '') {
    const vector = new Array(384).fill(0);
    if (!text) return vector;

    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = normalized.split(/\s+/).filter(Boolean);

    words.forEach((word) => {
        // Hash word into vector indices
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = (hash << 5) - hash + word.charCodeAt(i);
            hash |= 0;
        }
        const index = Math.abs(hash) % 384;
        vector[index] += 1;
    });

    // Normalize vector length (L2 norm)
    let norm = 0;
    for (let i = 0; i < 384; i++) norm += vector[i] * vector[i];
    norm = Math.sqrt(norm);

    if (norm > 0) {
        for (let i = 0; i < 384; i++) vector[i] /= norm;
    }

    return vector;
}

export function cosineSimilarity(vecA = [], vecB = []) {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

let extractorPromise;

async function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = import("@xenova/transformers").then(({ pipeline }) =>
            pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
        );
    }

    return extractorPromise;
}

export async function generateVector(text){
    const extractor = await getExtractor();
    const feature = await extractor(text, {pooling: 'mean', normalize: true});
    return Array.from(feature.data);
}

export function cosineSimilarity(vec1, vec2)
{
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;

    for(let i=0; i<vec1.length; i++)
    {
        dot += vec1[i] * vec2[i];
        mag1 += vec1[i] * vec1[i];
        mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if(mag1 == 0 || mag2 == 0)
        return 0;

    return dot/(mag1 * mag2);
}
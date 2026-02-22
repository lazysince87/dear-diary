require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Entry = require('../src/models/Entry');
const { generateEmbedding } = require('../src/services/embeddings');

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const entriesWithoutEmbeddings = await Entry.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: undefined },
                { embedding: { $size: 0 } }
            ]
        });

        console.log(`Found ${entriesWithoutEmbeddings.length} entries missing embeddings.`);

        for (const entry of entriesWithoutEmbeddings) {
            if (!entry.content || !entry.content.trim()) {
                console.log(`Skipping entry ${entry._id} because content is empty.`);
                continue;
            }

            console.log(`Generating embedding for entry ${entry._id}...`);
            try {
                const embeddingData = await generateEmbedding(entry.content);
                if (embeddingData && embeddingData.length > 0) {
                    entry.embedding = embeddingData;
                    await entry.save();
                    console.log(`Successfully updated entry ${entry._id}`);
                } else {
                    console.error(`Failed to generate embedding for entry ${entry._id} (returned null/empty)`);
                }
            } catch (err) {
                console.error(`Error processing entry ${entry._id}:`, err);
            }
        }

        console.log('Done backfilling embeddings.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();

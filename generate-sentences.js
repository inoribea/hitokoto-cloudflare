import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sentencesDir = path.join(__dirname, 'sentences');

async function generateSentencesJson() {
    try {
        // 确保 sentences 目录存在
        if (!fs.existsSync(sentencesDir)) {
            fs.mkdirSync(sentencesDir, { recursive: true });
        }

        const files = fs.readdirSync(__dirname);
        const tmpFiles = files.filter(file => file.endsWith('.tmp'));

        if (tmpFiles.length === 0) {
            console.log("No .tmp files found in the current directory.");
            return;
        }

        for (const tmpFile of tmpFiles) {
            const inputFilePath = path.join(__dirname, tmpFile);
            const outputFileName = tmpFile.replace(/\.tmp$/, '.json');
            const outputFilePath = path.join(sentencesDir, outputFileName);

            try {
                const data = fs.readFileSync(inputFilePath, 'utf8');
                const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

                const sentences = lines.map((hitokoto, index) => {
                    const now = Date.now();
                    return {
                        id: index + 1,
                        uuid: uuidv4(),
                        hitokoto: hitokoto,
                        type: "z",
                        from: "inoribea",
                        from_who: "inoribea",
                        creator: "inoribea",
                        creator_uid: "script-generated",
                        reviewer: "script-generated",
                        commit_from: "script",
                        created_at: Math.floor(now / 1000),
                        length: hitokoto.length,
                    };
                });

                fs.writeFileSync(outputFilePath, JSON.stringify(sentences, null, 2), 'utf8');
                console.log(`Successfully generated ${outputFilePath} with ${sentences.length} sentences.`);
            } catch (error) {
                console.error(`Error processing ${tmpFile}:`, error);
            }
        }
        await aggregateSentences(); // 调用聚合函数
    } catch (error) {
        console.error("Error in generateSentencesJson:", error);
    }
}

async function aggregateSentences() {
    const aggregatedData = {};
    try {
        const jsonFiles = fs.readdirSync(sentencesDir).filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            const filePath = path.join(sentencesDir, file);
            const key = file.replace(/\.json$/, '');
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                aggregatedData[key] = JSON.parse(data);
            } catch (error) {
                console.error(`Error reading or parsing ${file}:`, error);
            }
        }

        const outputPath = path.join(sentencesDir, 'index.js');
        const content = `export default ${JSON.stringify(aggregatedData, null, 2)};\n`;
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`Successfully aggregated all sentences into ${outputPath}.`);
    } catch (error) {
        console.error("Error in aggregateSentences:", error);
    }
}

generateSentencesJson().then(() => {
    console.log("Sentence generation and aggregation complete.");
}).catch(error => {
    console.error("An error occurred during sentence processing:", error);
});

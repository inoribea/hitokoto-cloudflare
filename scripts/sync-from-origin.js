import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const originDir = path.join(rootDir, 'origin');
const sentencesDir = path.join(rootDir, 'sentences');

function parseMdFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const sentences = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        const match = trimmed.match(/^\d+:\s*(.+)$/);
        if (match && match[1]) {
            sentences.push(match[1].trim());
        }
    }
    
    return sentences;
}

function readExistingSentences() {
    const zJsonPath = path.join(sentencesDir, 'z.json');
    
    if (!fs.existsSync(zJsonPath)) {
        return [];
    }
    
    try {
        const content = fs.readFileSync(zJsonPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading existing z.json:', error);
        return [];
    }
}

async function syncFromOrigin() {
    try {
        if (!fs.existsSync(sentencesDir)) {
            fs.mkdirSync(sentencesDir, { recursive: true });
        }
        
        if (!fs.existsSync(originDir)) {
            console.log('Origin directory does not exist. Creating...');
            fs.mkdirSync(originDir, { recursive: true });
            return;
        }
        
        const existingSentences = readExistingSentences();
        const existingHitokotos = new Set(existingSentences.map(s => s.hitokoto));
        
        const mdFiles = fs.readdirSync(originDir)
            .filter(file => file.endsWith('.md'));
        
        if (mdFiles.length === 0) {
            console.log('No .md files found in origin directory.');
            return;
        }
        
        let newSentencesCount = 0;
        let nextId = existingSentences.length > 0 
            ? Math.max(...existingSentences.map(s => s.id)) + 1 
            : 1;
        
        for (const mdFile of mdFiles) {
            const mdFilePath = path.join(originDir, mdFile);
            const creatorName = mdFile.replace(/\.md$/, '');
            
            console.log(`Processing ${mdFile}...`);
            
            const sentences = parseMdFile(mdFilePath);
            
            for (const hitokoto of sentences) {
                if (existingHitokotos.has(hitokoto)) {
                    continue;
                }
                
                const now = Date.now();
                const newSentence = {
                    id: nextId++,
                    uuid: uuidv4(),
                    hitokoto: hitokoto,
                    type: "z",
                    from: "origin",
                    from_who: creatorName,
                    creator: creatorName,
                    creator_uid: "script-generated",
                    reviewer: "script-generated",
                    commit_from: "script",
                    created_at: Math.floor(now / 1000),
                    length: hitokoto.length,
                };
                
                existingSentences.push(newSentence);
                existingHitokotos.add(hitokoto);
                newSentencesCount++;
            }
        }
        
        existingSentences.sort((a, b) => a.id - b.id);
        
        const zJsonPath = path.join(sentencesDir, 'z.json');
        fs.writeFileSync(zJsonPath, JSON.stringify(existingSentences, null, 2), 'utf8');
        
        console.log(`Successfully synced ${newSentencesCount} new sentences to z.json`);
        console.log(`Total sentences in z.json: ${existingSentences.length}`);
        
        await aggregateSentences();
        
    } catch (error) {
        console.error('Error in syncFromOrigin:', error);
        process.exit(1);
    }
}

async function aggregateSentences() {
    const aggregatedData = {};
    
    try {
        const jsonFiles = fs.readdirSync(sentencesDir)
            .filter(file => file.endsWith('.json'));
        
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
        console.error('Error in aggregateSentences:', error);
    }
}

syncFromOrigin().then(() => {
    console.log('Sync complete.');
}).catch(error => {
    console.error('An error occurred during sync:', error);
    process.exit(1);
});
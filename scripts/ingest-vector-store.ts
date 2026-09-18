import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const devVarsPath = path.join(rootDir, '.dev.vars');
const downloadsDir = path.join(rootDir, 'downloads');

function getDevVar(key: string): string | undefined {
	if (process.env[key]) return process.env[key];
	if (!fs.existsSync(devVarsPath)) return undefined;

	const content = fs.readFileSync(devVarsPath, 'utf8');
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eqIdx = trimmed.indexOf('=');
		if (eqIdx !== -1) {
			const k = trimmed.slice(0, eqIdx).trim();
			const v = trimmed.slice(eqIdx + 1).trim();
			if (k === key) return v;
		}
	}
	return undefined;
}

function updateDevVar(key: string, value: string): void {
	let content = fs.existsSync(devVarsPath) ? fs.readFileSync(devVarsPath, 'utf8') : '';
	const regex = new RegExp(`^${key}=.*$`, 'm');
	if (regex.test(content)) {
		content = content.replace(regex, `${key}=${value}`);
	} else {
		content = content.trimEnd() + `\n${key}=${value}\n`;
	}
	fs.writeFileSync(devVarsPath, content, 'utf8');
}

async function main() {
	console.log('🚀 Starting OpenAI Vector Store Document Ingestion...');

	const apiKey = getDevVar('OPENAI_API_KEY');
	if (!apiKey) {
		console.error('❌ Error: OPENAI_API_KEY not found in .dev.vars or environment');
		process.exit(1);
	}

	const openai = new OpenAI({ apiKey });

	if (!fs.existsSync(downloadsDir)) {
		console.error(`❌ Error: Downloads directory not found at ${downloadsDir}`);
		process.exit(1);
	}

	const files = fs
		.readdirSync(downloadsDir)
		.filter((f) => f.toLowerCase().endsWith('.pdf'))
		.map((f) => path.join(downloadsDir, f));

	if (files.length === 0) {
		console.error('❌ Error: No PDF documents found in downloads/');
		process.exit(1);
	}

	console.log(`📁 Found ${files.length} PDF documents in downloads/:`);
	for (const f of files) {
		const stat = fs.statSync(f);
		console.log(`   - ${path.basename(f)} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
	}

	// Create Vector Store with static chunking (800 max tokens, 200 overlap)
	console.log('\n📦 Creating vector store "wedontneednukes-research-kb"...');
	const vectorStore = await openai.vectorStores.create({
		name: 'wedontneednukes-research-kb',
		chunking_strategy: {
			type: 'static',
			static: {
				max_chunk_size_tokens: 800,
				chunk_overlap_tokens: 200
			}
		}
	});

	console.log(`✅ Vector Store created: ${vectorStore.id}`);

	console.log('\n📤 Uploading and indexing document batch (this may take 1-2 minutes)...');
	const fileStreams = files.map((filePath) => fs.createReadStream(filePath));

	const batch = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
		files: fileStreams
	});

	console.log(`\n🏁 File batch processing status: ${batch.status}`);
	console.log(`   - Total files: ${batch.file_counts.total}`);
	console.log(`   - Completed: ${batch.file_counts.completed}`);
	console.log(`   - In progress: ${batch.file_counts.in_progress}`);
	console.log(`   - Failed: ${batch.file_counts.failed}`);

	if (batch.file_counts.failed > 0) {
		console.warn(`⚠️ Warning: ${batch.file_counts.failed} file(s) failed indexing.`);
	} else {
		console.log('🎉 All documents successfully indexed into vector store!');
	}

	// Update .dev.vars
	updateDevVar('OPENAI_VECTOR_STORE_ID', vectorStore.id);
	console.log(`\n💾 Saved OPENAI_VECTOR_STORE_ID=${vectorStore.id} to .dev.vars`);
}

main().catch((err) => {
	console.error('❌ Fatal error during vector store ingestion:', err);
	process.exit(1);
});

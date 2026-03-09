import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read HF_TOKEN from .env.local or environment
let HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  try {
    const envFile = readFileSync(resolve(__dirname, '.env.local'), 'utf8');
    const match = envFile.match(/^HF_TOKEN=(.+)/m);
    if (match) HF_TOKEN = match[1].trim();
  } catch {}
}
if (!HF_TOKEN) {
  console.error('ERROR: No HF_TOKEN found. Set it via environment variable or in .env.local');
  process.exit(1);
}

const API_URL = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

const promptTemplate = (age, ethnicity, gender) =>
  `Professional corporate headshot portrait of a ${age}-year-old ${ethnicity} ${gender} smiling warmly, wearing a navy blue company polo shirt, head-and-shoulders framing with generous headroom, centered composition, soft-focus light gray studio backdrop, professional studio lighting with soft key light, photorealistic, high quality, home services company employee`;

const team = [
  { file: 'team-alex-johnson',      age: 45, ethnicity: 'Caucasian',  gender: 'male' },
  { file: 'team-mike-thompson',     age: 35, ethnicity: 'Caucasian',  gender: 'male' },
  { file: 'team-sarah-mitchell',    age: 40, ethnicity: 'Caucasian',  gender: 'female' },
  { file: 'team-james-carter',      age: 50, ethnicity: 'Caucasian',  gender: 'male' },
  { file: 'team-david-chen',        age: 35, ethnicity: 'East Asian', gender: 'male' },
  { file: 'team-marcus-williams',   age: 30, ethnicity: 'Black',      gender: 'male' },
  { file: 'team-emily-rodriguez',   age: 30, ethnicity: 'Latina',     gender: 'female' },
  { file: 'team-lisa-nguyen',       age: 28, ethnicity: 'East Asian', gender: 'female' },
];

async function generateImage(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const imagesDir = resolve(__dirname, 'images');

  for (let i = 0; i < team.length; i++) {
    const member = team[i];
    const prompt = promptTemplate(member.age, member.ethnicity, member.gender);
    const jpgPath = resolve(imagesDir, `${member.file}.jpg`);
    const webpPath = resolve(imagesDir, `${member.file}.webp`);

    console.log(`[${i + 1}/${team.length}] Generating ${member.file}...`);
    console.log(`  Prompt: ${prompt.slice(0, 80)}...`);

    try {
      const imageData = await generateImage(prompt);
      writeFileSync(jpgPath, imageData);
      console.log(`  Saved JPG (${(imageData.length / 1024).toFixed(0)} KB)`);

      // Convert to WebP
      execSync(`ffmpeg -y -i "${jpgPath}" "${webpPath}"`, { stdio: 'pipe' });
      console.log(`  Converted to WebP`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      // Continue with remaining team members
    }

    // Small delay between requests to avoid rate limiting
    if (i < team.length - 1) {
      console.log('  Waiting 2s before next request...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\nDone! All headshots generated.');
}

main();

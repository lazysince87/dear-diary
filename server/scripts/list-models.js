require('dotenv').config({ path: '../.env' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  const models = data.models || [];
  const embedModels = models.filter(m => m.name.includes('embed'));
  console.log(JSON.stringify(embedModels, null, 2));
}

listModels();

/**
 * Script to download face-api.js models
 * Run this script to download the required models for face detection and emotion recognition
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Create models directory in public folder
const modelsDir = path.join(__dirname, '../public/models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('Created models directory:', modelsDir);
}

// Models to download
const models = [
  // Tiny Face Detector model
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    filename: 'tiny_face_detector_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    filename: 'tiny_face_detector_model-shard1'
  },
  // Face Expression model
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
    filename: 'face_expression_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1',
    filename: 'face_expression_model-shard1'
  }
];

// Download function
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Download all models
async function downloadModels() {
  console.log('Downloading face-api.js models...');
  
  for (const model of models) {
    const filePath = path.join(modelsDir, model.filename);
    
    try {
      console.log(`Downloading ${model.filename}...`);
      await downloadFile(model.url, filePath);
      console.log(`Downloaded ${model.filename}`);
    } catch (err) {
      console.error(`Error downloading ${model.filename}:`, err);
    }
  }
  
  console.log('All models downloaded successfully!');
}

// Run the download
downloadModels().catch(console.error);

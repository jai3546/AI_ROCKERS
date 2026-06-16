const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'scratch') {
        searchDir(fullPath, query);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Found "${query}" in: ${fullPath}`);
      }
    }
  }
}

console.log("Searching for 'Document AI'...");
searchDir('d:\\SSOC\\AI_ROCKERS', 'Document AI');

console.log("Searching for 'Upload & Summarize'...");
searchDir('d:\\SSOC\\AI_ROCKERS', 'Upload & Summarize');

console.log("Searching for 'Parse slides'...");
searchDir('d:\\SSOC\\AI_ROCKERS', 'Parse slides');

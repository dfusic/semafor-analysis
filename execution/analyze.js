const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
    // Looks like the data might not be plain HTML... let's check the club page again
    // In our early python script we found `window.__NUXT__` but couldn't parse it
    // Wait, the test python script output was "No Next, Nuxt, or Vue found."
    // Let's actually look at what the sample html is composed of
    const sampleHtml = fs.readFileSync(path.join(__dirname, '..', '.tmp', 'sample_match.html'), 'utf-8');
    
    // Check if there are script tags with interesting data
    const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    let match;
    let count = 0;
    while ((match = scriptRegex.exec(sampleHtml)) !== null) {
        if(match[0].includes('window.') || match[0].includes('var ') || match[0].includes('const ')) {
             console.log(`Script ${count} (Length: ${match[0].length}): `, match[0].substring(0, 150));
        }
        count++;
    }
}

main();

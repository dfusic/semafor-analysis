const axios = require('axios');
const cheerio = require('cheerio');

async function debug() {
    const url = "https://semafor.hns.family/utakmice/100972792/nk-granicar-dj-nk-nedelisce-7-0/";
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    
    // Look for Suci
    console.log("Searching for Suci:");
    $('*').each((i, el) => {
        const text = $(el).contents().filter(function() { return this.type === 'text'; }).text().trim();
        if(text.includes('Suci:')) {
           console.log("Found Suci direct text:", text);
           console.log("Parent HTML:", $(el).parent().html().substring(0, 300));
        }
    });
    
    // Suci might be completely in one string. Let's find "Nikola Kristić"
    $('*').each((i, el) => {
        const text = $(el).text();
        if(text.includes('Nikola Kristić') && text.length < 150) {
            console.log("Found specific Ref in tag:", el.tagName, text.trim());
        }
    });

    // Look for Goal Scorer
    console.log("\nSearching for Joško Rendulić:");
    $('*').each((i, el) => {
        const text = $(el).text();
        if(text.includes('Joško Rendulić') && text.length < 100) {
            console.log(`Found Scorer: <${el.tagName}>`, text.trim().replace(/\s+/g, ' '));
        }
    });
    
    // Look for the specific element containing goals
    // Often it's a list:
    console.log("\nList of all ul > li text (first 50 chars):");
    $('ul li').each((i, el) => {
        const t = $(el).text().replace(/\s+/g, ' ').trim();
        if(t.length > 5 && t.length < 60) {
            console.log(t);
        }
    });
}
debug();

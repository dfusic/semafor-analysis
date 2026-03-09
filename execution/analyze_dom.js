const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function analyzeMatchHtml() {
    const sampleHtml = fs.readFileSync(path.join(__dirname, '..', '.tmp', 'sample_match.html'), 'utf-8');
    const $ = cheerio.load(sampleHtml);
    
    // Date Time Location string: "ŠRC Vlado Leščan Duspe, Đurđevac, 23.08.2025. 17:30"
    const infoTextBlocks = [];
    $('.match-info *').each((i, el) => {
        const text = $(el).contents().filter(function() { return this.type === 'text'; }).text().trim();
        if(text) infoTextBlocks.push(text);
    });
    
    // The entire header area seems to have this info text
    const headerText = $('.competition-title, h1').parent().text().replace(/\s+/g, ' ');
    console.log("Header Area Text: ", headerText.substring(0, 200));
    
    // Look for Službene osobe specifically
    let objText = '';
    $('h3').each((i, el) => {
         if($(el).text().includes('Službene osobe')) {
             objText = $(el).parent().text().replace(/\s+/g, ' ');
         }
         if($(el).text().includes('Igrači')) {
             // check players
         }
    });
    console.log("Službene osobe text: ", objText);

    // Strikers: They are often indicated by an icon next to the player name inside the match timeline or player list
    // Semafor uses a football icon svg or img for goals.
    console.log("\nSearching for Goal markers:");
    $('img[src*="goal"], svg *').each((i, el) => {
         // let's just see if we can find goals by text format.
         // typically "1:0 Name Surname (min')"
    });
    
    // Let's print out all players in the match summary
    const players = [];
    $('.player-name').each((i, el) => players.push($(el).text().trim()));
    if(players.length === 0) {
        // let's find lists or tables
        $('ul li, table tr').each((i, el) => {
            const rowText = $(el).text().replace(/\s+/g, ' ').trim();
            if(rowText.length > 0 && rowText.length < 100) {
               // console.log(`Row: ${rowText}`);
            }
        });
    }
    
    // Goal scorers are typically in a specific div on the match recap page
    // Let's search for the score "7:0" and see what's near it
    console.log("\nScore area:");
    $('*').each((i, el) => {
        const text = $(el).text().trim();
        if(text === '7:0') {
             console.log($(el).parent().parent().html().substring(0, 300));
        }
    });
}

analyzeMatchHtml();

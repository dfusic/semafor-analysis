const axios = require('axios');
const cheerio = require('cheerio');

async function debug() {
    const url = "https://semafor.hns.family/utakmice/100972792/nk-granicar-dj-nk-nedelisce-7-0/";
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    
    // Find lineups sections
    $('.lineup-container, .roster, .match-roster, .team-roster, [class*="roster"], [class*="lineup"]').each((i, el) => {
        console.log("Found roster container class:", $(el).attr('class'));
    });
    
    // Find where the team name is located relative to the players
    console.log("\nSearching for team headers:");
    $('*:contains("NK Nedelišće")').each((i, el) => {
        if($(el).children().length === 0) { // leaf node
           console.log("Leaf node with NK Nedelišće:", el.tagName, $(el).text().trim(), "Parent:", $(el).parent().attr('class') || $(el).parent().get(0).tagName);
        }
    });

}
debug();

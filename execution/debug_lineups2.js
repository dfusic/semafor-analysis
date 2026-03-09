const axios = require('axios');
const cheerio = require('cheerio');

async function debug() {
    const url = "https://semafor.hns.family/utakmice/100972792/nk-granicar-dj-nk-nedelisce-7-0/";
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    
    // Look for lists of players
    let lists = [];
    $('.player-name').each((i, el) => {
       const ul = $(el).closest('ul');
       if (ul.length && !lists.includes(ul.get(0))) {
           lists.push(ul.get(0));
       }
    });
    
    console.log("Found player lists:", lists.length);
    lists.forEach((ul, i) => {
        const prevText = $(ul).prev().text().trim();
        const parentPrevText = $(ul).parent().prev().text().trim();
        const firstPlayer = $(ul).find('.player-name').first().text().replace(/\s+/g, ' ').trim();
        console.log(`List ${i} preceded by: "${prevText}" or parentPrev: "${parentPrevText}" - First player: ${firstPlayer}`);
    });
    
    // Check if team names are nearby
    console.log("\nSearching for class related to lineups");
    $('[class*="lineup"]').first().parent().children().each((i, el) => {
        console.log($(el).prop('tagName'), $(el).attr('class'), $(el).text().substring(0, 50).replace(/\s+/g, ' '));
    });
}
debug();

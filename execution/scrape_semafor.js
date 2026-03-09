const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://semafor.hns.family';

async function fetchHtml(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

async function scrapeMainPage(url) {
    const html = await fetchHtml(url);
    if (!html) return [];
    
    const $ = cheerio.load(html);
    const matchUrls = new Set();
    
    // Semafor typically holds match links in hrefs with "/utakmice/"
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/utakmice/')) {
            const absoluteUrl = new URL(href, BASE_URL).href;
            matchUrls.add(absoluteUrl);
        }
    });

    return Array.from(matchUrls);
}

async function scrapeMatchPage(url, parentClubName) {
    console.log(`Scraping: ${url}`);
    const html = await fetchHtml(url);
    if (!html) return null;

    const $ = cheerio.load(html);

    // Default object
    const matchData = {
        parentClub: parentClubName,
        sourceUrl: url,
        title: "",
        competition: "",
        homeTeam: "",
        awayTeam: "",
        score: "",
        status: "",
        date: "",
        time: "",
        location: "",
        visitors: null,
        referees: [],
        strikers: [], // { player: string, minute: string }
        players: [] // All players in the match
    };

    try {
        // Extraction
        matchData.title = $('h1').text().trim() || $('title').text().replace(" - Hrvatski nogometni savez", "").trim();
        
        // Find main blocks using the text dump from our analyze tool
        const allText = [];
        $('*').each((i, el) => {
            const txt = $(el).contents().filter(function() { return this.type === 'text'; }).text().trim();
            if (txt) allText.push(txt);
        });

        // Date/Time/Location (e.g. "ŠRC Vlado Leščan Duspe, Đurđevac, 23.08.2025. 17:30")
        const dateTimeLocStr = allText.find(t => /\d{2}\.\d{2}\.\d{4}\.?\s*\d{2}:\d{2}/.test(t));
        if (dateTimeLocStr) {
            const parts = dateTimeLocStr.split(',');
            if (parts.length >= 3) {
                const dateTimePart = parts[parts.length - 1].trim(); // "23.08.2025. 17:30"
                const dateMatch = dateTimePart.match(/(\d{2}\.\d{2}\.\d{4}\.?)/);
                const timeMatch = dateTimePart.match(/(\d{2}:\d{2})/);
                
                if(dateMatch) matchData.date = dateMatch[1].replace(/\.$/, '');
                if(timeMatch) matchData.time = timeMatch[1];
                
                matchData.location = parts.slice(0, parts.length - 1).join(', ').trim();
            } else {
                 matchData.location = dateTimeLocStr;
            }
        }

        // Visitors
        const visitorsStr = allText.find(t => t.includes('Gledatelja:'));
        if(visitorsStr) {
            const num = visitorsStr.replace(/[^\d]/g, '');
            if(num) matchData.visitors = parseInt(num, 10);
        }

        // Referees
        const suciIdx = allText.findIndex(t => t.includes('Suci:'));
        if (suciIdx !== -1) {
            const suciLine = allText[suciIdx];
            // Format: "Suci: Nikola Kristić, Josip Brnjaković, Antonio Lukenda." or "Gledatelja: 400Suci: Nikola..."
            const matchSuci = suciLine.match(/Suci:\s*(.*)/);
            if (matchSuci) {
                 const refs = matchSuci[1].replace(/\.$/, '').split(',').map(r => r.trim());
                 matchSuci[1].split(',').forEach(r => matchData.referees.push(r.replace(/\.$/, '').trim()));
            }
        }
        
        if (matchData.referees.length === 0) {
            // Fallback for Glavni sudac block
            $('.officials .official-item, .referees .referee-item, li').each((i, el) => {
                const txt = $(el).text().trim();
                if(txt.includes('Glavni sudac') || txt.includes('Pomoćni sudac')) {
                     matchData.referees.push(txt.replace(/\s+/g, ' '));
                }
            });
        }
        // Basic deduplication
        matchData.referees = [...new Set(matchData.referees)];

        // Goals / Strikers
        // Strikers have format like "Joško Rendulić11'" or "Pedro Godinho Fernandes15'"
        const goalRegex = /^([A-Za-zčćžšđČĆŽŠĐ\s-]+?)(\d+(?:\+\d+)?')$/;
        
        // We look at all LIs specifically as they house the timeline events
        $('li').each((i, el) => {
            const txt = $(el).text().replace(/\s+/g, ' ').trim();
            const matchGoal = txt.match(goalRegex);
            if(matchGoal) {
                // Return formatted "Minute - Name"
                matchData.strikers.push(`${matchGoal[2]} ${matchGoal[1].trim()}`);
            }
        });
        
        // Let's also fallback to previous basic DOM classes if empty, to be safe.
        if (matchData.strikers.length === 0) {
            $('.goal-event, .match-event-goal, li:has(img[src*="goal"])').each((i, el) => {
                const txt = $(el).text().replace(/\s+/g, ' ').trim();
                matchData.strikers.push(txt);
            });
        }
        
        // Basic deduplication for strikers
        matchData.strikers = [...new Set(matchData.strikers)];

        // Extract All Players
        let currentClubName = "";
        
        $('li').each((i, el) => {
            const classAttr = $(el).attr('class') || "";
            if (classAttr.includes('clubName')) {
                currentClubName = $(el).text().trim();
            } else if (classAttr.includes('match_lineup')) {
                // Determine if this player belongs to the club we are currently scraping for
                // We use `.includes` since some names might have "(Đ)" or other slight variations
                const isTargetClub = currentClubName && (currentClubName.includes(parentClubName) || parentClubName.includes(currentClubName));
                
                if (isTargetClub) {
                    const txt = $(el).text().replace(/\s+/g, ' ').trim();
                    // Skip coach
                    if(txt.includes('Trener')) return;
                    
                    const aText = $(el).find('a').first().text().replace(/\s+/g, ' ').trim();
                    if(aText) {
                        matchData.players.push(aText);
                    } else {
                        let clean = txt.replace(/^\d+/, '').replace(/(Igrač|Vratar).*$/, '').trim();
                        clean = clean.replace(/\(C\)/g, '').trim();
                        if (clean.length > 3) {
                            matchData.players.push(clean);
                        }
                    }
                }
            }
        });

        // Final deduplication for players
        matchData.players = [...new Set(matchData.players)];

        // Home / Away teams and score
        const scoreStr = allText.find(t => /^\d+:\d+$/.test(t));
        if (scoreStr) {
            matchData.score = scoreStr;
        }

    } catch (e) {
        console.error("Error parsing details:", e.message);
    }

    return matchData;
}

async function main() {
    console.log("Starting scraping process for multiple clubs...");
    
    const clubs = [
        { name: "NK Graničar (Đ)", url: "https://semafor.hns.family/klubovi/916/nk-granicar-dj/?cid=100970578" },
        { name: "NK Dinamo Predavac", url: "https://semafor.hns.family/klubovi/1378/nk-dinamo-predavac/" },
        { name: "NK Koprivnica", url: "https://semafor.hns.family/klubovi/915/nk-koprivnica/" },
        { name: "NK Slaven Belupo", url: "https://semafor.hns.family/klubovi/914/nk-slaven-belupo/" }
    ];
    
    const allMatchesData = [];

    for (const club of clubs) {
        console.log(`\n--- Processing ${club.name} ---`);
        const matchUrls = await scrapeMainPage(club.url);
        console.log(`Discovered ${matchUrls.length} match URLs for ${club.name}.`);
        
        for (const url of matchUrls) {
            const data = await scrapeMatchPage(url, club.name);
            if (data) {
                allMatchesData.push(data);
            }
            await new Promise(r => setTimeout(r, 600)); // Rate limiting
        }
    }

    // Save to output json
    const outDir = path.join(__dirname, '..', '.tmp');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    
    const outPath = path.join(outDir, 'data.json');
    fs.writeFileSync(outPath, JSON.stringify(allMatchesData, null, 2));
    console.log(`\nSuccessfully saved ${allMatchesData.length} total records to ${outPath}`);
}

main();

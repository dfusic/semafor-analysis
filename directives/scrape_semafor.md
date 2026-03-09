# Scrape HNS Semafor

## Goal
Extract match data for a specific football club (e.g., NK Graničar (Đ)) from the HNS Semafor website and save it as a structured JSON file.

## Inputs
- **Base URL**: The main club page URL (e.g., `https://semafor.hns.family/klubovi/916/nk-granicar-dj/?cid=100970578`).

## Tools/Scripts
- `execution/scrape_semafor.js`

## Instructions
1. The script fetches the main club page.
2. It looks for the section containing the latest matches (e.g., "Treća NL Sjever 25/26").
3. It extracts the `Prethodna utakmica` (Previous matches) and `Sljedeća utakmica` (Next matches) or any matches listed in the recent results. Wait, the page structure might require fetching individual match links.
4. From each match link, the script extracts:
   - Date and Time
   - Location (Home/Away based on the team's position)
   - Number of Visitors
   - Referees
   - Strikers (Goal scorers)
   - The source URL for the match.
5. The extracted data is formatted into a list of dictionaries.

## Outputs
- **File**: `.tmp/data.json`
- **Format**: JSON Array of match objects.

## Edge Cases
- If a match hasn't been played yet, visitors and strikers might be missing. The script should handle `None` gracefully.
- If the HTML structure changes, update the BeautifulSoup selectors in the execution script.
- Ensure the script respects reasonable delays to avoid being blocked.

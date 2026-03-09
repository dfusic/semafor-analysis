import { useMemo } from 'react';
import { ExternalLink, Users, CalendarDays } from 'lucide-react';

export default function SlavenBelupoComparison({ data }) {

  // Filter out intra-group matches ("Dont compare if the match is against one and another")
  const targetClubs = ["NK Slaven Belupo", "NK Dinamo Predavac", "NK Koprivnica"];
  const validMatches = useMemo(() => {
     return data.filter(match => {
         if(!match.title) return false;
         let matchClubCount = 0;
         targetClubs.forEach(tc => {
             if (match.title.includes(tc)) matchClubCount++;
         });
         return matchClubCount < 2; // Keep matches where only ONE of the target clubs is playing
     });
  }, [data]);

  // 1. Player Overlaps Analysis
  const playerOverlaps = useMemo(() => {
     const playerMap = {};
     
     validMatches.forEach(match => {
         if(!targetClubs.includes(match.parentClub) || !match.players) return;
         
         match.players.forEach(p => {
             if(!playerMap[p]) {
                 playerMap[p] = new Set();
             }
             playerMap[p].add(match.parentClub);
         });
     });

     // Filter to players who play in more than 1 of these 3 specific clubs
     const overlaps = Object.entries(playerMap)
         .filter(([_, clubsSet]) => clubsSet.size > 1)
         .map(([name, clubsSet]) => ({
             name,
             clubs: Array.from(clubsSet)
         }))
         .sort((a,b) => b.clubs.length - a.clubs.length);

     return overlaps;
  }, [data]);


  // 2. Schedule Collisions (Matches on the same day)
  const scheduleCollisions = useMemo(() => {
     const dateMap = {};

     validMatches.forEach(match => {
        if(!targetClubs.includes(match.parentClub) || !match.date) return;
        
        if(!dateMap[match.date]) {
            dateMap[match.date] = [];
        }
        
        // Avoid duplicate matches (since they might play each other and we scrape both)
        const isDuplicate = dateMap[match.date].some(m => m.sourceUrl === match.sourceUrl);
        if(!isDuplicate) {
            dateMap[match.date].push({
                club: match.parentClub,
                title: match.title,
                url: match.sourceUrl
            });
        }
     });

     // Filter out dates where only 1 team plays, or dates where Belupo DOESNT play but the other two do (user specifically wants Slaven Belupo context)
     const collisions = Object.entries(dateMap)
         .filter(([_, matchesOnDate]) => {
             const clubsOnDate = matchesOnDate.map(m => m.club);
             return clubsOnDate.length > 1 && clubsOnDate.includes("NK Slaven Belupo");
         })
         .map(([date, matchesOnDate]) => ({ date, matches: matchesOnDate }))
         .sort((a, b) => {
             const [d1, m1, y1] = a.date.split('.');
             const [d2, m2, y2] = b.date.split('.');
             return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
         });

     return collisions;
  }, [data]);

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Player Overlaps */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
           <Users className="mr-2 text-indigo-400" />
           Zajednički igrači (Slaven Belupo / Predavac / Koprivnica)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg w-1/3">Ime igrača</th>
                <th className="px-6 py-3 rounded-tr-lg">Klubovi za koje su igrali</th>
              </tr>
            </thead>
            <tbody>
              {playerOverlaps.length === 0 && <tr><td colSpan="2" className="px-6 py-6 text-center text-gray-500">Nisu pronađeni zajednički igrači.</td></tr>}
              {playerOverlaps.map((p, idx) => (
                <tr key={idx} className="border-b border-[#30363d] hover:bg-[#1f242c] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                     {p.clubs.map(c => (
                         <span key={c} className={`px-2 py-1 rounded text-xs border ${
                             c === "NK Slaven Belupo" ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" :
                             c === "NK Dinamo Predavac" ? "border-green-500 text-green-400 bg-green-500/10" :
                             "border-yellow-600 text-yellow-500 bg-yellow-600/10"
                         }`}>
                             {c}
                         </span>
                     ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Collisions */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
           <CalendarDays className="mr-2 text-rose-400" />
           Preklapanja rasporeda (Slaven Belupo + ostali)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg w-48">Datum</th>
                <th className="px-6 py-3 rounded-tr-lg">Istovremene utakmice</th>
              </tr>
            </thead>
            <tbody>
              {scheduleCollisions.length === 0 && <tr><td colSpan="2" className="px-6 py-6 text-center text-gray-500">Nisu pronađena preklapanja rasporeda.</td></tr>}
              {scheduleCollisions.map((coll, idx) => (
                <tr key={idx} className="border-b border-[#30363d] hover:bg-[#1f242c] transition-colors align-top">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{coll.date}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-2">
                         {coll.matches.map((m, i) => (
                             <div key={i} className="flex items-center space-x-2">
                                <span className={`w-3 h-3 rounded-full ${
                                    m.club === "NK Slaven Belupo" ? "bg-indigo-500" :
                                    m.club === "NK Dinamo Predavac" ? "bg-green-500" :
                                    "bg-yellow-600"
                                }`}></span>
                                <span>{m.title}</span>
                                <a href={m.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                                   <ExternalLink className="w-3 h-3" />
                                </a>
                             </div>
                         ))}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

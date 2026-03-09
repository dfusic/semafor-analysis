import { useState, useMemo } from 'react';
import { ExternalLink, Calendar, MapPin, Users, Award, User, Target, Trophy } from 'lucide-react';

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState('strikers'); // 'strikers' | 'referees' | 'matches'
  
  // Process Data
  const matches = data.filter(m => m.title);
  
  const strikersMap = {};
  const refereesMap = {};

  matches.forEach(match => {
    // Strikers
    match.strikers.forEach(s => {
      // Clean up striker goal string "60' Player Name" to just Player Name if possible
      const nameMatch = s.match(/\d+'\s+(.*)/);
      const name = nameMatch ? nameMatch[1].trim() : s.trim();
      
      if(!strikersMap[name]) strikersMap[name] = { name, goals: 0, matches: [] };
      strikersMap[name].goals += 1;
      if(!strikersMap[name].matches.includes(match.sourceUrl)) {
           strikersMap[name].matches.push({ url: match.sourceUrl, date: match.date });
      }
    });

    // Referees
    match.referees.forEach(r => {
      if(!refereesMap[r]) refereesMap[r] = { name: r, matches: [] };
      refereesMap[r].matches.push({ url: match.sourceUrl, date: match.date, matchTitle: match.title });
    });
  });

  const topStrikers = Object.values(strikersMap).sort((a,b) => b.goals - a.goals);
  const allReferees = Object.values(refereesMap).sort((a,b) => b.matches.length - a.matches.length);

  return (
    <div className="w-full animate-fade-in">
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-[#30363d] pb-2">
        <button 
          onClick={() => setActiveTab('strikers')}
          className={`flex items-center pb-2 px-2 border-b-2 font-medium transition-colors ${activeTab === 'strikers' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          <Target className="w-4 h-4 mr-2" />
          Strikers
        </button>
        <button 
          onClick={() => setActiveTab('referees')}
          className={`flex items-center pb-2 px-2 border-b-2 font-medium transition-colors ${activeTab === 'referees' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          <Award className="w-4 h-4 mr-2" />
          Referees
        </button>
      </div>

      <div className="glass-panel p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
         <Trophy className="mr-2 text-yellow-400" />
         Tablice s podacima
      </h2>
      
      <div className="flex space-x-4 mb-6">
        <button 
           onClick={() => setActiveTab('strikers')}
           className={`px-4 py-2 rounded font-medium transition-colors ${activeTab === 'strikers' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-[#161b22] text-gray-400 border border-[#30363d] hover:bg-[#1f242c]'}`}
        >
          Najbolji strijelci (Golovi)
        </button>
        <button 
           onClick={() => setActiveTab('referees')}
           className={`px-4 py-2 rounded font-medium transition-colors ${activeTab === 'referees' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#161b22] text-gray-400 border border-[#30363d] hover:bg-[#1f242c]'}`}
        >
          Suci (Suđene utakmice)
        </button>
      </div>

      <div className="overflow-x-auto">
         {activeTab === 'strikers' ? (
             <table className="w-full text-left text-sm text-gray-300 animate-fade-in">
                 <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase">
                    <tr>
                       <th className="px-4 py-3 rounded-tl-lg">Ime igrača</th>
                       <th className="px-4 py-3 text-center">Golovi</th>
                       <th className="px-4 py-3 rounded-tr-lg">Poveznice (Minuta Gola)</th>
                    </tr>
                 </thead>
                 <tbody>
                    {topStrikers.length === 0 && <tr><td colSpan="3" className="px-4 py-4 text-center">Nema podataka o strijelcima</td></tr>}
                    {topStrikers.map((s, idx) => (
                        <tr key={idx} className="border-b border-[#30363d] hover:bg-[#1f242c] transition-colors">
                            <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                            <td className="px-4 py-3 text-center text-blue-400 font-bold">{s.goals}</td>
                            <td className="px-4 py-3 flex flex-wrap gap-2">
                                {s.matches.map((m, i) => (
                                    <a key={i} href={m.url} target="_blank" rel="noreferrer" title={m.title} className="inline-flex items-center px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded text-xs hover:border-blue-500 transition-colors">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Min {m.minute}
                                    </a>
                                ))}
                            </td>
                        </tr>
                    ))}
                 </tbody>
             </table>
         ) : (
             <table className="w-full text-left text-sm text-gray-300 animate-fade-in">
                 <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase">
                    <tr>
                       <th className="px-4 py-3 rounded-tl-lg">Ime suca</th>
                       <th className="px-4 py-3 text-center">Utakmice</th>
                       <th className="px-4 py-3 rounded-tr-lg">Poveznice</th>
                    </tr>
                 </thead>
                 <tbody>
                    {allReferees.length === 0 && <tr><td colSpan="3" className="px-4 py-4 text-center">Nema podataka o sucima</td></tr>}
                    {allReferees.map((r, idx) => (
                        <tr key={idx} className="border-b border-[#30363d] hover:bg-[#1f242c] transition-colors">
                            <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                            <td className="px-4 py-3 text-center text-emerald-400 font-bold">{r.matches.length}</td>
                            <td className="px-4 py-3 flex flex-wrap gap-2">
                                {r.matches.map((m, i) => (
                                    <a key={i} href={m.url} target="_blank" rel="noreferrer" title={`Sudio: ${m.title} (${m.date})`} className="inline-flex items-center px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded text-xs hover:border-emerald-500 transition-colors">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        {m.date}
                                    </a>
                                ))}
                            </td>
                        </tr>
                    ))}
                 </tbody>
             </table>
         )}
      </div>
    </div>
    </div>
  );
}

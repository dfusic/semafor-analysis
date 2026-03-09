import { useMemo } from 'react';
import { ExternalLink, Award, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CLUB_COLORS = {
  "NK Graničar (Đ)": "#58a6ff",      // Blue
  "NK Dinamo Predavac": "#3fb950",   // Green
  "NK Koprivnica": "#d29922"         // Yellow/Gold
};

export default function RefereeComparison({ data }) {
  
  // Aggregate data by referee
  const refereeStats = useMemo(() => {
    const map = {};
    
    data.forEach(match => {
      if (!match.title || !match.referees) return;
      
      const club = match.parentClub;
      
      match.referees.forEach(refName => {
         if (!map[refName]) {
            map[refName] = {
               name: refName,
               total: 0,
               clubs: {
                 "NK Graničar (Đ)": [],
                 "NK Dinamo Predavac": [],
                 "NK Koprivnica": []
               }
            };
         }
         
         map[refName].total += 1;
         if (map[refName].clubs[club]) {
            map[refName].clubs[club].push({
                url: match.sourceUrl,
                date: match.date,
                title: match.title
            });
         }
      });
    });
    
    // Sort by total matches officiated
    return Object.values(map).sort((a, b) => b.total - a.total);
    
  }, [data]);

  // Data map for the stacked bar chart (top 15 referees)
  const chartData = useMemo(() => {
    return refereeStats.slice(0, 15).map(ref => ({
      name: ref.name.split(' ').slice(-1)[0], // Just use last name for chart brevity
      fullName: ref.name,
      "NK Graničar (Đ)": ref.clubs["NK Graničar (Đ)"].length,
      "NK Dinamo Predavac": ref.clubs["NK Dinamo Predavac"].length,
      "NK Koprivnica": ref.clubs["NK Koprivnica"].length,
      total: ref.total
    }));
  }, [refereeStats]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg shadow-xl text-sm z-50">
          <p className="text-white font-bold mb-2 pb-1 border-b border-[#30363d]">{data.fullName}</p>
          {payload.map((entry, index) => {
              if (entry.value === 0) return null;
              return (
                <p key={`item-${index}`} style={{ color: entry.color }} className="flex justify-between w-40">
                  <span>{entry.name}:</span>
                  <span className="font-bold">{entry.value}</span>
                </p>
              );
          })}
          <p className="text-gray-400 font-bold flex justify-between w-40 mt-1 pt-1 border-t border-[#30363d]">
            <span>Ukupno utakmica:</span>
            <span>{data.total}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Chart Section */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
           <Scale className="mr-2 text-purple-400" />
           Usporedba najboljih sudaca po klubovima
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
              <XAxis dataKey="name" stroke="#8b949e" tick={{fontSize: 11}} tickMargin={10} interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#8b949e" tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#c9d1d9' }}/>
              <Bar dataKey="NK Graničar (Đ)" stackId="a" fill={CLUB_COLORS["NK Graničar (Đ)"]} />
              <Bar dataKey="NK Dinamo Predavac" stackId="a" fill={CLUB_COLORS["NK Dinamo Predavac"]} />
              <Bar dataKey="NK Koprivnica" stackId="a" fill={CLUB_COLORS["NK Koprivnica"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
           <Award className="mr-2 text-amber-400" />
           Glavni popis sudaca
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Ime suca</th>
                <th className="px-6 py-3 text-center">Ukupno utakmica</th>
                <th className="px-6 py-3">NK Graničar (Đ)</th>
                <th className="px-6 py-3">NK Dinamo Predavac</th>
                <th className="px-6 py-3 rounded-tr-lg">NK Koprivnica</th>
              </tr>
            </thead>
            <tbody>
              {refereeStats.length === 0 && <tr><td colSpan="5" className="px-6 py-4 text-center">Nema dostupnih podataka o sucima.</td></tr>}
              {refereeStats.map((r, idx) => (
                <tr key={idx} className="border-b border-[#30363d] hover:bg-[#1f242c] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{r.name}</td>
                  <td className="px-6 py-4 text-center text-amber-400 font-bold">{r.total}</td>
                  
                  {/* Graničar Links */}
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-1">
                     {r.clubs["NK Graničar (Đ)"].map((m, i) => (
                        <a key={i} href={m.url} target="_blank" rel="noreferrer" title={`${m.title} - ${m.date}`} className="inline-flex items-center justify-center p-1 bg-[#0d1117] border border-[#30363d] rounded hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors">
                           <ExternalLink className="w-3 h-3" />
                        </a>
                     ))}
                     {r.clubs["NK Graničar (Đ)"].length === 0 && <span className="text-gray-600">-</span>}
                     </div>
                  </td>

                  {/* Predavac Links */}
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-1">
                     {r.clubs["NK Dinamo Predavac"].map((m, i) => (
                        <a key={i} href={m.url} target="_blank" rel="noreferrer" title={`${m.title} - ${m.date}`} className="inline-flex items-center justify-center p-1 bg-[#0d1117] border border-[#30363d] rounded hover:border-[#3fb950] hover:text-[#3fb950] transition-colors">
                           <ExternalLink className="w-3 h-3" />
                        </a>
                     ))}
                     {r.clubs["NK Dinamo Predavac"].length === 0 && <span className="text-gray-600">-</span>}
                     </div>
                  </td>

                  {/* Koprivnica Links */}
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-1">
                     {r.clubs["NK Koprivnica"].map((m, i) => (
                        <a key={i} href={m.url} target="_blank" rel="noreferrer" title={`${m.title} - ${m.date}`} className="inline-flex items-center justify-center p-1 bg-[#0d1117] border border-[#30363d] rounded hover:border-[#d29922] hover:text-[#d29922] transition-colors">
                           <ExternalLink className="w-3 h-3" />
                        </a>
                     ))}
                     {r.clubs["NK Koprivnica"].length === 0 && <span className="text-gray-600">-</span>}
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

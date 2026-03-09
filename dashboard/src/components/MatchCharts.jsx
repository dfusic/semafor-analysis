import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { Users, MapPin, Calendar, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg shadow-xl text-sm z-50">
        <p className="font-bold text-white mb-1 pb-1 border-b border-[#30363d]">{point.title}</p>
        <p className="text-gray-400"><span className="text-gray-300 font-semibold">Datum:</span> {point.date} {point.time}</p>
        <p className="text-gray-400"><span className="text-gray-300 font-semibold">Lokacija:</span> {point.location}</p>
        <p className="text-emerald-400 font-bold mt-1 pt-1 border-t border-[#30363d]"><span className="text-gray-300">Gledatelji:</span> {point.visitors}</p>
      </div>
    );
  }
  return null;
};

export default function MatchCharts({ data }) {
  const parsedData = useMemo(() => {
    const acc = {
      timeSeries: [],
      homeAway: { home: 0, away: 0 }
    };

    data.filter(m => m.date && m.visitors !== null).forEach(match => {
      const [day, month, year] = match.date.split('.');
      const formattedDate = `${year}-${month}-${day}`;
      acc.timeSeries.push({
        ...match,
        date: formattedDate,
        displayDate: match.date
      });

      if (match.homeTeam?.includes("Graničar") || (!match.homeTeam && match.location && (match.location.includes("Đurđevac") || match.location.includes("Duspe")))) {
        acc.homeAway.home += match.visitors;
      } else {
        acc.homeAway.away += match.visitors;
      }
    });
    
    return {
      timeSeries: acc.timeSeries.sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-'))),
      homeAwayData: [
        { name: 'Domaćići', value: acc.homeAway.home },
        { name: 'Gosti', value: acc.homeAway.away }
      ]
    };
  }, [data]);

  const COLORS = ['#58a6ff', '#3fb950'];

  if (parsedData.timeSeries.length === 0) {
     return <div className="text-center text-gray-500 py-10">Nema dovoljno podataka za prikaz grafikona.</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in mt-6">
      {/* Time Series Chart */}
      <div className="lg:col-span-2 glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <LineChartIcon className="mr-2 text-blue-400" />
          Broj gledatelja kroz vrijeme
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={parsedData.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#8b949e" tick={{fontSize: 12}} tickMargin={10} />
              <YAxis stroke="#8b949e" tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#58a6ff" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1f6feb', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#58a6ff', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="lg:col-span-1 glass-panel p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <PieChartIcon className="mr-2 text-emerald-400" />
            Raspodjela gledatelja (Domaći vs Gosti)
        </h2>
        <div className="flex-grow flex items-center justify-center -mt-6">
            <div className="h-64 w-full">
                <ResponsiveContainer>
                    <PieChart>
                    <Pie
                        data={parsedData.homeAwayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                    >
                        {parsedData.homeAwayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        formatter={(value) => [`${value} Gledatelja`, '']}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#c9d1d9' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}

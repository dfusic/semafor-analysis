import { useState, useEffect, useMemo } from 'react';
import DataTable from './components/DataTable';
import MatchCharts from './components/MatchCharts';
import RefereeComparison from './components/RefereeComparison';
import SlavenBelupoComparison from './components/SlavenBelupoComparison';
import rawData from './data.json';
import { Activity } from 'lucide-react';

const CLUBS = ["NK Graničar (Đ)", "NK Dinamo Predavac", "NK Koprivnica"];
const TAB_OPTIONS = [...CLUBS, "Usporedba sudaca", "Pregled Slaven Belupa"];

function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(TAB_OPTIONS[0]);

  useEffect(() => {
    // In a real app we might fetch this, but for now we'll just import the JSON
    if (rawData && Array.isArray(rawData)) {
      setData(rawData);
    }
  }, []);

  const clubData = useMemo(() => {
    if (activeTab === "Usporedba sudaca" || activeTab === "Pregled Slaven Belupa") return data;
    return data.filter(m => m.parentClub === activeTab);
  }, [data, activeTab]);

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-6 animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
              Semafor Analitika
            </h1>
            <p className="text-gray-400 text-lg">Pregled i statistika ligaških utakmica</p>
          </div>
          <div className="hidden md:flex items-center justify-center bg-[#161b22] border border-[#30363d] rounded-full p-4 shadow-lg">
             <Activity className="text-emerald-400 w-8 h-8" />
          </div>
        </header>

        {/* Selector Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 border-b border-[#30363d] scrollbar-hide">
             {TAB_OPTIONS.map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-emerald-500 text-white bg-[#161b22]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1f242c]'}`}
               >
                 {tab === "Usporedba sudaca" ? <span className="flex items-center text-purple-400">⚖️ {tab}</span> : 
                  tab === "Pregled Slaven Belupa" ? <span className="flex items-center text-rose-400">🔗 {tab}</span> : tab}
               </button>
             ))}
        </div>

        {clubData.length === 0 ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">
            {data.length === 0 ? "Učitavanje podataka o utakmicama..." : `Nisu pronađene utakmice.`}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {activeTab === "Usporedba sudaca" && <RefereeComparison data={data} />}
            {activeTab === "Pregled Slaven Belupa" && <SlavenBelupoComparison data={data} />}
            {CLUBS.includes(activeTab) && (
                <>
                  {/* Visualizations Module */}
                  <MatchCharts data={clubData} />
                  
                  {/* Data Tables Module */}
                  <DataTable data={clubData} />
                </>
            )}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-[#30363d] text-center text-gray-500 text-sm animate-fade-in">
           <p>Podaci preuzeti sa <a href="https://semafor.hns.family" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">HNS Semafor</a></p>
           <p className="mt-1">Generirano pomoću lokalnog pipelinea</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

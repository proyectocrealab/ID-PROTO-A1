import React from 'react';
import { AnalysisState } from '../types';
import { FORCES_CONFIG } from '../constants';
import { Briefcase, TrendingUp, Globe, Users, Target, ShieldAlert, Zap, Factory } from 'lucide-react';

interface EnvironmentCanvasProps {
  data: AnalysisState;
  id?: string;
}

const EnvironmentCanvas: React.FC<EnvironmentCanvasProps> = ({ data, id }) => {
  
  const renderSectionContent = (categoryKey: string, subKey: string) => {
    // @ts-ignore
    const val = data[categoryKey]?.[subKey];
    if (!val) return <span className="text-gray-400 italic text-xs">Not specified</span>;
    return <span className="text-gray-800 text-xs font-medium">{val}</span>;
  };

  const getForceConfig = (id: string) => FORCES_CONFIG.find(f => f.id === id);

  const KeyTrends = getForceConfig('keyTrends')!;
  const MarketForces = getForceConfig('marketForces')!;
  const IndustryForces = getForceConfig('industryForces')!;
  const MacroForces = getForceConfig('macroEconomicForces')!;

  return (
    <div id={id} className="w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[40px] border-gray-900"></div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* --- TOP: KEY TRENDS --- */}
        <div className="md:col-start-2 flex flex-col items-center">
            <div className={`w-full p-4 rounded-2xl border-2 ${KeyTrends.borderClass} ${KeyTrends.bgClass} min-h-[220px] shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <TrendingUp className={KeyTrends.textClass} size={20} />
                    <h3 className={`font-bold uppercase tracking-wider ${KeyTrends.textClass}`}>{KeyTrends.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {KeyTrends.subSections.map(sub => (
                        <div key={sub.id} className="bg-white/60 p-2 rounded backdrop-blur-sm border border-white/50">
                            <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">{sub.label}</div>
                            <div className="line-clamp-3 leading-tight">{renderSectionContent(KeyTrends.id, sub.id)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- MIDDLE ROW --- */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT: INDUSTRY FORCES */}
            <div className={`w-full p-4 rounded-2xl border-2 ${IndustryForces.borderClass} ${IndustryForces.bgClass} min-h-[300px] shadow-sm transition-all hover:shadow-md flex flex-col`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Factory className={IndustryForces.textClass} size={20} />
                    <h3 className={`font-bold uppercase tracking-wider ${IndustryForces.textClass}`}>{IndustryForces.title}</h3>
                </div>
                <div className="space-y-3 flex-grow">
                     {IndustryForces.subSections.map(sub => (
                        <div key={sub.id} className="bg-white/60 p-2 rounded backdrop-blur-sm border border-white/50">
                            <div className="flex items-start gap-2">
                                <div className="text-[10px] uppercase text-gray-500 font-bold mt-0.5 flex-shrink-0 w-24">{sub.label}</div>
                                <div className="text-xs leading-tight">{renderSectionContent(IndustryForces.id, sub.id)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CENTER: BUSINESS MODEL PLACEHOLDER */}
            <div className="flex items-center justify-center">
                <div className="w-full aspect-square max-w-[250px] bg-gray-900 rounded-lg shadow-xl flex flex-col items-center justify-center text-white p-6 text-center border-4 border-gray-800">
                    <Briefcase size={48} className="mb-4 text-gray-400" />
                    <h4 className="font-bold text-xl mb-2">YOUR BUSINESS MODEL</h4>
                    <p className="text-xs text-gray-400">The environment exerts pressure on this central design.</p>
                </div>
            </div>

            {/* RIGHT: MARKET FORCES */}
            <div className={`w-full p-4 rounded-2xl border-2 ${MarketForces.borderClass} ${MarketForces.bgClass} min-h-[300px] shadow-sm transition-all hover:shadow-md flex flex-col`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Target className={MarketForces.textClass} size={20} />
                    <h3 className={`font-bold uppercase tracking-wider ${MarketForces.textClass}`}>{MarketForces.title}</h3>
                </div>
                <div className="space-y-3 flex-grow">
                     {MarketForces.subSections.map(sub => (
                        <div key={sub.id} className="bg-white/60 p-2 rounded backdrop-blur-sm border border-white/50">
                            <div className="flex items-start gap-2 flex-row-reverse text-right">
                                <div className="text-[10px] uppercase text-gray-500 font-bold mt-0.5 flex-shrink-0 w-24">{sub.label}</div>
                                <div className="text-xs leading-tight">{renderSectionContent(MarketForces.id, sub.id)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* --- BOTTOM: MACRO FORCES --- */}
        <div className="md:col-start-2 flex flex-col items-center">
            <div className={`w-full p-4 rounded-2xl border-2 ${MacroForces.borderClass} ${MacroForces.bgClass} min-h-[220px] shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Globe className={MacroForces.textClass} size={20} />
                    <h3 className={`font-bold uppercase tracking-wider ${MacroForces.textClass}`}>{MacroForces.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {MacroForces.subSections.map(sub => (
                        <div key={sub.id} className="bg-white/60 p-2 rounded backdrop-blur-sm border border-white/50">
                            <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">{sub.label}</div>
                            <div className="line-clamp-3 leading-tight">{renderSectionContent(MacroForces.id, sub.id)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

      <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none">
        Generated by EnvioScan
      </div>
      {data.author && (
          <div className="absolute bottom-4 left-4 text-xs font-semibold text-gray-400 pointer-events-none">
            Analysis by {data.author}
          </div>
      )}
    </div>
  );
};

export default EnvironmentCanvas;

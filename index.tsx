import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
    LayoutDashboard, 
    Edit3, 
    FileText, 
    Download, 
    Sparkles, 
    ChevronRight, 
    Info, 
    CheckCircle2, 
    Loader2,
    ShieldAlert,
    User,
    Trash2,
    Save,
    AlignLeft,
    Upload,
    BarChart3,
    FileUp,
    AlertCircle,
    Activity,
    Briefcase, 
    TrendingUp, 
    Globe, 
    Target, 
    Factory
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// --- TYPES ---

type ForceCategory = 'keyTrends' | 'marketForces' | 'industryForces' | 'macroEconomicForces';

interface AnalysisSection {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  description: string;
}

interface ForceData {
  id: ForceCategory;
  title: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  subSections: AnalysisSection[];
}

interface AnalysisState {
  author: string;
  description: string;
  keyTrends: Record<string, string>;
  marketForces: Record<string, string>;
  industryForces: Record<string, string>;
  macroEconomicForces: Record<string, string>;
}

interface AIInsight {
  opportunities: string[];
  threats: string[];
  strategicAdvice: string;
  dataQualityScore: number;
  dataQualityFeedback: string;
}

interface ComparativeReport {
  executiveSummary: string;
  commonPatterns: string[];
  outliers: string[];
  aggregatedStats: { label: string; count: number; description: string }[];
}

// --- CONSTANTS ---

const INITIAL_STATE: AnalysisState = {
  author: '',
  description: '',
  keyTrends: {
    regulatory: '',
    technology: '',
    societal: '',
    socioeconomic: '',
  },
  marketForces: {
    segments: '',
    needs: '',
    issues: '',
    switchingCosts: '',
    revenue: '',
  },
  industryForces: {
    competitors: '',
    newEntrants: '',
    substitutes: '',
    suppliers: '',
    stakeholders: '',
  },
  macroEconomicForces: {
    globalConditions: '',
    capitalMarkets: '',
    infrastructure: '',
    resources: '',
  },
};

const FORCES_CONFIG: ForceData[] = [
  {
    id: 'keyTrends',
    title: 'Key Trends',
    color: '#eab308', // yellow-500
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    textClass: 'text-yellow-800',
    subSections: [
      { id: 'regulatory', label: 'Regulatory Trends', value: '', placeholder: 'Regulations, taxes, standards...', description: 'Rules and regulations influencing the business model.' },
      { id: 'technology', label: 'Technology Trends', value: '', placeholder: 'Emerging tech, digitization...', description: 'Major technology trends that could threaten or improve your model.' },
      { id: 'societal', label: 'Societal & Cultural Trends', value: '', placeholder: 'Social shifts, cultural changes...', description: 'Major social trends that may influence buyer behavior.' },
      { id: 'socioeconomic', label: 'Socioeconomic Trends', value: '', placeholder: 'Income distribution, education...', description: 'Demographic and economic trends relevant to your market.' },
    ],
  },
  {
    id: 'marketForces',
    title: 'Market Forces',
    color: '#3b82f6', // blue-500
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-800',
    subSections: [
      { id: 'segments', label: 'Market Segments', value: '', placeholder: 'Target groups, niches...', description: 'The market segments you are targeting.' },
      { id: 'needs', label: 'Needs & Demands', value: '', placeholder: 'Underserved needs, desires...', description: 'What customers need and how well they are served.' },
      { id: 'issues', label: 'Market Issues', value: '', placeholder: 'Costs, efficiency...', description: 'Key issues driving the market landscape.' },
      { id: 'switchingCosts', label: 'Switching Costs', value: '', placeholder: 'Lock-in effects, transfer costs...', description: 'Elements preventing customers from switching to competitors.' },
      { id: 'revenue', label: 'Revenue Attractiveness', value: '', placeholder: 'Margins, willingness to pay...', description: 'Pricing power and revenue potential.' },
    ],
  },
  {
    id: 'industryForces',
    title: 'Industry Forces',
    color: '#6366f1', // indigo-500
    bgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    textClass: 'text-indigo-800',
    subSections: [
      { id: 'competitors', label: 'Competitors (Incumbents)', value: '', placeholder: 'Main rivals, their strengths...', description: 'Who are the dominant players in your sector?' },
      { id: 'newEntrants', label: 'New Entrants (Insurgents)', value: '', placeholder: 'Startups, invading players...', description: 'New players entering your space.' },
      { id: 'substitutes', label: 'Substitute Products', value: '', placeholder: 'Alternatives, indirect competition...', description: 'Products/services that could replace yours.' },
      { id: 'suppliers', label: 'Suppliers & Value Chain', value: '', placeholder: 'Key partners, dependencies...', description: 'Key actors in your value chain.' },
      { id: 'stakeholders', label: 'Stakeholders', value: '', placeholder: 'Investors, lobby groups...', description: 'Influential groups upon your organization.' },
    ],
  },
  {
    id: 'macroEconomicForces',
    title: 'Macro-Economic Forces',
    color: '#d97706', // amber-600
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    subSections: [
      { id: 'globalConditions', label: 'Global Market Conditions', value: '', placeholder: 'GDP growth, sentiment...', description: 'Overall economic health.' },
      { id: 'capitalMarkets', label: 'Capital Markets', value: '', placeholder: 'Access to funds, interest rates...', description: 'Availability of capital.' },
      { id: 'infrastructure', label: 'Economic Infrastructure', value: '', placeholder: 'Transport, public services...', description: 'Infrastructure needed to operate.' },
      { id: 'resources', label: 'Commodities & Resources', value: '', placeholder: 'Raw materials, talent costs...', description: 'Cost and availability of essential resources.' },
    ],
  },
];

// --- SERVICES ---

const parseJSON = (text: string) => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return null;
    }
}

const generateInsights = async (data: AnalysisState): Promise<AIInsight | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return {
        opportunities: ["API Key missing - cannot generate insights."],
        threats: [],
        strategicAdvice: "Please configure your environment variables.",
        dataQualityScore: 0,
        dataQualityFeedback: "No API key provided."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze the following Business Model Environment data based on Osterwalder's framework.
    
    Data:
    ${JSON.stringify(data, null, 2)}

    Tasks:
    1. Analyze the input data to identify Opportunities and Threats.
    2. Provide Strategic Advice.
    3. Grade the user's data input quality from 0 to 100.
       - Logic: 0 = No data. 100 = Excellent depth, with at least ~6 relevant, specific data points/insights provided per category (Key Trends, Market Forces, Industry Forces, Macro-Economic Forces).
       - Evaluate RELEVANCE to the 'description' (Project Context). Irrelevant data should not count towards the score.
    
    Output JSON format:
    {
      "opportunities": ["string", "string", ...],
      "threats": ["string", "string", ...],
      "strategicAdvice": "string (concise paragraph)",
      "dataQualityScore": number (0-100),
      "dataQualityFeedback": "string (brief explanation of the score and tips to improve)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                strategicAdvice: { type: Type.STRING },
                dataQualityScore: { type: Type.INTEGER },
                dataQualityFeedback: { type: Type.STRING }
            }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return parseJSON(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

const generateComparativeReport = async (analyses: AnalysisState[]): Promise<ComparativeReport | null> => {
    if (!process.env.API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanData = analyses.map((a, index) => ({
        id: index + 1,
        author: a.author,
        description: a.description,
        data: {
            keyTrends: a.keyTrends,
            marketForces: a.marketForces,
            industryForces: a.industryForces,
            macroEconomicForces: a.macroEconomicForces
        }
    }));
    const prompt = `
      Perform a comparative statistical analysis on the following ${analyses.length} Business Model Environment datasets.
      Datasets: ${JSON.stringify(cleanData, null, 2)}
      Tasks: Identify recurring themes, outliers, and stats.
      Output JSON format: { "executiveSummary": "string", "commonPatterns": ["string"], "outliers": ["string"], "aggregatedStats": [{ "label": "string", "count": number, "description": "string" }] }
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        commonPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                        outliers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        aggregatedStats: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    count: { type: Type.NUMBER },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        const text = response.text;
        if (!text) return null;
        return parseJSON(text);
    } catch (error) {
        console.error("Gemini Comparative Error", error);
        return null;
    }
}

// --- COMPONENTS ---

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
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[40px] border-gray-900"></div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
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
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="flex items-center justify-center">
                <div className="w-full aspect-square max-w-[250px] bg-gray-900 rounded-lg shadow-xl flex flex-col items-center justify-center text-white p-6 text-center border-4 border-gray-800">
                    <Briefcase size={48} className="mb-4 text-gray-400" />
                    <h4 className="font-bold text-xl mb-2">YOUR BUSINESS MODEL</h4>
                    <p className="text-xs text-gray-400">The environment exerts pressure on this central design.</p>
                </div>
            </div>
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
      <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none">Generated by EnvioScan</div>
      {data.author && <div className="absolute bottom-4 left-4 text-xs font-semibold text-gray-400 pointer-events-none">Analysis by {data.author}</div>}
    </div>
  );
};

// --- APP ---

// @ts-ignore
const pdfjs = pdfjsLib.default || pdfjsLib;
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

const STORAGE_KEY = 'ENVIOSCAN_DATA';

const App = () => {
  const [data, setData] = useState<AnalysisState>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch (e) {
        console.error("Failed to load saved data", e);
        return INITIAL_STATE;
    }
  });
  
  const [activeTab, setActiveTab] = useState<ForceCategory>('keyTrends');
  const [viewMode, setViewMode] = useState<'edit' | 'visualize' | 'compare'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [uploadedAnalyses, setUploadedAnalyses] = useState<AnalysisState[]>([]);
  const [comparativeReport, setComparativeReport] = useState<ComparativeReport | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setLastSaved(new Date());
      } catch (e) {
          console.error("Failed to save data", e);
      }
  }, [data]);

  const handleInputChange = (category: ForceCategory, field: string, value: string) => {
    setData(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setData(prev => ({ ...prev, author: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleReset = () => {
      if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
          setData(INITIAL_STATE);
          setInsights(null);
          localStorage.removeItem(STORAGE_KEY);
      }
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    const result = await generateInsights(data);
    setInsights(result);
    setIsGenerating(false);
    setViewMode('visualize');
  };

  const handleSaveProgress = () => {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `envioscan_progress_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleLoadProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              const parsed = JSON.parse(content);
              if (parsed.keyTrends && parsed.marketForces && parsed.industryForces && parsed.macroEconomicForces) {
                   if(window.confirm("This will overwrite your current work. Continue?")) {
                       setData(parsed);
                   }
              } else {
                  alert("Invalid project file format.");
              }
          } catch (err) {
              console.error("Failed to load file", err);
              alert("Error reading file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('canvas-export-target');
    if (!element) return;
    try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        pdf.setProperties({ title: 'Environment Analysis', subject: JSON.stringify(data), author: data.author, creator: 'EnvioScan App' });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        if (insights) {
            pdf.addPage();
            pdf.setFontSize(20);
            pdf.text("AI Strategic Analysis", 20, 20);
            let y = 30;
            if (data.author) { pdf.setFontSize(10); pdf.setTextColor(100); pdf.text(`Prepared by: ${data.author}`, 20, y); y += 6; } 
            if (data.description) {
                pdf.setFontSize(10); pdf.setTextColor(100);
                const descLines = pdf.splitTextToSize(data.description, 250);
                pdf.text(descLines, 20, y);
                y += (descLines.length * 5) + 10;
            } else { y += 10; }
            pdf.setFillColor(243, 244, 246);
            pdf.rect(20, y, 100, 20, 'F');
            pdf.setFontSize(12);
            pdf.setTextColor(55, 65, 81);
            pdf.text(`Data Quality Score: ${insights.dataQualityScore}/100`, 25, y + 8);
            pdf.setFontSize(9);
            pdf.text(pdf.splitTextToSize(insights.dataQualityFeedback || "", 90), 25, y + 14);
            y += 28;
            pdf.setFontSize(14); pdf.setTextColor(22, 163, 74); pdf.text("Opportunities", 20, y);
            pdf.setFontSize(10); pdf.setTextColor(0,0,0); y += 10;
            insights.opportunities.forEach(op => { const lines = pdf.splitTextToSize(`• ${op}`, 250); pdf.text(lines, 20, y); y += (lines.length * 5) + 2; });
            y += 10; pdf.setFontSize(14); pdf.setTextColor(220, 38, 38); pdf.text("Threats", 20, y);
            pdf.setFontSize(10); pdf.setTextColor(0,0,0); y += 10;
            insights.threats.forEach(th => { const lines = pdf.splitTextToSize(`• ${th}`, 250); pdf.text(lines, 20, y); y += (lines.length * 5) + 2; });
            y += 10; pdf.setFontSize(14); pdf.setTextColor(37, 99, 235); pdf.text("Strategic Advice", 20, y);
            pdf.setFontSize(10); pdf.setTextColor(0,0,0); y += 10;
            const adviceLines = pdf.splitTextToSize(insights.strategicAdvice, 250);
            pdf.text(adviceLines, 20, y);
        }
        pdf.save('environment-analysis.pdf');
    } catch (err) { console.error("PDF Export failed", err); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newAnalyses: AnalysisState[] = [];
    setIsComparing(true);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            const metadata = await pdf.getMetadata();
            if (metadata?.info?.Subject) {
                const json = JSON.parse(metadata.info.Subject);
                if (json.keyTrends && json.marketForces) { newAnalyses.push(json); }
            }
        } catch (error) { console.error(`Error parsing file ${file.name}`, error); }
    }
    setUploadedAnalyses(prev => [...prev, ...newAnalyses]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsComparing(false);
  };

  const runComparison = async () => {
      if (uploadedAnalyses.length === 0) return;
      setIsComparing(true);
      const report = await generateComparativeReport(uploadedAnalyses);
      setComparativeReport(report);
      setIsComparing(false);
  };

  const activeForceConfig = FORCES_CONFIG.find(f => f.id === activeTab);
  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
      if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
  };
  const getScoreLabel = (score: number) => {
      if (score >= 80) return 'Excellent Data Depth';
      if (score >= 50) return 'Moderate Data Depth';
      return 'Insufficient Data';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 text-white p-2 rounded-lg"> <LayoutDashboard size={20} /> </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">EnvioScan</h1>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 hidden sm:block">Business Model Environment Analyst</p>
                    {lastSaved && ( <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1"> <Save size={10} /> Saved </span> )}
                </div>
            </div>
          </div>
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('edit')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'edit' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}> <Edit3 size={16} /> Input </button>
            <button onClick={() => setViewMode('visualize')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'visualize' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}> <FileText size={16} /> Visualize </button>
            <button onClick={() => setViewMode('compare')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'compare' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}> <BarChart3 size={16} /> Compare </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'compare' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Comparative Analysis</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto mt-2">Upload multiple PDF reports generated by EnvioScan to identify patterns.</p>
                    </div>
                    <div className="max-w-xl mx-auto">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full"> <FileUp size={32} /> </div>
                                <div> <h3 className="font-semibold text-gray-900">Click to upload PDFs</h3> <p className="text-sm text-gray-500 mt-1">Select multiple .pdf files exported from EnvioScan</p> </div>
                            </div>
                        </div>
                        {uploadedAnalyses.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Loaded Reports ({uploadedAnalyses.length})</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto mb-6">
                                    {uploadedAnalyses.map((analysis, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">{idx + 1}</div>
                                                <div> <div className="font-medium text-gray-900">{analysis.author || 'Unknown Author'}</div> <div className="text-xs text-gray-500 truncate max-w-[200px]">{analysis.description || 'No description'}</div> </div>
                                            </div>
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={runComparison} disabled={isComparing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                    {isComparing ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />} {isComparing ? 'Analyzing Patterns...' : 'Generate Statistical Report'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {comparativeReport && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"> <Sparkles className="text-indigo-600" size={20} /> Executive Summary </h3>
                            <p className="text-gray-700 leading-relaxed">{comparativeReport.executiveSummary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"> <div className="w-2 h-6 bg-green-500 rounded-full"></div> Common Patterns </h3>
                                <ul className="space-y-3"> {comparativeReport.commonPatterns.map((pat, i) => ( <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg"> <span className="font-bold text-gray-400">0{i+1}</span> {pat} </li> ))} </ul>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"> <div className="w-2 h-6 bg-orange-500 rounded-full"></div> Significant Outliers </h3>
                                <ul className="space-y-3"> {comparativeReport.outliers.map((out, i) => ( <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg"> <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" /> {out} </li> ))} </ul>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Topic Frequency Analysis</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {comparativeReport.aggregatedStats.map((stat, i) => (
                                    <div key={i} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center justify-between mb-2"> <span className="font-bold text-gray-900">{stat.label}</span> <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full"> {stat.count}x </span> </div>
                                        <p className="text-xs text-gray-500">{stat.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
             </div>
        ) : viewMode === 'edit' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-1 space-y-2">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Author</label>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                <User size={16} className="text-gray-400" />
                                <input type="text" value={data.author} onChange={handleAuthorChange} placeholder="Your Name" className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Project Context</label>
                            <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                <AlignLeft size={16} className="text-gray-400 mt-1" />
                                <textarea value={data.description} onChange={handleDescriptionChange} placeholder="Briefly describe the business context..." rows={3} className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400 resize-none" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Analysis Quadrants</h2>
                    {FORCES_CONFIG.map((force) => (
                        <button key={force.id} onClick={() => setActiveTab(force.id)} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${activeTab === force.id ? `bg-white shadow-md ring-1 ring-gray-200 ${force.textClass}` : 'text-gray-600 hover:bg-gray-100'}`}>
                            <span className="font-medium">{force.title}</span> {activeTab === force.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                    <div className="pt-8 space-y-4">
                        <button onClick={handleGenerateInsights} disabled={isGenerating} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed">
                            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} {isGenerating ? 'Analyzing...' : 'Generate Insights'}
                        </button>
                         <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveProgress} className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 transition-all text-sm font-medium" title="Download JSON backup"> <Save size={16} /> Save JSON </button>
                            <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 transition-all text-sm font-medium cursor-pointer"> <Upload size={16} /> Load JSON <input type="file" accept=".json" className="hidden" onChange={handleLoadProgress} /> </label>
                        </div>
                        <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all text-sm"> <Trash2 size={14} /> Reset Data </button>
                        <p className="text-xs text-center text-gray-400">Made by Arturo Zamora</p>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    {activeForceConfig && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                             <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 ${activeForceConfig.bgClass} ${activeForceConfig.textClass}`}> {activeForceConfig.title} </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {activeForceConfig.subSections.map((section) => (
                                    <div key={section.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-800">{section.label}</label>
                                            <div className="group relative cursor-help">
                                                <Info size={14} className="text-gray-400" />
                                                <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"> {section.description} </div>
                                            </div>
                                        </div>
                                        <textarea value={data[activeTab][section.id]} onChange={(e) => handleInputChange(activeTab, section.id, e.target.value)} placeholder={section.placeholder} rows={4} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm resize-none" />
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-end gap-4">
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"> <Download size={18} /> Export PDF </button>
                </div>
                {insights && (
                    <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl border border-indigo-100 p-6 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-indigo-100 pb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"> <Sparkles className="text-indigo-600" size={20} /> Strategic Analysis </h2>
                            <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border ${getScoreColor(insights.dataQualityScore)} transition-colors`}>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                         <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 opacity-30" />
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * insights.dataQualityScore) / 100} className="transition-all duration-1000 ease-out" />
                                        </svg>
                                        <span className="absolute text-xs font-bold">{insights.dataQualityScore}</span>
                                    </div>
                                    <div> <div className="text-xs font-bold uppercase tracking-wide opacity-80">Data Quality</div> <div className="text-sm font-semibold">{getScoreLabel(insights.dataQualityScore)}</div> </div>
                                </div>
                            </div>
                        </div>
                         <div className="mb-6 bg-white/60 p-4 rounded-lg border border-indigo-50 text-sm text-indigo-900 flex items-start gap-3"> <Activity size={16} className="mt-0.5 text-indigo-500 flex-shrink-0" /> <p>{insights.dataQualityFeedback}</p> </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                <h3 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">Opportunities</h3>
                                <ul className="space-y-2"> {insights.opportunities.map((item, i) => ( <li key={i} className="flex items-start gap-2 text-sm text-green-900"> <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 opacity-60" /> <span>{item}</span> </li> ))} </ul>
                            </div>
                            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                                <h3 className="font-bold text-red-800 mb-3 text-sm uppercase tracking-wide">Threats</h3>
                                <ul className="space-y-2"> {insights.threats.map((item, i) => ( <li key={i} className="flex items-start gap-2 text-sm text-red-900"> <ShieldAlert size={16} className="mt-0.5 flex-shrink-0 opacity-60" /> <span>{item}</span> </li> ))} </ul>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">Strategic Advice</h3>
                                <p className="text-sm text-blue-900 leading-relaxed"> {insights.strategicAdvice} </p>
                            </div>
                        </div>
                    </div>
                )}
                <div id="canvas-export-target" className="p-4 bg-white rounded-xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Business Environment Analysis</h2>
                        <p className="text-gray-500">Osterwalder Framework Visualization</p>
                        {data.description && ( <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto border-t border-gray-100 pt-2">{data.description}</p> )}
                    </div>
                    <EnvironmentCanvas data={data} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

// --- ROOT RENDER ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
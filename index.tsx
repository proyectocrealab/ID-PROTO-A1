import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    Factory,
    Key,
    X,
    Search,
    BookOpen,
    HelpCircle,
    GraduationCap,
    Hash,
    Building2,
    Sprout,
    Users,
    FlaskConical,
    Microscope,
    School,
    Lightbulb,
    Trophy,
    Star,
    Crown,
    Sword,
    Scroll,
    Map
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  courseId: string; // New Academic Field
  description: string;
  keyTrends: Record<string, string>;
  marketForces: Record<string, string>;
  industryForces: Record<string, string>;
  macroEconomicForces: Record<string, string>;
}

interface Experiment {
    hypothesis: string;
    method: string;
    metric: string;
}

interface AIInsight {
  opportunities: string[];
  threats: string[];
  strategicAdvice: string;
  prototypingExperiments: Experiment[]; // New Academic Field
  dataQualityScore: number;
  dataQualityFeedback: string;
}

interface ComparativeReport {
  executiveSummary: string;
  commonPatterns: string[];
  outliers: string[];
  aggregatedStats: { label: string; count: number; description: string }[];
  averageDataQualityScore: number;
  keywordTrends: { keyword: string; count: number }[];
}

// --- CONSTANTS ---

const INITIAL_STATE: AnalysisState = {
  author: '',
  courseId: '',
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

const SCENARIO_STARTUP: AnalysisState = {
    author: "VerdeGrow Team A",
    courseId: "ENTR-301",
    description: "Strategic analysis for 'VerdeGrow', a Series A urban vertical farming startup targeting high-end restaurants and eco-conscious grocery chains in metropolitan areas. Focus on premium microgreens and herbs.",
    keyTrends: {
        regulatory: "Increasing urban zoning incentives for green businesses. Stricter food safety regulations for hydroponics. Carbon tax credits implementation favors low-mileage food.",
        technology: "IoT sensors for humidity/soil control becoming cheaper. LED efficiency doubling every 3 years. AI-driven crop cycle management allows for rapid iteration.",
        societal: "Massive shift towards 'hyper-local' food sourcing. Rising concern over pesticide use in traditional farming. Urbanites desiring connection to nature.",
        socioeconomic: "Rising food transport costs due to fuel prices making local production competitive. Middle-class expansion in target cities demanding premium produce."
    },
    marketForces: {
        segments: "High-end restaurants (B2B), Organic grocery chains (B2B), Subscription box for health-conscious households (B2C).",
        needs: "Year-round availability of seasonal crops. Zero-pesticide guarantee. Reduced carbon footprint transparency. Intense flavor profiles.",
        issues: "Price sensitivity in B2C mass market. Skepticism about nutrient density of hydroponic vs soil-grown. Logistics of last-mile delivery.",
        switchingCosts: "Restaurants have long-term contracts with broadline distributors. Low switching costs for individual consumers unless subscription model is sticky.",
        revenue: "High margins on specialty herbs and microgreens. Recurring revenue model via subscriptions. Premium pricing justifiable by 'freshness' factor."
    },
    industryForces: {
        competitors: "Traditional rural organic farms (seasonal limits). Greenhouse importers (high carbon footprint). Other small urban setups (mostly hobbyist scale).",
        newEntrants: "Tech giants investing in AgTech (e.g., Amazon, Google Ventures). Container farming franchises lowering entry barriers.",
        substitutes: "Home gardening kits. Traditional frozen organic produce. Farmers markets.",
        suppliers: "Dependency on specific nutrient solution providers. Reliance on local energy grid (high electricity usage). Seed suppliers.",
        stakeholders: "Local city council (zoning). Environmental advocacy groups. Investors seeking ESG targets."
    },
    macroEconomicForces: {
        globalConditions: "Supply chain disruptions affecting fertilizer availability. Climate change causing volatility in traditional agriculture pricing.",
        capitalMarkets: "High interest from venture capital in ClimateTech and AgTech. Interest rates rising making hardware financing expensive.",
        infrastructure: "Availability of retrofittable warehouse space in city centers. Reliable fiber internet for IoT systems.",
        resources: "Water scarcity increasing value of water-efficient hydroponics. Rising energy costs posing a threat to operational opex."
    }
};

const SCENARIO_CORPORATE: AnalysisState = {
    author: "AgriCorp Global Analysis",
    courseId: "MGMT-450",
    description: "Strategic analysis for 'AgriCorp Global', a massive traditional agriculture conglomerate launching a vertical farming division. Focus on mass-market scale, supply chain efficiency, and automated monoculture.",
    keyTrends: {
        regulatory: "Lobbying for subsidies for large-scale indoor farming infrastructure. Food safety standardization to block smaller players.",
        technology: "Robotics and full automation to replace manual labor. Proprietary seed genetics optimized for indoor yield. Big Data analytics for yield prediction.",
        societal: "Consumer demand for consistent quality and lower prices. Distrust of 'factory farming' branding.",
        socioeconomic: "Labor shortages in traditional farming pushing towards automation. Inflation squeezing consumer wallets, demanding cheaper produce."
    },
    marketForces: {
        segments: "Mass market supermarkets (B2B). Fast food chains requiring consistent lettuce/tomato supply.",
        needs: "Consistency of supply volume. Lowest possible unit cost. Long shelf life.",
        issues: "High energy consumption per calorie produced. Difficulty differentiating brand in a commodity market.",
        switchingCosts: "Very high for supermarkets due to volume requirements; they need partners who can guarantee tons of produce daily.",
        revenue: "Low margin, high volume. Revenue stability via long-term contracts with major retailers."
    },
    industryForces: {
        competitors: "Other major ag-giants pivoting to indoor. Innovative startups (like VerdeGrow) capturing the premium niche.",
        newEntrants: "Logistics companies (e.g., Amazon) entering the fresh food space vertically.",
        substitutes: "Traditional field-grown crops (still much cheaper). Imported greenhouse produce.",
        suppliers: "Internal vertical integration (owning the seed and nutrient supply). Heavy reliance on energy providers.",
        stakeholders: "Shareholders demanding quarterly growth. Labor unions resisting automation. National agricultural regulators."
    },
    macroEconomicForces: {
        globalConditions: "Geopolitical instability affecting fertilizer trade. Climate resilience becoming a national security issue.",
        capitalMarkets: "Access to cheap corporate debt for massive infrastructure build-outs. Mergers and Acquisitions activity heating up.",
        infrastructure: "Need for massive energy grid upgrades to support Giga-factories. Transport logistics networks.",
        resources: "Energy security is the primary risk factor. Land scarcity near logistics hubs."
    }
};

const SCENARIO_NONPROFIT: AnalysisState = {
    author: "Student Group 3",
    courseId: "SOC-200",
    description: "Strategic analysis for 'UrbanRoots', a community-owned vertical farming cooperative in a food desert. Focus on food security, education, and job training for at-risk youth.",
    keyTrends: {
        regulatory: "Government grants for food security initiatives. Educational credits for urban farming programs.",
        technology: "Open-source farming hardware (low cost). DIY hydroponic systems. Knowledge sharing platforms.",
        societal: "Community empowerment and health education. Combatting food deserts. 'Food Justice' movements.",
        socioeconomic: "High unemployment in target neighborhoods. Lack of access to fresh produce in low-income areas."
    },
    marketForces: {
        segments: "Local residents (B2C). School cafeterias (B2G). Local food banks.",
        needs: "Affordable, nutritious food. Skill development and employment. Community gathering spaces.",
        issues: "Inability of target market to pay premium prices. Reliance on volunteer labor.",
        switchingCosts: "Social and emotional connection to the co-op creates high loyalty. Low economic barrier to switch to cheap processed food.",
        revenue: "Grant funding. Donations. Subsidized vegetable sales. Education workshop fees."
    },
    industryForces: {
        competitors: "Fast food chains (cheap, unhealthy calories). Dollar stores (lack of fresh produce).",
        newEntrants: "Gentrification pushing out local community spaces. Corporate CSR initiatives competing for same grant money.",
        substitutes: "Food pantries (canned goods). Community gardens (seasonal).",
        suppliers: "Donated equipment. Municipal water access. partnerships with universities for seeds.",
        stakeholders: "Local community board. Grant foundations. City government. Local schools."
    },
    macroEconomicForces: {
        globalConditions: "Inflation disproportionately affecting low-income families. Global food price spikes increasing need for local security.",
        capitalMarkets: "Reliance on philanthropic capital rather than venture capital. Impact investing trends.",
        infrastructure: "Repurposing abandoned urban buildings. Access to public transit for community access.",
        resources: "Volunteer labor availability. Water rights in urban centers."
    }
};

const EXAMPLE_INSIGHTS: AIInsight = {
    opportunities: [
        "Capitalize on 'hyper-local' trends by partnering with high-end restaurants for exclusive 'harvest-to-plate' marketing.",
        "Leverage carbon tax credits to subsidize initial hardware costs.",
        "Develop proprietary AI crop cycle management as a licensable SaaS product for other growers."
    ],
    threats: [
        "Energy price spikes could erode margins significantly compared to traditional farming.",
        "Market saturation from new container farming franchises lowering entry barriers.",
        "Consumer skepticism regarding the nutrient profile of hydroponic produce."
    ],
    strategicAdvice: "VerdeGrow should focus aggressively on the B2B high-end restaurant segment to secure high-margin, consistent contracts. Invest in solar offsets to mitigate energy risks and lean into the 'zero-carbon' branding which traditional farms cannot claim. Avoid the mass market B2C race until scale reduces unit economics.",
    prototypingExperiments: [
        {
            hypothesis: "High-end chefs value 'zero-mile' freshness over lower prices.",
            method: "Smoke Test: Create a landing page offering 'Same-Day Harvest' delivery at a 20% premium vs. standard organic. Run targeted ads to local executive chefs.",
            metric: "Click-through rate > 3% and at least 5 pre-orders/LOIs signed."
        },
        {
            hypothesis: "Consumers are skeptical of hydroponic nutrient density.",
            method: "A/B Testing: In-store sampling booth comparing our produce vs. soil-grown. Half the time display nutritional lab results next to samples.",
            metric: "Purchase conversion rate increases by 15% when lab results are displayed."
        },
        {
            hypothesis: "Subscription churn will be high due to delivery logistics.",
            method: "Concierge MVP: Manually deliver 50 boxes to beta testers for 4 weeks. Interview every cancellation personally.",
            metric: "Retention rate > 80% after month 1."
        }
    ],
    dataQualityScore: 95,
    dataQualityFeedback: "Excellent depth of analysis. You have identified specific, actionable trends and forces across all quadrants. The connection between regulatory incentives and technology trends is particularly strong."
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

// --- GAMIFICATION CONSTANTS ---
const GAME_LEVELS = [
    { name: 'Novice Observer', minXP: 0, color: 'text-gray-600', icon: User },
    { name: 'Data Explorer', minXP: 20, color: 'text-blue-600', icon: Search },
    { name: 'Pattern Seeker', minXP: 45, color: 'text-purple-600', icon: Microscope },
    { name: 'Strategy Architect', minXP: 70, color: 'text-orange-600', icon: Building2 },
    { name: 'Grandmaster', minXP: 90, color: 'text-yellow-600', icon: Crown }
];

const BADGES = [
    { id: 'trends', name: 'Trend Spotter', icon: TrendingUp, description: 'Identify all key trends', criteria: (d: AnalysisState) => Object.values(d.keyTrends).every(v => v.length > 20) },
    { id: 'market', name: 'Market Maven', icon: Target, description: 'Define all market forces', criteria: (d: AnalysisState) => Object.values(d.marketForces).every(v => v.length > 20) },
    { id: 'industry', name: 'Industry Insider', icon: Factory, description: 'Analyze all industry forces', criteria: (d: AnalysisState) => Object.values(d.industryForces).every(v => v.length > 20) },
    { id: 'macro', name: 'Macro Master', icon: Globe, description: 'Map all macro forces', criteria: (d: AnalysisState) => Object.values(d.macroEconomicForces).every(v => v.length > 20) },
    { id: 'story', name: 'Visionary', icon: Lightbulb, description: 'Write a detailed project context (>150 chars)', criteria: (d: AnalysisState) => d.description.length > 150 }
];

// --- SERVICES ---

const parseJSON = (text: string) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start !== -1 && end !== -1 && end > start) {
            const jsonCandidate = text.substring(start, end + 1);
            return JSON.parse(jsonCandidate);
        }
        
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return null;
    }
}

const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

const generateInsights = async (data: AnalysisState, apiKey: string, isAcademicMode: boolean): Promise<AIInsight | null> => {
  if (!apiKey) {
    console.warn("API Key missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Custom prompt construction based on mode
  let roleInstruction = "";
  
  if (isAcademicMode) {
      roleInstruction = `
      ROLE: Gamified Strategy Tutor & Quest Giver.
      GOAL: Guide the student through the 'Game of Business Strategy'. DO NOT give them the answers. Give them feedback to level up their analysis.
      
      TONE: Encouraging, Challenging, Gamified (use terms like 'XP', 'Quest', 'Boss Fight').

      SPECIFIC INSTRUCTIONS FOR JSON OUTPUT MAPPING:
      1. "opportunities": List 3 specific strengths in their input. Label these as "XP GAINS". (e.g., "XP GAIN: Excellent identification of regulatory headwinds.")
      2. "threats": List 3 specific missing data points or weak assumptions. Label these as "ACTIVE QUESTS". (e.g., "QUEST: Investigate the specific switching costs for your customer segment.")
      3. "strategicAdvice": Provide ONE major complex question that connects two quadrants. Label this as "BOSS FIGHT". (e.g., "BOSS FIGHT: How does your Technology Trend of AI specifically mitigate the Industry Force of Supplier Power?")
      4. "prototypingExperiments": Return an empty array [].
      5. "dataQualityScore": Grade strictly on research depth (0-100).
      `;
  } else {
      roleInstruction = `
      ROLE: Senior Strategy Consultant.
      GOAL: Provide executive-level strategic foresight and risk mitigation strategies.
      TONE: Professional, concise, action-oriented.
      
      SPECIFIC INSTRUCTIONS:
      1. Analyze Opportunities and Threats: Focus on macro-economic risks and strategic positioning.
      2. Strategic Advice: Focus on execution, scalability, and competitive advantage.
      3. Prototyping Experiments: Suggest 3 specific experiments (Hypothesis/Method/Metric) to validate business assumptions.
      4. Grading: Assess the completeness of the data for strategic decision making.
      `;
  }

  const prompt = `
    ${roleInstruction}
    
    Analyze the following Business Model Environment data based on Osterwalder's framework.
    
    Data:
    ${JSON.stringify(data, null, 2)}

    Output JSON format:
    {
      "opportunities": ["string", "string", ...],
      "threats": ["string", "string", ...],
      "strategicAdvice": "string (concise paragraph)",
      "prototypingExperiments": [
         { "hypothesis": "string", "method": "string", "metric": "string" },
         ...
      ],
      "dataQualityScore": number (0-100),
      "dataQualityFeedback": "string"
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
                prototypingExperiments: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            hypothesis: { type: Type.STRING },
                            method: { type: Type.STRING },
                            metric: { type: Type.STRING }
                        }
                    }
                },
                dataQualityScore: { type: Type.INTEGER },
                dataQualityFeedback: { type: Type.STRING }
            },
            required: ["opportunities", "threats", "strategicAdvice", "prototypingExperiments", "dataQualityScore", "dataQualityFeedback"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return parseJSON(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const generateComparativeReport = async (analyses: AnalysisState[], apiKey: string): Promise<ComparativeReport | null> => {
    if (!apiKey) return null;
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
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
      
      Tasks: 
      1. Identify recurring themes, outliers, and stats.
      2. Analyze the 'keyTrends', 'marketForces', 'industryForces', and 'macroEconomicForces' text to count mentions of specific high-impact keywords: 'AI', 'Sustainability', 'Digital', 'Climate', 'Regulation', 'Supply Chain'.
      3. Grade each dataset's depth/quality (0-100) based on specificity and completeness, then calculate the average score.

      Output JSON format: 
      { 
        "executiveSummary": "string", 
        "commonPatterns": ["string"], 
        "outliers": ["string"], 
        "aggregatedStats": [{ "label": "string", "count": number, "description": "string" }],
        "keywordTrends": [{ "keyword": "string", "count": number }],
        "averageDataQualityScore": number
      }
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
                        },
                        averageDataQualityScore: { type: Type.NUMBER },
                        keywordTrends: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    keyword: { type: Type.STRING },
                                    count: { type: Type.NUMBER }
                                }
                            }
                        }
                    },
                    required: ["executiveSummary", "commonPatterns", "outliers", "aggregatedStats", "averageDataQualityScore", "keywordTrends"]
                }
            }
        });
        const text = response.text;
        if (!text) return null;
        return parseJSON(text);
    } catch (error) {
        console.error("Gemini Comparative Error", error);
        throw error;
    }
}

// --- COMPONENTS ---

const Tooltip = ({ content, children, position = 'top', className = '' }: { content: React.ReactNode; children?: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right', className?: string }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div className={`absolute ${positionClasses[position]} px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] min-w-[150px] max-w-[250px] border border-gray-700/50 text-center`}>
        {content}
      </div>
    </div>
  );
};

const ApiKeyModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onRemove,
    hasKey
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (key: string) => void; 
    onRemove: () => void;
    hasKey: boolean;
}) => {
    const [key, setKey] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Key size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Gemini API Configuration</h2>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        To generate insights, this app requires a Google Gemini API Key. Your key is stored locally in your browser and never sent to our servers.
                    </p>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                            {hasKey ? 'Update API Key' : 'Enter your API Key'}
                        </label>
                        <input 
                            type="password" 
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder={hasKey ? "Enter new key to update..." : "AIzaSy..."}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-3">
                        <button 
                            type="button"
                            onClick={() => onSave(key)}
                            disabled={!key}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {hasKey ? 'Update API Key' : 'Save API Key'}
                        </button>

                        {hasKey && (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRemove();
                                }}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Remove Saved Key
                            </button>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-center">
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                        >
                            Get a free Gemini API Key →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

// Initialize PDF.js worker
// @ts-ignore
const pdfjs = pdfjsLib.default || pdfjsLib;
// Use cdnjs URL which provides a classic script worker that is compatible with most browser environments
if (pdfjs) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

const STORAGE_KEY = 'ENVIOSCAN_DATA';
const API_KEY_STORAGE = 'ENVIOSCAN_API_KEY';

const App = () => {
  const [data, setData] = useState<AnalysisState>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch (e) {
        console.error("Failed to load saved data, clearing corrupted storage", e);
        localStorage.removeItem(STORAGE_KEY);
        return INITIAL_STATE;
    }
  });
  
  const [activeTab, setActiveTab] = useState<ForceCategory>('keyTrends');
  const [viewMode, setViewMode] = useState<'edit' | 'visualize' | 'compare'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAcademicMode, setIsAcademicMode] = useState(false); // New Mode State

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
      // Check localStorage or fallback to empty (secure default)
      return localStorage.getItem(API_KEY_STORAGE) || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const [uploadedAnalyses, setUploadedAnalyses] = useState<AnalysisState[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // --- GAMIFICATION LOGIC ---
  const gamificationStats = useMemo(() => {
    let filledFields = 0;
    let totalFields = 0;
    
    FORCES_CONFIG.forEach(force => {
        force.subSections.forEach(sub => {
            totalFields++;
            // @ts-ignore
            const val = data[force.id][sub.id];
            if (val && val.length >= 10) {
                filledFields++;
            }
        });
    });

    // Calculate percentage of fields filled (max 90 points from fields, 10 from description)
    const fieldsPercentage = (filledFields / totalFields) * 90;
    const descriptionScore = Math.min(10, data.description.length > 50 ? 10 : (data.description.length / 5)); 
    
    const xp = Math.floor(fieldsPercentage + descriptionScore);

    const currentLevel = GAME_LEVELS.slice().reverse().find(lvl => xp >= lvl.minXP) || GAME_LEVELS[0];
    const nextLevel = GAME_LEVELS.find(lvl => lvl.minXP > xp);
    
    // Progress to next level
    let progressPercent = 100;
    if (nextLevel) {
        const prevLevelXP = GAME_LEVELS[GAME_LEVELS.indexOf(nextLevel) - 1]?.minXP || 0;
        const range = nextLevel.minXP - prevLevelXP;
        const currentInLevel = xp - prevLevelXP;
        progressPercent = Math.min(100, Math.max(0, (currentInLevel / range) * 100));
    } else {
        progressPercent = 100;
    }

    const earnedBadges = BADGES.filter(b => b.criteria(data));

    return { xp, level: currentLevel, nextLevel, progressPercent, earnedBadges };
  }, [data]);

  const handleSaveApiKey = (key: string) => {
      setApiKey(key);
      localStorage.setItem(API_KEY_STORAGE, key);
      setShowApiKeyModal(false);
  };

  const handleRemoveApiKey = () => {
      if (window.confirm("Are you sure you want to remove your API Key? You will need to enter it again to use AI features.")) {
        setApiKey('');
        localStorage.removeItem(API_KEY_STORAGE);
        setShowApiKeyModal(false);
      }
  };

  const validateInput = (category: string, id: string, value: string): string | null => {
      const trimmed = value.trim();
      if (category === 'meta' && id === 'description') {
          if (!trimmed) return "Project context is required.";
          if (trimmed.length < 20) return "Too short. Please add more details.";
          if (trimmed.length < 50) return `Keep going... (${50 - trimmed.length} more chars recommended).`;
          return null;
      }
      // For quadrant inputs
      if (category !== 'meta') {
          // It's okay to be empty, but if not empty, must be substantial
          if (trimmed.length > 0 && trimmed.length < 10) {
              return "Too brief (min 10 chars).";
          }
      }
      return null;
  };

  const handleInputChange = (category: ForceCategory, field: string, value: string) => {
    setData(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
    
    const error = validateInput(category, field, value);
    setValidationErrors(prev => {
        const next = { ...prev };
        if (error) next[`${category}.${field}`] = error;
        else delete next[`${category}.${field}`];
        return next;
    });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setData(prev => ({ ...prev, author: e.target.value }));
  };
  
  const handleCourseIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setData(prev => ({ ...prev, courseId: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setData(prev => ({ ...prev, description: val }));

      const error = validateInput('meta', 'description', val);
      setValidationErrors(prev => {
          const next = { ...prev };
          if (error) next['meta.description'] = error;
          else delete next['meta.description'];
          return next;
      });
  };

  const handleReset = () => {
      if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
          setData(INITIAL_STATE);
          setInsights(null);
          setValidationErrors({});
          localStorage.removeItem(STORAGE_KEY);
      }
  };

  const handleLoadExample = (scenario: AnalysisState) => {
    // Check if current data is effectively empty/default to avoid unnecessary confirmation
    const isDefault = JSON.stringify(data) === JSON.stringify(INITIAL_STATE);
    
    // If it's default, we don't need to confirm. If it's not default, we ask.
    const shouldLoad = isDefault || window.confirm("This will overwrite your current inputs with the selected example. Continue?");
    
    if (shouldLoad) {
        // Deep clone to ensure we have a fresh state
        const newData = JSON.parse(JSON.stringify(scenario));
        setData(newData);
        setValidationErrors({});
        
        // Load pre-canned insights for instant gratification if it matches the startup scenario
        if (scenario === SCENARIO_STARTUP) {
            setInsights(EXAMPLE_INSIGHTS);
        } else {
            setInsights(null); // Clear insights for other scenarios so user generates new ones
        }
    }
  };

  const handleLoadDemoBatch = () => {
    if(uploadedAnalyses.length > 0) {
        if(!window.confirm("This will add 3 demo scenarios to your existing list. Continue?")) return;
    }
    setUploadedAnalyses(prev => [
        ...prev,
        JSON.parse(JSON.stringify(SCENARIO_STARTUP)),
        JSON.parse(JSON.stringify(SCENARIO_CORPORATE)),
        JSON.parse(JSON.stringify(SCENARIO_NONPROFIT))
    ]);
  };

  const handleGenerateInsights = async () => {
    const newErrors: Record<string, string> = {};
    
    // Validate Description
    const descError = validateInput('meta', 'description', data.description);
    if (descError) newErrors['meta.description'] = descError;

    // Validate all active fields and count minimal required data
    let totalDataPoints = 0;
    
    FORCES_CONFIG.forEach(force => {
        force.subSections.forEach(sub => {
            // @ts-ignore
            const val = data[force.id][sub.id];
            if (val && val.trim().length >= 10) totalDataPoints++;
            
            const err = validateInput(force.id, sub.id, val);
            if (err) newErrors[`${force.id}.${sub.id}`] = err;
        });
    });

    if (Object.keys(newErrors).length > 0) {
        setValidationErrors(newErrors);
        alert("Please fix the validation errors before generating insights.");
        return;
    }

    if (totalDataPoints < 3) {
        alert("Please fill in at least 3 analysis fields with sufficient detail (10+ characters) to generate meaningful insights.");
        return;
    }

    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }

    setIsGenerating(true);
    try {
        const result = await generateInsights(data, apiKey, isAcademicMode);
        if (result) {
            setInsights(result);
            setViewMode('visualize');
        } else {
             alert("Failed to generate insights. Please try again.");
        }
    } catch (err) {
        console.error("Critical error generating insights", err);
        alert("An error occurred. Make sure your API Key is valid.");
    } finally {
        setIsGenerating(false);
    }
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
                       setValidationErrors({});
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
        
        pdf.setProperties({ 
            title: 'Environment Analysis', 
            subject: JSON.stringify(data), 
            author: data.author, 
            creator: 'EnvioScan App' 
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Helper: Add Page Number
        const addFooter = (pageNum: number) => {
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${pageNum} | EnvioScan Analysis | ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
        };

        // --- Page 1: Canvas Image ---
        const imgProps = pdf.getImageProperties(imgData);
        // Calculate fit dimensions to maintain aspect ratio within page (minus margin for title/footer)
        const imgRatio = imgProps.width / imgProps.height;
        const availHeight = pageHeight - (margin * 2); 
        
        let finalImgWidth = pageWidth - (margin * 2);
        let finalImgHeight = finalImgWidth / imgRatio;

        if (finalImgHeight > availHeight) {
            finalImgHeight = availHeight;
            finalImgWidth = availHeight * imgRatio;
        }

        // Center image
        const xOffset = (pageWidth - finalImgWidth) / 2;
        const yOffset = (pageHeight - finalImgHeight) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
        addFooter(1);

        // --- Page 2: Detailed Inputs Report ---
        pdf.addPage();
        let yCursor = margin;
        let pageCount = 2;

        // Helper to check for page breaks
        const ensureSpace = (heightNeeded: number) => {
            if (yCursor + heightNeeded > pageHeight - margin - 10) { // -10 buffer for footer
                addFooter(pageCount);
                pdf.addPage();
                pageCount++;
                yCursor = margin;
                return true; 
            }
            return false;
        };

        // Title for Data Section
        pdf.setFontSize(20);
        pdf.setTextColor(31, 41, 55); // gray-800
        pdf.setFont("helvetica", "bold");
        pdf.text("Detailed Environment Data", margin, yCursor);
        yCursor += 15;
        
        // Metadata Line (Author & Course)
        if (data.author || data.courseId) {
             pdf.setFontSize(10);
             pdf.setTextColor(100, 100, 100);
             pdf.setFont("helvetica", "normal");
             let metaText = "";
             if (data.author) metaText += `${isAcademicMode ? 'Student' : 'Author'}: ${data.author}   `;
             if (data.courseId && isAcademicMode) metaText += `Course ID: ${data.courseId}`;
             pdf.text(metaText, margin, yCursor);
             yCursor += 10;
        }

        if (data.description) {
            ensureSpace(30); // Check enough space for header + some text
            pdf.setFontSize(14);
            pdf.setTextColor(75, 85, 99); // gray-600
            pdf.setFont("helvetica", "bold");
            pdf.text(isAcademicMode ? "Project Context" : "Executive Summary", margin, yCursor);
            yCursor += 8;
            
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(55, 65, 81); // gray-700
            const lines = pdf.splitTextToSize(data.description, contentWidth);
            
            lines.forEach((line: string) => {
                if(ensureSpace(7)) {
                    pdf.setFontSize(11);
                    pdf.setTextColor(55, 65, 81);
                }
                pdf.text(line, margin, yCursor);
                yCursor += 6;
            });
            yCursor += 10;
        }

        FORCES_CONFIG.forEach(force => {
            ensureSpace(20); // Header space
            
            // Force Header
            const color = hexToRgb(force.color);
            pdf.setTextColor(color.r, color.g, color.b);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text(force.title.toUpperCase(), margin, yCursor);
            yCursor += 8;
            
            // Subsections
            force.subSections.forEach(sub => {
                // @ts-ignore
                const value = data[force.id][sub.id];
                if(!value) return; 
                
                // Ensure header doesn't get orphaned
                if (ensureSpace(30)) {
                    // if page break, reprint section header for clarity (optional, but good practice)
                    // pdf.setTextColor(color.r, color.g, color.b);
                    // pdf.setFontSize(14);
                    // pdf.setFont("helvetica", "bold");
                    // pdf.text(`${force.title.toUpperCase()} (Cont.)`, margin, yCursor);
                    // yCursor += 8;
                }
                
                pdf.setFontSize(10);
                pdf.setTextColor(107, 114, 128); // gray-500
                pdf.setFont("helvetica", "bold");
                pdf.text(sub.label.toUpperCase(), margin, yCursor);
                yCursor += 5;
                
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(55, 65, 81); // gray-700
                pdf.setFontSize(11);
                
                const textLines = pdf.splitTextToSize(value, contentWidth);
                textLines.forEach((line: string) => {
                    if(ensureSpace(7)) {
                         pdf.setFont("helvetica", "normal");
                         pdf.setTextColor(55, 65, 81);
                         pdf.setFontSize(11);
                    }
                    pdf.text(line, margin, yCursor);
                    yCursor += 6;
                });
                yCursor += 6; 
            });
            
            yCursor += 5; 
        });


        // --- Page 3+: AI Insights Report ---
        if (insights) {
            ensureSpace(50); // Try to start on same page if lots of room, else break
            if (yCursor > margin + 20) {
                 // Add separator line if continuing on same page
                 pdf.setDrawColor(200, 200, 200);
                 pdf.line(margin, yCursor, pageWidth - margin, yCursor);
                 yCursor += 15;
            }

            // Title
            pdf.setFontSize(22);
            pdf.setTextColor(17, 24, 39); // Gray 900
            pdf.setFont("helvetica", "bold");
            pdf.text(isAcademicMode ? "Academic Assessment" : "Strategic Analysis", margin, yCursor);
            yCursor += 15;

            // Author Info
            if (data.author) {
                pdf.setFontSize(10);
                pdf.setTextColor(107, 114, 128); // Gray 500
                pdf.setFont("helvetica", "normal");
                pdf.text(`Prepared by: ${data.author}`, margin, yCursor);
                yCursor += 10;
            } 
            
            // Data Quality Box (Dynamic Height)
            const feedbackText = insights.dataQualityFeedback || "No feedback available.";
            const feedbackLines = pdf.splitTextToSize(feedbackText, contentWidth - 10);
            const feedbackBlockHeight = feedbackLines.length * 5;
            const boxHeight = 20 + feedbackBlockHeight;

            ensureSpace(boxHeight + 10);

            // Draw Box
            pdf.setFillColor(243, 244, 246); // bg-gray-100
            pdf.setDrawColor(229, 231, 235); // border-gray-200
            pdf.roundedRect(margin, yCursor, contentWidth, boxHeight, 3, 3, 'FD');

            // Box Content
            pdf.setFontSize(12);
            pdf.setTextColor(31, 41, 55); // gray-800
            pdf.setFont("helvetica", "bold");
            pdf.text(`Data Quality Score: ${insights.dataQualityScore}/100`, margin + 5, yCursor + 8);
            
            pdf.setFontSize(10);
            pdf.setTextColor(75, 85, 99); // gray-600
            pdf.setFont("helvetica", "normal");
            pdf.text(feedbackLines, margin + 5, yCursor + 16);
            
            yCursor += boxHeight + 15;

            // Helper to render sections (Opportunities, Threats)
            const renderSection = (title: string, items: string[], colorHex: string) => {
                ensureSpace(20);
                pdf.setFontSize(16);
                const rgb = hexToRgb(colorHex);
                pdf.setTextColor(rgb.r, rgb.g, rgb.b);
                pdf.setFont("helvetica", "bold");
                pdf.text(title, margin, yCursor);
                yCursor += 8;

                pdf.setFontSize(11);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(55, 65, 81); // gray-700

                if (!items || items.length === 0) {
                    pdf.text("• None identified", margin, yCursor);
                    yCursor += 8;
                } else {
                    items.forEach(item => {
                        const bullet = "• ";
                        const wrappedItem = pdf.splitTextToSize(item, contentWidth - 8);
                        const itemHeight = wrappedItem.length * 6;
                        
                        ensureSpace(itemHeight);
                        
                        pdf.text(bullet, margin, yCursor);
                        pdf.text(wrappedItem, margin + 6, yCursor);
                        yCursor += itemHeight + 2;
                    });
                }
                yCursor += 8;
            };

            renderSection("Opportunities", insights.opportunities, "#16a34a"); // green-600
            renderSection("Threats", insights.threats, "#dc2626"); // red-600

            // Strategic Advice
            ensureSpace(20);
            pdf.setFontSize(16);
            pdf.setTextColor(37, 99, 235); // blue-600
            pdf.setFont("helvetica", "bold");
            pdf.text("Strategic Advice", margin, yCursor);
            yCursor += 8;

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(31, 41, 55); // gray-800
            
            const adviceLines = pdf.splitTextToSize(insights.strategicAdvice, contentWidth);
            adviceLines.forEach((line: string) => {
                if (ensureSpace(7)) {
                    pdf.setFontSize(11);
                    pdf.setTextColor(31, 41, 55);
                }
                pdf.text(line, margin, yCursor);
                yCursor += 6;
            });
        }
        
        // Add footer to last page
        addFooter(pageCount);

        pdf.save('environment-analysis.pdf');

        // Export JSON alongside PDF
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `environment-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) { console.error("PDF Export failed", err); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newAnalyses: AnalysisState[] = [];
    let errorCount = 0;
    setIsComparing(true);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            let json = null;
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                const text = await file.text();
                json = JSON.parse(text);
            } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                const arrayBuffer = await file.arrayBuffer();
                if (pdfjs && pdfjs.getDocument) {
                    try {
                        const loadingTask = pdfjs.getDocument({
                            data: arrayBuffer,
                            disableFontFace: true, 
                        });
                        const pdf = await loadingTask.promise;
                        const metadata = await pdf.getMetadata();
                        if (metadata?.info?.Subject) {
                             const subject = metadata.info.Subject;
                             if (typeof subject === 'string' && subject.trim().startsWith('{')) {
                                try {
                                    json = JSON.parse(subject);
                                } catch (e) {
                                    console.warn("Found Subject metadata but failed to parse as JSON", e);
                                }
                             }
                        }
                    } catch (pdfErr) {
                         console.error(`Error processing PDF ${file.name}`, pdfErr);
                         errorCount++;
                    }
                }
            }

            if (json && json.keyTrends && json.marketForces) {
                newAnalyses.push(json);
            } else {
                errorCount++;
            }
        } catch (error) { 
            console.error(`Error parsing file ${file.name}`, error); 
            errorCount++;
        }
    }
    setUploadedAnalyses(prev => [...prev, ...newAnalyses]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsComparing(false);

    if (errorCount > 0) {
        alert(`Imported ${newAnalyses.length} report(s). Skipped ${errorCount} invalid file(s). Note: Only PDF/JSON files exported from EnvioScan are supported.`);
    }
  };

  const filteredAnalyses = uploadedAnalyses.filter(a => 
    (a.author?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (a.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const runComparison = async () => {
      if (!apiKey) {
          setShowApiKeyModal(true);
          return;
      }
      
      const targetAnalyses = filteredAnalyses;
      if (targetAnalyses.length === 0) return;

      setIsComparing(true);
      try {
        const report = await generateComparativeReport(targetAnalyses, apiKey);
        if (report) {
            setComparativeReport(report);
        } else {
            alert("Failed to generate comparative report.");
        }
      } catch (err) {
        console.error(err);
        alert("Comparison failed. Check your API Key.");
      } finally {
        setIsComparing(false);
      }
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
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onSave={handleSaveApiKey}
        onRemove={handleRemoveApiKey}
        hasKey={!!apiKey}
      />

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
          <div className="flex items-center gap-2">
            {/* Mode Toggle Switch */}
            <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                <button 
                    onClick={() => setIsAcademicMode(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!isAcademicMode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Briefcase size={14} />
                    Business
                </button>
                <button 
                    onClick={() => setIsAcademicMode(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isAcademicMode ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <GraduationCap size={14} />
                    Academic
                </button>
            </div>

            <Tooltip content={apiKey ? "Update your API Key" : "Required for AI Insights"} position="bottom">
                <button 
                    onClick={() => setShowApiKeyModal(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${apiKey ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 animate-pulse'}`}
                >
                    <Key size={14} />
                    {apiKey ? 'API Key Set' : 'Set API Key'}
                </button>
            </Tooltip>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <Tooltip content="Edit analysis data" position="bottom">
                    <button onClick={() => setViewMode('edit')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'edit' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}> <Edit3 size={16} /> Input </button>
                </Tooltip>
                <Tooltip content="View diagram & insights" position="bottom">
                    <button onClick={() => setViewMode('visualize')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'visualize' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}> <FileText size={16} /> Visualize </button>
                </Tooltip>
                <Tooltip content="Compare multiple reports" position="bottom">
                    <button onClick={() => setViewMode('compare')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'compare' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}> <BarChart3 size={16} /> Compare </button>
                </Tooltip>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'compare' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Comparative Analysis</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto mt-2">Upload multiple JSON or PDF reports generated by EnvioScan to identify patterns.</p>
                    </div>
                    <div className="max-w-xl mx-auto">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input ref={fileInputRef} type="file" accept=".pdf,.json,application/pdf,application/json" multiple={true} onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full"> <FileUp size={32} /> </div>
                                <div> <h3 className="font-semibold text-gray-900">Click to upload files</h3> <p className="text-sm text-gray-500 mt-1">Select multiple .json or .pdf files exported from EnvioScan</p> </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                            <button 
                                onClick={handleLoadDemoBatch}
                                className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors border border-indigo-200"
                            >
                                <BookOpen size={16} />
                                Load Demo Batch (3 Examples)
                            </button>
                        </div>

                        {uploadedAnalyses.length > 0 && (
                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                        Loaded Reports 
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{uploadedAnalyses.length}</span>
                                    </h4>
                                    <div className="relative w-full sm:w-64">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search reports..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1 custom-scrollbar">
                                    {filteredAnalyses.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            No reports match your search "{searchTerm}"
                                        </div>
                                    ) : (
                                        filteredAnalyses.map((analysis, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm hover:border-indigo-200 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                                        {uploadedAnalyses.indexOf(analysis) + 1}
                                                    </div>
                                                    <div> 
                                                        <div className="font-medium text-gray-900">{analysis.author || 'Unknown Author'}</div> 
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">{analysis.description || 'No description'}</div> 
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const newlist = uploadedAnalyses.filter(a => a !== analysis);
                                                        setUploadedAnalyses(newlist);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove report"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    {uploadedAnalyses.length > 0 && (
                                        <Tooltip content="Clear all loaded reports" position="top">
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Remove all uploaded reports?')) {
                                                        setUploadedAnalyses([]);
                                                        setSearchTerm('');
                                                    }
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                                            >
                                                Clear All
                                            </button>
                                         </Tooltip>
                                    )}
                                    <Tooltip content="Analyze patterns across reports with AI" position="top" className="flex-1">
                                        <button onClick={runComparison} disabled={isComparing || filteredAnalyses.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                            {isComparing ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />} 
                                            {isComparing ? 'Analyzing Patterns...' : `Compare ${filteredAnalyses.length} Report${filteredAnalyses.length !== 1 ? 's' : ''}`}
                                        </button>
                                    </Tooltip>
                                </div>
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
                        
                        {/* New Section: Batch Stats & Quality */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"> 
                                    <Activity className="text-indigo-500" size={20} /> 
                                    Batch Data Quality 
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                         <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                                            <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={200} strokeDashoffset={200 - (200 * (comparativeReport.averageDataQualityScore || 0)) / 100} className="text-indigo-600 transition-all duration-1000 ease-out" />
                                        </svg>
                                        <span className="absolute text-xl font-bold text-gray-900">{comparativeReport.averageDataQualityScore || 0}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Average estimated completeness score across {uploadedAnalyses.length} reports.</p>
                                        <div className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                                            {(comparativeReport.averageDataQualityScore || 0) > 70 ? 'High Quality Batch' : 'Variable Quality Batch'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"> 
                                    <Hash className="text-purple-500" size={20} /> 
                                    Keyword Trends 
                                </h3>
                                <div className="space-y-3">
                                    {comparativeReport.keywordTrends?.map((trend, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-medium">{trend.keyword}</span>
                                            <div className="flex items-center gap-2 w-1/2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="bg-purple-500 h-full rounded-full" 
                                                        style={{ width: `${Math.min(100, (trend.count / uploadedAnalyses.length) * 100)}%` }} 
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 w-6 text-right">{trend.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!comparativeReport.keywordTrends || comparativeReport.keywordTrends.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">No specific keyword trends detected.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"> <div className="w-2 h-6 bg-green-500 rounded-full"></div> Common Patterns </h3>
                                <ul className="space-y-3"> {(comparativeReport.commonPatterns || []).map((pat, i) => ( <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg"> <span className="font-bold text-gray-400">0{i+1}</span> {pat} </li> ))} </ul>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2"> <div className="w-2 h-6 bg-orange-500 rounded-full"></div> Significant Outliers </h3>
                                <ul className="space-y-3"> {(comparativeReport.outliers || []).map((out, i) => ( <li key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg"> <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" /> {out} </li> ))} </ul>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Topic Frequency Analysis</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {(comparativeReport.aggregatedStats || []).map((stat, i) => (
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
                    {/* GAMIFICATION DASHBOARD */}
                    {isAcademicMode && (
                        <div className="bg-white p-4 rounded-xl shadow-md border-2 border-indigo-100 mb-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                <Trophy size={80} className="text-indigo-900" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-700">
                                        {React.createElement(gamificationStats.level.icon, { size: 18 })}
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-bold ${gamificationStats.level.color}`}>{gamificationStats.level.name}</h3>
                                        <div className="text-xs text-gray-500 font-mono">Level {GAME_LEVELS.indexOf(gamificationStats.level) + 1} Strategist</div>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                        <span>XP: {gamificationStats.xp}</span>
                                        <span>Next: {gamificationStats.nextLevel ? gamificationStats.nextLevel.minXP : 'Max'}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                                        <div 
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                                            style={{ width: `${gamificationStats.progressPercent}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        Badges ({gamificationStats.earnedBadges.length}/{BADGES.length})
                                    </h4>
                                    <div className="flex gap-1.5 flex-wrap mt-2">
                                        {gamificationStats.earnedBadges.length > 0 ? gamificationStats.earnedBadges.map(badge => (
                                            <React.Fragment key={badge.id}>
                                                <Tooltip content={badge.name} position="top">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-50 border border-yellow-200 text-yellow-600 shadow-sm">
                                                        {React.createElement(badge.icon, { size: 14 })}
                                                    </div>
                                                </Tooltip>
                                            </React.Fragment>
                                        )) : <span className="text-gray-400 italic text-xs">No badges earned yet. Keep researching!</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 space-y-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                {isAcademicMode ? 'Student Information' : 'Analyst Information'}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                    <User size={16} className="text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={data.author} 
                                        onChange={handleAuthorChange} 
                                        placeholder={isAcademicMode ? "Student Name" : "Author Name"} 
                                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400" 
                                    />
                                </div>
                                {isAcademicMode && (
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                        <School size={16} className="text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={data.courseId} 
                                            onChange={handleCourseIdChange} 
                                            placeholder="Course ID (e.g. ENTR-101)" 
                                            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                    {isAcademicMode ? 'Project Context' : 'Executive Summary'}
                                </label>
                                <Tooltip content="Provide context to help AI generate relevant strategic advice" position="left">
                                    <HelpCircle size={12} className="text-gray-400 cursor-help" />
                                </Tooltip>
                            </div>
                            <div className={`flex flex-col gap-1 bg-gray-50 rounded-lg px-3 py-2 border transition-all ${validationErrors['meta.description'] ? 'border-red-300 bg-red-50 focus-within:ring-2 focus-within:ring-red-100' : 'border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400'}`}>
                                <div className="flex items-start gap-2">
                                    <AlignLeft size={16} className={`mt-1 ${validationErrors['meta.description'] ? 'text-red-400' : 'text-gray-400'}`} />
                                    <textarea value={data.description} onChange={handleDescriptionChange} placeholder={isAcademicMode ? "Describe the class project or startup idea..." : "Briefly describe the business context..."} rows={3} className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400 resize-none" />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="flex-1">
                                        {validationErrors['meta.description'] && (
                                            <div className="text-xs text-red-600 font-medium flex items-center gap-1 animate-pulse">
                                                <AlertCircle size={10} />
                                                {validationErrors['meta.description']}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`text-[10px] whitespace-nowrap ml-2 ${data.description.length < 50 ? 'text-red-500 font-bold' : 'text-green-600 font-semibold'}`}>
                                        {data.description.length} / 50 min
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Load Example Scenario</label>
                            <div className="grid grid-cols-3 gap-2">
                                <Tooltip content="Startup (VerdeGrow)" position="top">
                                    <button onClick={() => handleLoadExample(SCENARIO_STARTUP)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-green-50 text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-200 transition-all text-xs font-medium gap-1">
                                        <Sprout size={16} />
                                        <span>Startup</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Corporate (AgriCorp)" position="top">
                                    <button onClick={() => handleLoadExample(SCENARIO_CORPORATE)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-all text-xs font-medium gap-1">
                                        <Building2 size={16} />
                                        <span>Corp</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Non-Profit (UrbanRoots)" position="top">
                                    <button onClick={() => handleLoadExample(SCENARIO_NONPROFIT)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition-all text-xs font-medium gap-1">
                                        <Users size={16} />
                                        <span>Non-Prof</span>
                                    </button>
                                </Tooltip>
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
                        <Tooltip content={isAcademicMode ? "Ask the tutor for feedback and missions" : "Sends data to Gemini AI to identify opportunities & threats"} position="top" className="w-full">
                            <button onClick={handleGenerateInsights} disabled={isGenerating} className={`w-full bg-gradient-to-r ${isAcademicMode ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white p-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed`}>
                                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : (isAcademicMode ? <Scroll size={20} /> : <Sparkles size={20} />)} 
                                {isGenerating ? 'Analyzing...' : (isAcademicMode ? 'Submit to Professor' : 'Generate Insights')}
                            </button>
                        </Tooltip>
                         <div className="grid grid-cols-2 gap-3">
                            <Tooltip content="Download a local backup of your current progress" position="top" className="w-full">
                                <button onClick={handleSaveProgress} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 transition-all text-sm font-medium" title="Download JSON backup"> <Save size={16} /> Save JSON </button>
                            </Tooltip>
                            <Tooltip content="Restore a previously saved analysis" position="top" className="w-full">
                                <label className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 transition-all text-sm font-medium cursor-pointer"> <Upload size={16} /> Load JSON <input type="file" accept=".json" className="hidden" onChange={handleLoadProgress} /> </label>
                            </Tooltip>
                        </div>
                        <Tooltip content="Clears all inputs to start fresh" position="top" className="w-full">
                            <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all text-sm"> <Trash2 size={14} /> Reset Data </button>
                        </Tooltip>
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
                                        <div className="relative">
                                            <textarea 
                                                value={data[activeTab][section.id]} 
                                                onChange={(e) => handleInputChange(activeTab, section.id, e.target.value)} 
                                                placeholder={section.placeholder} 
                                                rows={4} 
                                                className={`w-full p-3 pb-6 rounded-lg border transition-all text-sm resize-none ${validationErrors[`${activeTab}.${section.id}`] ? 'bg-red-50 border-red-300 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200 placeholder:text-red-300' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}`} 
                                            />
                                            <div className={`absolute bottom-2 right-2 text-[10px] pointer-events-none px-1 rounded font-mono transition-colors ${validationErrors[`${activeTab}.${section.id}`] ? 'text-red-600 bg-red-100 font-bold' : 'bg-white/50 text-gray-400'}`}>
                                                {data[activeTab][section.id]?.length || 0} chars
                                            </div>
                                        </div>
                                        {validationErrors[`${activeTab}.${section.id}`] && (
                                            <div className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                                <AlertCircle size={12} />
                                                {validationErrors[`${activeTab}.${section.id}`]}
                                            </div>
                                        )}
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
                    <Tooltip content="Generate a professional PDF report with diagram & detailed data" position="left">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"> <Download size={18} /> Export PDF </button>
                    </Tooltip>
                </div>
                {insights && (
                    <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl border border-indigo-100 p-6 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-indigo-100 pb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"> 
                                {isAcademicMode ? <Scroll className="text-indigo-600" size={20} /> : <Sparkles className="text-indigo-600" size={20} />}
                                {isAcademicMode ? "Tutor Feedback & Quests" : "Strategic Analysis"} 
                            </h2>
                            <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border ${getScoreColor(insights.dataQualityScore)} transition-colors`}>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                         <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 opacity-30" />
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * insights.dataQualityScore) / 100} className="transition-all duration-1000 ease-out" />
                                        </svg>
                                        <span className="absolute text-xs font-bold">{insights.dataQualityScore}</span>
                                    </div>
                                    <div> 
                                        <div className="flex items-center gap-1">
                                            <div className="text-xs font-bold uppercase tracking-wide opacity-80">{isAcademicMode ? 'Research Grade' : 'Data Quality'}</div> 
                                            <Tooltip content={<div className="text-left space-y-1">
                                                <div className="font-bold border-b border-gray-600 pb-1 mb-1">Grading Criteria</div>
                                                <div><span className="text-green-400 font-bold">90-100:</span> Excellent depth (6+ points/category)</div>
                                                <div><span className="text-blue-400 font-bold">70-89:</span> Good coverage</div>
                                                <div><span className="text-yellow-400 font-bold">50-69:</span> Average / Missing sections</div>
                                                <div><span className="text-red-400 font-bold">0-49:</span> Poor / Sparse data</div>
                                            </div>} position="bottom">
                                                <Info size={12} className="text-gray-400 cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <div className="text-sm font-semibold">{getScoreLabel(insights.dataQualityScore)}</div> 
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div className="mb-6 bg-white/60 p-4 rounded-lg border border-indigo-50 text-sm text-indigo-900 flex items-start gap-3"> <Activity size={16} className="mt-0.5 text-indigo-500 flex-shrink-0" /> <p>{insights.dataQualityFeedback}</p> </div>
                        
                        {/* Gamified Feedback System (Replaces Validation Missions in Academic Mode) */}
                        {isAcademicMode ? (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-md font-bold text-indigo-900 mb-4">
                                    <Trophy className="text-indigo-600" size={20} />
                                    Gamified Feedback System <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-normal">System Rules</span>
                                </h3>
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 text-sm text-indigo-900 leading-relaxed">
                                     <p className="mb-4">
                                        <strong>How to Level Up:</strong> This tool uses a gamified system to track your research depth. 
                                        You earn <strong>XP (Experience Points)</strong> based on the depth and completeness of your research across all 4 quadrants. 
                                        Filling out fields with detailed data ( &gt; 10 chars) maximizes your score.
                                     </p>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                                             <div className="font-bold text-indigo-700 mb-1 flex items-center gap-2"><Star size={16}/> Your Status</div>
                                             <div className="flex items-center gap-3 mt-2">
                                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                                     {React.createElement(gamificationStats.level.icon, { size: 20 })}
                                                </div>
                                                <div>
                                                     <div className="font-bold text-gray-900">{gamificationStats.level.name}</div>
                                                     <div className="text-xs text-gray-500">XP: {gamificationStats.xp} / 100</div>
                                                </div>
                                             </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                                             <div className="font-bold text-indigo-700 mb-1 flex items-center gap-2"><Crown size={16}/> Earned Badges</div>
                                             <div className="flex gap-1.5 flex-wrap mt-2">
                                                {gamificationStats.earnedBadges.length > 0 ? gamificationStats.earnedBadges.map(badge => (
                                                    <Tooltip key={badge.id} content={badge.name} position="top">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-50 border border-yellow-200 text-yellow-600 shadow-sm">
                                                            {React.createElement(badge.icon, { size: 14 })}
                                                        </div>
                                                    </Tooltip>
                                                )) : <span className="text-gray-400 italic text-xs">No badges earned yet. Keep researching!</span>}
                                             </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        ) : (
                            insights.prototypingExperiments && insights.prototypingExperiments.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="flex items-center gap-2 text-md font-bold text-purple-900 mb-4">
                                        <FlaskConical className="text-purple-600" size={20} />
                                        Prototyping Lab <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-normal">Business Validation</span>
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {insights.prototypingExperiments.map((exp, idx) => (
                                            <div key={idx} className="bg-purple-50/50 border border-purple-100 rounded-xl p-5 hover:border-purple-200 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-white p-2 rounded-lg text-purple-600 shadow-sm border border-purple-100">
                                                        <Microscope size={20} />
                                                    </div>
                                                    <div className="space-y-3 flex-1">
                                                        <div>
                                                            <div className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-1">Hypothesis {idx + 1}</div>
                                                            <p className="text-sm font-semibold text-gray-900">{exp.hypothesis}</p>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="bg-white/60 p-3 rounded-lg">
                                                                <div className="text-xs font-bold text-gray-500 mb-1">Test Method</div>
                                                                <p className="text-sm text-gray-800">{exp.method}</p>
                                                            </div>
                                                            <div className="bg-white/60 p-3 rounded-lg">
                                                                <div className="text-xs font-bold text-gray-500 mb-1">Success Metric</div>
                                                                <p className="text-sm text-gray-800 font-mono text-purple-700">{exp.metric}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                <h3 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">
                                    {isAcademicMode ? "XP Gains (Strengths)" : "Opportunities"}
                                </h3>
                                <ul className="space-y-2"> {insights.opportunities.map((item, i) => ( <li key={i} className="flex items-start gap-2 text-sm text-green-900"> <Star size={16} className={`mt-0.5 flex-shrink-0 ${isAcademicMode ? 'text-yellow-500 fill-yellow-500' : 'opacity-60'}`} /> <span>{item}</span> </li> ))} </ul>
                            </div>
                            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                                <h3 className="font-bold text-red-800 mb-3 text-sm uppercase tracking-wide">
                                    {isAcademicMode ? "Active Quests (Missing Data)" : "Threats"}
                                </h3>
                                <ul className="space-y-2"> {insights.threats.map((item, i) => ( <li key={i} className="flex items-start gap-2 text-sm text-red-900"> <ShieldAlert size={16} className="mt-0.5 flex-shrink-0 opacity-60" /> <span>{item}</span> </li> ))} </ul>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                                    {isAcademicMode ? "Boss Challenge" : "Strategic Advice"}
                                </h3>
                                {isAcademicMode && <Sword size={24} className="text-blue-500 mb-2" />}
                                <p className="text-sm text-blue-900 leading-relaxed"> {insights.strategicAdvice} </p>
                            </div>
                        </div>
                    </div>
                )}
                <div id="canvas-export-target" className="p-4 bg-white rounded-xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Business Environment Analysis</h2>
                        <p className="text-gray-500">Osterwalder Framework Visualization</p>
                        <div className="flex flex-col items-center mt-2 gap-1">
                            {data.author && <span className="text-xs font-medium text-gray-400">{isAcademicMode ? "Student" : "Author"}: {data.author}</span>}
                            {data.courseId && isAcademicMode && <span className="text-xs font-medium text-gray-400">Course: {data.courseId}</span>}
                        </div>
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
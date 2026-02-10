import { ForceData, AnalysisState } from './types';

export const INITIAL_STATE: AnalysisState = {
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

export const FORCES_CONFIG: ForceData[] = [
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
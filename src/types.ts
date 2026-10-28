export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate';

export type BudgetStatus = 'budgeted' | 'contracted' | 'deposit_paid' | 'paid_in_full';

export type TimelinePhase = 'planning' | 'day_of';

export type TimelineStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export type TimelineRole = 
  | 'All' 
  | 'Lead Director' 
  | 'Floral & Decor' 
  | 'A/V & Sound' 
  | 'Hospitality & Bar' 
  | 'Host & VIP';

export type ContractStatus = 
  | 'researching' 
  | 'inquiry_sent' 
  | 'proposal_reviewed' 
  | 'contract_signed' 
  | 'deposit_paid' 
  | 'fulfilled';

export type CollaboratorStatus = 'online' | 'editing' | 'reviewing' | 'away';

export interface PaletteColor {
  name: string;
  hex: string;
  role: 'Canvas' | 'Accent' | 'Velvet' | 'Metallic' | 'Floral' | 'Drape';
  pantone?: string;
}

export interface SensoryMotifs {
  aroma: string;
  lighting: string;
  tactile: string;
  soundscape: string;
}

export interface MenuCourse {
  course: string;
  dish: string;
  wine: string;
  notes: string;
}

export interface BudgetItem {
  id: string;
  category: 
    | 'Venue & Structure' 
    | 'Catering & Spirits' 
    | 'Floral & Spatial Decor' 
    | 'Photography & Cinema' 
    | 'Entertainment & Sound' 
    | 'Luxury Transport' 
    | 'Stationery & Calligraphy' 
    | 'Contingency & Fees';
  name: string;
  plannedAmount: number;
  committedAmount: number;
  paidAmount: number;
  status: BudgetStatus;
  notes: string;
  assignedTo: string;
}

export interface TimelineItem {
  id: string;
  phase: TimelinePhase;
  time: string; // e.g. "14:30" or "6 Months Out"
  title: string;
  description: string;
  ownerRole: 'Lead Director' | 'Floral & Decor' | 'A/V & Sound' | 'Hospitality & Bar' | 'Host & VIP';
  status: TimelineStatus;
  location: string;
  duration?: string;
}

export interface VendorTask {
  id: string;
  text: string;
  done: boolean;
}

export interface VendorItem {
  id: string;
  category: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  costEstimate: number;
  depositPaid: number;
  contractStatus: ContractStatus;
  tasks: VendorTask[];
  notes: string;
  website?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: CollaboratorStatus;
  activeCard?: string;
  initials: string;
  assignedTasksCount: number;
  color: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  actionType: 'budget_updated' | 'timeline_toggled' | 'vendor_contract' | 'chat_message' | 'plan_generated' | 'task_assigned';
  detail: string;
  badge?: string;
}

export interface CelesteEvent {
  id: string;
  title: string;
  subtitle: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  budgetTotal: number;
  currency: string;
  themeDescription: string;
  palette: PaletteColor[];
  sensoryMotifs: SensoryMotifs;
  menuPairings: MenuCourse[];
  budgetItems: BudgetItem[];
  timeline: TimelineItem[];
  vendors: VendorItem[];
  collaborators: Collaborator[];
  activityLogs: ActivityLog[];
}

export interface EventGenerationRequest {
  title: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  budgetTotal: number;
  vibe: string;
  locationType: string;
  specialRequests?: string;
}

export interface VendorInquiryRequest {
  vendorName: string;
  vendorCategory: string;
  eventTitle: string;
  eventDate: string;
  location: string;
  guestCount: number;
  budgetEstimate: number;
  tone: 'editorial_luxury' | 'polite_inquiry' | 'contract_negotiation';
  specificRequirements?: string;
}

export interface BudgetAdvisorRequest {
  eventTitle: string;
  eventType: string;
  budgetTotal: number;
  guestCount: number;
  budgetItems: BudgetItem[];
}

export interface BudgetAdvisorResponse {
  summary: string;
  healthScore: number; // 0 - 100
  varianceAlerts: Array<{
    category: string;
    planned: number;
    committed: number;
    risk: 'low' | 'medium' | 'high';
    advice: string;
  }>;
  costSavingLevers: Array<{
    title: string;
    potentialSaving: number;
    description: string;
    tradeOff: string;
  }>;
  negotiationPointers: string[];
}


export interface CreativeConcepts {
  conceptTitle: string;
  narrative: string;
  palette: PaletteColor[];
  sensoryMotifs: SensoryMotifs;
  menuConcepts: MenuCourse[];
  spatialInstallations: string[];
}

export interface BudgetMetrics {
  totalPlanned: number;
  totalCommitted: number;
  totalPaid: number;
  variance: number;
  committedPercent: number;
  paidPercent: number;
  costPerGuest: number;
}

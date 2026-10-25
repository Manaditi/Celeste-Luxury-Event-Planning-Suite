import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  CelesteEvent, 
  BudgetItem, 
  TimelineItem, 
  VendorItem, 
  ActivityLog, 
  Collaborator 
} from '../types';
import { BENCHMARK_EVENTS, DEFAULT_COLLABORATORS } from '../data/benchmarkEvents';

type ActiveView = 'overview' | 'timeline' | 'budget' | 'vendors' | 'creative' | 'team';

interface EventContextType {
  events: CelesteEvent[];
  currentEvent: CelesteEvent;
  currentEventId: string;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectEvent: (id: string) => void;
  addNewEvent: (event: CelesteEvent) => void;
  resetToBenchmarks: () => void;
  updateEventDetails: (updates: Partial<CelesteEvent>) => void;
  
  // Budget handlers
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  
  // Timeline handlers
  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  toggleTimelineStatus: (id: string) => void;
  deleteTimelineItem: (id: string) => void;
  
  // Vendor handlers
  addVendorItem: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendorItem: (id: string, updates: Partial<VendorItem>) => void;
  deleteVendorItem: (id: string) => void;
  toggleVendorTask: (vendorId: string, taskId: string) => void;
  
  // Collaboration & Team handlers
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
  simulationSpeed: 'realistic' | 'fast';
  setSimulationSpeed: (speed: 'realistic' | 'fast') => void;
  postChatMessage: (message: string, authorName?: string, role?: string) => void;
  triggerSimulatedAction: (type?: string) => void;
  updateCollaboratorStatus: (collabId: string, status: Collaborator['status'], activeCard?: string) => void;

  // Active Modals state
  isGeneratorOpen: boolean;
  setIsGeneratorOpen: (open: boolean) => void;
  isBudgetAdvisorOpen: boolean;
  setIsBudgetAdvisorOpen: (open: boolean) => void;
  selectedVendorForInquiry: VendorItem | null;
  setSelectedVendorForInquiry: (vendor: VendorItem | null) => void;
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;
}

const STORAGE_KEY_EVENTS = 'celeste_orchestration_events_v2';
const STORAGE_KEY_CURRENT_ID = 'celeste_orchestration_current_id_v2';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CelesteEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored events, resetting to benchmarks:', e);
    }
    return BENCHMARK_EVENTS;
  });

  const [currentEventId, setCurrentEventId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
    if (stored && events.some(e => e.id === stored)) return stored;
    return BENCHMARK_EVENTS[0].id;
  });

  const [activeView, setActiveView] = useState<ActiveView>('overview');

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isBudgetAdvisorOpen, setIsBudgetAdvisorOpen] = useState(false);
  const [selectedVendorForInquiry, setSelectedVendorForInquiry] = useState<VendorItem | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Simulation state
  const [isSimulationActive, setIsSimulationActive] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<'realistic' | 'fast'>('realistic');

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEY_CURRENT_ID, currentEventId);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [events, currentEventId]);

  const currentEvent = events.find(e => e.id === currentEventId) || events[0] || BENCHMARK_EVENTS[0];

  const selectEvent = (id: string) => {
    if (events.some(e => e.id === id)) {
      setCurrentEventId(id);
    }
  };

  const addNewEvent = (newEvent: CelesteEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setCurrentEventId(newEvent.id);
    setActiveView('overview');
  };

  const resetToBenchmarks = () => {
    setEvents(BENCHMARK_EVENTS);
    setCurrentEventId(BENCHMARK_EVENTS[0].id);
    localStorage.removeItem(STORAGE_KEY_EVENTS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_ID);
  };

  const updateCurrentEvent = (updater: (prev: CelesteEvent) => CelesteEvent) => {
    setEvents(prev => prev.map(ev => ev.id === currentEventId ? updater(ev) : ev));
  };

  const updateEventDetails = (updates: Partial<CelesteEvent>) => {
    updateCurrentEvent(prev => ({ ...prev, ...updates }));
  };

  // Log activity helper
  const logActivity = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
    };
    updateCurrentEvent(prev => ({
      ...prev,
      activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
    }));
  };

  // Budget Handlers
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const id = `b-${Date.now()}`;
    const newItem: BudgetItem = { ...item, id };
    updateCurrentEvent(prev => ({
      ...prev,
      budgetItems: [...prev.budgetItems, newItem],
    }));
    logActivity({
      authorName: 'Host (You)',
      authorRole: 'Event Host',
      actionType: 'budget_updated',
      detail: `Added new budget line item "${newItem.name}" allocated for $${newItem.plannedAmount.toLocaleString()}.`,
      badge: 'Budget Added',
    });
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    updateCurrentEvent(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.map(item => item.id === id ? { ...item, ...updates } : item),
    }));
  };

  const deleteBudgetItem = (id: string) => {
    const item = currentEvent.budgetItems.find(i => i.id === id);
    updateCurrentEvent(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.filter(i => i.id !== id),
    }));
    if (item) {
      logActivity({
        authorName: 'Host (You)',
        authorRole: 'Event Host',
        actionType: 'budget_updated',
        detail: `Removed budget line item "${item.name}".`,
        badge: 'Budget Removed',
      });
    }
  };

  // Timeline Handlers
  const addTimelineItem = (item: Omit<TimelineItem, 'id'>) => {
    const id = `t-${Date.now()}`;
    const newItem: TimelineItem = { ...item, id };
    updateCurrentEvent(prev => ({
      ...prev,
      timeline: [...prev.timeline, newItem],
    }));
    logActivity({
      authorName: 'Host (You)',
      authorRole: 'Event Host',
      actionType: 'timeline_toggled',
      detail: `Created run-of-show entry "${newItem.title}" scheduled for ${newItem.time}.`,
      badge: 'Timeline Created',
    });
  };

  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    updateCurrentEvent(prev => ({
      ...prev,
      timeline: prev.timeline.map(item => item.id === id ? { ...item, ...updates } : item),
    }));
  };

  const toggleTimelineStatus = (id: string) => {
    const statuses: TimelineItem['status'][] = ['pending', 'in_progress', 'completed', 'delayed'];
    const item = currentEvent.timeline.find(t => t.id === id);
    if (!item) return;

    const nextIndex = (statuses.indexOf(item.status) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    updateTimelineItem(id, { status: nextStatus });
    logActivity({
      authorName: 'Host (You)',
      authorRole: 'Event Host',
      actionType: 'timeline_toggled',
      detail: `Updated status of "${item.title}" to ${nextStatus.replace('_', ' ').toUpperCase()}.`,
      badge: 'Status Update',
    });
  };

  const deleteTimelineItem = (id: string) => {
    updateCurrentEvent(prev => ({
      ...prev,
      timeline: prev.timeline.filter(t => t.id !== id),
    }));
  };

  // Vendor Handlers
  const addVendorItem = (vendor: Omit<VendorItem, 'id'>) => {
    const id = `v-${Date.now()}`;
    const newVendor: VendorItem = { ...vendor, id };
    updateCurrentEvent(prev => ({
      ...prev,
      vendors: [...prev.vendors, newVendor],
    }));
    logActivity({
      authorName: 'Host (You)',
      authorRole: 'Event Host',
      actionType: 'vendor_contract',
      detail: `Onboarded vendor ${newVendor.companyName} (${newVendor.category}) to procurement directory.`,
      badge: 'Vendor Added',
    });
  };

  const updateVendorItem = (id: string, updates: Partial<VendorItem>) => {
    updateCurrentEvent(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === id ? { ...v, ...updates } : v),
    }));
  };

  const deleteVendorItem = (id: string) => {
    updateCurrentEvent(prev => ({
      ...prev,
      vendors: prev.vendors.filter(v => v.id !== id),
    }));
  };

  const toggleVendorTask = (vendorId: string, taskId: string) => {
    updateCurrentEvent(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => {
        if (v.id !== vendorId) return v;
        return {
          ...v,
          tasks: v.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
        };
      }),
    }));
  };

  // Team & Simulation
  const postChatMessage = (message: string, authorName = 'Host (You)', role = 'Host & Creative Principal') => {
    if (!message.trim()) return;
    logActivity({
      authorName,
      authorRole: role,
      actionType: 'chat_message',
      detail: message.trim(),
      badge: 'Message',
    });
  };

  const updateCollaboratorStatus = (collabId: string, status: Collaborator['status'], activeCard?: string) => {
    updateCurrentEvent(prev => ({
      ...prev,
      collaborators: prev.collaborators.map(c => 
        c.id === collabId ? { ...c, status, ...(activeCard ? { activeCard } : {}) } : c
      ),
    }));
  };

  const triggerSimulatedAction = (customType?: string) => {
    const simulatedActions = [
      () => {
        const item = currentEvent.budgetItems[Math.floor(Math.random() * currentEvent.budgetItems.length)];
        if (item) {
          const delta = Math.round((Math.random() * 2000 - 800) / 100) * 100;
          const newCommitted = Math.max(item.plannedAmount * 0.5, item.committedAmount + delta);
          updateBudgetItem(item.id, { committedAmount: newCommitted });
          logActivity({
            authorName: 'Julian Ross',
            authorRole: 'Floral & Spatial Architect',
            actionType: 'budget_updated',
            detail: `Adjusted committed allocation for "${item.name}" to $${newCommitted.toLocaleString()} based on updated floral import quotes.`,
            badge: 'Floral Sync',
          });
          updateCollaboratorStatus('collab-2', 'editing', item.name);
        }
      },
      () => {
        const pending = currentEvent.timeline.find(t => t.status === 'pending' || t.status === 'in_progress');
        if (pending) {
          updateTimelineItem(pending.id, { status: 'completed' });
          logActivity({
            authorName: 'Marcus Croft',
            authorRole: 'Technical & Sound Producer',
            actionType: 'timeline_toggled',
            detail: `Marked "${pending.title}" as COMPLETED after verified sound check.`,
            badge: 'Run-of-Show',
          });
          updateCollaboratorStatus('collab-3', 'online', 'Run-of-Show Completed');
        }
      },
      () => {
        const vendor = currentEvent.vendors[Math.floor(Math.random() * currentEvent.vendors.length)];
        if (vendor && vendor.tasks.some(t => !t.done)) {
          const task = vendor.tasks.find(t => !t.done)!;
          toggleVendorTask(vendor.id, task.id);
          logActivity({
            authorName: 'Elena Vance',
            authorRole: 'Lead Event Director',
            actionType: 'vendor_contract',
            detail: `Verified deliverable for ${vendor.companyName}: "${task.text}".`,
            badge: 'Deliverable Verified',
          });
          updateCollaboratorStatus('collab-1', 'editing', vendor.companyName);
        }
      },
      () => {
        const messages = [
          'The sommelier confirmed our allocation of the 2018 reserve vintage. Cellar temperature will be stabilized at 12°C.',
          'Just completed the walk-through of the courtyard. Pin-spot lighting on the imperial table will be stunning at dusk.',
          'Guest transportation routes mapped out. Shuttles will cycle every 15 minutes from the partner hotel.',
          'Printed menu proofs received from the print studio. Hand-deckled edges with gold foil script look exquisite.',
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const collabs = [
          { name: 'Siobhan Roy', role: 'Hospitality & Sommelier Lead', id: 'collab-4' },
          { name: 'Elena Vance', role: 'Lead Event Director', id: 'collab-1' },
          { name: 'Julian Ross', role: 'Floral & Spatial Architect', id: 'collab-2' },
        ];
        const chosen = collabs[Math.floor(Math.random() * collabs.length)];
        logActivity({
          authorName: chosen.name,
          authorRole: chosen.role,
          actionType: 'chat_message',
          detail: msg,
          badge: 'Team Room Update',
        });
        updateCollaboratorStatus(chosen.id, 'online', 'Team Broadcast');
      },
    ];

    const randomAction = simulatedActions[Math.floor(Math.random() * simulatedActions.length)];
    randomAction();
  };

  // Auto-simulation timer
  useEffect(() => {
    if (!isSimulationActive) return;
    const intervalMs = simulationSpeed === 'fast' ? 7000 : 20000;
    const timer = setInterval(() => {
      triggerSimulatedAction();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isSimulationActive, simulationSpeed, currentEventId]);

  return (
    <EventContext.Provider
      value={{
        events,
        currentEvent,
        currentEventId,
        activeView,
        setActiveView,
        selectEvent,
        addNewEvent,
        resetToBenchmarks,
        updateEventDetails,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTimelineItem,
        updateTimelineItem,
        toggleTimelineStatus,
        deleteTimelineItem,
        addVendorItem,
        updateVendorItem,
        deleteVendorItem,
        toggleVendorTask,
        isSimulationActive,
        setIsSimulationActive,
        simulationSpeed,
        setSimulationSpeed,
        postChatMessage,
        triggerSimulatedAction,
        updateCollaboratorStatus,
        isGeneratorOpen,
        setIsGeneratorOpen,
        isBudgetAdvisorOpen,
        setIsBudgetAdvisorOpen,
        selectedVendorForInquiry,
        setSelectedVendorForInquiry,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

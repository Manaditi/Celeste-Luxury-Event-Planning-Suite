import React, { useState, useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import { TimelineItem, TimelinePhase, TimelineRole, TimelineStatus } from '../../types';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Plus, 
  Search, 
  Printer, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3,
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { 
    currentEvent, 
    addTimelineItem, 
    updateTimelineItem, 
    toggleTimelineStatus, 
    deleteTimelineItem 
  } = useEventContext();

  const [activePhase, setActivePhase] = useState<TimelinePhase>('day_of');
  const [selectedRole, setSelectedRole] = useState<TimelineRole>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);

  // New item form state
  const [formTime, setFormTime] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOwnerRole, setFormOwnerRole] = useState<TimelineItem['ownerRole']>('Lead Director');
  const [formLocation, setFormLocation] = useState('');
  const [formDuration, setFormDuration] = useState('');

  const roles: TimelineRole[] = [
    'All',
    'Lead Director',
    'Floral & Decor',
    'A/V & Sound',
    'Hospitality & Bar',
    'Host & VIP',
  ];

  // Memoized filtered timeline
  const filteredTimeline = useMemo(() => {
    return (currentEvent.timeline || []).filter((item) => {
      if (item.phase !== activePhase) return false;
      if (selectedRole !== 'All' && item.ownerRole !== selectedRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.time.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentEvent.timeline, activePhase, selectedRole, searchQuery]);

  const handleOpenAdd = (item?: TimelineItem) => {
    if (item) {
      setEditingItem(item);
      setFormTime(item.time);
      setFormTitle(item.title);
      setFormDescription(item.description);
      setFormOwnerRole(item.ownerRole);
      setFormLocation(item.location);
      setFormDuration(item.duration || '');
    } else {
      setEditingItem(null);
      setFormTime(activePhase === 'day_of' ? '15:00' : '2 Months Out');
      setFormTitle('');
      setFormDescription('');
      setFormOwnerRole('Lead Director');
      setFormLocation(currentEvent.location.split(',')[0]);
      setFormDuration('60 min');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      updateTimelineItem(editingItem.id, {
        time: formTime,
        title: formTitle,
        description: formDescription,
        ownerRole: formOwnerRole,
        location: formLocation,
        duration: formDuration,
      });
    } else {
      addTimelineItem({
        phase: activePhase,
        time: formTime,
        title: formTitle,
        description: formDescription,
        ownerRole: formOwnerRole,
        status: 'pending',
        location: formLocation,
        duration: formDuration,
      });
    }
    setIsAddModalOpen(false);
  };

  const printSchedule = () => {
    window.print();
  };

  const statusBadge = (status: TimelineStatus) => {
    const map = {
      pending: { label: 'Pending', style: 'text-stone-600 bg-stone-100/80 border-stone-300' },
      in_progress: { label: 'In Progress', style: 'text-amber-800 bg-amber-50 border-amber-300' },
      completed: { label: 'Completed', style: 'text-emerald-800 bg-emerald-50 border-emerald-300' },
      delayed: { label: 'Delayed', style: 'text-rose-800 bg-rose-50 border-rose-300' },
    };
    const s = map[status];
    return (
      <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${s.style}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER CONTROLS: DUAL VIEW TOGGLE & ROLE FILTERS */}
      <div className="bg-white border border-[#B4863A]/25 p-5 rounded-sm shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Dual Phase Selector */}
        <div className="flex items-center space-x-1 p-1 bg-[#FAF8F5] border border-stone-200/80 rounded-sm">
          <button
            onClick={() => setActivePhase('day_of')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
              activePhase === 'day_of'
                ? 'bg-charcoal-900 text-[#FAF8F5] shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#B4863A]" />
            <span>Day-of Master Schedule</span>
            <span className="text-[10px] font-mono opacity-80">
              ({currentEvent.timeline?.filter(t => t.phase === 'day_of').length})
            </span>
          </button>

          <button
            onClick={() => setActivePhase('planning')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
              activePhase === 'planning'
                ? 'bg-charcoal-900 text-[#FAF8F5] shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#B4863A]" />
            <span>Planning Milestones</span>
            <span className="text-[10px] font-mono opacity-80">
              ({currentEvent.timeline?.filter(t => t.phase === 'planning').length})
            </span>
          </button>
        </div>

        {/* Right: Search, Export & Add Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-stone-200/80 rounded text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#B4863A]"
            />
          </div>

          <button
            onClick={printSchedule}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200/80 rounded text-xs text-charcoal-700 transition-colors"
            title="Print or export Run-of-Show sheet"
          >
            <Printer className="w-3.5 h-3.5 text-charcoal-500" />
            <span className="hidden sm:inline">Print Run-of-Show</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#B4863A] hover:bg-[#946A29] text-white rounded text-xs font-medium uppercase tracking-wider transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

      </div>

      {/* ROLE FILTER SEGMENTED TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-charcoal-400 uppercase tracking-widest text-[10px] font-medium mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3 text-[#B4863A]" />
          <span>Role Filter:</span>
        </span>
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-all ${
              selectedRole === role
                ? 'bg-charcoal-900 text-[#FAF8F5] font-semibold'
                : 'bg-white border border-stone-200 text-charcoal-600 hover:border-[#B4863A]/40'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* CHRONOLOGICAL TIMELINE STREAM */}
      <div className="bg-white border border-stone-200/80 rounded-sm shadow-luxury overflow-hidden">
        
        {/* Table/List Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#FAF8F5] border-b border-stone-200 text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold">
          <div className="col-span-2">Time / Offset</div>
          <div className="col-span-5">Event & Deliverable Directive</div>
          <div className="col-span-2">Owner Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Timeline Rows */}
        <div className="divide-y divide-stone-100">
          {filteredTimeline.length === 0 ? (
            <div className="py-12 text-center text-charcoal-400">
              <Clock className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-serif">No timeline items found matching the selected filter.</p>
              <button
                onClick={() => handleOpenAdd()}
                className="mt-3 text-xs text-[#946A29] font-medium hover:underline"
              >
                + Add an entry now
              </button>
            </div>
          ) : (
            filteredTimeline.map((item) => (
              <div 
                key={item.id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 items-start hover:bg-[#FAF8F5]/60 transition-colors group"
              >
                {/* Time & Duration */}
                <div className="col-span-2">
                  <div className="font-mono text-sm font-semibold tabular-nums text-charcoal-900">
                    {item.time}
                  </div>
                  {item.duration && (
                    <span className="text-[10px] text-charcoal-400 font-mono block mt-0.5">
                      Duration: {item.duration}
                    </span>
                  )}
                  <div className="flex items-center space-x-1 text-[11px] text-charcoal-500 font-light mt-1">
                    <MapPin className="w-3 h-3 text-[#B4863A] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                {/* Directive Title & Description */}
                <div className="col-span-5">
                  <h4 className="font-serif text-sm font-semibold text-charcoal-900 group-hover:text-[#946A29] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-charcoal-600 font-light leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                {/* Owner Role */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-1.5 text-xs text-charcoal-800 font-medium">
                    <User className="w-3.5 h-3.5 text-[#B4863A]" />
                    <span>{item.ownerRole}</span>
                  </div>
                </div>

                {/* Status Toggle (Interactive Zero-Pill) */}
                <div className="col-span-2">
                  <button
                    onClick={() => toggleTimelineStatus(item.id)}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                    title="Click to toggle status (Pending -> In Progress -> Completed -> Delayed)"
                  >
                    {statusBadge(item.status)}
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end space-x-1 text-charcoal-400">
                  <button
                    onClick={() => handleOpenAdd(item)}
                    className="p-1 hover:text-charcoal-800 transition-colors"
                    title="Edit item"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove timeline entry "${item.title}"?`)) {
                        deleteTimelineItem(item.id);
                      }
                    }}
                    className="p-1 hover:text-rose-700 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* ADD / EDIT TIMELINE ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#B4863A]/40 w-full max-w-lg rounded-sm shadow-luxury-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                {editingItem ? 'Edit Run-of-Show Item' : 'New Timeline Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    {activePhase === 'day_of' ? 'Timestamp (e.g. 17:30)' : 'Time Offset (e.g. 3 Months Out)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Duration (e.g. 45 min)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Title & Directive
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Twilight Ceremony Processional"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Description & Run-of-Show Notes
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Details for production team..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Owner Role
                  </label>
                  <select
                    value={formOwnerRole}
                    onChange={(e) => setFormOwnerRole(e.target.value as TimelineItem['ownerRole'])}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none bg-white"
                  >
                    <option value="Lead Director">Lead Director</option>
                    <option value="Floral & Decor">Floral & Decor</option>
                    <option value="A/V & Sound">A/V & Sound</option>
                    <option value="Hospitality & Bar">Hospitality & Bar</option>
                    <option value="Host & VIP">Host & VIP</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Location / Zone
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Historic Courtyard"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-charcoal-600 hover:text-charcoal-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-charcoal-900 hover:bg-[#2A2421] text-white text-xs font-medium uppercase tracking-wider rounded"
                >
                  {editingItem ? 'Update Item' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

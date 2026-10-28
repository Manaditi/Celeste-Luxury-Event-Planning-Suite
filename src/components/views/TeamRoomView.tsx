import React, { useState, useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import { Collaborator } from '../../types';
import { 
  Users, 
  Radio, 
  Send, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  Zap, 
  CheckCircle2, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Flame,
  ArrowRight
} from 'lucide-react';

export const TeamRoomView: React.FC = () => {
  const { 
    currentEvent, 
    isSimulationActive, 
    setIsSimulationActive, 
    simulationSpeed, 
    setSimulationSpeed, 
    postChatMessage, 
    triggerSimulatedAction,
    updateCollaboratorStatus 
  } = useEventContext();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>('all');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    postChatMessage(inputMessage);
    setInputMessage('');
  };

  const collaborators = currentEvent.collaborators || [];
  const activeCount = useMemo(() => {
    return collaborators.filter(c => c.status !== 'away').length;
  }, [collaborators]);

  const statusIndicator = (status: Collaborator['status']) => {
    switch (status) {
      case 'online':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Online" />;
      case 'editing':
        return <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ring-2 ring-amber-200" title="Actively Editing" />;
      case 'reviewing':
        return <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-sky-200" title="Reviewing Cards" />;
      case 'away':
        return <span className="w-2 h-2 rounded-full bg-stone-300" title="Away" />;
    }
  };

  const filteredLogs = useMemo(() => {
    return (currentEvent.activityLogs || []).filter((log) => {
      if (selectedCollaboratorId === 'all') return true;
      const author = collaborators.find(c => c.id === selectedCollaboratorId);
      return author && log.authorName === author.name;
    });
  }, [currentEvent.activityLogs, selectedCollaboratorId, collaborators]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* COLLABORATION CONTROL HEADER */}
      <div className="bg-white border border-[#B4863A]/25 p-5 rounded-sm shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Active Presence Count */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-sm bg-[#FAF8F5] border border-[#B4863A]/40 flex items-center justify-center">
            <Radio className={`w-5 h-5 ${isSimulationActive ? 'text-emerald-600 animate-pulse' : 'text-stone-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                Live Multi-User Collaborative Suite
              </h3>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                {activeCount} of {collaborators.length} Active
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Simulated real-time team synchronization with live presence cards and audit logging
            </p>
          </div>
        </div>

        {/* Right: Simulation Controls & Quick Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pause / Resume Engine */}
          <button
            onClick={() => setIsSimulationActive(!isSimulationActive)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              isSimulationActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {isSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulationActive ? 'Simulation Running' : 'Simulation Paused'}</span>
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center space-x-1 bg-[#FAF8F5] border border-stone-200 p-0.5 rounded text-xs">
            <button
              onClick={() => setSimulationSpeed('realistic')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                simulationSpeed === 'realistic' ? 'bg-charcoal-900 text-white' : 'text-charcoal-600'
              }`}
            >
              Realistic (20s)
            </button>
            <button
              onClick={() => setSimulationSpeed('fast')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                simulationSpeed === 'fast' ? 'bg-charcoal-900 text-white' : 'text-charcoal-600'
              }`}
            >
              Fast (7s)
            </button>
          </div>

          {/* Instant Trigger Action */}
          <button
            onClick={() => triggerSimulatedAction()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#B4863A] hover:bg-[#946A29] text-white rounded text-xs font-medium uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Action</span>
          </button>
        </div>

      </div>

      {/* ACTIVE TEAM CARDS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {collaborators.map((collab) => {
          const isSelected = selectedCollaboratorId === collab.id;
          return (
            <div 
              key={collab.id}
              onClick={() => setSelectedCollaboratorId(isSelected ? 'all' : collab.id)}
              className={`p-4 bg-white rounded-sm border transition-all cursor-pointer relative shadow-sm ${
                isSelected 
                  ? 'border-[#B4863A] ring-1 ring-[#B4863A]/40' 
                  : 'border-stone-200/80 hover:border-[#B4863A]/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative shrink-0">
                  <img
                    src={collab.avatar}
                    alt={collab.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#B4863A]/30"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white p-0.5 rounded-full shadow-xs">
                    {statusIndicator(collab.status)}
                  </div>
                </div>

                <div className="truncate">
                  <h4 className="font-serif text-sm font-semibold text-charcoal-900 truncate">
                    {collab.name}
                  </h4>
                  <p className="text-[11px] text-[#946A29] font-medium truncate">
                    {collab.role}
                  </p>
                </div>
              </div>

              {/* Active Card Viewing Tag */}
              <div className="mt-3 pt-2.5 border-t border-stone-100">
                <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block">
                  Current Focus:
                </span>
                <p className="text-xs text-charcoal-700 font-medium truncate mt-0.5 flex items-center space-x-1">
                  <Eye className="w-3 h-3 text-[#B4863A] shrink-0" />
                  <span className="truncate">{collab.activeCard || 'Master Schedule'}</span>
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-charcoal-400 font-mono">
                <span className="capitalize">{collab.status}</span>
                <span>{collab.assignedTasksCount} tasks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* COLLABORATIVE AUDIT LOG & LIVE CHAT FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Live Activity Audit Feed */}
        <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-charcoal-900">
                  Collaborative Activity Audit Stream
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Synchronous log of all budget modifications, status toggles, and team dispatches
                </p>
              </div>

              {selectedCollaboratorId !== 'all' && (
                <button
                  onClick={() => setSelectedCollaboratorId('all')}
                  className="text-xs text-[#946A29] hover:underline"
                >
                  Clear Filter (Show All)
                </button>
              )}
            </div>

            <div className="p-5 divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-charcoal-400">
                  <Activity className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm font-serif">No audit events recorded for this selection.</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const typeColors = {
                    budget_updated: 'text-amber-800 bg-amber-50 border-amber-200',
                    timeline_toggled: 'text-sky-800 bg-sky-50 border-sky-200',
                    vendor_contract: 'text-emerald-800 bg-emerald-50 border-emerald-200',
                    chat_message: 'text-stone-700 bg-stone-50 border-stone-200',
                    plan_generated: 'text-purple-800 bg-purple-50 border-purple-200',
                    task_assigned: 'text-[#946A29] bg-[#FAF8F5] border-[#B4863A]/30',
                  };

                  return (
                    <div key={log.id} className="py-3.5 flex items-start space-x-3.5 group">
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#B4863A]/30 flex items-center justify-center font-serif text-xs font-bold text-charcoal-800 shrink-0 mt-0.5">
                        {log.authorName.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-charcoal-900">{log.authorName}</span>
                            <span className="text-[10px] text-charcoal-400 font-light">· {log.authorRole}</span>
                          </div>
                          <span className="text-[10px] font-mono text-charcoal-400">{log.timestamp}</span>
                        </div>

                        <p className="text-xs text-charcoal-700 font-light mt-1 leading-relaxed">
                          {log.detail}
                        </p>

                        {log.badge && (
                          <span className={`inline-block mt-1.5 text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${
                            typeColors[log.actionType] || 'text-stone-600 bg-stone-50 border-stone-200'
                          }`}>
                            {log.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Simulation Triggers Footer */}
          <div className="p-4 bg-[#FAF8F5] border-t border-stone-200/80 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-medium mr-1">
              Simulate:
            </span>
            <button
              onClick={() => triggerSimulatedAction()}
              className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] text-charcoal-700 font-medium transition-colors"
            >
              Julian (Floral Update)
            </button>
            <button
              onClick={() => triggerSimulatedAction()}
              className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] text-charcoal-700 font-medium transition-colors"
            >
              Marcus (Audio Calibration)
            </button>
            <button
              onClick={() => triggerSimulatedAction()}
              className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] text-charcoal-700 font-medium transition-colors"
            >
              Siobhan (Sommelier Tasting)
            </button>
          </div>
        </div>

        {/* Right (1 col): Team Room Live Chat Dispatch */}
        <div className="bg-white border border-stone-200/80 rounded-sm shadow-luxury p-5 flex flex-col justify-between h-[580px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#B4863A]" />
                <h3 className="font-serif text-sm font-semibold text-charcoal-900">
                  Directorate Dispatch Chat
                </h3>
              </div>
              <span className="text-[10px] font-mono text-charcoal-400">Host Channel</span>
            </div>

            <div className="mt-3 space-y-3 overflow-y-auto max-h-[400px] pr-1">
              <div className="bg-[#FAF8F5] p-3 rounded border border-stone-200/60 text-xs">
                <span className="text-[10px] font-bold text-[#946A29] uppercase block mb-0.5">
                  Elena Vance · Lead Event Director
                </span>
                <p className="text-charcoal-700 font-light leading-relaxed">
                  Welcome to the Céleste live room. Julian, Marcus, and Siobhan are continuously updating allocations and technical riders. Post directives here anytime!
                </p>
              </div>

              {currentEvent.activityLogs
                ?.filter(l => l.actionType === 'chat_message')
                .slice(0, 5)
                .map((msg) => (
                  <div key={msg.id} className="bg-white p-3 rounded border border-stone-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-charcoal-900">{msg.authorName}</span>
                      <span className="text-[9px] font-mono text-charcoal-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-charcoal-700 font-light leading-relaxed mt-1">
                      {msg.detail}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-stone-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Broadcast directive to team..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs bg-[#FAF8F5] border border-stone-200 rounded text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#B4863A]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1 bg-charcoal-900 hover:bg-[#2A2421] text-white rounded transition-colors"
                title="Send message"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import { BudgetItem, BudgetStatus } from '../../types';
import { 
  DollarSign, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Filter,
  PieChart,
  ArrowUpRight
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { 
    currentEvent, 
    addBudgetItem, 
    updateBudgetItem, 
    deleteBudgetItem, 
    setIsBudgetAdvisorOpen 
  } = useEventContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<BudgetItem['category']>('Venue & Structure');
  const [formName, setFormName] = useState('');
  const [formPlanned, setFormPlanned] = useState<number>(10000);
  const [formCommitted, setFormCommitted] = useState<number>(10000);
  const [formPaid, setFormPaid] = useState<number>(5000);
  const [formStatus, setFormStatus] = useState<BudgetStatus>('budgeted');
  const [formNotes, setFormNotes] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('Elena Vance');

  const categories = [
    'All',
    'Venue & Structure',
    'Catering & Spirits',
    'Floral & Spatial Decor',
    'Photography & Cinema',
    'Entertainment & Sound',
    'Luxury Transport',
    'Stationery & Calligraphy',
    'Contingency & Fees',
  ];

  // Memoized Financial aggregates
  const { totalPlanned, totalCommitted, totalPaid, budgetVariance, perGuestCommitted, guestCount } = useMemo(() => {
    const planned = currentEvent.budgetTotal || 1;
    const committed = (currentEvent.budgetItems || []).reduce((sum, i) => sum + (i.committedAmount || 0), 0);
    const paid = (currentEvent.budgetItems || []).reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const variance = committed - planned;
    const guests = currentEvent.guestCount || 1;
    const perGuest = Math.round(committed / guests);
    return {
      totalPlanned: planned,
      totalCommitted: committed,
      totalPaid: paid,
      budgetVariance: variance,
      perGuestCommitted: perGuest,
      guestCount: guests,
    };
  }, [currentEvent.budgetTotal, currentEvent.budgetItems, currentEvent.guestCount]);

  // Memoized Filtered items
  const filteredItems = useMemo(() => {
    return (currentEvent.budgetItems || []).filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q) ||
          item.assignedTo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentEvent.budgetItems, selectedCategory, searchQuery]);

  // Memoized Category breakdown cards
  const categoryBreakdown = useMemo(() => {
    return categories.slice(1).map((cat) => {
      const items = (currentEvent.budgetItems || []).filter((i) => i.category === cat);
      const planned = items.reduce((s, i) => s + (i.plannedAmount || 0), 0);
      const committed = items.reduce((s, i) => s + (i.committedAmount || 0), 0);
      const paid = items.reduce((s, i) => s + (i.paidAmount || 0), 0);
      const variance = committed - planned;
      return { category: cat, count: items.length, planned, committed, paid, variance };
    }).filter(c => c.count > 0 || c.planned > 0);
  }, [currentEvent.budgetItems]);

  const handleOpenAdd = (item?: BudgetItem) => {
    if (item) {
      setEditingItem(item);
      setFormCategory(item.category);
      setFormName(item.name);
      setFormPlanned(item.plannedAmount);
      setFormCommitted(item.committedAmount);
      setFormPaid(item.paidAmount);
      setFormStatus(item.status);
      setFormNotes(item.notes);
      setFormAssignedTo(item.assignedTo);
    } else {
      setEditingItem(null);
      setFormCategory('Venue & Structure');
      setFormName('');
      setFormPlanned(15000);
      setFormCommitted(15000);
      setFormPaid(0);
      setFormStatus('budgeted');
      setFormNotes('');
      setFormAssignedTo('Elena Vance');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        category: formCategory,
        name: formName,
        plannedAmount: Number(formPlanned),
        committedAmount: Number(formCommitted),
        paidAmount: Number(formPaid),
        status: formStatus,
        notes: formNotes,
        assignedTo: formAssignedTo,
      });
    } else {
      addBudgetItem({
        category: formCategory,
        name: formName,
        plannedAmount: Number(formPlanned),
        committedAmount: Number(formCommitted),
        paidAmount: Number(formPaid),
        status: formStatus,
        notes: formNotes,
        assignedTo: formAssignedTo,
      });
    }
    setIsAddModalOpen(false);
  };

  const cycleStatus = (id: string, current: BudgetStatus) => {
    const list: BudgetStatus[] = ['budgeted', 'contracted', 'deposit_paid', 'paid_in_full'];
    const next = list[(list.indexOf(current) + 1) % list.length];
    updateBudgetItem(id, { status: next });
  };

  const statusBadge = (status: BudgetStatus) => {
    const map = {
      budgeted: { label: 'Budgeted', style: 'text-stone-600 bg-stone-100 border-stone-200' },
      contracted: { label: 'Contracted', style: 'text-amber-800 bg-amber-50 border-amber-200' },
      deposit_paid: { label: 'Deposit Paid', style: 'text-sky-800 bg-sky-50 border-sky-200' },
      paid_in_full: { label: 'Paid in Full', style: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
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
      
      {/* FINANCIAL OVERVIEW STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#B4863A]/30 p-5 rounded-sm shadow-luxury">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
            Target Cap Allocation
          </span>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-charcoal-900">
            ${totalPlanned.toLocaleString()}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light mt-1">
            Currency: <span className="font-mono">{currentEvent.currency || 'USD'}</span>
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-luxury">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
            Committed Contracts
          </span>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-charcoal-900">
            ${totalCommitted.toLocaleString()}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light mt-1">
            <span className="font-mono tabular-nums">${perGuestCommitted.toLocaleString()}</span> / guest ({guestCount} guests)
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-luxury">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
            Variance Exposure
          </span>
          <div className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
            budgetVariance > 0 ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            {budgetVariance > 0 ? `+$${budgetVariance.toLocaleString()}` : `-$${Math.abs(budgetVariance).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light mt-1">
            {budgetVariance > 0 ? 'Over budget cap' : 'Reserve surplus buffer'}
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
              Settled Deposits & Cash
            </span>
            <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-800">
              ${totalPaid.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => setIsBudgetAdvisorOpen(true)}
            className="mt-3 flex items-center justify-between w-full px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F4EFEA] border border-[#B4863A]/40 rounded text-xs text-[#946A29] font-medium transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B4863A]" />
              <span>AI Advisor Levers</span>
            </span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* CATEGORY BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {categoryBreakdown.map((cat) => {
          const isOver = cat.variance > 0;
          return (
            <div 
              key={cat.category}
              onClick={() => setSelectedCategory(selectedCategory === cat.category ? 'All' : cat.category)}
              className={`p-3.5 rounded border transition-all cursor-pointer ${
                selectedCategory === cat.category
                  ? 'bg-white border-[#B4863A] ring-1 ring-[#B4863A]/40 shadow-xs'
                  : 'bg-white/90 border-stone-200/80 hover:border-[#B4863A]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-semibold text-charcoal-900 truncate">
                  {cat.category}
                </span>
                <span className="text-[10px] font-mono text-charcoal-400">
                  {cat.count} items
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between font-mono text-xs tabular-nums">
                <span className="font-semibold text-charcoal-800">
                  ${cat.committed.toLocaleString()}
                </span>
                <span className={`text-[11px] ${isOver ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {isOver ? `+$${cat.variance.toLocaleString()}` : 'Within cap'}
                </span>
              </div>

              <div className="mt-2 w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOver ? 'bg-amber-600' : 'bg-[#B4863A]'}`}
                  style={{ width: `${Math.min(100, (cat.committed / (cat.planned || 1)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTROLS STRIP */}
      <div className="bg-white border border-[#B4863A]/25 p-4 rounded-sm shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar text-xs">
          <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-[#B4863A]" />
            <span>Category:</span>
          </span>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-charcoal-900 text-[#FAF8F5] font-semibold'
                  : 'bg-white border border-stone-200 text-charcoal-600 hover:border-[#B4863A]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Search & Add */}
        <div className="flex items-center space-x-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ledger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-stone-200/80 rounded text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#B4863A]"
            />
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#B4863A] hover:bg-[#946A29] text-white rounded text-xs font-medium uppercase tracking-wider transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

      </div>

      {/* TABULAR BUDGET LEDGER */}
      <div className="bg-white border border-stone-200/80 rounded-sm shadow-luxury overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#FAF8F5] border-b border-stone-200 text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold">
          <div className="col-span-4">Item & Scope Notes</div>
          <div className="col-span-2 text-right">Planned</div>
          <div className="col-span-2 text-right">Committed</div>
          <div className="col-span-1 text-right">Paid</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-100">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-charcoal-400">
              <DollarSign className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-serif">No line items found for this selection.</p>
              <button
                onClick={() => handleOpenAdd()}
                className="mt-3 text-xs text-[#946A29] font-medium hover:underline"
              >
                + Add a budget allocation
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const variance = item.committedAmount - item.plannedAmount;
              const isOver = variance > 0;
              return (
                <div 
                  key={item.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#FAF8F5]/60 transition-colors group"
                >
                  {/* Item Description */}
                  <div className="col-span-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-[#946A29] uppercase">
                        [{item.category.split(' ')[0]}]
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-charcoal-900 group-hover:text-[#946A29] transition-colors">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-xs text-charcoal-500 font-light mt-0.5 line-clamp-1">
                      {item.notes || 'No contract stipulations noted.'}
                    </p>
                    <span className="text-[10px] text-charcoal-400 font-light block mt-0.5">
                      Assigned to: <strong className="font-medium text-charcoal-600">{item.assignedTo}</strong>
                    </span>
                  </div>

                  {/* Planned Amount */}
                  <div className="col-span-2 text-right font-mono text-sm tabular-nums text-charcoal-500">
                    ${item.plannedAmount.toLocaleString()}
                  </div>

                  {/* Committed Amount + Variance Indicator */}
                  <div className="col-span-2 text-right font-mono text-sm tabular-nums font-semibold text-charcoal-900">
                    ${item.committedAmount.toLocaleString()}
                    {variance !== 0 && (
                      <span className={`text-[10px] block font-mono ${isOver ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {isOver ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`}
                      </span>
                    )}
                  </div>

                  {/* Paid Amount */}
                  <div className="col-span-1 text-right font-mono text-sm tabular-nums text-emerald-800">
                    ${item.paidAmount.toLocaleString()}
                  </div>

                  {/* Status Toggle Button */}
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => cycleStatus(item.id, item.status)}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      title="Click to advance status"
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
                        if (confirm(`Remove budget item "${item.name}"?`)) {
                          deleteBudgetItem(item.id);
                        }
                      }}
                      className="p-1 hover:text-rose-700 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Ledger Footer */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#FAF8F5] border-t border-stone-200 text-xs font-mono font-semibold text-charcoal-900">
          <div className="col-span-4 uppercase tracking-wider font-sans">
            Total Ledger Portfolio ({filteredItems.length} items)
          </div>
          <div className="col-span-2 text-right">
            ${filteredItems.reduce((s, i) => s + i.plannedAmount, 0).toLocaleString()}
          </div>
          <div className="col-span-2 text-right text-charcoal-900">
            ${filteredItems.reduce((s, i) => s + i.committedAmount, 0).toLocaleString()}
          </div>
          <div className="col-span-1 text-right text-emerald-800">
            ${filteredItems.reduce((s, i) => s + i.paidAmount, 0).toLocaleString()}
          </div>
          <div className="col-span-3 text-right text-charcoal-500 font-sans font-light">
            All amounts verified by Fiduciary Lead
          </div>
        </div>

      </div>

      {/* ADD / EDIT BUDGET ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#B4863A]/40 w-full max-w-lg rounded-sm shadow-luxury-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                {editingItem ? 'Edit Budget Item' : 'New Budget Line Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as BudgetItem['category'])}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none bg-white"
                >
                  {categories.slice(1).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Line Item Description
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Imperial Table Suspended Florals"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Planned ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formPlanned}
                    onChange={(e) => setFormPlanned(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Committed ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formCommitted}
                    onChange={(e) => setFormCommitted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Paid ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formPaid}
                    onChange={(e) => setFormPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as BudgetStatus)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none bg-white"
                  >
                    <option value="budgeted">Budgeted</option>
                    <option value="contracted">Contracted</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Assigned Lead
                  </label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none bg-white"
                  >
                    <option value="Elena Vance">Elena Vance (Director)</option>
                    <option value="Julian Ross">Julian Ross (Florals)</option>
                    <option value="Marcus Croft">Marcus Croft (Sound/Tech)</option>
                    <option value="Siobhan Roy">Siobhan Roy (Hospitality)</option>
                    <option value="Victoria Chen">Victoria Chen (Host)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Contract Notes & Invoicing Details
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Payment milestones, cancellation clauses..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                />
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
                  {editingItem ? 'Update Item' : 'Add to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

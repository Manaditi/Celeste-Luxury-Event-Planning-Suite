import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { VendorItem, ContractStatus } from '../../types';
import { 
  CheckSquare, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  Globe, 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText,
  Sparkles
} from 'lucide-react';

export const VendorView: React.FC = () => {
  const { 
    currentEvent, 
    addVendorItem, 
    updateVendorItem, 
    deleteVendorItem, 
    toggleVendorTask,
    setSelectedVendorForInquiry 
  } = useEventContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState('Floral & Styling');
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEstimate, setFormEstimate] = useState<number>(20000);
  const [formDeposit, setFormDeposit] = useState<number>(10000);
  const [formStatus, setFormStatus] = useState<ContractStatus>('contract_signed');
  const [formNotes, setFormNotes] = useState('');
  const [formWebsite, setFormWebsite] = useState('');

  const statuses = [
    'All',
    'researching',
    'inquiry_sent',
    'proposal_reviewed',
    'contract_signed',
    'deposit_paid',
    'fulfilled',
  ];

  const filteredVendors = (currentEvent.vendors || []).filter((v) => {
    if (selectedStatus !== 'All' && v.contractStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.companyName.toLowerCase().includes(q) ||
        v.contactName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalContracted = (currentEvent.vendors || []).reduce((s, v) => s + (v.costEstimate || 0), 0);
  const totalDeposited = (currentEvent.vendors || []).reduce((s, v) => s + (v.depositPaid || 0), 0);
  const remainingLiability = totalContracted - totalDeposited;

  const handleOpenAdd = (v?: VendorItem) => {
    if (v) {
      setEditingVendor(v);
      setFormCategory(v.category);
      setFormCompany(v.companyName);
      setFormContact(v.contactName);
      setFormEmail(v.email);
      setFormPhone(v.phone);
      setFormEstimate(v.costEstimate);
      setFormDeposit(v.depositPaid);
      setFormStatus(v.contractStatus);
      setFormNotes(v.notes);
      setFormWebsite(v.website || '');
    } else {
      setEditingVendor(null);
      setFormCategory('Fine Dining & Bar');
      setFormCompany('');
      setFormContact('');
      setFormEmail('');
      setFormPhone('');
      setFormEstimate(25000);
      setFormDeposit(12500);
      setFormStatus('inquiry_sent');
      setFormNotes('');
      setFormWebsite('');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim()) return;

    if (editingVendor) {
      updateVendorItem(editingVendor.id, {
        category: formCategory,
        companyName: formCompany,
        contactName: formContact,
        email: formEmail,
        phone: formPhone,
        costEstimate: Number(formEstimate),
        depositPaid: Number(formDeposit),
        contractStatus: formStatus,
        notes: formNotes,
        website: formWebsite,
      });
    } else {
      addVendorItem({
        category: formCategory,
        companyName: formCompany,
        contactName: formContact,
        email: formEmail,
        phone: formPhone,
        costEstimate: Number(formEstimate),
        depositPaid: Number(formDeposit),
        contractStatus: formStatus,
        notes: formNotes,
        website: formWebsite,
        tasks: [
          { id: `t-1-${Date.now()}`, text: 'Review preliminary scope and pricing proposal', done: true },
          { id: `t-2-${Date.now()}`, text: 'Schedule 15-minute director alignment video conference', done: false },
          { id: `t-3-${Date.now()}`, text: 'Sign master service contract and transfer retainer', done: false },
        ],
      });
    }
    setIsAddModalOpen(false);
  };

  const statusBadge = (status: ContractStatus) => {
    const map = {
      researching: { label: 'Researching', style: 'text-stone-600 bg-stone-100 border-stone-200' },
      inquiry_sent: { label: 'Inquiry Sent', style: 'text-sky-800 bg-sky-50 border-sky-200' },
      proposal_reviewed: { label: 'Proposal Reviewed', style: 'text-purple-800 bg-purple-50 border-purple-200' },
      contract_signed: { label: 'Contract Signed', style: 'text-amber-800 bg-amber-50 border-amber-200' },
      deposit_paid: { label: 'Deposit Paid', style: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
      fulfilled: { label: 'Fulfilled', style: 'text-stone-700 bg-stone-100 border-stone-300' },
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
      
      {/* VENDOR METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-[#B4863A]/30 p-5 rounded-sm shadow-luxury">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
            Total Contracted Procurement
          </span>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-charcoal-900">
            ${totalContracted.toLocaleString()}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light mt-1">
            Across <span className="font-mono">{currentEvent.vendors?.length || 0}</span> specialized ateliers
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-luxury">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
            Secured Retainers & Deposits
          </span>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-800">
            ${totalDeposited.toLocaleString()}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light mt-1">
            Settled via fiduciary wire transfer
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 p-5 rounded-sm shadow-luxury">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
            Outstanding Vendor Balances
          </span>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-charcoal-700">
            ${remainingLiability.toLocaleString()}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light mt-1">
            Due upon final milestone & load-in
          </p>
        </div>

      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-[#B4863A]/25 p-4 rounded-sm shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar text-xs">
          <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-[#B4863A]" />
            <span>Status:</span>
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-charcoal-900 text-[#FAF8F5] font-semibold'
                  : 'bg-white border border-stone-200 text-charcoal-600 hover:border-[#B4863A]/40'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Right Search & Add */}
        <div className="flex items-center space-x-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search directory..."
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
            <span>Add Vendor</span>
          </button>
        </div>

      </div>

      {/* VENDOR DIRECTORY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVendors.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-charcoal-400 bg-white border border-stone-200 rounded-sm">
            <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-serif">No vendors match your search criteria.</p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-3 text-xs text-[#946A29] font-medium hover:underline"
            >
              + Onboard a new vendor
            </button>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div 
              key={vendor.id}
              className="bg-white border border-stone-200/80 rounded-sm shadow-luxury p-6 flex flex-col justify-between hover:border-[#B4863A]/50 transition-all group"
            >
              <div>
                {/* Header: Category & Contract Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#946A29] font-semibold">
                    {vendor.category}
                  </span>
                  {statusBadge(vendor.contractStatus)}
                </div>

                {/* Company Name & Contact */}
                <div className="mt-2.5 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-charcoal-900 group-hover:text-[#946A29] transition-colors">
                      {vendor.companyName}
                    </h3>
                    <p className="text-xs text-charcoal-600 font-light mt-0.5">
                      Contact: <strong className="font-medium text-charcoal-800">{vendor.contactName}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-bold tabular-nums text-charcoal-900">
                      ${vendor.costEstimate.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 block">
                      ${vendor.depositPaid.toLocaleString()} paid
                    </span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-x-4 gap-y-2 text-xs text-charcoal-600 font-light">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B4863A]" />
                    <a href={`mailto:${vendor.email}`} className="hover:underline">{vendor.email}</a>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B4863A]" />
                    <span className="font-mono">{vendor.phone}</span>
                  </span>
                  {vendor.website && (
                    <span className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#B4863A]" />
                      <span className="font-mono">{vendor.website}</span>
                    </span>
                  )}
                </div>

                {/* Contract Notes */}
                {vendor.notes && (
                  <p className="mt-3 text-xs text-charcoal-500 font-light italic bg-[#FAF8F5] p-2.5 rounded border border-stone-200/60">
                    "{vendor.notes}"
                  </p>
                )}

                {/* Interactive Deliverables Checklist */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-semibold">
                      Deliverable Checklist ({vendor.tasks?.filter(t => t.done).length || 0}/{vendor.tasks?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {vendor.tasks?.map((task) => (
                      <label 
                        key={task.id} 
                        className="flex items-start space-x-2.5 text-xs text-charcoal-700 cursor-pointer hover:text-charcoal-900 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleVendorTask(vendor.id, task.id)}
                          className="mt-0.5 rounded border-stone-300 text-[#B4863A] focus:ring-[#B4863A]"
                        />
                        <span className={task.done ? 'line-through text-charcoal-400 font-light' : 'font-light'}>
                          {task.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedVendorForInquiry(vendor)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F4EFEA] border border-[#B4863A]/40 rounded text-xs text-[#946A29] font-medium transition-colors shadow-2xs group-hover:border-[#B4863A]"
                  title="Draft customized outreach email with Gemini 3.8 Flash"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B4863A]" />
                  <span>Draft AI Outreach</span>
                </button>

                <div className="flex items-center space-x-1 text-charcoal-400">
                  <button
                    onClick={() => handleOpenAdd(vendor)}
                    className="p-1.5 hover:text-charcoal-800 transition-colors"
                    title="Edit vendor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove vendor "${vendor.companyName}"?`)) {
                        deleteVendorItem(vendor.id);
                      }
                    }}
                    className="p-1.5 hover:text-rose-700 transition-colors"
                    title="Delete vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT VENDOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#B4863A]/40 w-full max-w-lg rounded-sm shadow-luxury-lg p-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                {editingVendor ? 'Edit Vendor Details' : 'Onboard New Vendor'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Fine Art Cinema"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Contract Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none bg-white"
                  >
                    <option value="researching">Researching</option>
                    <option value="inquiry_sent">Inquiry Sent</option>
                    <option value="proposal_reviewed">Proposal Reviewed</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Atelier / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Maison Flore Atelier"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Contact Lead
                  </label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Cost Estimate ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formEstimate}
                    onChange={(e) => setFormEstimate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                    Deposit Paid ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                  Contract Notes & Insurance Clearance
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Load-in certificates, riders..."
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
                  {editingVendor ? 'Save Vendor' : 'Onboard to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

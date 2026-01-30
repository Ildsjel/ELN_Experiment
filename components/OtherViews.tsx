import React, { useState, useEffect } from 'react';
import { MOCK_EXPERIMENTS, MOCK_SAMPLES, MOCK_PLASMID_FEATURES, TEMP_LOGS, MOCK_AUDIT_LOGS, MOCK_MACHINES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { Dna, Box, Thermometer, AlertCircle, CircleDashed, Search, Zap, Printer, Activity, ShieldCheck, Filter, Download, Plus, Share2, MoreHorizontal, ArrowRight, ArrowLeft, Copy, Edit3, X, Save, Check, Trash2, Calendar, Clock, MapPin, Wrench, Sparkles, Loader2, BrainCircuit, RefreshCw, TrendingUp, Info, List, Scissors, Code, Microscope } from 'lucide-react';
import { PlasmidFeature, ViewState, ExperimentStatus, LabMachine, MachineBooking } from '../types';
import { generateLabOverview } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const recentExps = MOCK_EXPERIMENTS.slice(0, 3);
  
  const activeExpsCount = MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.InProgress).length;
  const pendingApprovalsCount = MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Review).length;
  const lowStockCount = MOCK_SAMPLES.filter(s => s.quantity.startsWith('0.') || s.quantity.includes('uL')).length;
  const equipmentAlertsCount = TEMP_LOGS.some(log => log.freezer2 > -70) ? 1 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Lab Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
            onClick={() => onNavigate(ViewState.Experiments)}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="text-slate-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Active Experiments</div>
           <div className="text-3xl font-bold text-slate-800">{activeExpsCount}</div>
           <div className="text-xs text-green-600 mt-2 flex items-center">▲ 1 this week</div>
        </div>
        <div 
            onClick={() => onNavigate(ViewState.Experiments)}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="text-slate-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Pending Approvals</div>
           <div className="text-3xl font-bold text-slate-800">{pendingApprovalsCount}</div>
           <div className="text-xs text-slate-400 mt-2">No change</div>
        </div>
        <div 
            onClick={() => onNavigate(ViewState.Inventory)}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="text-slate-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Low Stock Items</div>
           <div className="text-3xl font-bold text-amber-600">{lowStockCount}</div>
           <div className="text-xs text-amber-600 mt-2">Requires attention</div>
        </div>
        <div 
            onClick={() => onNavigate(ViewState.Inventory, { tab: 'cold-chain' })}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
           <div className="text-slate-500 text-sm font-medium mb-1 group-hover:text-indigo-600 transition-colors">Equipment Alerts</div>
           <div className="text-3xl font-bold text-red-600 flex items-center gap-2"><AlertCircle size={20}/> {equipmentAlertsCount}</div>
           <div className="text-xs text-red-600 mt-2">Freezer 2 Temp Excursion</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Experiments</h3>
          <div className="space-y-4">
            {recentExps.map(exp => (
              <div 
                key={exp.id} 
                onClick={() => onNavigate(ViewState.Experiments)}
                className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors"
              >
                <div>
                   <div className="font-medium text-slate-800">{exp.title}</div>
                   <div className="text-xs text-slate-500">{exp.id} • {exp.author}</div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">{exp.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl shadow-sm p-6 text-white">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Dna size={20}/> Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => onNavigate(ViewState.Experiments, { openCreate: true })}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-left transition-colors flex items-center gap-2"
             >
                <CircleDashed size={16} /> New Protocol
             </button>
             <button 
                onClick={() => onNavigate(ViewState.Inventory, { tab: 'list' })}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-left transition-colors flex items-center gap-2"
             >
                <Printer size={16} /> Print Barcode
             </button>
             <button 
                onClick={() => onNavigate(ViewState.Molecular)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-left transition-colors flex items-center gap-2"
             >
                <Zap size={16} /> CRISPR Design
             </button>
             <button 
                onClick={() => onNavigate(ViewState.Inventory, { tab: 'equipment' })}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-left transition-colors flex items-center gap-2"
             >
                <Activity size={16} /> Book Instrument
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InventoryProps {
  initialTab?: 'list' | 'cold-chain' | 'equipment';
}

export const Inventory: React.FC<InventoryProps> = ({ initialTab = 'list' }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'cold-chain' | 'equipment'>(initialTab);
  const [machines, setMachines] = useState<LabMachine[]>(MOCK_MACHINES);
  const [selectedMachine, setSelectedMachine] = useState<LabMachine | null>(null);
  const [samples, setSamples] = useState(MOCK_SAMPLES);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
      name: '',
      type: 'Reagent',
      location: '',
      quantity: '',
      expiration: '',
      barcode: ''
  });

  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingStartTime, setBookingStartTime] = useState("09:00");
  const [bookingDuration, setBookingDuration] = useState(60); 
  const [bookingPurpose, setBookingPurpose] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleBookMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    const startDateTime = new Date(`${bookingDate}T${bookingStartTime}`);
    const endDateTime = new Date(startDateTime.getTime() + bookingDuration * 60000);
    const newBooking: MachineBooking = {
        id: `B-${Date.now()}`,
        userId: 'U-CURRENT',
        userName: 'Dr. Sarah Chen',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: bookingPurpose
    };
    const updatedMachines = machines.map(m => {
        if (m.id === selectedMachine.id) {
            return {
                ...m,
                bookings: [...m.bookings, newBooking].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            };
        }
        return m;
    });
    setMachines(updatedMachines);
    setSelectedMachine(null);
    setBookingPurpose("");
    setBookingStartTime("09:00");
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item = {
        id: `SMP-${Date.now()}`,
        name: newItem.name,
        type: newItem.type,
        location: newItem.location,
        quantity: newItem.quantity,
        expiration: newItem.expiration || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        barcode: newItem.barcode || Math.floor(1000000 + Math.random() * 9000000).toString()
    };
    setSamples([item, ...samples]);
    setIsAddItemModalOpen(false);
    setNewItem({ name: '', type: 'Reagent', location: '', quantity: '', expiration: '', barcode: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col relative overflow-hidden">
       <div className="p-4 border-b border-slate-200 flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Box size={20}/> Inventory & Storage</h2>
            <div className="flex gap-2">
                {activeTab === 'list' && (
                  <button onClick={() => alert(`Printing barcodes for ${samples.length} items...`)} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center gap-2">
                    <Printer size={16} /> Print All
                  </button>
                )}
                <button onClick={() => alert("Report exported!")} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">Export Report</button>
                <button onClick={() => setIsAddItemModalOpen(true)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Item</button>
            </div>
         </div>
         <div className="flex gap-4 border-b border-slate-100">
            <button onClick={() => setActiveTab('list')} className={`pb-2 text-sm font-medium ${activeTab === 'list' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Sample List</button>
            <button onClick={() => setActiveTab('equipment')} className={`pb-2 text-sm font-medium ${activeTab === 'equipment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Equipment & Booking</button>
            <button onClick={() => setActiveTab('cold-chain')} className={`pb-2 text-sm font-medium ${activeTab === 'cold-chain' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Cold Chain Monitoring</button>
         </div>
       </div>
       <div className="flex-1 overflow-auto bg-slate-50/50">
         {activeTab === 'list' && (
             <table className="w-full text-sm text-left bg-white">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                 <tr>
                   <th className="px-6 py-3">Name</th>
                   <th className="px-6 py-3">Type</th>
                   <th className="px-6 py-3">Location</th>
                   <th className="px-6 py-3">Quantity</th>
                   <th className="px-6 py-3">Expiry</th>
                   <th className="px-6 py-3">Barcode</th>
                   <th className="px-6 py-3">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {samples.map(sample => (
                   <tr key={sample.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-3 font-medium text-slate-800">{sample.name}</td>
                     <td className="px-6 py-3 text-slate-500"><span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">{sample.type}</span></td>
                     <td className="px-6 py-3 text-slate-600">{sample.location}</td>
                     <td className="px-6 py-3 text-slate-600">{sample.quantity}</td>
                     <td className="px-6 py-3 text-slate-600">{sample.expiration}</td>
                     <td className="px-6 py-3 font-mono text-xs text-slate-400">{sample.barcode}</td>
                     <td className="px-6 py-3"><button onClick={() => alert(`Printing barcode for ${sample.name}...`)} className="text-slate-400 hover:text-indigo-600 p-1.5"><Printer size={16} /></button></td>
                   </tr>
                 ))}
               </tbody>
             </table>
         )}
         {activeTab === 'equipment' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map(machine => (
                    <div key={machine.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-800">{machine.name}</h3>
                                <p className="text-xs text-slate-500">{machine.type}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${machine.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {machine.status}
                            </span>
                        </div>
                        <div className="p-4 space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={14} className="text-slate-400"/> {machine.location}</div>
                            <div className="mt-4"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming</h4>
                                {machine.bookings.length > 0 ? machine.bookings.slice(0, 2).map(b => (
                                    <div key={b.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                                        <div className="font-medium">{b.userName}</div>
                                        <div className="text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={10} /> {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                )) : <div className="text-xs text-slate-400 italic py-2">No bookings</div>}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setSelectedMachine(machine)} disabled={machine.status === 'Maintenance'} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors">Book Now</button>
                        </div>
                    </div>
                ))}
            </div>
         )}
         {activeTab === 'cold-chain' && (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                        <div className="text-sm text-green-800 font-medium">Freezer 1</div>
                        <div className="text-2xl font-bold text-green-900">-80.2°C</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                        <div className="text-sm text-red-800 font-medium">Freezer 2</div>
                        <div className="text-2xl font-bold text-red-900">-65.0°C</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TEMP_LOGS}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="time" tick={{fontSize: 12}} /><YAxis domain={[-90, -50]} tick={{fontSize: 12}} /><Tooltip /><Line type="monotone" dataKey="freezer1" stroke="#10b981" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="freezer2" stroke="#ef4444" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
         )}
       </div>
    </div>
  );
};

// --- Helper Functions for SVG Plasmid Map ---
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number){
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

export const MolecularTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'sequence' | 'plasmid' | 'crispr'>('plasmid');
  const [features, setFeatures] = useState<PlasmidFeature[]>(MOCK_PLASMID_FEATURES);
  const [selectedFeature, setSelectedFeature] = useState<PlasmidFeature | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<PlasmidFeature | null>(null);
  const [sequence, setSequence] = useState("ATGCGTACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGGTTA");
  
  const plasmidSize = 4000;
  const cx = 300;
  const cy = 300;
  const radius = 180;
  const trackWidth = 24;

  const handleEditClick = () => {
      if (selectedFeature) {
          setEditFormData({ ...selectedFeature });
          setIsEditing(true);
      }
  };

  const handleSave = () => {
      if (!editFormData) return;
      if (selectedFeature) {
          setFeatures(features.map(f => f === selectedFeature ? editFormData : f));
          setSelectedFeature(editFormData);
      } else {
          setFeatures([...features, editFormData]);
      }
      setIsEditing(false);
  };

  const handleReverseComplement = () => {
    const complement: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
    const rev = sequence.split('').reverse().map(base => complement[base] || base).join('');
    setSequence(rev);
  };

  const renderFeatures = () => {
      return features.map((feature, idx) => {
          const startAngle = (feature.start / plasmidSize) * 360;
          const endAngle = (feature.end / plasmidSize) * 360;
          const path = describeArc(cx, cy, radius, startAngle, endAngle);
          const midAngle = startAngle + (endAngle - startAngle)/2;
          const labelDist = radius + 40;
          const labelPos = polarToCartesian(cx, cy, labelDist, midAngle);
          const isSelected = selectedFeature === feature;
          return (
              <g key={idx} className="group cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedFeature(isSelected ? null : feature); }}>
                  <path d={path} fill="none" stroke={feature.color} strokeWidth={isSelected ? trackWidth + 10 : trackWidth} className={`transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                  <text x={labelPos.x} y={labelPos.y} textAnchor={midAngle > 180 ? "end" : "start"} fill={feature.color} className={`text-[10px] font-bold transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>{feature.name}</text>
              </g>
          )
      });
  };

  return (
    <div className="rounded-xl shadow-xl border h-full flex flex-col overflow-hidden transition-all duration-500 bg-white border-slate-200">
       <div className="p-6 border-b flex justify-between items-center border-slate-100 text-slate-800">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Dna size={24}/>
             </div>
             <h2 className="font-bold text-xl tracking-tight">Molecular Suite</h2>
           </div>
           <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
               {[
                 { id: 'sequence', icon: Code },
                 { id: 'plasmid', icon: Microscope },
                 { id: 'crispr', icon: Scissors }
               ].map(tool => (
                   <button key={tool.id} onClick={() => setActiveTool(tool.id as any)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTool === tool.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>
                       <tool.icon size={14}/> {tool.id}
                   </button>
               ))}
           </div>
       </div>

       <div className="flex-1 overflow-hidden relative">
           <div className="h-full overflow-auto p-8">
               {activeTool === 'sequence' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Sequence Editor</h3>
                                <p className="text-sm text-slate-500">Real-time nucleotide management and analysis</p>
                            </div>
                            <div className="flex gap-2">
                                 <button onClick={handleReverseComplement} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"><RefreshCw size={14}/> Reverse Complement</button>
                                 <button onClick={() => alert("Searching for restriction sites...")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"><Scissors size={14}/> Restriction Scan</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-inner min-h-[300px] flex flex-col">
                            <textarea value={sequence} onChange={(e) => setSequence(e.target.value.toUpperCase().replace(/[^ATGC]/g, ''))} className="w-full h-full bg-transparent border-none focus:ring-0 text-2xl font-mono tracking-[0.2em] leading-relaxed text-slate-700 resize-none" spellCheck={false} placeholder="Input ATGC sequence..."></textarea>
                            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-4 gap-4">
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Length</div><div className="text-xl font-mono font-bold text-indigo-600">{sequence.length} bp</div></div>
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] uppercase font-bold text-slate-400 mb-1">GC Content</div><div className="text-xl font-mono font-bold text-indigo-600">{((sequence.split('G').length + sequence.split('C').length - 2) / sequence.length * 100).toFixed(1)}%</div></div>
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Mol Weight</div><div className="text-xl font-mono font-bold text-indigo-600">{(sequence.length * 660).toLocaleString()} Da</div></div>
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Absorbance</div><div className="text-xl font-mono font-bold text-indigo-600">0.82 AU</div></div>
                            </div>
                        </div>
                    </div>
               )}

               {activeTool === 'plasmid' && (
                 <div className="flex flex-col lg:flex-row h-full items-center justify-center gap-12">
                     <div className="relative shrink-0 animate-in zoom-in-95 fade-in duration-700">
                         <svg width="600" height="600" viewBox="0 0 600 600" className="drop-shadow-xl" onClick={() => setSelectedFeature(null)}>
                             <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={trackWidth} />
                             {renderFeatures()}
                             <circle cx={cx} cy={cy} r="100" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                             <text x={cx} y={cy} textAnchor="middle" dy="-10" className="text-2xl font-bold fill-slate-800 tracking-tight">pCAS9-MOD</text>
                             <text x={cx} y={cy} textAnchor="middle" dy="25" className="text-xs font-mono fill-emerald-600 tracking-widest uppercase font-bold">4,000 bp</text>
                         </svg>
                     </div>
                     {/* Feature Inspector - Kept Dark as requested */}
                     <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-lg">Feature Inspector</h3>
                            <button onClick={() => { setEditFormData({ name: 'New Feature', start: 0, end: 500, type: 'gene', color: '#6366f1', direction: 1 }); setIsEditing(true); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"><Plus size={18}/></button>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {features.map((f, i) => (
                                <div key={i} onClick={() => setSelectedFeature(f)} className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedFeature === f ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: f.color }}></div>
                                        <div>
                                            <div className="font-bold text-sm">{f.name}</div>
                                            <div className="text-[10px] uppercase font-mono tracking-widest opacity-50">{f.start}-{f.end} bp</div>
                                        </div>
                                    </div>
                                    {selectedFeature === f && <button onClick={handleEditClick} className="p-1.5 bg-white/10 rounded-md hover:bg-white/20"><Edit3 size={14}/></button>}
                                </div>
                            ))}
                        </div>
                        {selectedFeature && (
                            <div className="pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Selected Detail</h4>
                                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-slate-500 block mb-1">TYPE</span><span className="text-white font-bold">{selectedFeature.type.toUpperCase()}</span></div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-slate-500 block mb-1">STRAND</span><span className="text-white font-bold">{selectedFeature.direction === 1 ? 'FORWARD (+)' : 'REVERSE (-)'}</span></div>
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
               )}

               {activeTool === 'crispr' && (
                   <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="bg-indigo-600 p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20"><Scissors size={48}/></div>
                                <div>
                                    <h3 className="text-3xl font-bold mb-3">Guide RNA Design Suite</h3>
                                    <p className="text-indigo-100 max-w-lg">Advanced CRISPR screening using our high-throughput PAM-detection algorithm. Paste your genomic target below.</p>
                                </div>
                           </div>
                           <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                       </div>
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Input Sequence</label>
                                    <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={6} placeholder="Paste genomic locus..."></textarea>
                                    <button className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"><Zap size={16}/> Analyze Guides</button>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-4">Parameters</h4>
                                    <div className="space-y-4">
                                        <div><div className="flex justify-between text-xs mb-1"><span>GC Tolerance</span><span className="font-bold">20-80%</span></div><div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full w-3/4 bg-indigo-500 rounded-full"></div></div></div>
                                        <div><div className="flex justify-between text-xs mb-1"><span>PAM Requirement</span><span className="font-bold">NGG</span></div><select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold"><option>SpCas9 (NGG)</option><option>SaCas9 (NNGRRT)</option></select></div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 px-2"><List size={18} className="text-indigo-500"/> Candidate sgRNAs</h4>
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="p-3 bg-slate-100 rounded-xl font-bold text-slate-500 text-sm">#{i}</div>
                                            <div>
                                                <div className="font-mono text-indigo-700 font-bold tracking-widest">GTCGTAGCTAGCTAGCTAGC<span className="text-red-500">TAGG</span></div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded">PAM: TAGG</span>
                                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded">LOC: 1,492 bp</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">On-Target Score</div>
                                            <div className="text-2xl font-black text-emerald-500">{99-i*3}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                       </div>
                   </div>
               )}
           </div>
       </div>

       {isEditing && editFormData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setIsEditing(false)}>
                <div className="bg-[#1e293b] border border-slate-700 rounded-3xl w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><Edit3 className="text-emerald-400"/> Modify Segment</h3>
                    <div className="space-y-6">
                        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Feature Name</label><input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"/></div>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Start</label><input type="number" value={editFormData.start} onChange={e => setEditFormData({...editFormData, start: parseInt(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono outline-none"/></div>
                             <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">End</label><input type="number" value={editFormData.end} onChange={e => setEditFormData({...editFormData, end: parseInt(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono outline-none"/></div>
                        </div>
                        <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Color Profile</label><div className="flex gap-3">{['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#64748b'].map(c => (
                            <button key={c} onClick={() => setEditFormData({...editFormData, color: c})} className={`w-8 h-8 rounded-full border-2 transition-all ${editFormData.color === c ? 'border-white scale-125' : 'border-transparent'}`} style={{backgroundColor: c}}></button>
                        ))}</div></div>
                    </div>
                    <div className="mt-10 flex gap-4">
                        <button onClick={() => { setFeatures(features.filter(f => f !== selectedFeature)); setSelectedFeature(null); setIsEditing(false); }} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={20}/></button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:text-white transition-all">Cancel</button>
                        <button onClick={handleSave} className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black shadow-lg shadow-emerald-900/40 transition-all px-8">Update Map</button>
                    </div>
                </div>
            </div>
       )}
    </div>
  );
};

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const statusData = [{ name: 'Completed', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Completed).length, color: '#10b981' }, { name: 'In Progress', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.InProgress).length, color: '#3b82f6' }, { name: 'Review', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Review).length, color: '#f59e0b' }, { name: 'Draft', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Draft).length, color: '#94a3b8' }];
  const sampleTypeData = [{ name: 'Reagent', value: MOCK_SAMPLES.filter(s => s.type === 'Reagent').length }, { name: 'Plasmid', value: MOCK_SAMPLES.filter(s => s.type === 'Plasmid').length }, { name: 'Cell Line', value: MOCK_SAMPLES.filter(s => s.type === 'Cell Line').length }];
  const generateSummary = async () => { setLoading(true); const text = await generateLabOverview(MOCK_EXPERIMENTS, MOCK_SAMPLES, MOCK_MACHINES); setSummary(text); setLoading(false); };
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Activity size={24} className="text-indigo-600"/> Lab Analytics</h1>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500" /> Experiment Status</h3>
             <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
             <div className="flex justify-center gap-4 mt-4 flex-wrap">{statusData.map(d => (<div key={d.name} className="flex items-center gap-2 text-xs text-slate-600"><span className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></span>{d.name} ({d.value})</div>))}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2"><Box size={18} className="text-indigo-500" /> Inventory</h3>
             <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={sampleTypeData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" tick={{fontSize: 12}} /><YAxis allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div>
          </div>
       </div>
       <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden mt-6">
          <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-white flex justify-between items-center"><h3 className="font-bold text-slate-800 flex items-center gap-2.5"><BrainCircuit className="text-indigo-600" size={24} /> Strategic Operational Intelligence</h3><button onClick={generateSummary} disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">{loading ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}{summary ? 'Refresh Analysis' : 'Generate Comprehensive Report'}</button></div>
          <div className="p-8 min-h-[300px] bg-white relative">{loading ? (<div className="flex flex-col items-center justify-center h-full min-h-[200px] text-indigo-400"><div className="relative mb-6"><Sparkles size={48} className="animate-pulse text-indigo-200" /><BrainCircuit size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" /></div><span className="text-sm font-bold tracking-wide uppercase text-indigo-500">Processing lab data streams...</span></div>) : summary ? (<div className="animate-in fade-in slide-in-from-bottom-4 duration-700"><div className="prose prose-sm max-w-none text-slate-700">{summary.split('\n').map((line, i) => { if (line.startsWith('###')) { return <h4 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2"><div className="w-1 h-5 bg-indigo-500 rounded-full"></div>{line.replace('###', '').trim()}</h4>; } if (line.trim().startsWith('*')) { return <div key={i} className="flex gap-2 mb-2 ml-4"><div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-2 shrink-0"></div><p className="text-sm text-slate-600">{line.replace('*', '').trim()}</p></div>; } return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-4">{line}</p>; })}</div></div>) : (<div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center max-w-md mx-auto"><div className="p-4 bg-indigo-50 rounded-full mb-6"><Sparkles size={32} className="text-indigo-400" /></div><h4 className="text-lg font-bold text-slate-800 mb-2">No Active Intelligence Report</h4><p className="text-sm text-slate-500 mb-6">Analyze your current lab throughput, identify bottlenecks, and surface data anomalies.</p><button onClick={generateSummary} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200">Analyze Lab Data</button></div>)}</div>
       </div>
    </div>
  );
};

export const AuditLog: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
       <div className="p-4 border-b border-slate-200 flex justify-between items-center"><h2 className="font-semibold text-slate-800 flex items-center gap-2"><ShieldCheck size={20}/> Audit Trail & Compliance</h2><button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Download size={16}/> Export Log</button></div>
       <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 font-medium sticky top-0"><tr><th className="px-6 py-3">Timestamp</th><th className="px-6 py-3">User</th><th className="px-6 py-3">Action</th><th className="px-6 py-3">Resource</th><th className="px-6 py-3">Details</th><th className="px-6 py-3">ID</th></tr></thead><tbody className="divide-y divide-slate-100">{MOCK_AUDIT_LOGS.map(log => (<tr key={log.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-3 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td><td className="px-6 py-3 font-medium text-slate-800">{log.user}</td><td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.action === 'Create' ? 'bg-green-100 text-green-700' : log.action === 'Delete' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{log.action}</span></td><td className="px-6 py-3 text-slate-600">{log.resourceType} <span className="text-xs text-slate-400">{log.resourceId ? `(${log.resourceId})` : ''}</span></td><td className="px-6 py-3 text-slate-600 max-w-md truncate" title={log.details}>{log.details}</td><td className="px-6 py-3 font-mono text-xs text-slate-400">{log.id}</td></tr>))}</tbody></table>
       </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { MOCK_EXPERIMENTS, MOCK_SAMPLES, MOCK_PLASMID_FEATURES, TEMP_LOGS, MOCK_AUDIT_LOGS, MOCK_MACHINES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { Dna, Box, Thermometer, AlertCircle, CircleDashed, Search, Zap, Printer, Activity, ShieldCheck, Filter, Download, Plus, Share2, MoreHorizontal, ArrowRight, ArrowLeft, Copy, Edit3, X, Save, Check, Trash2, Calendar, Clock, MapPin, Wrench, Sparkles, Loader2, BrainCircuit, RefreshCw } from 'lucide-react';
import { PlasmidFeature, ViewState, ExperimentStatus, LabMachine, MachineBooking } from '../types';
import { generateLabOverview } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const recentExps = MOCK_EXPERIMENTS.slice(0, 3);
  
  // Calculate dynamic stats based on mock data
  const activeExpsCount = MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.InProgress).length;
  const pendingApprovalsCount = MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Review).length;
  // Simple heuristic for low stock: quantities starting with '0.' or containing 'uL'
  const lowStockCount = MOCK_SAMPLES.filter(s => s.quantity.startsWith('0.') || s.quantity.includes('uL')).length;
  // Check for freezer alerts in the logs (temperature > -70C)
  const equipmentAlertsCount = TEMP_LOGS.some(log => log.freezer2 > -70) ? 1 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Lab Overview</h1>
      
      {/* KPI Cards */}
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
        {/* Recent Activity */}
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

        {/* Quick Actions */}
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
  
  // Sample State for adding items
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

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingStartTime, setBookingStartTime] = useState("09:00");
  const [bookingDuration, setBookingDuration] = useState(60); // minutes
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
    setSelectedMachine(null); // Close modal
    // Reset form
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
    
    // @ts-ignore - Mock data compatibility
    setSamples([item, ...samples]);
    setIsAddItemModalOpen(false);
    setNewItem({
        name: '',
        type: 'Reagent',
        location: '',
        quantity: '',
        expiration: '',
        barcode: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col relative overflow-hidden">
       <div className="p-4 border-b border-slate-200 flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Box size={20}/> Inventory & Storage</h2>
            <div className="flex gap-2">
                <button 
                  onClick={() => alert("Report exported successfully!")}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
                >
                  Export Report
                </button>
                <button 
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  + Add Item
                </button>
            </div>
         </div>
         <div className="flex gap-4 border-b border-slate-100">
            <button onClick={() => setActiveTab('list')} className={`pb-2 text-sm font-medium ${activeTab === 'list' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Sample List</button>
            <button onClick={() => setActiveTab('equipment')} className={`pb-2 text-sm font-medium ${activeTab === 'equipment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Equipment & Booking</button>
            <button onClick={() => setActiveTab('cold-chain')} className={`pb-2 text-sm font-medium ${activeTab === 'cold-chain' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Cold Chain Monitoring</button>
         </div>
       </div>

       <div className="flex-1 overflow-auto p-0 bg-slate-50/50">
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
                     <td className="px-6 py-3 text-slate-500">
                       <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">{sample.type}</span>
                     </td>
                     <td className="px-6 py-3 text-slate-600">{sample.location}</td>
                     <td className="px-6 py-3 text-slate-600">{sample.quantity}</td>
                     <td className="px-6 py-3 text-slate-600">{sample.expiration}</td>
                     <td className="px-6 py-3 font-mono text-xs text-slate-400">{sample.barcode}</td>
                     <td className="px-6 py-3">
                        <button 
                            type="button"
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                alert(`Printing barcode for ${sample.name} [${sample.barcode}]...`);
                            }}
                            title="Print Barcode"
                        >
                            <Printer size={16} />
                        </button>
                     </td>
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
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${
                                machine.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                machine.status === 'Maintenance' ? 'bg-red-50 text-red-600 border-red-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                                {machine.status}
                            </span>
                        </div>
                        <div className="p-4 space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin size={14} className="text-slate-400"/> {machine.location}
                            </div>
                            {machine.nextMaintenance && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Wrench size={14} className="text-slate-400"/> Next Service: {machine.nextMaintenance}
                                </div>
                            )}
                            
                            <div className="mt-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming Bookings</h4>
                                {machine.bookings.length > 0 ? (
                                    <div className="space-y-2">
                                        {machine.bookings.slice(0, 2).map(booking => (
                                            <div key={booking.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-100">
                                                <div className="font-medium text-slate-700">{booking.userName}</div>
                                                <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Clock size={10} />
                                                    {new Date(booking.startTime).toLocaleDateString()} {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        ))}
                                        {machine.bookings.length > 2 && <div className="text-xs text-center text-slate-400">+{machine.bookings.length - 2} more</div>}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic py-2">No upcoming bookings</div>
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedMachine(machine);
                                }}
                                disabled={machine.status === 'Maintenance'}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
         )}

         {activeTab === 'cold-chain' && (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                        <div className="text-sm text-green-800 font-medium">Freezer 1 (General)</div>
                        <div className="text-2xl font-bold text-green-900">-80.2°C</div>
                        <div className="text-xs text-green-700">Status: Optimal</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                        <div className="text-sm text-red-800 font-medium">Freezer 2 (Cell Lines)</div>
                        <div className="text-2xl font-bold text-red-900">-65.0°C</div>
                        <div className="text-xs text-red-700">Status: Excursion Detected</div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 h-96">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">24h Temperature Log</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TEMP_LOGS}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#94a3b8" />
                            <YAxis domain={[-90, -50]} tick={{fontSize: 12}} stroke="#94a3b8" />
                            <Tooltip />
                            <ReferenceLine y={-70} stroke="red" strokeDasharray="3 3" label={{ position: 'top',  value: 'Alert Threshold', fill: 'red', fontSize: 12 }} />
                            <Line type="monotone" dataKey="freezer1" stroke="#10b981" strokeWidth={2} dot={false} name="Freezer 1" />
                            <Line type="monotone" dataKey="freezer2" stroke="#ef4444" strokeWidth={2} dot={false} name="Freezer 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
         )}
       </div>

       {/* Booking Modal */}
       {selectedMachine && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <div>
                       <h3 className="font-bold text-slate-800">Book Equipment</h3>
                       <p className="text-xs text-slate-500">{selectedMachine.name}</p>
                   </div>
                   <button onClick={() => setSelectedMachine(null)} className="text-slate-400 hover:text-slate-600">
                       <X size={20} />
                   </button>
                </div>
                <form onSubmit={handleBookMachine} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                        <input 
                            type="date" 
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Time</label>
                            <input 
                                type="time" 
                                required
                                value={bookingStartTime}
                                onChange={(e) => setBookingStartTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration (mins)</label>
                            <select 
                                value={bookingDuration}
                                onChange={(e) => setBookingDuration(parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                            >
                                <option value={30}>30 mins</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                                <option value={240}>4 hours</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Colony PCR"
                            required
                            value={bookingPurpose}
                            onChange={(e) => setBookingPurpose(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                        />
                    </div>
                    
                    {/* Simplified conflict check visual - list bookings for selected day */}
                    <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 border border-amber-100">
                        <div className="font-bold mb-1">Current Bookings on {bookingDate}:</div>
                        {selectedMachine.bookings.filter(b => b.startTime.startsWith(bookingDate)).length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5">
                                {selectedMachine.bookings.filter(b => b.startTime.startsWith(bookingDate)).map(b => (
                                    <li key={b.id}>{new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({b.userName})</li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-amber-600/70 italic">No bookings for this date yet.</span>
                        )}
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setSelectedMachine(null)}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
         </div>
       )}

       {/* Add Item Modal */}
       {isAddItemModalOpen && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="font-bold text-slate-800">Add New Inventory Item</h3>
                   <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={20} />
                   </button>
                </div>
                <form onSubmit={handleAddItem} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Item Name</label>
                        <input 
                            type="text" 
                            required
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                            placeholder="e.g. DMEM High Glucose"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                            <select 
                                value={newItem.type}
                                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                            >
                                <option value="Reagent">Reagent</option>
                                <option value="Cell Line">Cell Line</option>
                                <option value="Plasmid">Plasmid</option>
                                <option value="Antibody">Antibody</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Consumable">Consumable</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quantity</label>
                            <input 
                                type="text" 
                                required
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                                placeholder="e.g. 500mL"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                        <input 
                            type="text" 
                            required
                            value={newItem.location}
                            onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                            placeholder="e.g. Fridge 1, Shelf B"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiration</label>
                            <input 
                                type="date" 
                                value={newItem.expiration}
                                onChange={(e) => setNewItem({...newItem, expiration: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Barcode (Optional)</label>
                            <input 
                                type="text" 
                                value={newItem.barcode}
                                onChange={(e) => setNewItem({...newItem, barcode: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 bg-white"
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsAddItemModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Add Item
                        </button>
                    </div>
                </form>
            </div>
         </div>
       )}
    </div>
  );
};

export const MolecularTools: React.FC = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col p-6">
         <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Dna size={24} className="text-indigo-600"/> Molecular Tools</h2>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
             <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-8">
                     <h3 className="font-bold text-slate-700">pCas9-GFP Vector Map</h3>
                     <div className="flex gap-2">
                         <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600">Download GenBank</button>
                         <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600">Edit Sequence</button>
                     </div>
                 </div>
  
                 {/* Mock Linear Plasmid View */}
                 <div className="flex-1 flex flex-col justify-center px-4">
                     <div className="relative h-4 bg-slate-300 rounded-full w-full">
                         {MOCK_PLASMID_FEATURES.map((feature, i) => (
                             <div 
                                 key={i}
                                 className="absolute h-8 -top-2 rounded-md opacity-90 hover:opacity-100 cursor-pointer transition-all hover:scale-105 shadow-sm border border-black/10 group"
                                 style={{
                                     left: `${(feature.start / 5000) * 100}%`,
                                     width: `${((feature.end - feature.start) / 5000) * 100}%`,
                                     backgroundColor: feature.color
                                 }}
                             >
                                 <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                     {feature.name} ({feature.type})
                                     <div className="text-[10px] opacity-70">{feature.start} - {feature.end} bp</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="flex justify-between text-xs text-slate-400 font-mono mt-8">
                         <span>0 bp</span>
                         <span>1000 bp</span>
                         <span>2000 bp</span>
                         <span>3000 bp</span>
                         <span>4000 bp</span>
                         <span>5000 bp</span>
                     </div>
                 </div>
  
                 <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                     {MOCK_PLASMID_FEATURES.map((f, i) => (
                         <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                             <div className="w-3 h-3 rounded-full mb-2" style={{backgroundColor: f.color}}></div>
                             <div className="font-bold text-sm text-slate-800 truncate">{f.name}</div>
                             <div className="text-xs text-slate-500 capitalize">{f.type}</div>
                         </div>
                     ))}
                 </div>
             </div>
  
             <div className="space-y-6">
                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap size={18} className="text-amber-500"/> CRISPR Design</h3>
                     <div className="space-y-3">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Gene</label>
                             <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. EGFR"/>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organism</label>
                             <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                 <option>Homo sapiens (Human)</option>
                                 <option>Mus musculus (Mouse)</option>
                             </select>
                         </div>
                         <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Find Targets</button>
                     </div>
                 </div>
  
                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Primer Analysis</h3>
                     <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                         <div className="text-slate-400 mb-2">Drag & Drop Sequence</div>
                         <div className="text-xs text-slate-500">.fasta, .seq supported</div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    );
};

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusData = [
    { name: 'Completed', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Completed).length, color: '#10b981' },
    { name: 'In Progress', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.InProgress).length, color: '#3b82f6' },
    { name: 'Review', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Review).length, color: '#f59e0b' },
    { name: 'Draft', value: MOCK_EXPERIMENTS.filter(e => e.status === ExperimentStatus.Draft).length, color: '#94a3b8' },
  ];

  const sampleTypeData = [
    { name: 'Reagent', value: MOCK_SAMPLES.filter(s => s.type === 'Reagent').length },
    { name: 'Plasmid', value: MOCK_SAMPLES.filter(s => s.type === 'Plasmid').length },
    { name: 'Cell Line', value: MOCK_SAMPLES.filter(s => s.type === 'Cell Line').length },
  ];

  const generateSummary = async () => {
    setLoading(true);
    const text = await generateLabOverview(MOCK_EXPERIMENTS, MOCK_SAMPLES, MOCK_MACHINES);
    setSummary(text);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Activity size={24} className="text-indigo-600"/> Lab Analytics</h1>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-700 mb-6">Experiment Status Distribution</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie 
                        data={statusData} 
                        cx="50%" cy="50%" 
                        innerRadius={60} outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {statusData.map(d => (
                   <div key={d.name} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></span>
                      {d.name} ({d.value})
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-700 mb-6">Inventory Composition</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={sampleTypeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>

       {/* AI Summary Section */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6 border-indigo-100">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />
                AI Lab Situation Report
             </h3>
             <button 
                onClick={generateSummary}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                {summary ? 'Refresh Analysis' : 'Generate Analysis'}
             </button>
          </div>
          
          <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100 min-h-[120px] flex items-center justify-center relative">
              {loading ? (
                 <div className="flex flex-col items-center gap-3 text-indigo-400 animate-pulse">
                    <BrainCircuit size={32} />
                    <span className="text-sm font-medium">Analyzing lab data streams...</span>
                 </div>
              ) : summary ? (
                 <div className="text-slate-700 leading-relaxed text-sm w-full animate-in fade-in">
                    {summary}
                 </div>
              ) : (
                 <div className="text-center">
                    <p className="text-slate-500 text-sm mb-3">Get an AI-powered overview of experiment progress, inventory shortages, and equipment status.</p>
                    <button 
                        onClick={generateSummary}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        Generate Report
                    </button>
                 </div>
              )}
          </div>
       </div>
    </div>
  );
};

export const AuditLog: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
       <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><ShieldCheck size={20}/> Audit Trail & Compliance</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
             <Download size={16}/> Export Log
          </button>
       </div>
       <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                <tr>
                   <th className="px-6 py-3">Timestamp</th>
                   <th className="px-6 py-3">User</th>
                   <th className="px-6 py-3">Action</th>
                   <th className="px-6 py-3">Resource</th>
                   <th className="px-6 py-3">Details</th>
                   <th className="px-6 py-3">ID</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {MOCK_AUDIT_LOGS.map(log => (
                   <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-3 font-medium text-slate-800">{log.user}</td>
                      <td className="px-6 py-3">
                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${log.action === 'Create' ? 'bg-green-100 text-green-700' : 
                              log.action === 'Delete' ? 'bg-red-100 text-red-700' : 
                              log.action === 'Sign' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'}`}>
                            {log.action}
                         </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                         {log.resourceType} <span className="text-xs text-slate-400">{log.resourceId ? `(${log.resourceId})` : ''}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600 max-w-md truncate" title={log.details}>{log.details}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.id}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, FlaskConical, Dna, FileText, Settings, Search, Bell, Menu, Activity, ShieldCheck, Clock, ChevronRight, X, Check, AlertCircle, Info, Layers, Trash2, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';
import { ChatBot } from './ChatBot';
import { MOCK_EXPERIMENTS, MOCK_SAMPLES, MOCK_MACHINES } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewState.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.Experiments, label: 'Experiments', icon: FileText },
    { id: ViewState.Inventory, label: 'Inventory', icon: FlaskConical },
    { id: ViewState.Molecular, label: 'Molecular Tools', icon: Dna },
    { id: ViewState.Analytics, label: 'Analytics', icon: Activity },
    { id: ViewState.AuditLog, label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
          H
        </div>
        <span className="text-xl font-bold text-white tracking-tight">HelixNexus</span>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <div className="mt-4 flex items-center gap-3 px-3">
           <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
           <div className="text-xs">
             <div className="text-white font-medium">Dr. Sarah Chen</div>
             <div className="text-slate-500">Principal Investigator</div>
           </div>
        </div>
      </div>
    </div>
  );
};

interface Notification {
    id: string;
    category: 'equipment' | 'experiment' | 'inventory' | 'system';
    type: 'alert' | 'success' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    cta?: {
        label: string;
        view: ViewState;
        params?: any;
    };
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { 
      id: '1', 
      category: 'equipment', 
      type: 'alert', 
      title: 'Freezer 2 Temp Excursion', 
      message: 'Temperature reached -65°C', 
      timestamp: new Date(Date.now() - 1000 * 60 * 10), 
      read: false,
      cta: { label: 'Check Logs', view: ViewState.Inventory, params: { tab: 'cold-chain' } }
  },
  { 
      id: '2', 
      category: 'experiment', 
      type: 'success', 
      title: 'Analysis Complete', 
      message: 'EXP-2023-184 processing finished', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60), 
      read: false,
      cta: { label: 'View Results', view: ViewState.Experiments, params: { id: 'EXP-2023-184' } }
  },
  { 
      id: '3', 
      category: 'experiment', 
      type: 'success', 
      title: 'Analysis Complete', 
      message: 'EXP-2023-111 processing finished', 
      timestamp: new Date(Date.now() - 1000 * 60 * 120), 
      read: false,
      cta: { label: 'View Results', view: ViewState.Experiments, params: { id: 'EXP-2023-111' } }
  },
  { 
      id: '4', 
      category: 'inventory', 
      type: 'warning', 
      title: 'Low Stock Alert', 
      message: 'Lipofectamine 3000 (10%)', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), 
      read: false,
      cta: { label: 'Restock', view: ViewState.Inventory, params: { tab: 'list', search: 'Lipofectamine' } }
  },
  { 
      id: '5', 
      category: 'inventory', 
      type: 'warning', 
      title: 'Low Stock Alert', 
      message: 'DAPI Stain (5%)', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), 
      read: false,
      cta: { label: 'Restock', view: ViewState.Inventory, params: { tab: 'list', search: 'DAPI' } }
  },
  { 
      id: '6', 
      category: 'system', 
      type: 'info', 
      title: 'System Maintenance', 
      message: 'Scheduled for Oct 25th', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), 
      read: true 
  },
];

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState, params?: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['CRISPR', 'HEK293T', 'Protocol A']);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate Cron Job for Notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance to generate a notification every 15 seconds to simulate system events
      if (Math.random() > 0.7) {
        const categories = ['equipment', 'experiment', 'inventory', 'system'] as const;
        const category = categories[Math.floor(Math.random() * categories.length)];
        let type: 'alert' | 'success' | 'warning' | 'info' = 'info';
        let title = '';
        let message = '';
        let cta: { label: string; view: ViewState; params?: any } | undefined;

        switch (category) {
            case 'equipment':
                type = 'alert';
                title = 'Equipment Alert';
                const machines = ['Centrifuge A', 'Incubator 3', 'Freezer 1', 'PCR Cycler 2'];
                const issues = ['rotor imbalance detected', 'CO2 levels deviation', 'temperature rising', 'lid open error'];
                const mIdx = Math.floor(Math.random() * machines.length);
                message = `${machines[mIdx]} reported: ${issues[mIdx]}.`;
                cta = { label: 'Check Equipment', view: ViewState.Inventory, params: { tab: 'equipment' } };
                break;
            case 'experiment':
                type = 'success';
                title = 'Experiment Update';
                const expId = `EXP-2023-${Math.floor(Math.random() * 200) + 100}`;
                message = `Data processing for ${expId} has been completed successfully.`;
                cta = { label: 'View Experiment', view: ViewState.Experiments, params: { id: expId } };
                break;
            case 'inventory':
                type = 'warning';
                title = 'Low Stock Warning';
                const reagents = ['PBS 10x', 'Trypsin', 'DMEM Media', 'Ethanol 70%'];
                const rItem = reagents[Math.floor(Math.random() * reagents.length)];
                message = `Stock level for ${rItem} is below 15%.`;
                cta = { label: 'Order Now', view: ViewState.Inventory, params: { tab: 'list', search: rItem } };
                break;
            case 'system':
                type = 'info';
                title = 'System Sync';
                message = 'Data synchronization with cloud storage completed.';
                break;
        }

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            category,
            type,
            title,
            message,
            timestamp: new Date(),
            read: false,
            cta
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getSuggestions = () => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    
    const experiments = MOCK_EXPERIMENTS.filter(e => 
      e.title.toLowerCase().includes(query) || e.id.toLowerCase().includes(query)
    ).map(e => ({ type: 'Experiment', ...e }));

    const samples = MOCK_SAMPLES.filter(s => 
      s.name.toLowerCase().includes(query) || s.barcode.includes(query)
    ).map(s => ({ type: 'Sample', ...s }));

    const machines = MOCK_MACHINES.filter(m => 
      m.name.toLowerCase().includes(query)
    ).map(m => ({ type: 'Equipment', ...m }));

    return [...experiments, ...samples, ...machines].slice(0, 6);
  };

  const handleSelectSuggestion = (item: any) => {
    const term = item.title || item.name;
    if (!recentSearches.includes(term)) {
        setRecentSearches(prev => [term, ...prev].slice(0, 5));
    }
    setShowSuggestions(false);
    setSearchQuery('');

    if (item.type === 'Experiment') {
        onNavigate(ViewState.Experiments, { id: item.id });
    } else if (item.type === 'Sample') {
        onNavigate(ViewState.Inventory, { tab: 'list', search: item.name });
    } else if (item.type === 'Equipment') {
        onNavigate(ViewState.Inventory, { tab: 'equipment', search: item.name });
    }
  };

  const suggestions = getSuggestions();

  // Notification Logic
  const unreadCount = notifications.filter(n => !n.read).length;

  const getSmartNotifications = () => {
    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Group unread by category
    const clusters: Record<string, Notification[]> = {};
    unread.forEach(n => {
        if (!clusters[n.category]) clusters[n.category] = [];
        clusters[n.category].push(n);
    });

    const smartList: any[] = [];
    
    // Process clusters
    Object.entries(clusters).forEach(([cat, items]) => {
        if (items.length > 1) {
            // Determine a generic CTA for clusters
            let clusterCta = undefined;
            if (cat === 'experiment') clusterCta = { label: 'View Experiments', view: ViewState.Experiments };
            else if (cat === 'inventory') clusterCta = { label: 'Check Inventory', view: ViewState.Inventory };
            else if (cat === 'equipment') clusterCta = { label: 'Check Equipment', view: ViewState.Inventory, params: { tab: 'equipment' } };

            // Create a cluster item
            smartList.push({
                id: `cluster-${cat}`,
                isCluster: true,
                category: cat,
                count: items.length,
                items: items,
                timestamp: items[0].timestamp, // Use most recent
                type: items[0].type, // Use type of most recent
                cta: clusterCta
            });
        } else {
            smartList.push(items[0]);
        }
    });

    // Sort smart list by time
    smartList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return [...smartList, ...read];
  };

  const smartNotifications = getSmartNotifications();

  const markAsRead = (ids: string[]) => {
      setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
  };
  
  const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearRead = () => {
      setNotifications(prev => prev.filter(n => !n.read));
  };

  const formatTime = (date: Date) => {
      const diff = (new Date().getTime() - date.getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 relative">
          <div className="flex items-center gap-4 flex-1">
             <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded">
               <Menu size={20} />
             </button>
             
             {/* Search Area */}
             <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search experiments, samples, or entities..." 
                 className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setShowSuggestions(true)}
               />
               
               {/* Auto Suggestion Dropdown */}
               {showSuggestions && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchQuery === '' ? (
                      <div className="p-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Recent Searches</div>
                        {recentSearches.map((term, i) => (
                          <button 
                            key={i}
                            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2 group transition-colors"
                            onClick={() => {
                                setSearchQuery(term);
                            }}
                          >
                             <Clock size={14} className="text-slate-400 group-hover:text-indigo-500"/>
                             {term}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2">
                         {suggestions.length > 0 ? (
                            <>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Suggestions</div>
                              {suggestions.map((item: any) => (
                                <button
                                  key={item.id}
                                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-start gap-3 group transition-colors"
                                  onClick={() => handleSelectSuggestion(item)}
                                >
                                  <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                                    item.type === 'Experiment' ? 'bg-blue-100 text-blue-600' :
                                    item.type === 'Sample' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-amber-100 text-amber-600'
                                  }`}>
                                    {item.type === 'Experiment' ? <FileText size={16}/> : 
                                     item.type === 'Sample' ? <FlaskConical size={16}/> : 
                                     <Activity size={16}/>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600">
                                       {item.title || item.name}
                                     </div>
                                     <div className="text-xs text-slate-500 flex items-center gap-1">
                                       <span className="opacity-75">{item.type}</span>
                                       <span>•</span>
                                       <span className="font-mono opacity-75">{item.id}</span>
                                     </div>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 self-center"/>
                                </button>
                              ))}
                            </>
                         ) : (
                           <div className="p-4 text-center text-sm text-slate-500">
                             No results found for "{searchQuery}"
                           </div>
                         )}
                      </div>
                    )}
                 </div>
               )}
             </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Button */}
            <div className="relative" ref={notificationRef}>
                <button 
                    className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-slate-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                        <Check size={12}/> Mark all read
                                    </button>
                                )}
                                <button onClick={clearRead} className="text-slate-400 hover:text-red-500" title="Clear read">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {smartNotifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                    <Bell size={32} className="opacity-20 mb-2"/>
                                    <span className="text-xs">No notifications</span>
                                </div>
                            ) : (
                                <div>
                                    {smartNotifications.map((item: any) => (
                                        <div 
                                            key={item.id} 
                                            className={`p-4 border-b border-slate-50 transition-colors cursor-pointer group hover:bg-slate-50 ${item.read ? 'opacity-60 bg-slate-50/30' : 'bg-white'}`}
                                            onClick={() => {
                                                if (item.isCluster) {
                                                    markAsRead(item.items.map((i: any) => i.id));
                                                } else {
                                                    markAsRead([item.id]);
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                                                    item.type === 'alert' ? 'bg-red-100 text-red-600' :
                                                    item.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                    item.type === 'success' ? 'bg-green-100 text-green-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {item.isCluster ? (
                                                        <Layers size={14} />
                                                    ) : item.type === 'alert' ? (
                                                        <AlertCircle size={14} />
                                                    ) : item.type === 'success' ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <Info size={14} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {item.isCluster ? (
                                                        <>
                                                            <div className="text-sm font-bold text-slate-800 mb-0.5">
                                                                {item.count} {item.category === 'experiment' ? 'Updates' : item.category === 'inventory' ? 'Alerts' : 'Notifications'} in {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                            </div>
                                                            <div className="text-xs text-slate-500 line-clamp-2">
                                                                {item.items.map((sub: any) => sub.message).join(', ')}
                                                            </div>
                                                            {item.cta && (
                                                              <button 
                                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 mt-1.5 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(item.items.map((i: any) => i.id));
                                                                    onNavigate(item.cta.view, item.cta.params);
                                                                    setShowNotifications(false);
                                                                }}
                                                              >
                                                                {item.cta.label} <ArrowRight size={10} />
                                                              </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-sm font-semibold text-slate-800 mb-0.5 flex justify-between">
                                                                {item.title}
                                                                {!item.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>}
                                                            </div>
                                                            <div className="text-xs text-slate-500 leading-relaxed">
                                                                {item.message}
                                                            </div>
                                                            {item.cta && (
                                                              <button 
                                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 mt-1.5 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead([item.id]);
                                                                    onNavigate(item.cta.view, item.cta.params);
                                                                    setShowNotifications(false);
                                                                }}
                                                              >
                                                                {item.cta.label} <ArrowRight size={10} />
                                                              </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <div className="mt-1.5 flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400">{formatTime(item.timestamp)}</span>
                                                        {item.isCluster && <span className="text-[10px] text-indigo-500 font-medium bg-indigo-50 px-1.5 rounded">Grouped</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Lab: NeuroGenetics Alpha
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  );
};
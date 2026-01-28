import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Calendar, User, Tag, ChevronRight, 
  Sparkles, CheckCircle2, Circle, Save, 
  MessageSquare, BrainCircuit, X, History,
  FlaskConical, Wand2, FilePenLine, Loader2, Check,
  Mic, StopCircle, SpellCheck, AlignLeft, Undo
} from 'lucide-react';
import { Experiment, ExperimentStatus, AIAnalysisResult, ProtocolStep } from '../types';
import { MOCK_EXPERIMENTS, PROTOCOL_TEMPLATES } from '../constants';
import { analyzeExperimentText, chatWithData, generateExperimentPlan, refineLabNotes } from '../services/geminiService';

const StatusBadge = ({ status }: { status: ExperimentStatus }) => {
  const colors = {
    [ExperimentStatus.Draft]: 'bg-gray-100 text-gray-700',
    [ExperimentStatus.InProgress]: 'bg-blue-100 text-blue-700',
    [ExperimentStatus.Review]: 'bg-yellow-100 text-yellow-700',
    [ExperimentStatus.Completed]: 'bg-green-100 text-green-700',
    [ExperimentStatus.Archived]: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

interface ExperimentViewProps {
  initialCreate?: boolean;
  initialSelectedId?: string | null;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ initialCreate, initialSelectedId }) => {
  const [experiments, setExperiments] = useState<Experiment[]>(MOCK_EXPERIMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Writing Helper State
  const [isListening, setIsListening] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // New Experiment Form Data
  const [newExpData, setNewExpData] = useState<{
    title: string;
    tags: string;
    content: string;
    protocolSteps: string[];
  }>({
    title: '',
    tags: '',
    content: '',
    protocolSteps: []
  });

  // Handle initial props
  useEffect(() => {
    if (initialCreate) {
      setIsCreateModalOpen(true);
    }
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [initialCreate, initialSelectedId]);

  // Reset suggestion when experiment changes
  useEffect(() => {
    setAiSuggestion(null);
  }, [selectedId]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  // Selected Experiment State
  const selectedExp = experiments.find(e => e.id === selectedId);

  const toggleListening = useCallback(() => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
         const lastResult = event.results[event.results.length - 1];
         if (lastResult.isFinal) {
             const transcript = lastResult[0].transcript;
             
             // If we are reviewing a suggestion, append to that, otherwise append to content
             if (aiSuggestion !== null) {
                 setAiSuggestion(prev => (prev || '') + ' ' + transcript);
             } else {
                 setExperiments(prev => {
                     const newExps = [...prev];
                     const exp = newExps.find(e => e.id === selectedId);
                     if(exp) {
                         exp.content = (exp.content + ' ' + transcript).trim();
                     }
                     return newExps;
                 });
             }
         }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [selectedId, aiSuggestion]);

  const handleAiRefine = async (mode: 'fix' | 'scientific' | 'expand') => {
    if(!selectedExp) return;
    setIsRefining(true);
    try {
        const refined = await refineLabNotes(selectedExp.content, mode);
        setAiSuggestion(refined);
    } catch (e) {
        console.error("AI Refine failed", e);
    } finally {
        setIsRefining(false);
    }
  };

  const applySuggestion = () => {
    if (!selectedExp || aiSuggestion === null) return;
    const newExps = experiments.map(exp => exp.id === selectedId ? {...exp, content: aiSuggestion} : exp);
    setExperiments(newExps);
    setAiSuggestion(null);
  };

  const discardSuggestion = () => {
    setAiSuggestion(null);
  };

  const handleCreateExperiment = () => {
    const newId = `EXP-${new Date().getFullYear()}-${String(experiments.length + 1).padStart(3, '0')}`;
    const newExperiment: Experiment = {
      id: newId,
      title: newExpData.title || 'Untitled Experiment',
      author: 'Dr. Sarah Chen', // Hardcoded for prototype
      date: new Date().toISOString().split('T')[0],
      status: ExperimentStatus.Draft,
      tags: newExpData.tags.split(',').map(t => t.trim()).filter(Boolean),
      content: newExpData.content,
      protocolSteps: newExpData.protocolSteps.map((step, idx) => ({
        id: `s${idx}`,
        instruction: step,
        completed: false
      }))
    };

    setExperiments([newExperiment, ...experiments]);
    setSelectedId(newId);
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewExpData({ title: '', tags: '', content: '', protocolSteps: [] });
    setAiPrompt('');
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const result = await generateExperimentPlan(aiPrompt);
    
    setNewExpData({
      title: result.title || '',
      tags: (result.tags || []).join(', '),
      content: result.content || '',
      protocolSteps: (result.protocolSteps || []).map((s: any) => s.instruction)
    });
    
    setCreateMode('manual'); // Switch to review mode
    setIsGenerating(false);
  };
  
  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    const [category, item] = value.split(':');
    
    setNewExpData({
        title: item,
        tags: category,
        content: `## ${item}\n\n**Objective:** \n\n**Materials:**\n\n**Method:**\n\n**Results:**`,
        protocolSteps: [
            'Prepare necessary reagents and equipment',
            `Perform ${item} procedure`,
            'Record data and observations',
            'Clean up workspace'
        ]
    });
  };

  const handleSave = () => {
    if (!selectedExp) return;
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
        // In a real app, this is where we'd persist the 'experiments' state to the backend
    }, 800);
  }

  const toggleStep = (stepId: string) => {
    if (!selectedExp) return;

    const updatedSteps = selectedExp.protocolSteps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    const updatedExperiments = experiments.map(exp => 
      exp.id === selectedExp.id ? { ...exp, protocolSteps: updatedSteps } : exp
    );

    setExperiments(updatedExperiments);
  };

  return (
    <div className="flex h-full gap-6 relative">
      {/* List View */}
      <div className={`${selectedId ? 'hidden lg:flex lg:w-1/3 xl:w-1/4' : 'w-full flex'} flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Experiments</h2>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {experiments.map(exp => (
            <div 
              key={exp.id}
              onClick={() => setSelectedId(exp.id)}
              className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${selectedId === exp.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono text-slate-400">{exp.id}</span>
                <StatusBadge status={exp.status} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-1">{exp.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1"><User size={12}/> {exp.author}</div>
                <div className="flex items-center gap-1"><Calendar size={12}/> {exp.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      {selectedExp && (
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* Toolbar */}
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
             <div className="flex items-center gap-4">
               <button onClick={() => setSelectedId(null)} className="lg:hidden mr-2 text-slate-400">Back</button>
               <div>
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">{selectedExp.title}</h1>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedExp.id} • {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Last edited 2 hours ago'}
                  </span>
               </div>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isAiPanelOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Sparkles size={16} className={isAiPanelOpen ? "text-indigo-600" : "text-yellow-500"} />
                  <span className="text-sm font-medium">AI Insights</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <History size={18} />
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:bg-slate-700 min-w-[90px] justify-center transition-all"
                >
                  {isSaving ? (
                      <Loader2 className="animate-spin" size={16} />
                  ) : (
                      <Save size={16} />
                  )}
                  <span>{isSaving ? 'Saving' : 'Save'}</span>
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Close Experiment"
                >
                  <X size={18} />
                </button>
             </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Metadata Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedExp.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
                <button className="px-2 py-1 rounded-full border border-dashed border-slate-300 text-slate-400 text-xs hover:text-indigo-500 hover:border-indigo-300 flex items-center gap-1">
                  <Plus size={10} /> Add Tag
                </button>
              </div>

              {/* Protocol Steps */}
              <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Protocol Execution</h3>
                <div className="space-y-3">
                  {selectedExp.protocolSteps.map(step => (
                    <div key={step.id} className="flex items-start gap-3 group">
                      <button 
                        onClick={() => toggleStep(step.id)}
                        className={`mt-0.5 transition-colors ${step.completed ? 'text-green-500' : 'text-slate-300 hover:text-indigo-500'}`}
                      >
                        {step.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <div className="flex-1">
                         <p className={`text-sm ${step.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{step.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Editor Simulation */}
              <div className={`flex flex-col h-[500px] border rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-300 ${aiSuggestion ? 'border-indigo-400 ring-4 ring-indigo-50/50' : 'border-slate-200'}`}>
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mr-2">Observations</h3>
                         <div className="h-4 w-px bg-slate-300 mx-1"></div>
                         
                         <button 
                            onClick={toggleListening}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                isListening 
                                ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse' 
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                         >
                            {isListening ? <><StopCircle size={14} className="fill-current"/> Recording...</> : <><Mic size={14}/> Dictate</>}
                         </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium uppercase mr-2 hidden xl:block">AI Writing Helper</span>
                        <button 
                            onClick={() => handleAiRefine('fix')}
                            disabled={isRefining || !selectedExp.content || aiSuggestion !== null}
                            className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all border border-transparent hover:border-slate-200 disabled:opacity-50"
                            title="Fix Grammar"
                        >
                            <SpellCheck size={16} />
                        </button>
                        <button 
                            onClick={() => handleAiRefine('scientific')}
                            disabled={isRefining || !selectedExp.content || aiSuggestion !== null}
                            className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all border border-transparent hover:border-slate-200 disabled:opacity-50"
                            title="Scientific Tone"
                        >
                            <FlaskConical size={16} />
                        </button>
                        <button 
                            onClick={() => handleAiRefine('expand')}
                            disabled={isRefining || !selectedExp.content || aiSuggestion !== null}
                            className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all border border-transparent hover:border-slate-200 disabled:opacity-50"
                            title="Expand Notes"
                        >
                            <AlignLeft size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="relative flex-1">
                    {isRefining && (
                        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg">
                                <Loader2 className="animate-spin" size={16}/> Refining...
                            </div>
                        </div>
                    )}
                    
                    {/* Approval Overlay */}
                    {aiSuggestion !== null && (
                        <div className="absolute bottom-4 right-4 z-20 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                             <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex flex-col gap-3 max-w-sm border border-slate-700">
                                 <div className="flex items-start justify-between gap-4">
                                     <div>
                                         <h4 className="font-bold text-sm flex items-center gap-2">
                                             <Sparkles size={14} className="text-indigo-400"/> 
                                             AI Suggestion
                                         </h4>
                                         <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                             The AI has rewritten your notes. Review the text above, edit if needed, then accept or discard.
                                         </p>
                                     </div>
                                     <button onClick={discardSuggestion} className="text-slate-500 hover:text-white"><X size={16}/></button>
                                 </div>
                                 <div className="flex gap-2 pt-1">
                                     <button 
                                        onClick={discardSuggestion}
                                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                                     >
                                        Discard
                                     </button>
                                     <button 
                                        onClick={applySuggestion}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-1.5"
                                     >
                                        <Check size={14}/> Accept Changes
                                     </button>
                                 </div>
                             </div>
                        </div>
                    )}

                    <textarea 
                      className={`w-full h-full p-6 focus:outline-none resize-none font-mono text-sm leading-relaxed transition-colors ${aiSuggestion !== null ? 'bg-indigo-50/10 text-indigo-900' : 'text-slate-700 bg-white'}`}
                      value={aiSuggestion !== null ? aiSuggestion : selectedExp.content}
                      placeholder="Type your observations here or use voice dictation..."
                      onChange={(e) => {
                        if (aiSuggestion !== null) {
                            setAiSuggestion(e.target.value);
                        } else {
                            const newExps = experiments.map(exp => exp.id === selectedExp.id ? {...exp, content: e.target.value} : exp);
                            setExperiments(newExps);
                        }
                      }}
                    />
                </div>
                <div className={`border-t px-4 py-1.5 flex justify-between items-center text-[10px] transition-colors ${aiSuggestion ? 'bg-indigo-50 border-indigo-100 text-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <span>{aiSuggestion ? 'REVIEW MODE' : 'Markdown Supported'}</span>
                    <span>{(aiSuggestion || selectedExp.content).length} chars</span>
                </div>
              </div>
            </div>

            {/* Right Side AI Panel */}
            {isAiPanelOpen && (
              <AIPanel experiment={selectedExp} onClose={() => setIsAiPanelOpen(false)} />
            )}
          </div>

        </div>
      )}

      {/* CREATE EXPERIMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Create New Experiment</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setCreateMode('manual')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${createMode === 'manual' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <FilePenLine size={16} /> Standard Entry
              </button>
              <button 
                onClick={() => setCreateMode('ai')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${createMode === 'ai' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Wand2 size={16} /> AI Generator
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {createMode === 'ai' ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-800">
                    <p className="flex items-start gap-2">
                      <Sparkles className="shrink-0 mt-0.5" size={16}/>
                      Describe your experiment in plain language. AI will generate the title, tags, protocol steps, and initial structure for you.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Experiment Description</label>
                    <textarea 
                      className="w-full h-40 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-slate-900"
                      placeholder="e.g., I want to optimize the PCR annealing temperature for the GAPDH gene. I'll test 55, 58, 60, and 62 degrees using the standard Phusion polymerase protocol."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                    {isGenerating ? 'Generating Structure...' : 'Generate Experiment Structure'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   {/* TEMPLATE SELECTOR */}
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Load Template (Optional)</label>
                       <div className="relative">
                           <select 
                               className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none text-sm text-slate-900"
                               onChange={handleTemplateSelect}
                               defaultValue=""
                           >
                               <option value="" disabled>Select a standard protocol...</option>
                               {PROTOCOL_TEMPLATES.map(group => (
                                   <optgroup label={group.category} key={group.category}>
                                       {group.items.map(item => (
                                           <option value={`${group.category}:${item}`} key={item}>{item}</option>
                                       ))}
                                   </optgroup>
                               ))}
                           </select>
                           <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16}/>
                       </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                     <input 
                       type="text" 
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                       placeholder="Experiment Title"
                       value={newExpData.title}
                       onChange={(e) => setNewExpData({...newExpData, title: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                     <input 
                       type="text" 
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                       placeholder="PCR, Optimization, GAPDH"
                       value={newExpData.tags}
                       onChange={(e) => setNewExpData({...newExpData, tags: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Protocol Steps (one per line, optional)</label>
                     <textarea 
                       className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm bg-white text-slate-900"
                       placeholder="Step 1: Prepare master mix&#10;Step 2: Aliquot into tubes"
                       value={newExpData.protocolSteps.join('\n')}
                       onChange={(e) => setNewExpData({...newExpData, protocolSteps: e.target.value.split('\n')})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Initial Observations / Notes</label>
                     <textarea 
                       className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-slate-900"
                       placeholder="Background information..."
                       value={newExpData.content}
                       onChange={(e) => setNewExpData({...newExpData, content: e.target.value})}
                     />
                   </div>
                </div>
              )}
            </div>

            {/* Footer actions (only for manual review/submit) */}
            {createMode === 'manual' && (
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateExperiment}
                  disabled={!newExpData.title.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Create Experiment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for AI Panel (unchanged but included to complete file)
const AIPanel = ({ experiment, onClose }: { experiment: Experiment, onClose: () => void }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);

  const performAnalysis = useCallback(async () => {
    setLoading(true);
    const result = await analyzeExperimentText(experiment.content);
    setAnalysis(result);
    setLoading(false);
  }, [experiment.content]);

  // Auto-analyze on open or when content changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      performAnalysis();
    }, 1000);

    return () => clearTimeout(timer);
  }, [performAnalysis]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    
    // Simulate thinking
    const response = await chatWithData(chatHistory, `Context: ${experiment.content}. User Question: ${userMsg}`);
    
    setChatHistory(prev => [...prev, { role: 'model', content: response || "Error" }]);
  };

  return (
    <div className="w-96 border-l border-slate-200 bg-white flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-slate-50">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold">
          <BrainCircuit size={18} />
          <span>Research Assistant</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'insights' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Insights & NER
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Q&A Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             <p className="text-xs">Analyzing experiment data...</p>
          </div>
        ) : activeTab === 'insights' && analysis ? (
          <div className="space-y-6">
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Summary</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Extracted Entities (NER)</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.entities.map((ent, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${ent.type.toLowerCase().includes('gene') ? 'bg-blue-400' : ent.type.toLowerCase().includes('reagent') ? 'bg-amber-400' : 'bg-gray-400'}`}></span>
                    {ent.name}
                  </span>
                ))}
              </div>
            </div>

            {analysis.anomalies.length > 0 && (
               <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Anomalies Detected</h4>
                <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                  {analysis.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
               <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Suggestions</h4>
                <ul className="list-disc list-inside text-sm text-emerald-800 space-y-1">
                  {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
             
            <button 
              onClick={performAnalysis} 
              className="w-full py-2 text-xs text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
            >
              Re-analyze
            </button>

          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 space-y-4 mb-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10">
                  Ask questions about this experiment, e.g., "What was the transfection efficiency?"
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ask Gemini..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
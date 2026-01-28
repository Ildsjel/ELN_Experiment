import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ViewState } from './types';
import { ExperimentView } from './components/ExperimentView';
import { Dashboard, Inventory, MolecularTools, Analytics, AuditLog } from './components/OtherViews';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.Dashboard);
  const [inventoryTab, setInventoryTab] = useState<'list' | 'cold-chain' | 'equipment'>('list');
  const [autoOpenCreate, setAutoOpenCreate] = useState(false);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const handleNavigate = (view: ViewState, params?: any) => {
    setCurrentView(view);
    
    // Reset selection states on navigation unless explicitly passed
    setSelectedExperimentId(null);
    setAutoOpenCreate(false);

    // Handle specific parameters for views
    if (view === ViewState.Inventory) {
        if (params?.tab) setInventoryTab(params.tab);
    }
    
    // Handle experiments specific params
    if (view === ViewState.Experiments) {
        if (params?.openCreate) {
            setAutoOpenCreate(true);
        }
        if (params?.id) {
            setSelectedExperimentId(params.id);
        }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.Dashboard:
        return <Dashboard onNavigate={handleNavigate} />;
      case ViewState.Experiments:
        return <ExperimentView initialCreate={autoOpenCreate} initialSelectedId={selectedExperimentId} />;
      case ViewState.Inventory:
        return <Inventory key={inventoryTab} initialTab={inventoryTab} />;
      case ViewState.Molecular:
        return <MolecularTools />;
      case ViewState.Analytics:
        return <Analytics />;
      case ViewState.AuditLog:
        return <AuditLog />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {renderView()}
    </Layout>
  );
};

export default App;
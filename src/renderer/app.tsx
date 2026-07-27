import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ThemeModal } from './components/theme/ThemeModal';

import { DashboardView } from './features/dashboard/DashboardView';
import { FocusView } from './features/focus/FocusView';
import { TasksView } from './features/tasks/TasksView';
import { NotesView } from './features/notes/NotesView';
import { BibleView } from './features/bible/BibleView';
import { StatsView } from './features/stats/StatsView';

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  const tabLabels: Record<NavTab, string> = {
    dashboard: 'Home Dashboard',
    focus: 'Focus Mode',
    tasks: "Today's Tasks",
    notes: 'Quick Notes',
    bible: 'Bible & Reflection',
    stats: 'Study Analytics',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'focus':
        return <FocusView />;
      case 'tasks':
        return <TasksView />;
      case 'notes':
        return <NotesView />;
      case 'bible':
        return <BibleView />;
      case 'stats':
        return <StatsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="main-layout">
        <Header
          activeTabLabel={tabLabels[activeTab]}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />
        
        <main className="content-viewport">
          {renderContent()}
        </main>
      </div>

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}

export default App;
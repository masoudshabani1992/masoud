import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DepartmentHubView from './components/DepartmentHubView';
import KanbanBoard from './components/KanbanBoard';
import ProductsArchiveView from './components/ProductsArchiveView';
import MyTasksInbox from './components/MyTasksInbox';
import CalculatorView from './components/CalculatorView';
import DashboardView from './components/DashboardView';
import MaterialPricesView from './components/MaterialPricesView';
import SubdomainGuideView from './components/SubdomainGuideView';
import IndustrialOrderForm from './components/IndustrialOrderForm';
import UserManagementView from './components/UserManagementView';
import DataMigrationView from './components/DataMigrationView';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import PrintTicketModal from './components/PrintTicketModal';
import NotificationCenterModal from './components/NotificationCenterModal';
import { playNotificationSound } from './utils/helpers';

export default function App() {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState('hub');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderData, setReorderData] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Modals state
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [printProject, setPrintProject] = useState(null);

  const fetchNotificationsCount = async () => {
    try {
      const res = await api.getNotifications();
      const count = res.unreadCount || 0;
      if (count > unreadNotifCount && unreadNotifCount > 0) {
        playNotificationSound();
      }
      setUnreadNotifCount(count);
    } catch (e) {}
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      setProjects(res.projects || []);
      fetchNotificationsCount();
    } catch (err) {
      console.warn('Error fetching projects, retrying...', err);
      setTimeout(async () => {
        try {
          const retryRes = await api.getProjects();
          setProjects(retryRes.projects || []);
        } catch (e) {
          console.error(e);
        }
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
      fetchNotificationsCount();
      const interval = setInterval(fetchNotificationsCount, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginView />;
  }

  let targetStages = [];
  if (role === 'ceo') targetStages = [4];
  else if (role === 'sales') targetStages = [1, 3, 6, 8];
  else if (role === 'secretary') targetStages = [1, 3];
  else if (role === 'estimation' || role === 'accounting') targetStages = [2];
  else if (role === 'design') targetStages = [5];
  else if (role === 'mockup' || role === 'outsource') targetStages = [7];
  else if (role === 'procurement' || role === 'warehouse') targetStages = [9];
  else if (role === 'production') targetStages = [10];
  else if (role === 'customer') targetStages = [3, 6, 8];

  const myPendingTasksCount = projects.filter((p) => targetStages.includes(p.current_stage)).length;

  const handleStartReorder = (proj) => {
    setReorderData({
      ...proj,
      title: `${proj.title} (سفارش مجدد)`,
      old_archive_code: proj.archive_code || proj.tracking_code,
      order_code: String(Math.floor(1000 + Math.random() * 9000)),
      archive_code: String(Math.floor(1000 + Math.random() * 9000))
    });
    setActiveTab('new_order');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full text-slate-800">
      {/* Universal Full-Width Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'new_order') setReorderData(null);
          setActiveTab(tab);
        }}
        myPendingCount={myPendingTasksCount}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setShowNotificationModal(true)}
      />

      {/* Main Content Area - Full-Width Responsive */}
      <main className="flex-1 w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Department Hub (Landing Screen matching user's legacy MIS) */}
        {activeTab === 'hub' && (
          <DepartmentHubView
            projects={projects}
            onNavigateDepartment={(tabKey) => setActiveTab(tabKey)}
            onOpenNewOrder={() => setActiveTab('new_order')}
            onOpenArchive={() => setActiveTab('archive')}
          />
        )}

        {/* Full-Page New Order View (No Popup) */}
        {activeTab === 'new_order' && (
          <IndustrialOrderForm
            initialData={reorderData}
            onCancel={() => {
              setReorderData(null);
              setActiveTab('hub');
            }}
            onOrderSaved={() => {
              setReorderData(null);
              fetchProjects();
              setActiveTab('hub');
            }}
          />
        )}

        {/* Products & Orders Archive Search Table */}
        {activeTab === 'archive' && (
          <ProductsArchiveView
            projects={projects}
            onSelectProject={(p) => setSelectedProjectId(p.id)}
            onPrintTicket={(p) => setPrintProject(p)}
            onReorderProject={handleStartReorder}
            onRefresh={fetchProjects}
          />
        )}

        {/* 9-Stage Kanban Board */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            projects={projects}
            onSelectProject={(p) => setSelectedProjectId(p.id)}
            onPrintTicket={(p) => setPrintProject(p)}
            currentRole={role}
          />
        )}

        {/* My Tasks Inbox */}
        {activeTab === 'my_tasks' && (
          <MyTasksInbox
            projects={projects}
            onSelectProject={(p) => setSelectedProjectId(p.id)}
            onPrintTicket={(p) => setPrintProject(p)}
          />
        )}

        {/* Dashboard Analytics */}
        {activeTab === 'dashboard' && <DashboardView />}

        {/* Raw Materials Prices */}
        {activeTab === 'materials' && <MaterialPricesView />}

        {/* User Management & RBAC Panel */}
        {activeTab === 'users' && <UserManagementView />}

        {/* Data Migration & Import Center */}
        {activeTab === 'migration' && <DataMigrationView onRefreshData={fetchProjects} />}

        {/* Full-Page Industrial Price Calculator */}
        {activeTab === 'calculator' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">ماشین حساب برآورد صنعتی قیمت جعبه و کارتن</h2>
              <span className="text-xs font-bold text-slate-500">محاسبه دقیق فرمول‌های متریال، چاپ و خدمات تکمیلی</span>
            </div>
            <CalculatorView />
          </div>
        )}

        {/* Subdomain Guide */}
        {activeTab === 'subdomain_guide' && <SubdomainGuideView />}
      </main>

      {/* Project Details Modal */}
      {selectedProjectId && (
        <ProjectDetailsModal
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          onUpdated={() => fetchProjects()}
          onPrintTicket={(p) => setPrintProject(p)}
        />
      )}

      {/* Print Document Modal */}
      {printProject && (
        <PrintTicketModal
          project={printProject}
          onClose={() => setPrintProject(null)}
        />
      )}

      {/* Notification Center Modal */}
      {showNotificationModal && (
        <NotificationCenterModal
          onClose={() => {
            setShowNotificationModal(false);
            fetchNotificationsCount();
          }}
          onSelectProject={(p) => setSelectedProjectId(p.id)}
        />
      )}
    </div>
  );
}

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
import LicenseGate from './components/LicenseGate';
import LicenseStatusModal from './components/LicenseStatusModal';
import AiAssistantView from './components/AiAssistantView';
import MarketingLeadsView from './components/MarketingLeadsView';
import DielineGeneratorView from './components/DielineGeneratorView';
import Packaging3DStudioView from './components/Packaging3DStudioView';
import { playNotificationSound } from './utils/helpers';

export default function App() {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState(role === 'marketer' ? 'marketing' : 'hub');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderData, setReorderData] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Selected Lead to load into price calculator / estimation
  const [selectedLeadSpecs, setSelectedLeadSpecs] = useState(null);

  // License State
  const [licenseState, setLicenseState] = useState({
    checked: false,
    isActive: true,
    hardwareId: '',
    license: null,
    errorReason: null
  });

  // Modals state
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [printProject, setPrintProject] = useState(null);

  // Navigate with browser history support (Back Button handler)
  const navigateTab = (newTab, addToHistory = true) => {
    if (newTab !== 'new_order') setReorderData(null);
    setActiveTab(newTab);
    if (addToHistory && window.history) {
      window.history.pushState({ tab: newTab }, '', `#${newTab}`);
    }
  };

  // 1. Browser Back Button Listener (popstate)
  useEffect(() => {
    // Initial state
    if (window.history && !window.history.state) {
      window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
    }

    const handlePopState = (event) => {
      // If modal is open, close modal first
      if (selectedProjectId) {
        setSelectedProjectId(null);
        return;
      }
      if (printProject) {
        setPrintProject(null);
        return;
      }
      if (showNotificationModal) {
        setShowNotificationModal(false);
        return;
      }
      if (showLicenseModal) {
        setShowLicenseModal(false);
        return;
      }

      // If state has tab, restore tab
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        // Default back goes to hub
        if (role === 'marketer') {
          setActiveTab('marketing');
        } else {
          setActiveTab('hub');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProjectId, printProject, showNotificationModal, showLicenseModal, activeTab, role]);

  // Check License on Startup
  useEffect(() => {
    if (role === 'marketer' && activeTab !== 'marketing') {
      setActiveTab('marketing');
    }
  }, [role, activeTab]);

  const checkLicense = async () => {
    try {
      const res = await api.getLicenseStatus();
      setLicenseState({
        checked: true,
        isActive: res.isActive,
        hardwareId: res.hardwareId,
        license: res.license,
        errorReason: res.errorReason
      });
    } catch (err) {
      console.error('License check error:', err);
      setLicenseState((prev) => ({ ...prev, checked: true }));
    }
  };

  useEffect(() => {
    checkLicense();

    const handleLicenseLocked = (e) => {
      setLicenseState((prev) => ({
        ...prev,
        isActive: false,
        hardwareId: e.detail?.hardwareId || prev.hardwareId,
        errorReason: e.detail?.reason || e.detail?.message || 'سامانه قفل است'
      }));
    };

    window.addEventListener('license_locked', handleLicenseLocked);
    return () => window.removeEventListener('license_locked', handleLicenseLocked);
  }, []);

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
    if (currentUser && licenseState.isActive) {
      fetchProjects();
      fetchNotificationsCount();
      const interval = setInterval(fetchNotificationsCount, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser, licenseState.isActive]);

  // Handle opening lead from notification
  const handleOpenLeadFromNotification = async (leadId, leadCode) => {
    try {
      if (role === 'sales' || role === 'estimation' || role === 'accounting' || role === 'ceo') {
        navigateTab('calculator');
      } else {
        navigateTab('marketing');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If license is checking, display loader
  if (!licenseState.checked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans" dir="rtl">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-sm">در حال اعتبارسنجی قفل سخت‌افزاری و لایسنس سرور...</p>
      </div>
    );
  }

  // If license is NOT active/valid, show License Gate
  if (!licenseState.isActive) {
    return (
      <LicenseGate
        hardwareId={licenseState.hardwareId}
        errorReason={licenseState.errorReason}
        onActivated={(newLic) => {
          setLicenseState({
            checked: true,
            isActive: true,
            hardwareId: licenseState.hardwareId,
            license: newLic,
            errorReason: null
          });
        }}
      />
    );
  }

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
    navigateTab('new_order');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full text-slate-800">
      {/* Universal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => navigateTab(tab)}
        myPendingCount={myPendingTasksCount}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenLicense={() => setShowLicenseModal(true)}
        licenseInfo={licenseState.license}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Department Hub (Landing Screen) */}
        {activeTab === 'hub' && (
          <DepartmentHubView
            projects={projects}
            onNavigateDepartment={(tabKey) => navigateTab(tabKey)}
            onOpenNewOrder={() => navigateTab('new_order')}
            onOpenArchive={() => navigateTab('archive')}
          />
        )}

        {/* Full-Page New Order View */}
        {activeTab === 'new_order' && (
          <IndustrialOrderForm
            initialData={reorderData}
            onCancel={() => {
              setReorderData(null);
              navigateTab('hub');
            }}
            onOrderSaved={() => {
              setReorderData(null);
              fetchProjects();
              navigateTab('hub');
            }}
          />
        )}

        {/* Products & Orders Archive */}
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

        {/* User Management Panel */}
        {activeTab === 'users' && <UserManagementView />}

        {/* Data Migration & Import Center */}
        {activeTab === 'migration' && <DataMigrationView onRefreshData={fetchProjects} />}

        {/* Amiran Design Studio & Dieline Generator */}
        {activeTab === 'dieline_generator' && (
          <DielineGeneratorView
            onTransferToOrder={(boxSpecs) => {
              setReorderData({
                ...boxSpecs,
                order_code: String(Math.floor(1000 + Math.random() * 9000)),
                archive_code: String(Math.floor(1000 + Math.random() * 9000))
              });
              navigateTab('new_order');
            }}
          />
        )}

        {/* Fullscreen Amiran 3D Studio */}
        {activeTab === '3d_studio' && (
          <Packaging3DStudioView
            onSwitchTo2DDieline={() => navigateTab('dieline_generator')}
            onTransferToOrder={(boxSpecs) => {
              setReorderData({
                ...boxSpecs,
                order_code: String(Math.floor(1000 + Math.random() * 9000)),
                archive_code: String(Math.floor(1000 + Math.random() * 9000))
              });
              navigateTab('new_order');
            }}
          />
        )}

        {/* AI Packaging Assistant & Preflight Inspection */}
        {activeTab === 'ai_assistant' && (
          <AiAssistantView
            onTransferToOrderForm={(extractedData) => {
              setReorderData({
                ...extractedData,
                order_code: String(Math.floor(1000 + Math.random() * 9000)),
                archive_code: String(Math.floor(1000 + Math.random() * 9000))
              });
              navigateTab('new_order');
            }}
          />
        )}

        {/* Full-Page Industrial Price Calculator with Marketer Inquiries */}
        {activeTab === 'calculator' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">ماشین حساب برآورد صنعتی قیمت جعبه و استعلام بازاریابی</h2>
              <span className="text-xs font-bold text-slate-500">برآورد قیمت روز استعلام‌های بازاریاب و فرمول‌های صنعتی</span>
            </div>
            <CalculatorView
              initialSpecs={selectedLeadSpecs}
              onLeadEstimated={() => fetchNotificationsCount()}
            />
          </div>
        )}

        {/* Marketing Leads & Field Sales Hub */}
        {activeTab === 'marketing' && (
          <MarketingLeadsView
            onNavigateToKanban={() => {
              if (role !== 'marketer') {
                navigateTab('kanban');
              }
            }}
          />
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
          onSelectProject={(p) => {
            if (p.type === 'lead') {
              handleOpenLeadFromNotification(p.leadId, p.archiveCode);
            } else {
              setSelectedProjectId(p.id);
            }
          }}
          onSelectLead={handleOpenLeadFromNotification}
        />
      )}

      {/* License Status & Details Modal */}
      <LicenseStatusModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        licenseInfo={licenseState.license}
        hardwareId={licenseState.hardwareId}
        onLicenseUpdated={(newLic) => {
          setLicenseState((prev) => ({
            ...prev,
            isActive: true,
            license: newLic
          }));
        }}
      />
    </div>
  );
}

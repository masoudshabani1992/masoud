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
import ProductionOrderView from './components/ProductionOrderView';
import WarehouseInventoryView from './components/WarehouseInventoryView';
import DigitalPrintView from './components/DigitalPrintView';
import TollServicesView from './components/TollServicesView';
import HumanResourcesView from './components/HumanResourcesView';
import StorageManagerView from './components/StorageManagerView';
import AuditLogsView from './components/AuditLogsView';
import CommandPaletteModal from './components/CommandPaletteModal';
import FloatingQuickDock from './components/FloatingQuickDock';
import ErrorBoundary from './components/ErrorBoundary';
import { playNotificationSound } from './utils/helpers';

const TAB_PERMISSION_MAP = {
  hub: 'can_view_hub',
  new_order: 'can_create_order',
  archive: 'can_view_archive',
  kanban: 'can_view_kanban',
  my_tasks: 'can_view_my_tasks',
  dashboard: 'can_view_dashboard',
  materials: 'can_view_material_prices',
  users: 'can_manage_users',
  hr: 'can_manage_users',
  logs: 'can_manage_users',
  storage: 'can_manage_users',
  migration: 'can_view_migration',
  dieline_generator: 'can_view_studio',
  '3d_studio': 'can_view_studio',
  ai_assistant: 'can_view_ai',
  calculator: 'can_view_calculator',
  marketing: 'can_view_marketing',
  production_orders: 'can_view_production_offset',
  production_orders_offset: 'can_view_production_offset',
  digital_orders: 'can_view_production_digital',
  production_orders_digital: 'can_view_production_digital',
  service_orders: 'can_view_production_service',
  production_orders_service: 'can_view_production_service',
  warehouse_inventory: 'can_view_warehouse_cardboard',
  warehouse_cardboard: 'can_view_warehouse_cardboard',
  warehouse_sheet_carton: 'can_view_warehouse_sheet_carton',
  warehouse_single_face: 'can_view_warehouse_single_face',
  warehouse_cellophane: 'can_view_warehouse_cellophane',
  warehouse_pvc_film: 'can_view_warehouse_pvc_film',
  warehouse_ink: 'can_view_warehouse_ink'
};

const getDefaultTabForUser = (user, checkPermFn) => {
  if (!user) return 'hub';
  if (user.role === 'ceo') return 'hub';
  if (user.role === 'design' && checkPermFn('can_view_studio')) return 'dieline_generator';
  if (user.role === 'marketer' && checkPermFn('can_view_marketing')) return 'marketing';
  if (user.role === 'secretary' && checkPermFn('can_create_order')) return 'new_order';
  if (user.role === 'warehouse' && checkPermFn('can_view_warehouse_cardboard')) return 'warehouse_cardboard';
  if (user.role === 'production' && checkPermFn('can_view_production_offset')) return 'production_orders';
  if (user.role === 'accounting' && checkPermFn('can_view_calculator')) return 'calculator';
  
  if (checkPermFn('can_view_hub')) return 'hub';
  if (checkPermFn('can_view_studio')) return 'dieline_generator';
  if (checkPermFn('can_view_marketing')) return 'marketing';
  if (checkPermFn('can_create_order')) return 'new_order';
  if (checkPermFn('can_view_production_offset')) return 'production_orders';
  if (checkPermFn('can_view_warehouse_cardboard')) return 'warehouse_cardboard';
  if (checkPermFn('can_view_calculator')) return 'calculator';
  if (checkPermFn('can_view_my_tasks')) return 'my_tasks';
  return 'hub';
};

export default function App() {
  const { currentUser, role, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    if (role === 'design') return 'dieline_generator';
    if (role === 'marketer') return 'marketing';
    if (role === 'secretary') return 'new_order';
    if (role === 'warehouse') return 'warehouse_cardboard';
    if (role === 'production') return 'production_orders';
    if (role === 'accounting') return 'calculator';
    return 'hub';
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderData, setReorderData] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global Ctrl+K / Cmd+K Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Open / Close Modals with History Support
  const openProjectModal = (projId) => {
    setSelectedProjectId(projId);
    if (window.history) {
      window.history.pushState({ tab: activeTab, modal: 'project', id: projId }, '', `#project-${projId}`);
    }
  };

  const closeProjectModal = () => {
    setSelectedProjectId(null);
    if (window.history?.state?.modal === 'project') {
      window.history.back();
    }
  };

  const openPrintModal = (proj) => {
    setPrintProject(proj);
    if (window.history) {
      window.history.pushState({ tab: activeTab, modal: 'print', id: proj.id }, '', `#print-${proj.id}`);
    }
  };

  const closePrintModal = () => {
    setPrintProject(null);
    if (window.history?.state?.modal === 'print') {
      window.history.back();
    }
  };

  const openSearchModal = () => {
    setShowCommandPalette(true);
    if (window.history) {
      window.history.pushState({ tab: activeTab, modal: 'search' }, '', `#search`);
    }
  };

  const closeSearchModal = () => {
    setShowCommandPalette(false);
    if (window.history?.state?.modal === 'search') {
      window.history.back();
    }
  };

  const openNotificationsModal = () => {
    setShowNotificationModal(true);
    if (window.history) {
      window.history.pushState({ tab: activeTab, modal: 'notifications' }, '', `#notifications`);
    }
  };

  const closeNotificationsModal = () => {
    setShowNotificationModal(false);
    if (window.history?.state?.modal === 'notifications') {
      window.history.back();
    }
  };

  const openLicenseModal = () => {
    setShowLicenseModal(true);
    if (window.history) {
      window.history.pushState({ tab: activeTab, modal: 'license' }, '', `#license`);
    }
  };

  const closeLicenseModal = () => {
    setShowLicenseModal(false);
    if (window.history?.state?.modal === 'license') {
      window.history.back();
    }
  };

  // Navigate with browser history support (Back Button handler)
  const navigateTab = (newTab, addToHistory = true) => {
    if (newTab !== 'new_order') setReorderData(null);
    setActiveTab(newTab);
    // Close modals on tab change
    setSelectedProjectId(null);
    setPrintProject(null);
    setShowCommandPalette(false);
    setShowNotificationModal(false);
    setShowLicenseModal(false);

    if (addToHistory && window.history) {
      window.history.pushState({ tab: newTab, modal: null }, '', `#${newTab}`);
    }
  };

  // Browser Back & Forward Button Listener (popstate)
  useEffect(() => {
    // Initial state setup
    if (window.history && !window.history.state) {
      window.history.replaceState({ tab: activeTab, modal: null }, '', `#${activeTab}`);
    }

    const handlePopState = (event) => {
      const state = event.state;
      if (!state) {
        setSelectedProjectId(null);
        setPrintProject(null);
        setShowCommandPalette(false);
        setShowNotificationModal(false);
        setShowLicenseModal(false);
        const fallback = getDefaultTabForUser(currentUser, hasPermission);
        setActiveTab(fallback);
        if (window.history) {
          window.history.replaceState({ tab: fallback, modal: null }, '', `#${fallback}`);
        }
        return;
      }

      // Restore Modal or Tab from History State
      if (state.modal === 'project' && state.id) {
        setSelectedProjectId(state.id);
        setPrintProject(null);
        setShowCommandPalette(false);
        setShowNotificationModal(false);
        setShowLicenseModal(false);
      } else if (state.modal === 'print' && state.id) {
        const found = projects.find(p => p.id === state.id);
        if (found) setPrintProject(found);
        setSelectedProjectId(null);
        setShowCommandPalette(false);
        setShowNotificationModal(false);
        setShowLicenseModal(false);
      } else if (state.modal === 'search') {
        setShowCommandPalette(true);
        setSelectedProjectId(null);
        setPrintProject(null);
        setShowNotificationModal(false);
        setShowLicenseModal(false);
      } else if (state.modal === 'notifications') {
        setShowNotificationModal(true);
        setSelectedProjectId(null);
        setPrintProject(null);
        setShowCommandPalette(false);
        setShowLicenseModal(false);
      } else if (state.modal === 'license') {
        setShowLicenseModal(true);
        setSelectedProjectId(null);
        setPrintProject(null);
        setShowCommandPalette(false);
        setShowNotificationModal(false);
      } else {
        // No modal in state -> close all modals and activate tab
        setSelectedProjectId(null);
        setPrintProject(null);
        setShowCommandPalette(false);
        setShowNotificationModal(false);
        setShowLicenseModal(false);
        if (state.tab) {
          setActiveTab(state.tab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [projects, currentUser, hasPermission, activeTab]);

  // Enforce Strict Role Isolation & Permissions Filter
  useEffect(() => {
    if (!currentUser) return;
    const requiredPerm = TAB_PERMISSION_MAP[activeTab];
    if (requiredPerm && !hasPermission(requiredPerm)) {
      const fallbackTab = getDefaultTabForUser(currentUser, hasPermission);
      setActiveTab(fallbackTab);
    }
  }, [currentUser, role, activeTab]);

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
      setShowNotificationModal(false);
      if (leadId) {
        try {
          const res = await api.getMarketingLeads();
          const found = res?.leads?.find(l => l.id === leadId || l.lead_code === leadCode);
          if (found) {
            setSelectedLeadSpecs(found);
          }
        } catch (e) {}
      }
      if (role === 'sales' || role === 'estimation' || role === 'accounting' || role === 'ceo') {
        navigateTab('calculator');
      } else {
        navigateTab('marketing');
      }
    } catch (err) {
      console.error(err);
      navigateTab('calculator');
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
        onOpenNotifications={openNotificationsModal}
        onOpenLicense={openLicenseModal}
        onOpenSearch={openSearchModal}
        licenseInfo={licenseState.license}
      />

      {/* Main Content Area Wrapped with Error Boundary */}
      <main
        className={
          activeTab === 'dieline_generator' || activeTab === '3d_studio'
            ? 'flex-1 w-full h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden p-2 sm:p-3'
            : 'flex-1 w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'
        }
      >
        <ErrorBoundary onReset={() => navigateTab('hub')}>
          
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
              onSelectProject={(p) => openProjectModal(p.id)}
              onPrintTicket={(p) => openPrintModal(p)}
              onReorderProject={handleStartReorder}
              onRefresh={fetchProjects}
              onNavigateTab={(t) => navigateTab(t)}
            />
          )}

          {/* 10-Stage Kanban Board */}
          {activeTab === 'kanban' && (
            <KanbanBoard
              projects={projects}
              onSelectProject={(p) => openProjectModal(p.id)}
              onPrintTicket={(p) => openPrintModal(p)}
              currentRole={role}
              onNavigateTab={(t) => navigateTab(t)}
            />
          )}

          {/* My Tasks Inbox */}
          {activeTab === 'my_tasks' && (
            <MyTasksInbox
              projects={projects}
              onSelectProject={(p) => openProjectModal(p.id)}
              onPrintTicket={(p) => openPrintModal(p)}
            />
          )}

          {/* Dashboard Analytics */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(t) => navigateTab(t)}
            />
          )}

          {/* Raw Materials Prices */}
          {activeTab === 'materials' && <MaterialPricesView />}

          {/* User Management Panel */}
          {activeTab === 'users' && <UserManagementView />}

          {/* Storage Files & Folders Manager */}
          {activeTab === 'storage' && <StorageManagerView />}

          {/* Audit Logs & User Activity Tracking (ممیزی و لاگ سیستم) */}
          {activeTab === 'logs' && <AuditLogsView />}

          {/* Human Resources & Performance Evaluation System (HR) */}
          {activeTab === 'hr' && <HumanResourcesView />}

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

          {/* Production Orders (دستور تولید: ۱. تولید (صف ۳ رنگ)) */}
          {(activeTab === 'production_orders' || activeTab === 'production_orders_offset') && (
            <ProductionOrderView
              onOpenNewProject={() => navigateTab('new_order')}
            />
          )}

          {/* Digital Print Orders (دستور تولید: ۲. دیجیتال) */}
          {(activeTab === 'digital_orders' || activeTab === 'production_orders_digital') && (
            <DigitalPrintView />
          )}

          {/* Toll Service Orders (دستور تولید: ۳. خدماتی با متریال مشتری) */}
          {(activeTab === 'service_orders' || activeTab === 'production_orders_service') && (
            <TollServicesView />
          )}

          {/* Warehouse Inventory (انبار: ۱. مقوا | ۲. ورق | ۳. سینگل | ۴. سلفون | ۵. طلق | ۶. مرکب) */}
          {activeTab === 'warehouse_inventory' && (
            <WarehouseInventoryView initialCategory="cardboard" />
          )}
          {activeTab === 'warehouse_cardboard' && (
            <WarehouseInventoryView initialCategory="cardboard" />
          )}
          {activeTab === 'warehouse_sheet_carton' && (
            <WarehouseInventoryView initialCategory="sheet_carton" />
          )}
          {activeTab === 'warehouse_single_face' && (
            <WarehouseInventoryView initialCategory="single_face" />
          )}
          {activeTab === 'warehouse_cellophane' && (
            <WarehouseInventoryView initialCategory="cellophane" />
          )}
          {activeTab === 'warehouse_pvc_film' && (
            <WarehouseInventoryView initialCategory="pvc_film" />
          )}
          {activeTab === 'warehouse_ink' && (
            <WarehouseInventoryView initialCategory="ink" />
          )}

          {/* Subdomain Guide */}
          {activeTab === 'subdomain_guide' && <SubdomainGuideView />}
        </ErrorBoundary>
      </main>

      {/* Universal Page Footer */}
      <footer className="w-full py-2 px-4 sm:px-6 bg-slate-900 text-slate-300 border-t border-slate-800 text-[12px] flex items-center justify-between flex-wrap gap-2 z-30 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            همکار گرامی! تمامی اطلاعات این اتوماسیون محرمانه و امانت در اختیار شماست
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[12px]">
          <span className="text-slate-400">برنامه‌نویس:</span>
          <span>مسعود شعبانی</span>
        </div>
      </footer>

      {/* Project Details Modal */}
      {selectedProjectId && (
        <ProjectDetailsModal
          projectId={selectedProjectId}
          onClose={closeProjectModal}
          onUpdated={() => fetchProjects()}
          onPrintTicket={(p) => openPrintModal(p)}
        />
      )}

      {/* Print Document Modal */}
      {printProject && (
        <PrintTicketModal
          project={printProject}
          onClose={closePrintModal}
        />
      )}

      {/* Notification Center Modal */}
      {showNotificationModal && (
        <NotificationCenterModal
          onClose={() => {
            closeNotificationsModal();
            fetchNotificationsCount();
          }}
          onSelectProject={(p) => {
            if (p.type === 'lead') {
              handleOpenLeadFromNotification(p.leadId, p.archiveCode);
            } else {
              openProjectModal(p.id);
            }
          }}
          onSelectLead={handleOpenLeadFromNotification}
        />
      )}

      {/* License Status & Details Modal */}
      <LicenseStatusModal
        isOpen={showLicenseModal}
        onClose={closeLicenseModal}
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

      {/* Floating Quick Action Dock (Always accessible on right side) */}
      <FloatingQuickDock
        activeTab={activeTab}
        onNavigate={(tab) => navigateTab(tab)}
        onOpenSearch={openSearchModal}
      />

      {/* Universal Search & Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={closeSearchModal}
        onNavigate={(tab) => navigateTab(tab)}
        onOpenNewOrder={() => navigateTab('new_order')}
        onSelectProject={(projId) => openProjectModal(projId)}
        projects={projects}
      />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, PlusCircle, Menu, X, Rocket, ChevronRight, LogOut, Briefcase } from 'lucide-react';
import { StorageService } from './services/storageService';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import CustomerMaster from './components/CustomerMaster';
import ProjectForm from './components/ProjectForm';
import ProjectDetail from './components/ProjectDetail';
import TeamMaster from './components/TeamMaster';

const SidebarLink = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      {isActive && <ChevronRight size={16} className="ml-auto" />}
    </Link>
  );
};

const Layout = ({ children, onLogout }: { children?: React.ReactNode, onLogout: () => void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Rocket className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Tracker GM</h1>
              <span className="text-xs text-gray-500 font-medium">Management Console</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-2">Menu</div>
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/projects" icon={FolderKanban} label="Projects" />
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-6">Master Data</div>
            <SidebarLink to="/customers" icon={Users} label="Customers" />
            <SidebarLink to="/team" icon={Briefcase} label="Team Master" />
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-6">Actions</div>
            <SidebarLink to="/projects/new" icon={PlusCircle} label="New Project" />
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                  GM
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">General Manager</p>
                  <p className="text-xs text-gray-500 truncate">Logged In</p>
                </div>
              </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium"
            >
                <LogOut size={16} /> Sign Out
            </button>
          </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-900">Tracker GM</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const ProtectedApp = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const sess = await StorageService.auth.getSession();
            setSession(sess);
            setLoading(false);
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        await StorageService.auth.signOut();
        setSession(null);
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
    }

    if (!session) {
        return <Login onLogin={async () => setSession(await StorageService.auth.getSession())} />;
    }

    return (
        <Layout onLogout={handleLogout}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/new" element={<ProjectForm />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/edit" element={<ProjectForm />} />
                <Route path="/customers" element={<CustomerMaster />} />
                <Route path="/team" element={<TeamMaster />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
};

const App = () => {
  return (
    <Router>
        <ProtectedApp />
    </Router>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Project, ProjectStatus } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Briefcase, Activity, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const COLORS = {
  [ProjectStatus.PLANNING]: '#94A3B8', // Gray
  [ProjectStatus.ON_PROGRESS]: '#1E88E5', // Blue
  [ProjectStatus.DONE]: '#43A047', // Green
  [ProjectStatus.HOLD]: '#EF4444', // Red
};

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await StorageService.fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const totalValue = projects.reduce((sum, p) => sum + p.value, 0);
  const totalProjects = projects.length;
  
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const customerCounts = projects.reduce((acc, p) => {
    acc[p.customerName] = (acc[p.customerName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(customerCounts)
    .map(name => ({ name, count: customerCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleGenerateAnalysis = async () => {
    setIsLoadingAi(true);
    const analysis = await GeminiService.getPortfolioAnalysis(projects);
    setAiAnalysis(analysis);
    setIsLoadingAi(false);
  };

  if (isLoadingData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Overview of your project portfolio.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleGenerateAnalysis}
                disabled={isLoadingAi || projects.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
            >
                <Sparkles size={18} />
                {isLoadingAi ? 'Analyzing...' : 'AI Portfolio Insight'}
            </button>
             <Link to="/projects/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <ArrowRight size={18} />
                New Project
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-primary">
              <Briefcase size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1 truncate" title={formatCurrency(totalValue)}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(totalValue)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-accent">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active (On Progress)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {statusCounts[ProjectStatus.ON_PROGRESS] || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full text-orange-500">
              <Activity size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Gemini Executive Summary</h3>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                {aiAnalysis}
            </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Status Distribution</h3>
          {projects.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as ProjectStatus] || '#ccc'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center flex-wrap gap-4 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name as ProjectStatus] || '#ccc' }} />
                    <span className="text-sm text-gray-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Customers by Project Count</h3>
          {barData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#1E88E5" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>
      
       {/* Recent Activity / Alert Placeholder */}
       {(statusCounts[ProjectStatus.HOLD] || 0) > 0 && (
         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-red-700">Attention Needed</h4>
              <p className="text-sm text-red-600">You have {statusCounts[ProjectStatus.HOLD]} projects currently On Hold. Review them in the Project List.</p>
            </div>
            <Link to="/projects" className="ml-auto text-sm font-semibold text-red-700 hover:text-red-800 underline">View</Link>
         </div>
       )}
    </div>
  );
};

export default Dashboard;
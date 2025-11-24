

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { StorageService } from '../services/storageService';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpRight, Plus, AlertCircle, CheckCircle, Clock, PauseCircle, Loader2, Tag } from 'lucide-react';

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const styles = {
    [ProjectStatus.PLANNING]: 'bg-gray-100 text-gray-700 border-gray-200',
    [ProjectStatus.ON_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
    [ProjectStatus.DONE]: 'bg-green-50 text-green-700 border-green-200',
    [ProjectStatus.HOLD]: 'bg-red-50 text-red-700 border-red-200'
  };

  const icons = {
    [ProjectStatus.PLANNING]: <Clock size={14} />,
    [ProjectStatus.ON_PROGRESS]: <ArrowUpRight size={14} />,
    [ProjectStatus.DONE]: <CheckCircle size={14} />,
    [ProjectStatus.HOLD]: <PauseCircle size={14} />
  };

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'value'>('date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await StorageService.fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error loading projects", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filteredProjects = projects
    .filter(p => filterStatus === 'ALL' || p.status === filterStatus)
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value;
      // Default to date (newest first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-500">Manage and track all ongoing work.</p>
        </div>
        <Link to="/projects/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Add Project
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search projects or customers..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select 
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Newest First</option>
              <option value="value">Highest Value</option>
            </select>
        </div>
      </div>

      {/* Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Project Name</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Value</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{project.customerName}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                         <Tag size={12} /> {project.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-right font-mono">
                      {formatCurrency(project.value)}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link 
                        to={`/projects/${project.id}`}
                        className="text-primary hover:text-primary-dark font-medium text-sm"
                       >
                         Details
                       </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="text-gray-300" size={32} />
                        <p>No projects found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;

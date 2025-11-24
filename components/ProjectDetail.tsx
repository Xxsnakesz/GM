

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project, ProjectStatus } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { MapPin, Calendar, DollarSign, ArrowLeft, Edit, Trash2, Sparkles, Mail, User, Loader2, Tag } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [aiReport, setAiReport] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
        if (id) {
            try {
                const projects = await StorageService.fetchProjects();
                const found = projects.find(p => p.id === id);
                if (found) setProject(found);
            } catch (error) {
                console.error("Error fetching project", error);
            } finally {
                setLoadingProject(false);
            }
        }
    };
    fetchProject();
  }, [id]);

  if (loadingProject) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!project) return <div className="text-center py-10">Project not found</div>;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await StorageService.deleteProject(project.id);
      navigate('/projects');
    }
  };

  const handleAiReport = async () => {
    setLoadingAi(true);
    const report = await GeminiService.getProjectReport(project);
    setAiReport(report);
    setLoadingAi(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/projects')} className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm font-medium">
        <ArrowLeft size={16} /> Back to List
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${project.status === ProjectStatus.ON_PROGRESS ? 'bg-blue-100 text-blue-700' : 
                      project.status === ProjectStatus.DONE ? 'bg-green-100 text-green-700' :
                      project.status === ProjectStatus.HOLD ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                `}>
                    {project.status}
                </span>
                <span className="text-gray-400 text-sm">Last updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-lg text-primary font-medium mt-1">{project.customerName}</p>
          </div>
          
          <div className="flex gap-2">
            <Link 
                to={`/projects/${project.id}/edit`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                title="Edit"
            >
                <Edit size={20} />
            </Link>
             <button 
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                title="Delete"
            >
                <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-b border-gray-100">
             <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <DollarSign size={16} /> Value
                </div>
                <div className="font-bold text-gray-900 text-lg">{formatCurrency(project.value)}</div>
             </div>
             <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar size={16} /> Start Date
                </div>
                <div className="font-semibold text-gray-900">{new Date(project.startDate).toLocaleDateString('id-ID', { dateStyle: 'long'})}</div>
             </div>
             <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Tag size={16} /> Type
                </div>
                <div className="font-semibold text-gray-900">{project.type}</div>
             </div>
             <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <MapPin size={16} /> Location
                </div>
                <div className="font-semibold text-gray-900">{project.location || '-'}</div>
             </div>
        </div>

        <div className="mt-6 space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {project.description || "No description provided."}
                </p>
            </div>
             <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Internal Notes</h3>
                <p className="text-gray-700 italic leading-relaxed border-l-4 border-yellow-400 pl-4 py-1">
                    {project.notes || "No additional notes."}
                </p>
            </div>
        </div>
      </div>

      {/* Team & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} /> Project Team
             </h3>
             {project.team && project.team.length > 0 ? (
                 <ul className="space-y-3">
                    {project.team.map((member, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                            <span className="font-medium text-gray-800">{member.name}</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{member.role}</span>
                        </li>
                    ))}
                 </ul>
             ) : (
                <p className="text-sm text-gray-500">No team members assigned.</p>
             )}
             <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400">Edit project to assign team</p>
             </div>
        </div>

        {/* AI Assistant */}
        <div className="md:col-span-2 bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-500" />
                    AI Assistant
                 </h3>
                 <button 
                    onClick={handleAiReport}
                    disabled={loadingAi}
                    className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-50"
                 >
                    {loadingAi ? 'Generating...' : 'Draft Status Email'}
                 </button>
             </div>
             
             {aiReport ? (
                 <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 mb-2 text-indigo-800 text-sm font-semibold">
                        <Mail size={16} /> Generated Draft
                    </div>
                    <textarea 
                        className="w-full text-sm text-gray-600 bg-transparent border-none focus:ring-0 resize-y min-h-[150px]"
                        value={aiReport}
                        readOnly
                    />
                     <p className="text-xs text-indigo-400 mt-2 text-right">Generated by Gemini 2.5 Flash</p>
                 </div>
             ) : (
                 <div className="text-center py-8 text-indigo-300">
                    <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click the button to generate a status report draft based on current project data.</p>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Project, ProjectStatus, ProjectType, Customer, Employee, TeamMember } from '../types';
import { StorageService } from '../services/storageService';
import { Save, X, Loader2, Plus, Trash2 } from 'lucide-react';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    customerId: '',
    customerName: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    status: ProjectStatus.PLANNING,
    value: 0,
    type: ProjectType.TURNKEY,
    description: '',
    notes: '',
    team: []
  });

  // State for adding a new team member
  const [selectedEmpId, setSelectedEmpId] = useState('');

  useEffect(() => {
    const initData = async () => {
        setIsLoading(true);
        try {
            const [loadedCustomers, loadedEmployees] = await Promise.all([
                StorageService.fetchCustomers(),
                StorageService.fetchEmployees()
            ]);
            setCustomers(loadedCustomers);
            setEmployees(loadedEmployees);

            if (isEdit && id) {
                const projects = await StorageService.fetchProjects();
                const project = projects.find(p => p.id === id);
                if (project) {
                    setFormData(project);
                } else {
                    navigate('/projects');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    initData();
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));

    if (name === 'customerId') {
        const customer = customers.find(c => c.id === value);
        if (customer) {
            setFormData(prev => ({ ...prev, customerName: customer.name }));
        }
    }
  };

  const handleAddTeamMember = () => {
      if (!selectedEmpId) return;
      const emp = employees.find(e => e.id === selectedEmpId);
      if (emp) {
          const newMember: TeamMember = {
              role: emp.role,
              name: emp.name,
              employeeId: emp.id
          };
          // Avoid duplicates
          if (!formData.team?.some(m => m.employeeId === emp.id)) {
              setFormData(prev => ({
                  ...prev,
                  team: [...(prev.team || []), newMember]
              }));
          }
      }
      setSelectedEmpId('');
  };

  const removeTeamMember = (index: number) => {
      setFormData(prev => {
          const newTeam = [...(prev.team || [])];
          newTeam.splice(index, 1);
          return { ...prev, team: newTeam };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.customerId) return;
    
    setIsSaving(true);
    try {
        const projectToSave: Project = {
            ...formData as Project,
            id: isEdit ? id! : undefined!,
            updatedAt: new Date().toISOString()
        };

        await StorageService.saveProject(projectToSave);
        navigate('/projects');
    } catch (error) {
        console.error("Error saving project", error);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Project' : 'New Project'}</h2>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="e.g., ERP Migration Phase 1"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                    name="customerId"
                    required
                    value={formData.customerId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                    {Object.values(ProjectStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value (IDR)</label>
                <input
                    type="number"
                    name="value"
                    min="0"
                    value={formData.value}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                    {Object.values(ProjectType).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="City or Site Name"
                />
            </div>
        </div>

        {/* Team Section */}
        <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Project Team</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex gap-2 mb-4">
                     <select
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        value={selectedEmpId}
                        onChange={(e) => setSelectedEmpId(e.target.value)}
                    >
                        <option value="">Select Staff...</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                        ))}
                    </select>
                    <button 
                        type="button"
                        onClick={handleAddTeamMember}
                        disabled={!selectedEmpId}
                        className="bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-lg text-gray-600 disabled:opacity-50"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2">
                    {formData.team && formData.team.length > 0 ? (
                        formData.team.map((member, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 shadow-sm">
                                <div>
                                    <span className="font-medium text-gray-800 text-sm">{member.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({member.role})</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeTeamMember(index)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-2">No team members assigned.</p>
                    )}
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Brief scope of work..."
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
            <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Important updates, risks, or next steps..."
            />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                disabled={isSaving}
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Project'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;

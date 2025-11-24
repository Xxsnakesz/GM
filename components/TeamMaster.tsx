
import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { StorageService } from '../services/storageService';
import { Plus, Trash2, User, Mail, Phone, Loader2, Briefcase } from 'lucide-react';

const TeamMaster = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({ status: 'Active', role: 'Engineer' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
        const data = await StorageService.fetchEmployees();
        setEmployees(data);
    } catch (e) {
        console.error("Failed to load team", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will not remove them from historical project records.")) {
      await StorageService.deleteEmployee(id);
      fetchEmployees();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSaving(true);
    try {
        const newEmp: Employee = {
            id: formData.id || undefined!, 
            name: formData.name!,
            role: formData.role || 'Engineer',
            email: formData.email || '',
            phone: formData.phone || '',
            status: formData.status || 'Active'
        };

        await StorageService.saveEmployee(newEmp);
        setShowModal(false);
        setFormData({ status: 'Active', role: 'Engineer' });
        fetchEmployees();
    } catch (e) {
        console.error("Failed to save employee", e);
    } finally {
        setIsSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
      switch(role) {
          case 'PM': return 'bg-purple-100 text-purple-700';
          case 'Sales': return 'bg-blue-100 text-blue-700';
          case 'Presales': return 'bg-indigo-100 text-indigo-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  if (isLoading && employees.length === 0) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Master</h2>
          <p className="text-gray-500">Manage internal staff assignments.</p>
        </div>
        <button 
            onClick={() => { setFormData({ status: 'Active', role: 'Engineer' }); setShowModal(true); }}
            className="bg-accent hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getRoleColor(emp.role)}`}>
                    {emp.role}
                </span>
                <button 
                    onClick={() => handleDelete(emp.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{emp.name}</h3>
            
            <div className="space-y-2 mt-4 text-sm text-gray-600">
                 <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{emp.email || '-'}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{emp.phone || '-'}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <button 
                    onClick={() => { setFormData(emp); setShowModal(true); }}
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                    Edit Details
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Member' : 'Add Team Member'}</h3>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select 
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as any})}
                            >
                                <option value="PM">Project Manager</option>
                                <option value="Sales">Sales</option>
                                <option value="Presales">Presales</option>
                                <option value="Engineer">Engineer</option>
                            </select>
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.email || ''}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.phone || ''}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex justify-center items-center gap-2"
                        >
                            {isSaving && <Loader2 className="animate-spin" size={16} />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default TeamMaster;

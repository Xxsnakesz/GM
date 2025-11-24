import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { StorageService } from '../services/storageService';
import { Plus, Trash2, MapPin, User, Phone, Loader2 } from 'lucide-react';

const CustomerMaster = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
        const data = await StorageService.fetchCustomers();
        setCustomers(data);
    } catch (e) {
        console.error("Failed to load customers", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will not remove associated projects.")) {
      await StorageService.deleteCustomer(id);
      fetchCustomers();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSaving(true);
    try {
        const newCustomer: Customer = {
            id: formData.id || undefined!, // Let DB generate ID if new
            name: formData.name!,
            address: formData.address || '',
            contactPerson: formData.contactPerson || '',
            phone: formData.phone || '',
            email: formData.email || ''
        };

        await StorageService.saveCustomer(newCustomer);
        setShowModal(false);
        setFormData({});
        fetchCustomers();
    } catch (e) {
        console.error("Failed to save customer", e);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading && customers.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Customer Master</h2>
          <p className="text-gray-500">Manage client database for projects.</p>
        </div>
        <button 
            onClick={() => { setFormData({}); setShowModal(true); }}
            className="bg-accent hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow">
            <button 
                onClick={() => handleDelete(customer.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h3>
            <div className="space-y-2 mt-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{customer.address || 'No address'}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span>{customer.contactPerson || 'No contact person'}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <span>{customer.phone || 'No phone'}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <button 
                    onClick={() => { setFormData(customer); setShowModal(true); }}
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                    Edit Details
                </button>
            </div>
          </div>
        ))}
        {customers.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                No customers found. Add one to get started.
            </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Customer' : 'Add New Customer'}</h3>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.address || ''}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            value={formData.contactPerson || ''}
                            onChange={e => setFormData({...formData, contactPerson: e.target.value})}
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

export default CustomerMaster;
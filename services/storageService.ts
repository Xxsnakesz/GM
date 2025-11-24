
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Customer, Employee, ProjectStatus, ProjectType } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'pt_gm_projects',
  CUSTOMERS: 'pt_gm_customers',
  EMPLOYEES: 'pt_gm_employees',
  SESSION: 'pt_gm_session'
};

// --- Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl!, supabaseKey!);
}

// --- Helper Functions for Data Mapping ---

// Map DB snake_case to App camelCase
const mapProjectFromDb = (dbProject: any): Project => ({
  id: dbProject.id,
  name: dbProject.name,
  customerId: dbProject.customer_id,
  customerName: dbProject.customer_name,
  location: dbProject.location,
  startDate: dbProject.start_date,
  endDate: dbProject.end_date,
  status: dbProject.status as ProjectStatus,
  value: Number(dbProject.value),
  type: dbProject.type as ProjectType,
  description: dbProject.description,
  notes: dbProject.notes,
  team: dbProject.team || [],
  updatedAt: dbProject.updated_at
});

// Map App camelCase to DB snake_case
const mapProjectToDb = (project: Partial<Project>): any => {
  const { id, name, customerId, customerName, location, startDate, endDate, status, value, type, description, notes, team, updatedAt } = project;
  return {
    ...(id && { id }), // Only include ID if it exists (for updates)
    name,
    customer_id: customerId,
    customer_name: customerName,
    location,
    start_date: startDate,
    end_date: endDate,
    status,
    value,
    type,
    description,
    notes,
    team,
    updated_at: updatedAt || new Date().toISOString()
  };
};

const mapCustomerFromDb = (dbCustomer: any): Customer => ({
  id: dbCustomer.id,
  name: dbCustomer.name,
  address: dbCustomer.address,
  contactPerson: dbCustomer.contact_person,
  phone: dbCustomer.phone,
  email: dbCustomer.email
});

const mapCustomerToDb = (customer: Customer): any => ({
  ...(customer.id && { id: customer.id }),
  name: customer.name,
  address: customer.address,
  contact_person: customer.contactPerson,
  phone: customer.phone,
  email: customer.email
});

const mapEmployeeFromDb = (dbEmp: any): Employee => ({
  id: dbEmp.id,
  name: dbEmp.name,
  role: dbEmp.role,
  email: dbEmp.email,
  phone: dbEmp.phone,
  status: dbEmp.status
});

const mapEmployeeToDb = (emp: Employee): any => ({
  ...(emp.id && { id: emp.id }),
  name: emp.name,
  role: emp.role,
  email: emp.email,
  phone: emp.phone,
  status: emp.status
});

// --- Local Storage Mock for Fallback ---
const seedData = () => {
  if (isSupabaseConfigured) return; // Don't seed local storage if using Supabase

  const existingProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (!existingProjects) {
    const customers: Customer[] = [
      { id: 'c1', name: 'Acme Corp', address: '123 Tech Blvd', contactPerson: 'John Doe' },
      { id: 'c2', name: 'Global Industries', address: '456 Biz Way', contactPerson: 'Jane Smith' },
    ];
    
    const employees: Employee[] = [
      { id: 'e1', name: 'Alice PM', role: 'PM', status: 'Active' },
      { id: 'e2', name: 'Bob Sales', role: 'Sales', status: 'Active' },
      { id: 'e3', name: 'Charlie Tech', role: 'Engineer', status: 'Active' },
    ];

    const projects: Project[] = [
      {
        id: 'p1',
        name: 'ERP Migration 2024',
        customerId: 'c1',
        customerName: 'Acme Corp',
        location: 'Jakarta',
        startDate: '2024-01-15',
        status: ProjectStatus.ON_PROGRESS,
        value: 150000000,
        type: ProjectType.SOFTWARE,
        description: 'Migrating legacy ERP to Cloud.',
        notes: 'Waiting for final data validation from client side.',
        team: [{ role: 'PM', name: 'Alice PM', employeeId: 'e1' }, { role: 'Engineer', name: 'Charlie Tech', employeeId: 'e3' }],
        updatedAt: new Date().toISOString()
      }
    ];

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }
};

seedData();

// --- Service Implementation ---

export const StorageService = {
  // LOGGING HELPER
  logActivity: async (action: string, details?: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
            await supabase.from('activity_logs').insert({
                user_email: user.email,
                action: action,
                details: details || ''
            });
        }
    } catch (e) {
        console.warn("Failed to log activity", e);
    }
  },

  // AUTHENTICATION
  auth: {
    signIn: async (email: string, password: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Log Login
        await StorageService.logActivity('LOGIN', 'User signed in successfully');
        return data.session;
      } else {
        // Mock Login
        if (email === 'admin@company.com' && password === 'admin') {
          const mockSession = { user: { email, id: 'mock-id' }, access_token: 'mock-token' };
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(mockSession));
          return mockSession;
        }
        throw new Error('Invalid credentials (Mock: admin@company.com / admin)');
      }
    },
    signOut: async () => {
      if (isSupabaseConfigured && supabase) {
        // Log Logout before signing out
        await StorageService.logActivity('LOGOUT', 'User signed out');
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    },
    getSession: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        return data.session;
      } else {
        const sess = localStorage.getItem(STORAGE_KEYS.SESSION);
        return sess ? JSON.parse(sess) : null;
      }
    }
  },

  // PROJECTS
  fetchProjects: async (): Promise<Project[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
      if (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
      return data.map(mapProjectFromDb);
    } else {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    }
  },

  saveProject: async (project: Project): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapProjectToDb(project);
      if (project.id && !project.id.includes('-')) delete dbPayload.id;
      
      const isNew = !project.id || project.id.includes('-');
      const { error } = await supabase.from('projects').upsert(dbPayload);
      
      if (!error) {
          await StorageService.logActivity(isNew ? 'CREATE_PROJECT' : 'UPDATE_PROJECT', `Project: ${project.name}`);
      } else {
          console.error("Error saving project:", error);
      }
    } else {
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
      const index = projects.findIndex((p: Project) => p.id === project.id);
      if (index >= 0) projects[index] = project;
      else projects.push(project);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
         await StorageService.logActivity('DELETE_PROJECT', `Project ID: ${id}`);
      } else {
         console.error("Error deleting project:", error);
      }
    } else {
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
      const filtered = projects.filter((p: Project) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    }
  },

  // CUSTOMERS
  fetchCustomers: async (): Promise<Customer[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
      return data.map(mapCustomerFromDb);
    } else {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    }
  },

  saveCustomer: async (customer: Customer): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapCustomerToDb(customer);
      if (customer.id && !customer.id.includes('-')) delete dbPayload.id; 
      
      const { error } = await supabase.from('customers').upsert(dbPayload);
      if (error) console.error("Error saving customer:", error);
      else await StorageService.logActivity('UPDATE_CUSTOMER', `Customer: ${customer.name}`);
    } else {
      const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
      const index = customers.findIndex((c: Customer) => c.id === customer.id);
      if (index >= 0) customers[index] = customer;
      else customers.push(customer);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) console.error("Error deleting customer:", error);
    } else {
      const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
      const filtered = customers.filter((c: Customer) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
    }
  },

  // TEAM MEMBERS / EMPLOYEES
  fetchEmployees: async (): Promise<Employee[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('team_members').select('*').order('name');
      if (error) {
        console.error("Error fetching team:", error);
        return [];
      }
      return data.map(mapEmployeeFromDb);
    } else {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : [];
    }
  },

  saveEmployee: async (employee: Employee): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapEmployeeToDb(employee);
      if (employee.id && !employee.id.includes('-')) delete dbPayload.id; 
      const { error } = await supabase.from('team_members').upsert(dbPayload);
      if (error) console.error("Error saving team member:", error);
    } else {
      const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
      const index = employees.findIndex((e: Employee) => e.id === employee.id);
      if (index >= 0) employees[index] = employee;
      else employees.push(employee);
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
  },

  deleteEmployee: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) console.error("Error deleting team member:", error);
    } else {
      const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
      const filtered = employees.filter((e: Employee) => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
    }
  }
};

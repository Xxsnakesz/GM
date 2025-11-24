
export enum ProjectStatus {
  PLANNING = 'Planning',
  ON_PROGRESS = 'On Progress',
  DONE = 'Done',
  HOLD = 'On Hold'
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

// Master data for employees
export interface Employee {
  id: string;
  name: string;
  role: 'PM' | 'Sales' | 'Presales' | 'Engineer';
  email?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
}

// Snapshot of a team member in a project
export interface TeamMember {
  role: 'PM' | 'Sales' | 'Presales' | 'Engineer';
  name: string;
  employeeId?: string; // Optional reference to master ID
}

export interface Project {
  id: string;
  name: string;
  customerId: string;
  customerName: string; // Denormalized for easier display
  location: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  value: number;
  description: string;
  notes: string;
  team: TeamMember[];
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalValue: number;
  statusDistribution: { name: string; value: number; color: string }[];
  topCustomers: { name: string; count: number; value: number }[];
}

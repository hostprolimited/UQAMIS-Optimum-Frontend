import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Edit, X, Trash2, AlertCircle, Phone, MoreHorizontal, Check, ChevronsUpDown, ArrowRightLeft } from 'lucide-react';
import dataJson from '@/constants/data.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getUsers, createUser, deleteUser, updateUser, transferUser } from '../core/_requests';
import { Urls } from '@/constants/urls';
import { getInstitutions } from '@/pages/onboarding/core/_requests';
import { getPermissions } from '../core/_requests';
import { User as UserModel, CreateUserInput } from '../core/_models';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import data from '@/constants/data.json';
import api from '@/utils/api';

// Define types for data.json structures
interface County {
  county_id: string;
  county_name: string;
}

interface Subcounty {
  subcounty_id: string;
  county_id: string;
  constituency_name: string;
}

interface Station {
  station_id: string;
  subcounty_id: string;
  constituency_name: string;
  ward: string;
}

// Extract counties, subcounties, and wards from JSON
const counties = data.find((t) => t.name === 'counties').data;
const subcounties = data.find((t) => t.name === 'subcounties').data;
const wards = data.find((t) => t.name === 'station').data;

// School Admin Users Component
const SchoolAdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', role: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const { currentUser } = useRole();
  const { toast } = useToast();

  const fetchSchoolUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      if (Array.isArray(data)) {
        // Filter users by institution_id
        const schoolUsers = data.filter(user => user.institution_id === currentUser?.institution_id);
        setUsers(schoolUsers);
      } else if (data && typeof data === 'object' && 'users' in data && Array.isArray((data as { users: UserModel[] }).users)) {
        const schoolUsers = (data as { users: UserModel[] }).users.filter(user => user.institution_id === currentUser?.institution_id);
        setUsers(schoolUsers);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      let errorMessage = 'Failed to load users.';
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        errorMessage = 'You do not have permission to view users.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getPermissions();
      setRoles(data.roles?.map(r => ({ ...r, status: r.status || 'Active' })) || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      let errorMessage = 'Failed to load roles.';
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        errorMessage = 'You do not have permission to view roles.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchSchoolUsers();
    fetchRoles();
  }, [currentUser?.institution_id]);

  const handleOpenModal = () => {
    setForm({ name: '', email: '', phone: '', gender: '', role: '', password: '' });
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setForm({ name: '', email: '', phone: '', gender: '', role: '', password: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validation for phone number
    if (form.phone && !/^07\d{8}$/.test(form.phone)) {
      setError('Phone number must be a valid Kenyan number: 10 digits starting with 07');
      setSubmitting(false);
      return;
    }

    try {
      const createData = {
        ...form,
        institution_id: currentUser?.institution_id,
      };
      await createUser(createData);
      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default",
      });
      setShowModal(false);
      fetchSchoolUsers();
    } catch (err: any) {
      const errorResponse = err?.response?.data;
      if (errorResponse?.errors) {
        const validationErrors = Object.entries(errorResponse.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        toast({
          title: "Validation Error",
          description: validationErrors,
          variant: "destructive",
        });
        setError(validationErrors);
      } else {
        const errorMessage = errorResponse?.message || 'Failed to create user';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
      case 'Suspended':
        return <Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">School Staff Management</h1>
            <p className="text-muted-foreground">
              Manage staff members for {currentUser?.institution?.name || 'your school'}
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleOpenModal}>
            <User className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                School staff members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.role === 'teacher').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Teaching staff
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.status === 'Active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active staff
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modal for creating staff */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full p-6 relative" style={{ maxWidth: '500px' }}>
              <button className="absolute top-2 right-2 text-muted-foreground" onClick={handleCloseModal}>
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">Add Staff Member</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
                    <Input name="name" value={form.name} onChange={handleChange} required disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email <span className="text-destructive">*</span></label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} required disabled={submitting} />
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </label>
                    <Input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g., 0712345678" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Role <span className="text-destructive">*</span></label>
                    <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-2 py-1" required disabled={submitting}>
                      <option value="">Select role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {formatRole(role.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password <span className="text-destructive">*</span></label>
                    <Input name="password" type="password" value={form.password} onChange={handleChange} required disabled={submitting} />
                  </div>
                </div>

                {error && <div className="text-destructive text-sm">{error}</div>}
                <div className="flex justify-end">
                  <Button type="button" variant="outline" className="mr-2" onClick={handleCloseModal} disabled={submitting}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
                    {submitting ? 'Creating...' : 'Create Staff Member'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>School Staff</CardTitle>
            <CardDescription>
              View and manage staff members at your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No staff members found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground">
                          {formatRole(user.role || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status || '')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : ''}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  );
};

// Utility functions
function getSubCountiesByCountyId(county_id) {
  return subcounties
    .filter((s): s is { subcounty_id: string; county_id: string; constituency_name: string } => 'county_id' in s && 'constituency_name' in s)
    .filter((s) => s.county_id === county_id);
}
function getWardsBySubCountyId(subCountyId) {
  return wards
    .filter((w): w is { station_id: string; subcounty_id: string; constituency_name: string; ward: string } =>
      typeof w === 'object' && 'subcounty_id' in w && typeof w.subcounty_id === 'string'
    )
    .filter((w) => w.subcounty_id === subCountyId);
}

const Users = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateUserInput & { subcounty_ids?: string[]; ward_ids?: string[] }>({ name: '', email: '', password: '', phone: '', role: '', county_code: '', subcounty_ids: [], ward_ids: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [subcounties, setSubcounties] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    new_county_code: '',
    new_county: '',
    new_subcounty: '',
    new_ward: '',
    new_institution_id: '',
  });
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openInstitution, setOpenInstitution] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [transferInstitutionSearch, setTransferInstitutionSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useRole();
  const { toast } = useToast();


  // If current user is school admin, show school admin interface
  if (currentUser?.role === 'school_admin') {
    return <SchoolAdminUsers />;
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (
        data &&
        typeof data === 'object' &&
        'users' in data &&
        Array.isArray((data as { users: UserModel[] }).users)
      ) {
        setUsers((data as { users: UserModel[] }).users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch institutions for select and listing
  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const data = await getInstitutions();
      setInstitutions(Array.isArray(data.institutions) ? data.institutions : []);
    } catch (e) {
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const data = await getPermissions();
      setRoles(data.roles || []);
    } catch (e) {
      setRoles([]);
    }
  };

  // Fetch subcounties for the agent's county
   const fetchSubcounties = async (countyId: string) => {
     try {
       // Filter subcounties from data.json based on county_id
       const subcountiesData = getSubCountiesByCountyId(countyId).map((subcounty: any) => ({
         id: subcounty.subcounty_id,
         name: subcounty.constituency_name,
         county_id: subcounty.county_id
       }));
       setSubcounties(subcountiesData);
     } catch (e) {
       setSubcounties([]);
     }
   };

  // Fetch wards for the selected subcounty
   const fetchWards = async (subcountyId: string) => {
     try {
       // Filter wards from data.json based on subcounty_id
       const wardsData = getWardsBySubCountyId(subcountyId).map((ward: any) => ({
         id: ward.station_id,
         name: ward.ward,
         subcounty_id: ward.subcounty_id
       }));
       setWards(wardsData);
     } catch (e) {
       setWards([]);
     }
   };

  useEffect(() => {
    fetchUsers();
    fetchInstitutions();
    fetchRoles();
  }, []);

  // Fetch wards when subcounties change
   useEffect(() => {
     if (form.subcounty_ids && form.subcounty_ids.length > 0) {
       // For now, fetch wards for the first selected subcounty
       // In a real implementation, you might want to fetch wards for all selected subcounties
       fetchWards(form.subcounty_ids[0]);
     } else {
       setWards([]);
     }
   }, [form.subcounty_ids]);

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'county_admin':
        return 'bg-warning text-warning-foreground';
      case 'school_admin':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
      case 'Suspended':
        return <Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUsers = React.useMemo(
    () => {
      if (!searchTerm) return users;
      return users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.institution?.name && user.institution.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.county && user.county.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    },
    [users, searchTerm]
  );

  const visibleUsers = React.useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  const handleOpenModal = () => {
    setForm({ name: '', email: '', password: '', phone: '', role: '', county_code: '', subcounty_ids: [], ward_ids: [] });
    setError(null);
    setShowModal(true);

    // If current user is agent, fetch subcounties for their county
    if (currentUser?.role === 'agent' && currentUser?.county_code) {
      fetchSubcounties(currentUser.county_code);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setIsEditing(false);
    setSelectedUser(null);
    setForm({ name: '', email: '', password: '', phone: '', role: '', county_code: '', subcounty_ids: [], ward_ids: [] });
    setSubcounties([]);
    setWards([]);
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setSelectedUser(null);
    setTransferForm({
      new_county_code: '',
      new_county: '',
      new_subcounty: '',
      new_ward: '',
      new_institution_id: '',
    });
    setTransferInstitutionSearch('');
    setSelectedCounty('');
    setSelectedSubcounty('');
  };

  // Helper functions to get data from data.json
  const getCounties = (): County[] => {
    const countiesTable = dataJson.find((table: any) => table.name === 'counties') as { data: County[] } | undefined;
    return countiesTable?.data || [];
  };

  const getSubcounties = (countyId: string): Subcounty[] => {
    const subcountiesTable = dataJson.find((table: any) => table.name === 'subcounties') as { data: Subcounty[] } | undefined;
    return subcountiesTable?.data.filter((subcounty) => subcounty.county_id === countyId) || [];
  };

  const getWards = (subcountyId: string): Station[] => {
    const stationTable = dataJson.find((table: any) => table.name === 'station') as { data: Station[] } | undefined;
    return stationTable?.data.filter((station) => station.subcounty_id === subcountyId) || [];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'subcounty_ids') {
      // Reset wards when subcounties change
      setForm({ ...form, [name]: value ? [value] : [], ward_ids: [] });
    } else if (name === 'role') {
      // Reset institution when role changes to non-school_admin
      if (value !== 'school_admin') {
        setForm({ ...form, [name]: value, institution_id: undefined });
      } else {
        setForm({ ...form, [name]: value });
      }
    } else if (name === 'phone') {
      // Allow only digits for phone number
      const numericValue = value.replace(/\D/g, '');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleEdit = (user: UserModel) => {
    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || '',
      gender: user.gender,
      institution_id: user.institution_id,
      subcounty_ids: (user as any).subcounty_id ? [(user as any).subcounty_id] : [],
      ward_ids: (user as any).ward_id ? [(user as any).ward_id] : [],
      county_code: (user as any).county_code || '',
      password: '' // Password is optional for updates
    });

    // If current user is agent, fetch subcounties and wards for editing any user
    if (currentUser?.role === 'agent' && currentUser?.county_code) {
      fetchSubcounties(currentUser.county_code);
      if ((user as any).subcounty_id) {
        fetchWards((user as any).subcounty_id);
      }
    }

    setIsEditing(true);
    setShowModal(true);
  };

  const handleToggleStatus = async (user: UserModel) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(Urls.CHANGE_USER_STATUS(user.id));
      toast({
        title: "Success",
        description: `User ${newStatus.toLowerCase()}d successfully`,
        variant: "default",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleTransfer = (user: UserModel) => {
    setSelectedUser(user);
    setTransferForm({
      new_county_code: '',
      new_county: '',
      new_subcounty: '',
      new_ward: '',
      new_institution_id: '',
    });
    setShowTransferModal(true);
  };

  const handleDelete = (user: UserModel) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const transferData: any = {};

      if (selectedUser.role === 'agent') {
        // For agents, collect county information (county is required, subcounty and ward are optional)
        if (transferForm.new_county_code) transferData.new_county_code = transferForm.new_county_code;
        if (transferForm.new_county) transferData.new_county = transferForm.new_county;
        if (transferForm.new_subcounty) transferData.new_subcounty = transferForm.new_subcounty;
        if (transferForm.new_ward) transferData.new_ward = transferForm.new_ward;
      } else if (selectedUser.role === 'school_admin') {
        // For school admins, collect institution information
        if (transferForm.new_institution_id) transferData.new_institution_id = parseInt(transferForm.new_institution_id);
      }

      await transferUser(selectedUser.id, transferData);
      toast({
        title: "Success",
        description: "User transferred successfully",
        variant: "default",
      });
      setShowTransferModal(false);
      fetchUsers(); // Refresh the users list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to transfer user",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });
      fetchUsers(); // Refresh the users list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validation for subcounty and ward when current user is agent (now optional)
    // No validation needed as they are optional

    // Validation for county_code when current user is ministry_admin
    if (currentUser?.role === 'ministry_admin') {
      if (!form.county_code) {
        setError('County Code is required');
        setSubmitting(false);
        return;
      }
    }

    // Validation for institution when role is school_admin
    if (form.role === 'school_admin' && !form.institution_id) {
      setError('Institution is required when role is School Admin');
      setSubmitting(false);
      return;
    }

    // Validation for phone number
    if (form.phone && !/^07\d{8}$/.test(form.phone)) {
      setError('Phone number must be a valid 10 digits ');
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && selectedUser) {
        // Handle update
        const updateData = { ...form };
        if (!updateData.password) {
          delete updateData.password;
        }
        // Map subcounty_ids to subcounty name and ward_ids to ward name (take first if multiple)
        if (updateData.subcounty_ids && updateData.subcounty_ids.length > 0) {
          const selectedSubcounty = subcounties.find(s => s.id === updateData.subcounty_ids[0]);
          updateData.subcounty = selectedSubcounty ? selectedSubcounty.name : '';
          delete (updateData as any).subcounty_ids;
        }
        if (updateData.ward_ids && updateData.ward_ids.length > 0) {
          const selectedWard = wards.find(w => w.id === updateData.ward_ids[0]);
          updateData.ward = selectedWard ? selectedWard.name : '';
          delete (updateData as any).ward_ids;
        }
        await updateUser(selectedUser.id, updateData);
        toast({
          title: "Success",
          description: "User updated successfully",
          variant: "default",
        });
      } else {
        // Handle create
        const createData = { ...form };
        // Map subcounty_ids to subcounty name and ward_ids to ward name (take first if multiple)
        if (createData.subcounty_ids && createData.subcounty_ids.length > 0) {
          const selectedSubcounty = subcounties.find(s => s.id === createData.subcounty_ids[0]);
          createData.subcounty = selectedSubcounty ? selectedSubcounty.name : '';
          delete (createData as any).subcounty_ids;
        }
        if (createData.ward_ids && createData.ward_ids.length > 0) {
          const selectedWard = wards.find(w => w.id === createData.ward_ids[0]);
          createData.ward = selectedWard ? selectedWard.name : '';
          delete (createData as any).ward_ids;
        }
        await createUser(createData);
        toast({
          title: "Success",
          description: "User created successfully",
          variant: "default",
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      const errorResponse = err?.response?.data;
      if (errorResponse?.errors) {
        // Handle validation errors
        const validationErrors = Object.entries(errorResponse.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        
        toast({
          title: "Validation Error",
          description: validationErrors,
          variant: "destructive",
        });
        setError(validationErrors);
      } else {
        const errorMessage = errorResponse?.message || `Failed to ${isEditing ? 'update' : 'create'} user`;
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their access permissions
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={handleOpenModal}>
          <User className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchTerm ? filteredUsers.length : users.length}</div>
            <p className="text-xs text-muted-foreground">
              {searchTerm ? `Filtered from ${users.length} total` : 'Active system users'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(searchTerm ? filteredUsers : users).filter(user => user.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrators
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(searchTerm ? filteredUsers : users).filter(user => user.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal for creating user */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full p-6 relative" style={{ maxWidth: '650px' }}>
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={handleCloseModal}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
                  <Input name="name" value={form.name} onChange={handleChange} required disabled={submitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email <span className="text-destructive">*</span></label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} required disabled={submitting} />
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
              <div>
              <label className="block text-sm font-medium mb-1 flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g., 0712345678" disabled={submitting} />
              </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password <span className="text-destructive">*</span></label>
                  <Input name="password" type="password" value={form.password} onChange={handleChange} required disabled={submitting} />
                </div>
                {form.role === 'school_admin' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Institution (School) <span className="text-destructive">*</span></label>
                    <Popover open={openInstitution} onOpenChange={setOpenInstitution}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openInstitution}
                          className="w-full justify-between"
                          disabled={submitting}
                        >
                          {form.institution_id
                            ? institutions.find((inst) => inst.id === form.institution_id)?.name
                            : "Select institution..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search institutions..."
                            value={transferInstitutionSearch}
                            onValueChange={setTransferInstitutionSearch}
                          />
                          <CommandEmpty>No institution found.</CommandEmpty>
                          <CommandGroup>
                            {institutions
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .filter((inst) =>
                                transferInstitutionSearch === '' ||
                                inst.name.toLowerCase().includes(transferInstitutionSearch.toLowerCase())
                              )
                              .slice(0, 10)
                              .map((inst) => (
                                <CommandItem
                                  key={inst.id}
                                  value={inst.name}
                                  onSelect={() => {
                                    setForm({ ...form, institution_id: inst.id });
                                    setOpenInstitution(false);
                                    setInstitutionSearch('');
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.institution_id === inst.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {inst.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          {institutions.length > 10 && (
                            <div className="p-2 text-xs text-muted-foreground border-t">
                              {institutionSearch === ''
                                // ? "Showing first 10 institutions. Type to search more."
                                // : `Showing first 10 matches for "${institutionSearch}". Refine search for better results.`
                              }
                            </div>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Fourth Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                    <option value="">Select role</option>
                    {roles
                      .filter(role =>
                        // Agents cannot assign 'agent' or 'ministry_admin' roles
                        !(currentUser?.role === 'agent' && (role.name === 'agent' || role.name === 'ministry_admin'))
                      )
                      .map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Subcounty field for agents */}
                {currentUser?.role === 'agent' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Subcounty (Optional)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={submitting}
                        >
                          {form.subcounty_ids && form.subcounty_ids.length > 0
                            ? (() => {
                                const selectedNames = form.subcounty_ids.map(id => subcounties.find(s => s.id === id)?.name).filter(Boolean);
                                if (selectedNames.length <= 2) {
                                  return selectedNames.join(', ');
                                } else {
                                  return `${selectedNames.slice(0, 2).join(', ')} and ${selectedNames.length - 2} more`;
                                }
                              })()
                            : "Select subcounties..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search subcounties..." />
                          <CommandEmpty>No subcounty found.</CommandEmpty>
                          <CommandGroup>
                            {subcounties.map((subcounty) => {
                              const isSelected = form.subcounty_ids?.includes(subcounty.id) || false;
                              return (
                                <CommandItem
                                  key={subcounty.id}
                                  value={subcounty.name}
                                  onSelect={() => {
                                    const newValues = isSelected
                                      ? (form.subcounty_ids?.filter(id => id !== subcounty.id) || [])
                                      : [...(form.subcounty_ids || []), subcounty.id];
                                    setForm(prev => ({ ...prev, subcounty_ids: newValues, ward_ids: [] }));
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {subcounty.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* County Code field for ministry */}
                {currentUser?.role === 'ministry_admin' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">County Code <span className="text-destructive">*</span></label>
                    <Input
                      name="county_code"
                      type="number"
                      value={form.county_code}
                      onChange={handleChange}
                      placeholder="e.g., 23"
                      disabled={submitting}
                      required
                      className="w-72"
                    />
                  </div>
                )}
              </div>

              {/* Fifth Row - Ward field for agents (only show if subcounty is selected) */}
              {currentUser?.role === 'agent' && form.subcounty_ids && form.subcounty_ids.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ward (Optional)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={submitting}
                        >
                          {form.ward_ids && form.ward_ids.length > 0
                            ? (() => {
                                const selectedNames = form.ward_ids.map(id => wards.find(w => w.id === id)?.name).filter(Boolean);
                                if (selectedNames.length <= 2) {
                                  return selectedNames.join(', ');
                                } else {
                                  return `${selectedNames.slice(0, 2).join(', ')} and ${selectedNames.length - 2} more`;
                                }
                              })()
                            : "Select wards..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search wards..." />
                          <CommandEmpty>No ward found.</CommandEmpty>
                          <CommandGroup>
                            {wards.map((ward) => {
                              const isSelected = form.ward_ids?.includes(ward.id) || false;
                              return (
                                <CommandItem
                                  key={ward.id}
                                  value={ward.name}
                                  onSelect={() => {
                                    const newValues = isSelected
                                      ? (form.ward_ids?.filter(id => id !== ward.id) || [])
                                      : [...(form.ward_ids || []), ward.id];
                                    setForm(prev => ({ ...prev, ward_ids: newValues }));
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {ward.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* Empty div to maintain grid layout */}
                  <div></div>
                </div>
              )}

              {error && <div className="text-destructive text-sm">{error}</div>}
              <div className="flex justify-end">
                <Button type="button" variant="outline" className="mr-2" onClick={handleCloseModal} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
                  {submitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List institutions for this agent/county */}
      {/* <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Institutions Onboarded {currentUser?.role === 'agent' ? 'by You' : 'in Your County'}</h2>
        <ul className="list-disc pl-6">
          {institutions.length === 0 ? (
            <li className="text-muted-foreground">No institutions found.</li>
          ) : (
            institutions
              .filter(inst => {
                if (currentUser?.role === 'agent') {
                  return inst.created_by === currentUser.id;
                } else if (currentUser?.county_id) {
                  return inst.county === currentUser.county_id;
                }
                return true;
              })
              .map(inst => (
                <li key={inst.id}>{inst.name} <span className="text-xs text-muted-foreground">({inst.county})</span></li>
              ))
          )}
        </ul>
      </div> */}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            View and manage all users in the quality assurance system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search users by name, email, role, institution, or county..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0); // Reset to first page when searching
              }}
              className="max-w-sm"
            />
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setPage(0);
                }}
              >
                Clear
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No users found.</TableCell>
                </TableRow>
              ) : (
                visibleUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeVariant(user.role || '')}>
                        {formatRole(user.role || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.institution?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.county || '-'}</div>
                        {user.school && (
                          <div className="text-sm text-muted-foreground">{user.school}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status || '')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleEdit(user)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {(user.role === 'agent' || user.role === 'school_admin') && (
                            <DropdownMenuItem
                              onClick={() => handleTransfer(user)}
                              className="cursor-pointer"
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transfer User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                            className="cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredUsers.length)} of {filteredUsers.length}
                  {searchTerm && ` (filtered from ${users.length} total)`}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(page + 1)}
                    disabled={(page + 1) * rowsPerPage >= filteredUsers.length}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Transfer User Modal */}
      {showTransferModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full p-6 relative" style={{ maxWidth: '500px' }}>
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={handleCloseTransferModal}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Transfer User</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Transfer {selectedUser.name} to a new location
            </p>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {selectedUser.role === 'agent' ? (
                // Agent transfer form
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">New County</label>
                    <Select
                      value={selectedCounty}
                      onValueChange={(value) => {
                        setSelectedCounty(value);
                        setSelectedSubcounty('');
                        const county = getCounties().find((c: any) => c.county_id === value);
                        setTransferForm({
                          ...transferForm,
                          new_county_code: value,
                          new_county: county?.county_name || '',
                          new_subcounty: '',
                          new_ward: ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCounties().map((county: any) => (
                          <SelectItem key={county.county_id} value={county.county_id}>
                            {county.county_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">New Subcounty</label>
                      <Select
                        value={selectedSubcounty}
                        onValueChange={(value) => {
                          setSelectedSubcounty(value);
                          const subcounty = getSubcounties(selectedCounty).find(s => s.subcounty_id === value);
                          setTransferForm({ ...transferForm, new_subcounty: subcounty?.constituency_name || '', new_ward: '' });
                        }}
                        disabled={!selectedCounty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcounty" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCounty && getSubcounties(selectedCounty).map((subcounty: Subcounty) => (
                            <SelectItem key={subcounty.subcounty_id} value={subcounty.subcounty_id}>
                              {subcounty.constituency_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">New Ward</label>
                      <Select
                        value={transferForm.new_ward}
                        onValueChange={(value) => setTransferForm({ ...transferForm, new_ward: value })}
                        disabled={!selectedSubcounty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedSubcounty && getWards(selectedSubcounty).map((ward: any) => (
                            <SelectItem key={ward.station_id} value={ward.ward}>
                              {ward.ward}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : selectedUser.role === 'school_admin' ? (
                // School Admin transfer form
                <div>
                  <label className="block text-sm font-medium mb-1">New Institution <span className="text-destructive">*</span></label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {transferForm.new_institution_id
                          ? institutions.find((inst) => inst.id === parseInt(transferForm.new_institution_id))?.name
                          : "Select institution..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search institutions..."
                          value={institutionSearch}
                          onValueChange={setInstitutionSearch}
                        />
                        <CommandEmpty>No institution found.</CommandEmpty>
                        <CommandGroup>
                          {institutions
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .filter((inst) =>
                              institutionSearch === '' ||
                              inst.name.toLowerCase().includes(institutionSearch.toLowerCase())
                            )
                            .slice(0, 10)
                            .map((inst) => (
                              <CommandItem
                                key={inst.id}
                                value={inst.name}
                                onSelect={() => {
                                  setTransferForm({ ...transferForm, new_institution_id: inst.id.toString() });
                                  setTransferInstitutionSearch('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    transferForm.new_institution_id === inst.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {inst.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseTransferModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Transfer User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {selectedUser ? ` "${selectedUser.name}"` : ''} and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  );
};export default Users;

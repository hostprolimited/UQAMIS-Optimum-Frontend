import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Edit, X, Trash2, AlertCircle, Phone, MoreHorizontal } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUsers, createUser, deleteUser, updateUser } from '../core/_requests';
import { getInstitutions } from '@/pages/onboarding/core/_requests';
import { getPermissions } from '../core/_requests';
import { User as UserModel, CreateUserInput } from '../core/_models';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import data from '@/constants/data.json';

// Extract counties, subcounties, and wards from JSON
const counties = data.find((t) => t.name === 'counties').data;
const subcounties = data.find((t) => t.name === 'subcounties').data;
const wards = data.find((t) => t.name === 'station').data;

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
  const [form, setForm] = useState<CreateUserInput & { subcounty_id?: string; ward_id?: string }>({ name: '', email: '', password: '', phone: '', role: '', county_code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [subcounties, setSubcounties] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { currentUser } = useRole();
  const { toast } = useToast();

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

  // Fetch wards when subcounty changes
  useEffect(() => {
    if (form.subcounty_id) {
      fetchWards(form.subcounty_id);
    } else {
      setWards([]);
    }
  }, [form.subcounty_id]);

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

  const visibleUsers = React.useMemo(
    () => users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [users, page, rowsPerPage]
  );

  const handleOpenModal = () => {
    setForm({ name: '', email: '', password: '', phone: '', role: '', county_code: '' });
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
    setForm({ name: '', email: '', password: '', phone: '', role: '', county_code: '' });
    setSubcounties([]);
    setWards([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'subcounty_id') {
      // Reset ward when subcounty changes
      setForm({ ...form, [name]: value, ward_id: '' });
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
      subcounty_id: (user as any).subcounty_id,
      ward_id: (user as any).ward_id,
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

  const handleDelete = (user: UserModel) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
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

    // Validation for subcounty and ward when current user is agent
    if (currentUser?.role === 'agent') {
      if (!form.subcounty_id) {
        setError('Subcounty is required');
        setSubmitting(false);
        return;
      }
      if (!form.ward_id) {
        setError('Ward is required');
        setSubmitting(false);
        return;
      }
    }

    // Validation for county_code when current user is ministry_admin
    if (currentUser?.role === 'ministry_admin') {
      if (!form.county_code) {
        setError('County Code is required');
        setSubmitting(false);
        return;
      }
    }

    try {
      if (isEditing && selectedUser) {
        // Handle update
        const updateData = { ...form };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        // Map subcounty_id to subcounty name and ward_id to ward name
        if (updateData.subcounty_id) {
          const selectedSubcounty = subcounties.find(s => s.id === updateData.subcounty_id);
          updateData.subcounty = selectedSubcounty ? selectedSubcounty.name : '';
          delete updateData.subcounty_id;
        }
        if (updateData.ward_id) {
          const selectedWard = wards.find(w => w.id === updateData.ward_id);
          updateData.ward = selectedWard ? selectedWard.name : '';
          delete updateData.ward_id;
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
        // Map subcounty_id to subcounty name and ward_id to ward name
        if (createData.subcounty_id) {
          const selectedSubcounty = subcounties.find(s => s.id === createData.subcounty_id);
          createData.subcounty = selectedSubcounty ? selectedSubcounty.name : '';
          delete createData.subcounty_id;
        }
        if (createData.ward_id) {
          const selectedWard = wards.find(w => w.id === createData.ward_id);
          createData.ward = selectedWard ? selectedWard.name : '';
          delete createData.ward_id;
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
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active system users
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
              {users.filter(user => user.role === 'admin').length}
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
              {users.filter(user => user.status === 'Active').length}
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
 <Input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g., +254712345678" disabled={submitting} />
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
                <div>
                  <label className="block text-sm font-medium mb-1">Institution (School)</label>
                  <select name="institution_id" value={form.institution_id || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                    <option value="">Select institution</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
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
                    <label className="block text-sm font-medium mb-1">Subcounty <span className="text-destructive">*</span></label>
                    <select
                      name="subcounty_id"
                      value={form.subcounty_id || ''}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                      disabled={submitting}
                      required
                    >
                      <option value="">Select subcounty</option>
                      {subcounties.map(subcounty => (
                        <option key={subcounty.id} value={subcounty.id}>{subcounty.name}</option>
                      ))}
                    </select>
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
              {currentUser?.role === 'agent' && form.subcounty_id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ward <span className="text-destructive">*</span></label>
                    <select
                      name="ward_id"
                      value={form.ward_id || ''}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                      disabled={submitting || !form.subcounty_id}
                      required
                    >
                      <option value="">Select ward</option>
                      {wards.map(ward => (
                        <option key={ward.id} value={ward.id}>{ward.name}</option>
                      ))}
                    </select>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No users found.</TableCell>
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
                          <DropdownMenuItem
                            onClick={() => handleDelete(user)}
                            className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
          {!loading && users.length > 0 && (
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
                  {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, users.length)} of {users.length}
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
                    disabled={(page + 1) * rowsPerPage >= users.length}
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

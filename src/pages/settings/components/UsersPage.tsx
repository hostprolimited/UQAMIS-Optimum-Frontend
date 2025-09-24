import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Edit, X, Trash2, AlertCircle } from 'lucide-react';
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
import { getUsers, createUser, deleteUser, updateUser } from '../core/_requests';
import { getInstitutions } from '@/pages/onboarding/core/_requests';
import { User as UserModel, CreateUserInput } from '../core/_models';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Users = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({ name: '', email: '', password: '', phone: '', role: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    fetchUsers();
    fetchInstitutions();
  }, []);

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

  const handleOpenModal = () => {
    setForm({ name: '', email: '', password: '', phone: '', role: '' });
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setIsEditing(false);
    setSelectedUser(null);
    setForm({ name: '', email: '', password: '', phone: '', role: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      password: '' // Password is optional for updates
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && selectedUser) {
        // Handle update
        const updateData = { ...form };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await updateUser(selectedUser.id, updateData);
        toast({
          title: "Success",
          description: "User updated successfully",
          variant: "default",
        });
      } else {
        // Handle create
        await createUser(form);
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={handleCloseModal}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
                <Input name="name" value={form.name} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-destructive">*</span></label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input name="phone" value={form.phone} onChange={handleChange} disabled={submitting} />
              </div>
              {/*  gender Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                  <option value="">Select role</option>
                 
                  {/* <option value="county_admin">County Admin</option> */}
                  <option value="school_admin">School Admin</option>
                  {/* Only show agent option if current user is NOT agent */}
                  {currentUser?.role !== 'agent' && (
                    <option value="agent">County Admin</option>
                  )}
                  {currentUser?.role !== 'agent' && (
                    <option value="agent">Admin</option>
                  )}
                </select>
              </div>
              
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
      <div className="mt-8">
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
      </div>

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
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
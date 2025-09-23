import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Edit, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getUsers, createUser } from '../core/_requests';
import { User as UserModel, CreateUserInput } from '../core/_models';

const Users = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({ name: '', email: '', password: '', phone: '', role: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createUser(form);
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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

      {/* Modal for creating user */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={handleCloseModal}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
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
              <div>
                <label className="block text-sm font-medium mb-1">Password <span className="text-destructive">*</span></label>
                <Input name="password" type="password" value={form.password} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-2 py-1" disabled={submitting}>
                  {/* <option value="">Select role</option> */}
                  <option value="school_admin">School Admin</option>
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

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-success">
                  {users.filter(u => u.status === 'Active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground text-sm font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admin Users</p>
                <p className="text-2xl font-bold text-warning">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
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
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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
  );
};

export default Users;
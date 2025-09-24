import React, { useEffect, useState } from 'react';
import { Shield, Users, School, CheckCircle, XCircle, Plus, X, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  getUsers,
  getPermissions,
  createPermission,
  assignPermissionToRole,
  assignUserRole,
  getUserRole,
  updateRole,
  removeRole,
} from '../core/_requests';
import { User, Role, Permission } from '../core/_models';
import { RolePermission } from '../core/_types';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Simple icon for permission matrix
const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => (
  hasPermission ? (
    <CheckCircle className="text-green-500 w-4 h-4" />
  ) : (
    <XCircle className="text-red-500 w-4 h-4" />
  )
);

const rolePermissions: RolePermission[] = [
  {
    role: 'admin',
    name: 'National Admin',
    description: 'Full system access with national oversight',
    icon: Shield,
    color: 'text-destructive',
    users: 1,
    permissions: {
      overview: { national: true, county: true, school: true },
      onboard: { create: true, edit: true, delete: true },
      assessment: { create: true, review: true, approve: true },
      reports: { view: true, export: true, generate: true },
      userManagement: { create: true, edit: true, delete: true, assign: true },
      systemSafety: { view: true, configure: true },
      backup: { create: true, restore: true, schedule: true }
    }
  },
  {
    role: 'county_admin',
    name: 'County Admin',
    description: 'County-level management and oversight',
    icon: Users,
    color: 'text-warning',
    users: 47,
    permissions: {
      overview: { national: false, county: true, school: true },
      onboard: { create: true, edit: true, delete: false },
      assessment: { create: true, review: true, approve: true },
      reports: { view: true, export: true, generate: true },
      userManagement: { create: true, edit: true, delete: false, assign: false },
      systemSafety: { view: true, configure: false },
      backup: { create: false, restore: false, schedule: false }
    }
  },
  {
    role: 'school_admin',
    name: 'School Admin',
    description: 'School-level assessment and reporting',
    icon: School,
    color: 'text-success',
    users: 1248,
    permissions: {
      overview: { national: false, county: false, school: true },
      onboard: { create: false, edit: false, delete: false },
      assessment: { create: true, review: false, approve: false },
      reports: { view: true, export: true, generate: false },
      userManagement: { create: false, edit: false, delete: false, assign: false },
      systemSafety: { view: false, configure: false },
      backup: { create: false, restore: false, schedule: false }
    }
  }
];

const permissionLabels = {
  overview: 'Dashboard Overview',
  onboard: 'School Onboarding',
  assessment: 'Quality Assessment',
  reports: 'Reports & Analytics',
  userManagement: 'User Management',
  systemSafety: 'System Safety',
  backup: 'Backup & Recovery'
};

const RolesPermissions = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [creatingPermission, setCreatingPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roleStats, setRoleStats] = useState({
    totalRoles: 0,
    totalPermissions: 0,
    totalUsers: 0
  });
  const { toast } = useToast();
  const { currentUser } = useRole();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, permissionsData] = await Promise.all([
          getUsers(),
          getPermissions()
        ]);
        
        setUsers(usersResponse.users || []); // Access the users array from the response
        setPermissions(permissionsData.permissions || []);
        setRoles(permissionsData.roles || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays as fallback
        setUsers([]);
        setPermissions([]);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const availableRoles = currentUser?.role === 'agent'
    ? roles.filter(r => r.name === 'school_admin')
    : roles;

  const openAssignRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole('');
    setShowAssignRoleModal(true);
  };

  const closeAssignRoleModal = () => {
    setShowAssignRoleModal(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) return;
    
    setAssigning(true);
    try {
      const selectedRoleObj = roles.find(r => r.name === selectedRole);
      if (!selectedRoleObj) {
        throw new Error('Selected role not found');
      }
      
      await assignUserRole({
        user_id: selectedUser.id,
        role_id: selectedRoleObj.id,
        role_name: selectedRole
      });
      
      toast({
        title: "Success",
        description: "Role assigned successfully",
        variant: "default",
      });
      
      await getUsers().then(res => setUsers(res.users || []));
      closeAssignRoleModal();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const openCreatePermissionModal = () => {
    setNewPermissionName('');
    setShowCreatePermissionModal(true);
  };

  const closeCreatePermissionModal = () => {
    setShowCreatePermissionModal(false);
    setNewPermissionName('');
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermissionName) return;
    setCreatingPermission(true);
    try {
      await createPermission({
        name: newPermissionName
      });
      const updatedPermissions = await getPermissions();
      setPermissions(updatedPermissions.permissions || []);
      toast({
        title: "Success",
        description: "Permission created successfully",
        variant: "default",
      });
      closeCreatePermissionModal();
    } finally {
      setCreatingPermission(false);
    }
  };

  const handleAssignPermissionToRole = async (permissionName: string, roleName: string) => {
    try {
      const selectedPermission = permissions.find(p => p.name === permissionName);
      const selectedRole = roles.find(r => r.name === roleName);

      if (!selectedPermission || !selectedRole) {
        throw new Error('Permission or Role not found');
      }

      await assignPermissionToRole({
        permission_name: permissionName,
        role_name: roleName,
        permission_id: selectedPermission.id,
        role_id: selectedRole.id
      });
      
      toast({
        title: "Success",
        description: "Permission assigned successfully",
        variant: "default",
      });

      // Refresh permissions after assignment
      const updatedPermissions = await getPermissions();
      setPermissions(updatedPermissions.permissions || []);
    } catch (error: any) {
      // Handle error response
      const errorMessage = error.response?.data?.message || "Error assigning permission to role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error assigning permission to role:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Role & Permission Management</h1>
          <p className="text-muted-foreground">Manage system roles and their associated permissions</p>
        </div>
        <Button
          onClick={() => setShowAssignRoleModal(true)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-1" /> Assign Role
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              Active system roles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              System permissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users in system
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* User Roles Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Available roles and their descriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map(role => (
                <Card key={role.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                          {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm mt-1">
                      {/* {role.guard_name} */}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Permissions</CardTitle>
                <CardDescription>Manage and assign permissions</CardDescription>
              </div>
              <Button
                onClick={openCreatePermissionModal}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-1" /> Create Permission
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Assign Permission to Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell>{perm.name}</TableCell>
                      <TableCell>
                        <select
                          onChange={e => handleAssignPermissionToRole(perm.name, e.target.value)}
                          defaultValue=""
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Assign to role...</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>Overview of permissions across different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  {rolePermissions.map(role => (
                    <TableHead key={role.role} className="text-center">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={role.id} className="text-center">
                        <PermissionIcon
                          hasPermission={false} // You'll need to implement a way to check if the role has this permission
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Permission Modal */}
      {showCreatePermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Permission</CardTitle>
              <Button
                className="absolute top-2 right-2 text-muted-foreground"
                variant="ghost"
                onClick={closeCreatePermissionModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePermission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Permission Name</label>
                  <input
                    type="text"
                    value={newPermissionName}
                    onChange={e => setNewPermissionName(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                    disabled={creatingPermission}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCreatePermissionModal}
                    disabled={creatingPermission}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creatingPermission}
                    className="bg-primary text-primary-foreground"
                  >
                    {creatingPermission ? 'Creating...' : 'Create Permission'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Role to User</CardTitle>
              <Button
                className="absolute top-2 right-2 text-muted-foreground"
                variant="ghost"
                onClick={closeAssignRoleModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User</label>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={e => setSelectedUser(users.find(u => u.id === Number(e.target.value)) || null)}
                    className="w-full border rounded px-2 py-1"
                    required
                    disabled={assigning}
                  >
                    <option value="">Select user</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                    disabled={assigning}
                  >
                    <option value="">Select role</option>
                    {availableRoles.map(r => (
                      <option key={r.id} value={r.name}>
                        {r.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeAssignRoleModal}
                    disabled={assigning}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={assigning}
                    className="bg-primary text-primary-foreground"
                  >
                    {assigning ? 'Assigning...' : 'Assign Role'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
      <Toaster />
    </>
  );
};

export default RolesPermissions;
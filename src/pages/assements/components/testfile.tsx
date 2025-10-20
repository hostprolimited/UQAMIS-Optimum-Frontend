// import React, { useEffect, useState } from 'react';
// import { Shield, Users, School, CheckCircle, XCircle, Plus, X, Lock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import {
//   getUsers,
//   getPermissions,
//   createPermission,
//   createRole,
//   assignPermissionToRole,
//   assignUserRole,
//   getUserRole,
//   updateRole,
//   removeRole,
//   updatePermission,
//   deletePermission,
// } from '../core/_requests';
// import { User, Role, Permission } from '../core/_models';
// import { useRole } from '@/contexts/RoleContext';
// import { useToast } from "@/components/ui/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import { Urls } from '@/constants/urls';
// import api from '@/utils/api';
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Form, FormControl, FormField, FormItem, FormLabel as FormLabelComponent, FormMessage } from "@/components/ui/form";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";

// // Simple icon for permission matrix
// const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => (
//   hasPermission ? (
//     <CheckCircle className="text-green-500 w-4 h-4" />
//   ) : (
//     <XCircle className="text-red-500 w-4 h-4" />
//   )
// );


// const RolesPermissions = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [permissions, setPermissions] = useState<Permission[]>([]);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [selectedRole, setSelectedRole] = useState('');
//   const [selectedPermission, setSelectedPermission] = useState('');
//   const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
//   const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);
//   const [showEditRoleModal, setShowEditRoleModal] = useState(false);
//   const [showEditPermissionModal, setShowEditPermissionModal] = useState(false);
//   const [showAddRoleModal, setShowAddRoleModal] = useState(false);
//   const [newPermissionName, setNewPermissionName] = useState('');
//   const [editName, setEditName] = useState('');
//   const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
//   const [assigning, setAssigning] = useState(false);
//   const [creatingPermission, setCreatingPermission] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [newRoleName, setNewRoleName] = useState('');
//   const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
//   const [roleStats, setRoleStats] = useState({
//     totalRoles: 0,
//     totalPermissions: 0,
//     totalUsers: 0
//   });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [permissionsSearchTerm, setPermissionsSearchTerm] = useState('');
//   const [rolesSearchTerm, setRolesSearchTerm] = useState('');
//   const { toast } = useToast();
//   const { currentUser } = useRole();

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const [usersResponse, permissionsData] = await Promise.all([
//           getUsers(),
//           getPermissions()
//         ]);

//         setUsers(usersResponse.users || []); // Access the users array from the response
//         setPermissions(permissionsData.permissions?.map(p => ({ ...p, status: p.status || 'Active' })) || []);
//         setRoles(permissionsData.roles?.map(r => ({ ...r, status: r.status || 'Active' })) || []);
//       } catch (error: any) {
//         console.error('Error fetching data:', error);
//         let errorMessage = 'Failed to load data. Please try again.';
//         if (error?.response?.status === 403 || error?.response?.status === 401) {
//           errorMessage = 'You do not have permission to access this data.';
//         } else if (error?.response?.data?.message) {
//           errorMessage = error.response.data.message;
//         }
//         toast({
//           title: 'Error',
//           description: errorMessage,
//           variant: 'destructive',
//         });
//         // Set empty arrays as fallback
//         setUsers([]);
//         setPermissions([]);
//         setRoles([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [toast]);

//   const availableRoles = currentUser?.role === 'agent'
//     ? roles.filter(r => r.name === 'school_admin')
//     : roles;

//   const filteredPermissions = React.useMemo(
//     () => {
//       if (!permissionsSearchTerm) return permissions;
//       return permissions.filter(permission =>
//         permission.name.toLowerCase().includes(permissionsSearchTerm.toLowerCase())
//       );
//     },
//     [permissions, permissionsSearchTerm]
//   );

//   const visiblePermissions = React.useMemo(
//     () => filteredPermissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filteredPermissions, page, rowsPerPage]
//   );

//   const filteredRoles = React.useMemo(
//     () => {
//       if (!rolesSearchTerm) return roles;
//       return roles.filter(role =>
//         role.name.toLowerCase().includes(rolesSearchTerm.toLowerCase())
//       );
//     },
//     [roles, rolesSearchTerm]
//   );

//   const visibleRoles = React.useMemo(
//     () => filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filteredRoles, page, rowsPerPage]
//   );

//   const handleChangePage = (newPage: number) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const openAssignRoleModal = (user: User) => {
//     setSelectedUser(user);
//     setSelectedRole('');
//     setShowAssignRoleModal(true);
//   };

//   const closeAssignRoleModal = () => {
//     setShowAssignRoleModal(false);
//     setSelectedUser(null);
//     setSelectedRole('');
//   };

//   const handleEditRole = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedItemId || !editName) return;

//     try {
//       await updateRole(selectedItemId, { name: editName });
//       toast({
//         title: "Success",
//         description: "Role updated successfully",
//         variant: "default",
//       });
//       const permissionsData = await getPermissions();
//       setRoles(permissionsData.roles?.map(r => ({ ...r, status: r.status || 'Active' })) || []);
//       setShowEditRoleModal(false);
//     } catch (error: any) {
//       console.error('Error updating role:', error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update role",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleToggleRoleStatus = async (id: number, newStatus: string) => {
//     try {
//       await api.patch(Urls.CHANGE_USER_STATUS(id));
//       toast({
//         title: "Success",
//         description: `Role ${newStatus.toLowerCase()}d successfully`,
//         variant: "default",
//       });
//       const permissionsData = await getPermissions();
//       setRoles(permissionsData.roles?.map(r => ({ ...r, status: r.status || 'Active' })) || []);
//     } catch (error: any) {
//       console.error('Error updating role status:', error);
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to update role status",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleEditPermission = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedItemId || !editName) return;

//     try {
//       await updatePermission(selectedItemId, { name: editName });
//       toast({
//         title: "Success",
//         description: "Permission updated successfully",
//         variant: "default",
//       });
//       const permissionsData = await getPermissions();
//       setPermissions(permissionsData.permissions?.map(p => ({ ...p, status: p.status || 'Active' })) || []);
//       setShowEditPermissionModal(false);
//     } catch (error: any) {
//       console.error('Error updating permission:', error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update permission",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleTogglePermissionStatus = async (id: number, newStatus: string) => {
//     try {
//       await api.patch(Urls.CHANGE_USER_STATUS(id));
//       toast({
//         title: "Success",
//         description: `Permission ${newStatus.toLowerCase()}d successfully`,
//         variant: "default",
//       });
//       const permissionsData = await getPermissions();
//       setPermissions(permissionsData.permissions?.map(p => ({ ...p, status: p.status || 'Active' })) || []);
//     } catch (error: any) {
//       console.error('Error updating permission status:', error);
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to update permission status",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleAssignRole = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedUser || !selectedRole) return;
    
//     setAssigning(true);
//     try {
//       const selectedRoleObj = roles.find(r => r.name === selectedRole);
//       if (!selectedRoleObj) {
//         throw new Error('Selected role not found');
//       }
      
//       await assignUserRole({
//         user_id: selectedUser.id,
//         role_id: selectedRoleObj.id,
//         role_name: selectedRole
//       });
      
//       toast({
//         title: "Success",
//         description: "Role assigned successfully",
//         variant: "default",
//       });
      
//       await getUsers().then(res => setUsers(res.users || []));
//       closeAssignRoleModal();
//     } catch (error: any) {
//       console.error('Error assigning role:', error);
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to assign role",
//         variant: "destructive",
//       });
//     } finally {
//       setAssigning(false);
//     }
//   };

//   const openCreatePermissionModal = () => {
//     setNewPermissionName('');
//     setShowCreatePermissionModal(true);
//   };

//   const closeCreatePermissionModal = () => {
//     setShowCreatePermissionModal(false);
//     setNewPermissionName('');
//   };

//   const handleCreatePermission = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newPermissionName) return;
//     setCreatingPermission(true);
//     try {
//       await createPermission({
//         name: newPermissionName
//       });
//       const updatedPermissions = await getPermissions();
//       setPermissions(updatedPermissions.permissions?.map(p => ({ ...p, status: p.status || 'Active' })) || []);
//       toast({
//         title: "Success",
//         description: "Permission created successfully",
//         variant: "default",
//       });
//       closeCreatePermissionModal();
//     } finally {
//       setCreatingPermission(false);
//     }
//   };

//   const openAddRoleModal = () => {
//     setNewRoleName('');
//     setSelectedPermissions([]);
//     setShowAddRoleModal(true);
//   };

//   const handleAssignPermissionToRole = async (permissionName: string, roleName: string) => {
//     try {
//       const selectedPermission = permissions.find(p => p.name === permissionName);
//       const selectedRole = roles.find(r => r.name === roleName);

//       if (!selectedPermission || !selectedRole) {
//         throw new Error('Permission or Role not found');
//       }

//       await assignPermissionToRole({
//         permission_name: permissionName,
//         role_name: roleName,
//         permission_id: selectedPermission.id,
//         role_id: selectedRole.id
//       });
      
//       toast({
//         title: "Success",
//         description: "Permission assigned successfully",
//         variant: "default",
//       });

//       // Refresh permissions after assignment
//       const updatedPermissions = await getPermissions();
//       setPermissions(updatedPermissions.permissions?.map(p => ({ ...p, status: p.status || 'Active' })) || []);
//     } catch (error: any) {
//       // Handle error response
//       const errorMessage = error.response?.data?.message || "Error assigning permission to role";
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       });
//       console.error('Error assigning permission to role:', error);
//     }
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between mb-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Role & Permission Management</h1>
//           <p className="text-muted-foreground">Manage system roles and their associated permissions</p>
//         </div>
//         {/* <Button
//           onClick={() => setShowAssignRoleModal(true)}
//           className="bg-primary text-primary-foreground"
//         >
//           <Plus className="h-4 w-4 mr-1" /> Assign Role
//         </Button> */}
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
//             <Shield className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{rolesSearchTerm ? filteredRoles.length : roles.length}</div>
//             <p className="text-xs text-muted-foreground">
//               {rolesSearchTerm ? `Filtered from ${roles.length} total` : 'Active system roles'}
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
//             <Lock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{permissionsSearchTerm ? filteredPermissions.length : permissions.length}</div>
//             <p className="text-xs text-muted-foreground">
//               {permissionsSearchTerm ? `Filtered from ${permissions.length} total` : 'System permissions'}
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{users.length}</div>
//             <p className="text-xs text-muted-foreground">
//               Active users in system
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 gap-6">
//         {/* User Roles Section */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>User Roles</CardTitle>
//                 <CardDescription>Available roles and their descriptions</CardDescription>
//               </div>
//               <Button onClick={openAddRoleModal} className="bg-primary text-primary-foreground">
//                 <Plus className="h-4 w-4 mr-1" /> Add Role
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {/* Search Input */}
//             <div className="flex items-center space-x-2 mb-4">
//               <Input
//                 placeholder="Search roles..."
//                 value={rolesSearchTerm}
//                 onChange={(e) => {
//                   setRolesSearchTerm(e.target.value);
//                   setPage(0); // Reset to first page when searching
//                 }}
//                 className="max-w-sm"
//               />
//               {rolesSearchTerm && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     setRolesSearchTerm('');
//                     setPage(0);
//                   }}
//                 >
//                   Clear
//                 </Button>
//               )}
//             </div>
//             {isLoading ? (
//               <div className="flex items-center justify-center p-4">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//               </div>
//             ) : (
//               <>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Role Name</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {visibleRoles.map((role) => (
//                       <TableRow key={role.id}>
//                         <TableCell>{role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
//                         <TableCell>
//                           <Badge variant={role.status === 'Active' ? 'default' : 'secondary'}>
//                             {role.status || 'Active'}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                                 <MoreHorizontal className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end" className="w-40">
//                               <DropdownMenuItem
//                                 onClick={() => {
//                                   setSelectedItemId(role.id);
//                                   setEditName(role.name);
//                                   setShowEditRoleModal(true);
//                                 }}
//                                 className="cursor-pointer"
//                               >
//                                 <Edit className="h-4 w-4 mr-2" />
//                                 Edit
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() => handleToggleRoleStatus(role.id, role.status === 'Active' ? 'Inactive' : 'Active')}
//                                 className="cursor-pointer"
//                               >
//                                 {role.status === 'Active' ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
//                                 {role.status === 'Active' ? 'Deactivate' : 'Activate'}
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>

//                 {/* Pagination for roles */}
//                 {filteredRoles.length > 0 && (
//                   <div className="flex items-center justify-between px-2 py-4">
//                     <div className="flex items-center space-x-2">
//                       <label className="text-sm font-medium">Rows per page:</label>
//                       <select
//                         value={rowsPerPage}
//                         onChange={handleChangeRowsPerPage}
//                         className="border rounded px-2 py-1 text-sm"
//                       >
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={25}>25</option>
//                         <option value={50}>50</option>
//                       </select>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <span className="text-sm">
//                         {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredRoles.length)} of {filteredRoles.length}
//                         {rolesSearchTerm && ` (filtered from ${roles.length} total)`}
//                       </span>
//                       <div className="flex space-x-1">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleChangePage(page - 1)}
//                           disabled={page === 0}
//                         >
//                           Previous
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleChangePage(page + 1)}
//                           disabled={(page + 1) * rowsPerPage >= filteredRoles.length}
//                         >
//                           Next
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </CardContent>
//         </Card>

//       </div>

//       {/* Create Permission Modal */}
//       {showCreatePermissionModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle>Create Permission</CardTitle>
//               <Button
//                 className="absolute top-2 right-2 text-muted-foreground"
//                 variant="ghost"
//                 onClick={closeCreatePermissionModal}
//               >
//                 <X className="h-5 w-5" />
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleCreatePermission} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Permission Name</label>
//                   <input
//                     type="text"
//                     value={newPermissionName}
//                     onChange={e => setNewPermissionName(e.target.value)}
//                     className="w-full border rounded px-2 py-1"
//                     required
//                     disabled={creatingPermission}
//                   />
//                 </div>
//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={closeCreatePermissionModal}
//                     disabled={creatingPermission}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={creatingPermission}
//                     className="bg-primary text-primary-foreground"
//                   >
//                     {creatingPermission ? 'Creating...' : 'Create Permission'}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Assign Role Modal */}
//       {showAssignRoleModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle>Assign Role to User</CardTitle>
//               <Button
//                 className="absolute top-2 right-2 text-muted-foreground"
//                 variant="ghost"
//                 onClick={closeAssignRoleModal}
//               >
//                 <X className="h-5 w-5" />
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleAssignRole} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">User</label>
//                   <select
//                     value={selectedUser?.id || ''}
//                     onChange={e => setSelectedUser(users.find(u => u.id === Number(e.target.value)) || null)}
//                     className="w-full border rounded px-2 py-1"
//                     required
//                     disabled={assigning}
//                   >
//                     <option value="">Select user</option>
//                     {users.map(u => (
//                       <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Role</label>
//                   <select
//                     value={selectedRole}
//                     onChange={e => setSelectedRole(e.target.value)}
//                     className="w-full border rounded px-2 py-1"
//                     required
//                     disabled={assigning}
//                   >
//                     <option value="">Select role</option>
//                     {availableRoles.map(r => (
//                       <option key={r.id} value={r.name}>
//                         {r.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={closeAssignRoleModal}
//                     disabled={assigning}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={assigning}
//                     className="bg-primary text-primary-foreground"
//                   >
//                     {assigning ? 'Assigning...' : 'Assign Role'}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Add Role Modal */}
//       <Dialog open={showAddRoleModal} onOpenChange={setShowAddRoleModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Add Role</DialogTitle>
//             <DialogDescription>
//               Create a new role and assign permissions.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="roleName" className="text-sm font-medium text-gray-600">Role Name:*</Label>
//               <Input
//                 id="roleName"
//                 value={newRoleName}
//                 onChange={(e) => setNewRoleName(e.target.value)}
//                 placeholder="Role Name"
//                 className="mt-2"
//               />
//             </div>

//             <div>
//               <Label className="text-sm font-medium text-gray-600">Permissions:</Label>
//               <div className="mt-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
//                 {permissions.map((permission) => (
//                   <div key={permission.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`permission-${permission.id}`}
//                       checked={selectedPermissions.includes(permission.id)}
//                       onCheckedChange={(checked) => {
//                         if (checked) {
//                           setSelectedPermissions([...selectedPermissions, permission.id]);
//                         } else {
//                           setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
//                         }
//                       }}
//                     />
//                     <Label
//                       htmlFor={`permission-${permission.id}`}
//                       className="text-sm font-normal cursor-pointer"
//                     >
//                       {permission.name}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setShowAddRoleModal(false);
//                   setNewRoleName('');
//                   setSelectedPermissions([]);
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="button"
//                 onClick={async () => {
//                   if (!newRoleName.trim()) {
//                     toast({
//                       title: "Error",
//                       description: "Role name is required",
//                       variant: "destructive",
//                     });
//                     return;
//                   }

//                   try {
//                     // Create the role
//                     const roleResponse = await createRole({ name: newRoleName });

//                     // Assign selected permissions to the role
//                     if (selectedPermissions.length > 0) {
//                       const roleId = roleResponse.id; // Assuming the response includes the role ID
//                       for (const permissionId of selectedPermissions) {
//                         const permission = permissions.find(p => p.id === permissionId);
//                         if (permission) {
//                           await assignPermissionToRole({
//                             permission_name: permission.name,
//                             role_name: newRoleName,
//                             permission_id: permissionId,
//                             role_id: roleId
//                           });
//                         }
//                       }
//                     }

//                     toast({
//                       title: "Success",
//                       description: "Role created successfully with permissions",
//                       variant: "default",
//                     });

//                     // Refresh roles
//                     const permissionsData = await getPermissions();
//                     setRoles(permissionsData.roles?.map(r => ({ ...r, status: r.status || 'Active' })) || []);

//                     // Reset and close
//                     setShowAddRoleModal(false);
//                     setNewRoleName('');
//                     setSelectedPermissions([]);
//                   } catch (error: any) {
//                     console.error('Error creating role:', error);
//                     toast({
//                       title: "Error",
//                       description: error?.response?.data?.message || error?.message || "Failed to create role",
//                       variant: "destructive",
//                     });
//                   }
//                 }}
//                 className="bg-indigo-600 hover:bg-indigo-700"
//               >
//                 Save Role
//               </Button>
//             </DialogFooter>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Role Modal */}
//       <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Role</DialogTitle>
//             <DialogDescription>Update the role name.</DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="editRoleName">Role Name</Label>
//               <Input
//                 id="editRoleName"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 placeholder="Role Name"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowEditRoleModal(false)}>Cancel</Button>
//             <Button onClick={handleEditRole}>Save</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       </div>
//       <Toaster />
//     </>
//   );
// };

// export default RolesPermissions;
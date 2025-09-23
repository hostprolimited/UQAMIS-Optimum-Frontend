// Simple icon for permission matrix
const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => (
	hasPermission ? (
		<CheckCircle className="text-green-500 w-4 h-4" />
	) : (
		<XCircle className="text-red-500 w-4 h-4" />
	)
);
import React, { useEffect, useState } from 'react';
import { Shield, Users, School, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getUsers, getUserRoles, assignRoleToUser } from '../core/_requests';
import { User, Role } from '../core/_models';
import { useRole } from '@/contexts/RoleContext';

const rolePermissions = [
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
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [roles, setRoles] = useState<Role[]>([
		{
			id: 1,
			name: 'admin'
		},
		{
			id: 2,
			name: 'county_admin'
		},
		{
			id: 3,
			name: 'school_admin'
		}
	]);
	const [selectedRole, setSelectedRole] = useState('');
	const [assigning, setAssigning] = useState(false);
	const { currentUser } = useRole();

	useEffect(() => {
		getUsers().then(setUsers);
	}, []);

	const openAssignModal = (user: User) => {
		setSelectedUser(user);
		setSelectedRole('');
		setShowModal(true);
	};

	const closeAssignModal = () => {
		setShowModal(false);
		setSelectedUser(null);
		setSelectedRole('');
	};

	const handleAssignRole = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedUser || !selectedRole) return;
		setAssigning(true);
		try {
			await assignRoleToUser(
				selectedUser.id,
				roles.find(r => r.name === selectedRole)?.id!
			);
			closeAssignModal();
		} finally {
			setAssigning(false);
		}
	};

	// Only allow agent to assign school_admin
	const availableRoles =
		currentUser?.role === 'agent'
			? roles.filter(r => r.name === 'school_admin')
			: roles;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
					<p className="text-muted-foreground">
						Manage user roles and their system permissions
					</p>
				</div>
				<Button
					className="bg-primary text-primary-foreground flex items-center"
					onClick={() => setShowModal(true)}
				>
					<Plus className="h-4 w-4 mr-1" /> Assign User Role
				</Button>
			</div>
			{/* Modal for assigning user role */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
						<button
							className="absolute top-2 right-2 text-muted-foreground"
							onClick={closeAssignModal}
						>
							<X className="h-5 w-5" />
						</button>
						<h2 className="text-xl font-bold mb-4">Assign Role to User</h2>
						<form
							onSubmit={handleAssignRole}
							className="space-y-4"
						>
							<div>
								<label className="block text-sm font-medium mb-1">User</label>
								<select
									value={selectedUser?.id || ''}
									onChange={e =>
										setSelectedUser(
											users.find(u => u.id === Number(e.target.value)) || null
										)
									}
									className="w-full border rounded px-2 py-1"
									required
									disabled={assigning}
								>
									<option value="">Select user</option>
									{users.map(u => (
										<option key={u.id} value={u.id}>
											{u.name} ({u.email})
										</option>
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
											{r.name
												.replace('_', ' ')
												.replace(/\b\w/g, l => l.toUpperCase())}
										</option>
									))}
								</select>
							</div>
							<div className="flex justify-end">
								<Button
									type="button"
									variant="outline"
									className="mr-2"
									onClick={closeAssignModal}
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
					</div>
				</div>
			)}

			{/* Role Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{rolePermissions.map(role => (
					<Card key={role.role}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<role.icon className={`h-5 w-5 ${role.color}`} />
									<CardTitle className="text-lg">{role.name}</CardTitle>
								</div>
								<Badge variant="outline" className="text-sm">
									{role.users} user{role.users !== 1 ? 's' : ''}
								</Badge>
							</div>
							<CardDescription className="text-sm">
								{role.description}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="text-sm font-medium text-foreground mb-2">
									Key Permissions:
								</div>
								<div className="grid grid-cols-2 gap-2 text-xs">
									{Object.entries(role.permissions)
										.slice(0, 6)
										.map(([key, perms]) => {
											const hasAnyPermission = Object.values(perms).some(Boolean);
											return (
												<div key={key} className="flex items-center space-x-1">
													<PermissionIcon hasPermission={hasAnyPermission} />
													<span
														className={
															hasAnyPermission
																? 'text-foreground'
																: 'text-muted-foreground'
														}
													>
														{key.charAt(0).toUpperCase() + key.slice(1)}
													</span>
												</div>
											);
										})}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Detailed Permissions Matrix */}
			<Card>
				<CardHeader>
					<CardTitle>Permission Matrix</CardTitle>
					<CardDescription>
						Detailed view of all permissions across different user roles
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-48">Module / Feature</TableHead>
									<TableHead className="text-center">National Admin</TableHead>
									<TableHead className="text-center">County Admin</TableHead>
									<TableHead className="text-center">School Admin</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{/* Overview Permissions */}
								<TableRow>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-primary rounded-full"></div>
											<span>Dashboard Overview</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-2">
											<Badge variant="outline" className="text-xs">
												National
											</Badge>
											<Badge variant="outline" className="text-xs">
												County
											</Badge>
											<Badge variant="outline" className="text-xs">
												School
											</Badge>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-2">
											<Badge variant="outline" className="text-xs">
												County
											</Badge>
											<Badge variant="outline" className="text-xs">
												School
											</Badge>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<Badge variant="outline" className="text-xs">
											School
										</Badge>
									</TableCell>
								</TableRow>

								{/* School Onboarding */}
								<TableRow className="bg-muted/30">
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-success rounded-full"></div>
											<span>School Onboarding</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Full Access</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Create & Edit</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={false} />
											<span className="text-xs text-muted-foreground">
												No Access
											</span>
										</div>
									</TableCell>
								</TableRow>

								{/* Quality Assessment */}
								<TableRow>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-info rounded-full"></div>
											<span>Quality Assessment</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Full Access</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Review & Approve</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Create Only</span>
										</div>
									</TableCell>
								</TableRow>

								{/* Reports & Analytics */}
								<TableRow className="bg-muted/30">
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-warning rounded-full"></div>
											<span>Reports & Analytics</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Full Access</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">County Reports</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">School Reports</span>
										</div>
									</TableCell>
								</TableRow>

								{/* User Management */}
								<TableRow>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-destructive rounded-full"></div>
											<span>User Management</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Full Access</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">County Users</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={false} />
											<span className="text-xs text-muted-foreground">
												No Access
											</span>
										</div>
									</TableCell>
								</TableRow>

								{/* System Safety */}
								<TableRow className="bg-muted/30">
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-primary rounded-full"></div>
											<span>System Safety</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Full Access</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">View Only</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={false} />
											<span className="text-xs text-muted-foreground">
												No Access
											</span>
										</div>
									</TableCell>
								</TableRow>

								{/* Backup & Recovery */}
								<TableRow>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-muted rounded-full"></div>
											<span>Backup & Recovery</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={true} />
											<span className="text-xs">Full Access</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={false} />
											<span className="text-xs text-muted-foreground">
												No Access
											</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center space-x-1">
											<PermissionIcon hasPermission={false} />
											<span className="text-xs text-muted-foreground">
												No Access
											</span>
										</div>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default RolesPermissions;
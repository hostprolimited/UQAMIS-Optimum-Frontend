import React from 'react';
import { Shield, Users, School, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => (
    hasPermission ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-muted-foreground" />
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and their system permissions
          </p>
        </div>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rolePermissions.map((role) => (
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
                <div className="text-sm font-medium text-foreground mb-2">Key Permissions:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(role.permissions).slice(0, 6).map(([key, perms]) => {
                    const hasAnyPermission = Object.values(perms).some(Boolean);
                    return (
                      <div key={key} className="flex items-center space-x-1">
                        <PermissionIcon hasPermission={hasAnyPermission} />
                        <span className={hasAnyPermission ? 'text-foreground' : 'text-muted-foreground'}>
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
                      <Badge variant="outline" className="text-xs">National</Badge>
                      <Badge variant="outline" className="text-xs">County</Badge>
                      <Badge variant="outline" className="text-xs">School</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Badge variant="outline" className="text-xs">County</Badge>
                      <Badge variant="outline" className="text-xs">School</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">School</Badge>
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
                      <span className="text-xs text-muted-foreground">No Access</span>
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
                      <span className="text-xs text-muted-foreground">No Access</span>
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
                      <span className="text-xs text-muted-foreground">No Access</span>
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
                      <span className="text-xs text-muted-foreground">No Access</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <PermissionIcon hasPermission={false} />
                      <span className="text-xs text-muted-foreground">No Access</span>
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
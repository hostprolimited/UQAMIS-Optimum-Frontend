import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertTriangle, Clock, CheckCircle, User, MoreHorizontal, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getIncidents, updateIncident } from '../core/requests';
import { Incident, IncidentListResponse } from '../core/_models';
import { useRole } from '@/contexts/RoleContext';

// Helper function to format relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
};

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator(
  order: Order,
  orderBy: string,
): (a: Incident, b: Incident) => number {
  return order === 'desc'
    ? (a, b) => {
        let aValue: any, bValue: any;

        switch (orderBy) {
          case 'facility':
            aValue = a.facility.name;
            bValue = b.facility.name;
            break;
          case 'schoolName':
            aValue = a.institution.name;
            bValue = b.institution.name;
            break;
          case 'time':
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          case 'severity':
            aValue = a.severity_level;
            bValue = b.severity_level;
            break;
          default:
            aValue = a.created_at;
            bValue = b.created_at;
        }

        if (bValue < aValue) return -1;
        if (bValue > aValue) return 1;
        return 0;
      }
    : (a, b) => {
        let aValue: any, bValue: any;

        switch (orderBy) {
          case 'facility':
            aValue = a.facility.name;
            bValue = b.facility.name;
            break;
          case 'schoolName':
            aValue = a.institution.name;
            bValue = b.institution.name;
            break;
          case 'time':
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          case 'severity':
            aValue = a.severity_level;
            bValue = b.severity_level;
            break;
          default:
            aValue = a.created_at;
            bValue = b.created_at;
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      };
}

interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
  width?: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'facility',
    numeric: false,
    disablePadding: false,
    label: 'Facility',
    width: '20%',
  },
  {
    id: 'schoolName',
    numeric: false,
    disablePadding: false,
    label: 'School Name',
    width: '25%',
  },
  {
    id: 'time',
    numeric: false,
    disablePadding: false,
    label: 'Time',
    width: '15%',
  },
  {
    id: 'severity',
    numeric: false,
    disablePadding: false,
    label: 'Severity',
    width: '15%',
  },
  {
    id: 'actions',
    numeric: false,
    disablePadding: false,
    label: 'Actions',
    width: '15%',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps & { filteredHeadCells: HeadCell[] }) {
  const { order, orderBy, onRequestSort, filteredHeadCells } = props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead className="bg-muted/50">
      <TableRow>
        {filteredHeadCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, fontWeight: 'bold' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { searchTerm, onSearchChange, severityFilter, onSeverityFilterChange } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        minHeight: { xs: 56, sm: 64 },
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 2,
        py: 2,
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        id="tableTitle"
        component="div"
        className="text-lg font-semibold"
      >
        Incident Reports
      </Typography>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 w-full">
        {/* Filters and Search - Left Side */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-[250px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          {/* Severity Filter */}
          <Select value={severityFilter} onValueChange={onSeverityFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-10">
              <AlertTriangle className="h-4 w-4 mr-2 text-primary/80" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>
    </Toolbar>
  );
}

const IncidentListPage = () => {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<string>('created_at');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [updatingIncident, setUpdatingIncident] = React.useState<string | null>(null);

  // Fetch incidents from API
  React.useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response: IncidentListResponse = await getIncidents();
        setIncidents(response.incidents.data);
      } catch (error: any) {
        console.error('Error fetching incidents:', error);
        let errorMessage = 'Failed to load incidents. Please try again.';
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          errorMessage = 'You do not have permission to view incidents.';
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [toast]);

  // Handle incident status update
  const handleUpdateIncidentStatus = async (incidentId: number, newSeverity: string) => {
    try {
      setUpdatingIncident(incidentId.toString());
      await updateIncident(incidentId, { severity_level: newSeverity });
      toast({
        title: 'Success',
        description: 'Incident severity updated successfully.',
        variant: 'default',
      });

      // Refresh incidents list
      const response: IncidentListResponse = await getIncidents();
      setIncidents(response.incidents.data);
    } catch (error: any) {
      console.error('Error updating incident:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update incident.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingIncident(null);
    }
  };

  const filteredData = React.useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = searchTerm.toLowerCase() === '' ||
                            incident.facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.incident_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.submitted_by.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = severityFilter === 'all' ||
                             incident.severity_level.toLowerCase() === severityFilter.toLowerCase();

      return matchesSearch && matchesSeverity;
    });
  }, [incidents, searchTerm, severityFilter]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...filteredData]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredData],
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter head cells based on user role - hide school name for school admins
  const filteredHeadCells = headCells.filter(cell =>
    cell.id !== 'schoolName' || (currentUser?.role === 'agent' || currentUser?.role === 'ministry_admin')
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
            <AlertTriangle className="h-7 w-7 mr-3 text-red-600" />
            Incident Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and track all reported incidents across schools.
          </p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="py-4">
          <CardTitle className="text-xl">Incident List</CardTitle>
          <CardDescription>
            View, filter, and manage all incident reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={0} className="border">
              <EnhancedTableToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                severityFilter={severityFilter}
                onSeverityFilterChange={setSeverityFilter}
              />
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size='medium'
                >
                  <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={filteredData.length}
                    filteredHeadCells={filteredHeadCells}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={filteredHeadCells.length} align="center" className="py-10">
                          <div className="flex justify-center items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading incidents...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={filteredHeadCells.length} align="center" className="py-10">
                          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                            <AlertTriangle className="h-8 w-8" />
                            <p className="font-medium">No incidents found</p>
                            <p className="text-sm">Try adjusting your filters or search term.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((row) => (
                        <TableRow
                          hover
                          key={row.id}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha('#f5f5f5', 0.7) } }}
                        >
                          <TableCell sx={{ width: '20%' }}>
                            <div className="font-medium">{row.facility.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {row.incident_description.length > 50
                                ? `${row.incident_description.substring(0, 50)}...`
                                : row.incident_description}
                            </div>
                          </TableCell>
                          {(currentUser?.role === 'agent' || currentUser?.role === 'ministry_admin') && (
                            <TableCell sx={{ width: '25%' }}>
                              <div className="font-medium">{row.institution.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {row.submitted_by.name}
                              </div>
                            </TableCell>
                          )}
                          <TableCell sx={{ width: '15%' }}>
                            <span>{getRelativeTime(row.created_at)}</span>
                          </TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <Badge className={getSeverityColor(row.severity_level)}>
                              {row.severity_level.charAt(0).toUpperCase() + row.severity_level.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  disabled={updatingIncident === row.id.toString()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleUpdateIncidentStatus(row.id, 'low')}
                                  disabled={updatingIncident === row.id.toString() || row.severity_level === 'low'}
                                >
                                  Set Low Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateIncidentStatus(row.id, 'medium')}
                                  disabled={updatingIncident === row.id.toString() || row.severity_level === 'medium'}
                                >
                                  Set Medium Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateIncidentStatus(row.id, 'high')}
                                  disabled={updatingIncident === row.id.toString() || row.severity_level === 'high'}
                                >
                                  Set High Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateIncidentStatus(row.id, 'critical')}
                                  disabled={updatingIncident === row.id.toString() || row.severity_level === 'critical'}
                                >
                                  Set Critical Priority
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {emptyRows > 0 && !loading && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={filteredHeadCells.length} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: filteredData.length }]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentListPage;
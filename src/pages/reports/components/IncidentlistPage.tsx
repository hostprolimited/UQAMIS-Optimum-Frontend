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
import { Search, AlertTriangle, Clock, CheckCircle, User } from 'lucide-react';

// Types for incidents
interface Incident {
  id: string;
  type: string;
  schoolName: string;
  time: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'Responding' | 'Resolved';
  description: string;
  reportedBy: string;
  timestamp: Date;
}

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

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | Date },
  b: { [key in Key]: number | string | Date },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Incident;
  label: string;
  numeric: boolean;
  width?: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'Type',
    width: '15%',
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
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
    width: '15%',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Incident) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Incident) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead className="bg-muted/50">
      <TableRow>
        {headCells.map((headCell) => (
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
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { searchTerm, onSearchChange, severityFilter, onSeverityFilterChange, statusFilter, onStatusFilterChange } = props;

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
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-10">
              <Clock className="h-4 w-4 mr-2 text-primary/80" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Responding">Responding</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Toolbar>
  );
}

const IncidentListPage = () => {
  const { toast } = useToast();
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Incident>('timestamp');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Mock data for incidents
  React.useEffect(() => {
    const mockIncidents: Incident[] = [
      {
        id: '1',
        type: 'Fire',
        schoolName: 'Kawangware Primary',
        time: '2 mins ago',
        severity: 'High',
        status: 'New',
        description: 'Small fire reported in the chemistry lab',
        reportedBy: 'John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: '2',
        type: 'Injury',
        schoolName: 'Mwiki Secondary',
        time: '30 mins ago',
        severity: 'Medium',
        status: 'Responding',
        description: 'Student injured during sports activity',
        reportedBy: 'Jane Smith',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: '3',
        type: 'Gas Leak',
        schoolName: 'Kibera School',
        time: '10 mins ago',
        severity: 'Critical',
        status: 'Resolved',
        description: 'Gas leak detected in the science laboratory',
        reportedBy: 'Mike Johnson',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: '4',
        type: 'Electrical',
        schoolName: 'Westlands Academy',
        time: '1 hour ago',
        severity: 'High',
        status: 'New',
        description: 'Electrical fault in the main building',
        reportedBy: 'Sarah Wilson',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: '5',
        type: 'Flooding',
        schoolName: 'River Road Primary',
        time: '45 mins ago',
        severity: 'Medium',
        status: 'Responding',
        description: 'Water leakage in the basement',
        reportedBy: 'David Brown',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: '6',
        type: 'Medical',
        schoolName: 'Nairobi Central School',
        time: '15 mins ago',
        severity: 'Low',
        status: 'Resolved',
        description: 'Student feeling unwell in class',
        reportedBy: 'Emma Davis',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setIncidents(mockIncidents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = React.useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = searchTerm.toLowerCase() === '' ||
                            incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchTerm, severityFilter, statusFilter]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Incident,
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
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Responding': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


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
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
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
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="py-10">
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
                        <TableCell colSpan={5} align="center" className="py-10">
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
                          <TableCell sx={{ width: '15%' }}>
                            <span>{row.type}</span>
                          </TableCell>
                          <TableCell sx={{ width: '25%' }}>
                            <div className="font-medium">{row.schoolName}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {row.reportedBy}
                            </div>
                          </TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <span>{row.time}</span>
                          </TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <Badge className={getSeverityColor(row.severity)}>
                              {row.severity}
                            </Badge>
                          </TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <Badge className={getStatusColor(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {emptyRows > 0 && !loading && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={5} />
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
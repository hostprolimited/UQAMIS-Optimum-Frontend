import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { visuallyHidden } from '@mui/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { Plus, MoreHorizontal, Edit, Trash2, Filter, Search, Building } from 'lucide-react';
import { getSchoolEntities, deleteSchoolEntity } from '../core/_requests';
import { getFacilities } from '../../assements/core/_request';
import { Facility } from '../../assements/core/_model';

// Types for entities
interface Entity {
  id: string;
  facilityName: string;
  facilityType: string;
  number: number;
  details: any; // Store the original data for editing
}

interface ApiEntity {
  id: number;
  facility_id: number;
  institution_id: number;
  name: string;
  total: number;
  created_at: string;
  updated_at: string;
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
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Entity;
  label: string;
  numeric: boolean;
  width?: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'facilityName',
    numeric: false,
    disablePadding: false,
    label: 'Facility Name',
    width: '35%',
  },
  {
    id: 'facilityType',
    numeric: false,
    disablePadding: false,
    label: 'Entity Type',
    width: '50%',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Entity) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Entity) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead className="bg-muted/50">
      <TableRow>
        <TableCell padding="checkbox" sx={{ width: '5%' }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all entities',
            }}
          />
        </TableCell>
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
        <TableCell align="right" sx={{ width: '15%', fontWeight: 'bold' }}>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          minHeight: { xs: 56, sm: 64 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
          className="text-lg font-semibold"
        >
          Entities List
        </Typography>
      )}
    </Toolbar>
  );
}

const EntitiesListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useRole();
  const role = currentUser?.role;
  const [entities, setEntities] = React.useState<Entity[]>([]);
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedEntity, setSelectedEntity] = React.useState<Entity | null>(null);
  const [entityToDelete, setEntityToDelete] = React.useState<Entity | null>(null);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Entity>('facilityName');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [facilityFilter, setFacilityFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Fetch entities and facilities data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch facilities data for mapping facility_id to facility names
        const facilitiesResponse = await getFacilities();
        const facilitiesData = facilitiesResponse.data || [];
        setFacilities(facilitiesData);

        // Fetch entities data
        const entitiesResponse = await getSchoolEntities();
        const apiEntities: ApiEntity[] = entitiesResponse.data || [];

        // Transform API data to match our Entity interface
        const transformedEntities: Entity[] = apiEntities.map((apiEntity) => {
          // Find the facility name by facility_id
          const facility = facilitiesData.find(f => f.id === apiEntity.facility_id);
          const facilityName = facility ? facility.name : 'Unknown Facility';

          return {
            id: apiEntity.id.toString(),
            facilityName: facilityName,
            facilityType: apiEntity.name, // This contains "Grade 10 A" or "Physics Lab"
            number: apiEntity.total,
            details: apiEntity // Store original API data for editing
          };
        });

        setEntities(transformedEntities);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load entities data. Please try again.',
          variant: 'destructive',
        });
        setEntities([]);
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredData = React.useMemo(() => {
    return entities.filter((entity) => {
      const matchesFacility = facilityFilter === 'all' || entity.facilityName.toLowerCase() === facilityFilter.toLowerCase();
      const matchesSearch = searchTerm.toLowerCase() === '' ||
                            entity.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entity.facilityType.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFacility && matchesSearch;
    });
  }, [entities, facilityFilter, searchTerm]);

  const handleEdit = (entity: Entity) => {
    setSelectedEntity(entity);
    // TODO: Implement edit functionality
    toast({
      title: 'Edit',
      description: `Edit functionality for ${entity.facilityName} coming soon.`,
    });
  };

  const handleDeleteClick = (entity: Entity) => {
    setEntityToDelete(entity);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entityToDelete) return;

    try {
      // Call the delete API
      await deleteSchoolEntity(parseInt(entityToDelete.id));

      // Remove the entity from the list
      setEntities(prev => prev.filter(entity => entity.id !== entityToDelete.id));

      // Unselect the item if it was selected
      setSelected(prev => prev.filter(id => id !== entityToDelete.id));

      toast({
        title: 'Deleted',
        description: `${entityToDelete.facilityName} deleted successfully.`,
      });

      setShowDeleteDialog(false);
      setEntityToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error?.message || 'Failed to delete entity.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Entity,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddNew = () => {
    navigate('/facilities/add');
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

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
            <Building className="h-7 w-7 mr-3 text-primary" />
            Facility Entities
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track all facility entities and their details.
          </p>
        </div>
        {role === 'school_admin' && (
          <Button onClick={handleAddNew} variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Plus className="h-5 w-5 mr-2" />
            Add Entities
          </Button>
        )}
      </div>

      <Card className="shadow-md">
        <CardHeader className="py-4">
          <CardTitle className="text-xl">Entities List</CardTitle>
          <CardDescription>
            View, filter, and manage all facility entities.
          </CardDescription>
        </CardHeader>
        <CardContent>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">

            {/* Filters and Search - Left Side */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-[250px]">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by accessory or facility type..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className="pl-9 h-10 w-full"
                />
              </div>

              {/* Facility Filter */}
              <Select value={facilityFilter} onValueChange={(value) => {setFacilityFilter(value); setPage(0);}}>
                <SelectTrigger className="w-full sm:w-[150px] h-10">
                  <Filter className="h-4 w-4 mr-2 text-primary/80" />
                  <SelectValue placeholder="Facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="classroom">Classroom</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="toilet">Toilet</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                  <SelectItem value="dining hall">Dining Hall</SelectItem>
                  <SelectItem value="compound">Compound</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={0} className="border">
              <EnhancedTableToolbar
                numSelected={selected.length}
              />
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size='medium'
                >
                  <EnhancedTableHead
                    numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={filteredData.length}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" className="py-10">
                          <div className="flex justify-center items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading entities...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" className="py-10">
                          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                            <Building className="h-8 w-8" />
                            <p className="font-medium">No entities found</p>
                            <p className="text-sm">Try adjusting your filters or search term.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((row) => {
                        const isItemSelected = isSelected(row.id);
                        const labelId = `enhanced-table-checkbox-${row.id}`;

                        return (
                          <TableRow
                            hover
                            onClick={(event) => handleClick(event, row.id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha('#f5f5f5', 0.7) } }}
                          >
                            <TableCell padding="checkbox" sx={{ width: '5%' }}>
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                inputProps={{
                                  'aria-labelledby': labelId,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ width: '35%' }}>{row.facilityName}</TableCell>
                            <TableCell sx={{ width: '50%' }}>{row.facilityType}</TableCell>
                            <TableCell align="right" sx={{ width: '10%' }}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <IconButton size="small" aria-label="More actions" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                                  </IconButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleEdit(row);}} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteClick(row);}} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem> */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    {emptyRows > 0 && !loading && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={4} />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-6 w-6 mr-2" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the entity
              "{entityToDelete?.facilityName} - {entityToDelete?.facilityType}" and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EntitiesListPage;
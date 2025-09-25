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
import Tooltip from '@mui/material/Tooltip';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getSchoolMetrics, updateSchoolMetrics, deleteSchoolMetrics } from '../core/_request';
import { SchoolMetric } from '../core/_model';
import { Plus, MoreHorizontal, Users, GraduationCap, Calendar, Clock, Edit, Trash2, Filter, Download, FileText, FileSpreadsheet, File } from 'lucide-react';

// Types
interface SchoolForm {
  id: number;
  numberOfTeachers: number;
  numberOfStudents: number;
  term: string;
  year: string;
  createdAt: string;
}

// Mock data
const mockSchoolForms: SchoolForm[] = [
  {
    id: 1,
    numberOfTeachers: 25,
    numberOfStudents: 500,
    term: '1',
    year: '2024',
    createdAt: '2024-09-01',
  },
  {
    id: 2,
    numberOfTeachers: 30,
    numberOfStudents: 650,
    term: '2',
    year: '2024',
    createdAt: '2024-04-15',
  },
  {
    id: 3,
    numberOfTeachers: 22,
    numberOfStudents: 420,
    term: '3',
    year: '2024',
    createdAt: '2024-11-20',
  },
  {
    id: 4,
    numberOfTeachers: 28,
    numberOfStudents: 580,
    term: '1',
    year: '2025',
    createdAt: '2025-01-10',
  },
];

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
  id: keyof SchoolForm;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'numberOfStudents',
    numeric: true,
    disablePadding: false,
    label: 'Students',
  },
  {
    id: 'term',
    numeric: false,
    disablePadding: false,
    label: 'Term',
  },
  {
    id: 'year',
    numeric: false,
    disablePadding: false,
    label: 'Year',
  },
  {
    id: 'numberOfTeachers',
    numeric: true,
    disablePadding: false,
    label: 'Teachers',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof SchoolForm) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof SchoolForm) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" sx={{ width: '5%' }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all school forms',
            }}
          />
        </TableCell>
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: index === 0 ? '20%' : index === 1 ? '15%' : index === 2 ? '15%' : '20%' }}
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
        <TableCell align="right" sx={{ width: '25%' }}>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  onAddNew: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportWord: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, onAddNew, onExportPDF, onExportExcel, onExportWord } = props;

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
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
      ) : null}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download style={{ width: '16px', height: '16px', marginRight: '4px' }} />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportPDF}>
              <FileText style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportWord}>
              <File style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Export as Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Toolbar>
  );
}

// Form schema for editing
const editSchoolFormSchema = z.object({
  numberOfTeachers: z.number().min(1, 'Number of teachers must be at least 1').max(1000, 'Number of teachers seems too high'),
  numberOfStudents: z.number().min(1, 'Number of students must be at least 1').max(10000, 'Number of students seems too high'),
  term: z.string().min(1, 'Please select a term'),
  year: z.string().min(1, 'Please select a year'),
});

type EditSchoolFormData = z.infer<typeof editSchoolFormSchema>;

const SchoolFormListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schoolForms, setSchoolForms] = React.useState<SchoolForm[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedForm, setSelectedForm] = React.useState<SchoolForm | null>(null);
  const [formToDelete, setFormToDelete] = React.useState<SchoolForm | null>(null);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof SchoolForm>('numberOfStudents');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [termFilter, setTermFilter] = React.useState<string>('all');
  const [yearFilter, setYearFilter] = React.useState<string>('all');

  // Fetch school metrics on component mount
  React.useEffect(() => {
    const fetchSchoolMetrics = async () => {
      try {
        setLoading(true);
        const response = await getSchoolMetrics();
        if (response.status === 'success') {
          const mappedData: SchoolForm[] = response.data.map((metric: SchoolMetric) => ({
            id: metric.id,
            numberOfTeachers: metric.teachers_count,
            numberOfStudents: metric.students_count,
            term: metric.term,
            year: metric.year.toString(),
            createdAt: metric.created_at,
          }));
          setSchoolForms(mappedData);
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to fetch school metrics',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to fetch school metrics',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolMetrics();
  }, [toast]);

  // Filter the data based on selected filters
  const filteredData = React.useMemo(() => {
    return schoolForms.filter((form) => {
      const matchesTerm = termFilter === 'all' || form.term === termFilter;
      const matchesYear = yearFilter === 'all' || form.year === yearFilter;
      return matchesTerm && matchesYear;
    });
  }, [schoolForms, termFilter, yearFilter]);

  const editForm = useForm<EditSchoolFormData>({
    resolver: zodResolver(editSchoolFormSchema),
    defaultValues: {
      numberOfTeachers: 0,
      numberOfStudents: 0,
      term: '',
      year: '',
    },
  });


  const handleEdit = (form: SchoolForm) => {
    setSelectedForm(form);
    editForm.reset({
      numberOfTeachers: form.numberOfTeachers,
      numberOfStudents: form.numberOfStudents,
      term: form.term,
      year: form.year,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (form: SchoolForm) => {
    setFormToDelete(form);
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async (data: EditSchoolFormData) => {
    if (!selectedForm) return;

    try {
      const response = await updateSchoolMetrics(selectedForm.id, {
        students_count: data.numberOfStudents,
        teachers_count: data.numberOfTeachers,
      });

      if (response.status === 'success') {
        // Update the form in the list
        setSchoolForms(prev =>
          prev.map(form =>
            form.id === selectedForm.id
              ? { ...form, ...data }
              : form
          )
        );

        toast({
          title: 'Success',
          description: 'School form updated successfully',
        });

        setShowEditModal(false);
        setSelectedForm(null);
      } else {
        throw new Error(response.message || 'Failed to update school form');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update school form',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;

    try {
      const response = await deleteSchoolMetrics(formToDelete.id);

      if (response.status === 'success') {
        // Remove the form from the list
        setSchoolForms(prev => prev.filter(form => form.id !== formToDelete.id));

        toast({
          title: 'Success',
          description: 'School form deleted successfully',
        });

        setShowDeleteDialog(false);
        setFormToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete school form');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete school form',
        variant: 'destructive',
      });
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof SchoolForm,
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

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

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
    navigate('/school-form/add');
  };

  // Export functions
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    if (filteredData.length === 0) {
      doc.text('No data to export', 20, 20);
    } else {
      const headers = ['Number of Students', 'Term', 'Year', 'Number of Teachers'];
      const rows = filteredData.map(row => [
        row.numberOfStudents,
        `Term ${row.term}`,
        row.year,
        row.numberOfTeachers
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save('school-forms.pdf');
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const { saveAs } = await import('file-saver');

    const exportData = filteredData.map(row => ({
      'Number of Students': row.numberOfStudents,
      'Term': `Term ${row.term}`,
      'Year': row.year,
      'Number of Teachers': row.numberOfTeachers,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'School Forms');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'school-forms.xlsx');
  };

  const exportToWord = async () => {
    const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = await import('docx');
    const { saveAs } = await import('file-saver');

    if (filteredData.length === 0) {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [new Paragraph({ children: [new TextRun("No data to export")] })]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'school-forms.docx');
      return;
    }

    const headers = ['Number of Students', 'Term', 'Year', 'Number of Teachers'];

    const table = new Table({
      rows: [
        new TableRow({
          children: headers.map(header =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })]
            })
          )
        }),
        ...filteredData.map(row =>
          new TableRow({
            children: [
              row.numberOfStudents,
              `Term ${row.term}`,
              row.year,
              row.numberOfTeachers
            ].map(cellValue =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(String(cellValue))] })]
              })
            )
          })
        )
      ]
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [table]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'school-forms.docx');
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...filteredData]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredData],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">School Forms</h1>
          <p className="text-muted-foreground">
            Manage school statistics and information
          </p>
        </div>
        <Button onClick={handleAddNew} variant="default" size="sm">
          <Plus style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          Add School Info
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Forms List</CardTitle>
          <CardDescription>
            View and manage all submitted school forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex items-center space-x-2 py-4">
            {/* Term Filter */}
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="1">Term 1</SelectItem>
                <SelectItem value="2">Term 2</SelectItem>
                <SelectItem value="3">Term 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <EnhancedTableToolbar
                numSelected={selected.length}
                onAddNew={handleAddNew}
                onExportPDF={exportToPDF}
                onExportExcel={exportToExcel}
                onExportWord={exportToWord}
              />
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
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
                        <TableCell colSpan={6} align="center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No school forms found
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((row, index) => {
                        const isItemSelected = selected.includes(row.id);
                        const labelId = `enhanced-table-checkbox-${index}`;

                        return (
                          <TableRow
                            hover
                            onClick={(event) => handleClick(event, row.id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            sx={{ cursor: 'pointer' }}
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
                            <TableCell align="right" sx={{ width: '20%' }}>{row.numberOfStudents}</TableCell>
                            <TableCell sx={{ width: '15%' }}>{`Term ${row.term}`}</TableCell>
                            <TableCell sx={{ width: '15%' }}>{row.year}</TableCell>
                            <TableCell align="right" sx={{ width: '20%' }}>{row.numberOfTeachers}</TableCell>
                            <TableCell align="right" sx={{ width: '25%' }}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <IconButton size="small">
                                    <MoreHorizontal />
                                  </IconButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(row)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(row)} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    {emptyRows > 0 && !loading && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit School Form</DialogTitle>
            <DialogDescription>
              Update the school form details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="numberOfTeachers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Number of Teachers</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="numberOfStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Number of Students</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Term</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Term 1</SelectItem>
                          <SelectItem value="2">Term 2</SelectItem>
                          <SelectItem value="3">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Year</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  Update Form
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the school form
              for Term {formToDelete?.term} {formToDelete?.year}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolFormListPage;
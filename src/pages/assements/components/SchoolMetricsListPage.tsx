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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getSchoolMetrics, updateSchoolMetrics, deleteSchoolMetrics } from '../core/_request';
import { SchoolMetric } from '../core/_model';
import { Plus, MoreHorizontal, Users, GraduationCap, Calendar, Clock, Edit, Trash2, Filter, Download, FileText, FileSpreadsheet, File, Search } from 'lucide-react';

// Types
interface SchoolForm {
  id: number;
  numberOfTeachers: number;
  numberOfStudents: number;
  term: string;
  year: string;
  createdAt: string;
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
  id: keyof SchoolForm;
  label: string;
  numeric: boolean;
  width?: string; // Add width property for custom column widths
}

// Re-order and set custom widths for columns
const headCells: readonly HeadCell[] = [
  {
    id: 'numberOfTeachers',
    numeric: true,
    disablePadding: false,
    label: 'Teachers',
    width: '15%',
  },
  {
    id: 'numberOfStudents',
    numeric: true,
    disablePadding: false,
    label: 'Students',
    width: '15%',
  },
  {
    id: 'term',
    numeric: false,
    disablePadding: false,
    label: 'Term',
    width: '15%',
  },
  {
    id: 'year',
    numeric: false,
    disablePadding: false,
    label: 'Year',
    width: '15%',
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
    <TableHead className="bg-muted/50">
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
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, fontWeight: 'bold' }} // Apply custom width and bold header text
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
        {/* Adjusted width for Actions column */}
        <TableCell align="right" sx={{ width: '15%', fontWeight: 'bold' }}>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

// Simplified Toolbar to only show selection count, as export is moved
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
          School Forms
        </Typography>
      )}
    </Toolbar>
  );
}

// Form schema for editing (no change, but kept for completeness)
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
  const [searchTerm, setSearchTerm] = React.useState<string>(''); // New state for search

  // Fetch school metrics on component mount (No change needed)
  React.useEffect(() => {
    const fetchSchoolMetrics = async () => {
      try {
        setLoading(true);
        // Simulate a delay for a better loading experience
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const response = await getSchoolMetrics();
        if (response.status === 'success') {
          const mappedData: SchoolForm[] = response.data.map((metric: SchoolMetric) => ({
            id: metric.id,
            numberOfTeachers: metric.teachers_count,
            numberOfStudents: metric.students_count,
            term: metric.term.replace('Term ', ''),
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
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolMetrics();
  }, [toast]);

  // Filter the data based on selected filters AND search term
  const filteredData = React.useMemo(() => {
    return schoolForms.filter((form) => {
      const matchesTerm = termFilter === 'all' || form.term === termFilter;
      const matchesYear = yearFilter === 'all' || form.year === yearFilter;
      const matchesSearch = searchTerm.toLowerCase() === '' || 
                            form.year.includes(searchTerm) ||
                            `Term ${form.term}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            String(form.numberOfStudents).includes(searchTerm) ||
                            String(form.numberOfTeachers).includes(searchTerm);
      
      return matchesTerm && matchesYear && matchesSearch;
    });
  }, [schoolForms, termFilter, yearFilter, searchTerm]);

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
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await updateSchoolMetrics(selectedForm.id, {
        students_count: data.numberOfStudents,
        teachers_count: data.numberOfTeachers,
        metric_id: selectedForm.id,
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
          title: ' Success',
          description: 'School form updated successfully.',
        });

        setShowEditModal(false);
        setSelectedForm(null);
      } else {
        throw new Error(response.message || 'Failed to update school form');
      }
    } catch (error: any) {
      toast({
        title: ' Error',
        description: error?.message || 'Failed to update school form.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await deleteSchoolMetrics(formToDelete.id);

      if (response.status === 'success') {
        // Remove the form from the list
        setSchoolForms(prev => prev.filter(form => form.id !== formToDelete.id));

        // Unselect the item if it was selected
        setSelected(prev => prev.filter(id => id !== formToDelete.id));

        toast({
          title: '🗑️ Deleted',
          description: 'School form deleted successfully.',
        });

        setShowDeleteDialog(false);
        setFormToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete school form');
      }
    } catch (error: any) {
      toast({
        title: '⚠️ Error',
        description: error?.message || 'Failed to delete school form.',
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
    navigate('/school-metrics/add');
  };

  // Export functions (Ensure proper dynamic import structure)
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();

      if (filteredData.length === 0) {
        doc.text('No data to export', 20, 20);
      } else {
        const headers = ['Number of Teachers', 'Number of Students', 'Term', 'Year'];
        const rows = filteredData.map(row => [
          row.numberOfTeachers,
          row.numberOfStudents,
          `Term ${row.term}`,
          row.year,
        ]);

        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 20,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
          theme: 'striped',
        });
      }

      doc.save('school-forms.pdf');
    } catch (error) {
       toast({ title: 'Export Error', description: 'Failed to export PDF.', variant: 'destructive' });
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');

      const exportData = filteredData.map(row => ({
        'Number of Teachers': row.numberOfTeachers,
        'Number of Students': row.numberOfStudents,
        'Term': `Term ${row.term}`,
        'Year': row.year,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'School Forms');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'school-forms.xlsx');
    } catch (error) {
      toast({ title: 'Export Error', description: 'Failed to export Excel.', variant: 'destructive' });
    }
  };

  const exportToWord = async () => {
    try {
      const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType } = await import('docx');
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

      const headers = ['Number of Teachers', 'Number of Students', 'Term', 'Year'];

      const table = new Table({
        rows: [
          new TableRow({
            children: headers.map(header =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })], alignment: AlignmentType.CENTER })],
                verticalAlign: 'center',
              })
            ),
            tableHeader: true,
          }),
          ...filteredData.map(row =>
            new TableRow({
              children: [
                row.numberOfTeachers,
                row.numberOfStudents,
                `Term ${row.term}`,
                row.year
              ].map(cellValue =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun(String(cellValue))] })]
                })
              )
            })
          )
        ],
        width: {
          size: 100,
          // type: "percent",
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "School Forms Report",
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            table
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'school-forms.docx');
    } catch (error) {
      toast({ title: 'Export Error', description: 'Failed to export Word document.', variant: 'destructive' });
    }
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

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
            <GraduationCap className="h-7 w-7 mr-3 text-primary" />
            School Metrics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage school statistics per term and year.
          </p>
        </div>
        <Button onClick={handleAddNew} variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Plus className="h-5 w-5 mr-2" />
          Add School Info
        </Button>
      </div>

      {/* --- */}

      <Card className="shadow-md">
        <CardHeader className="py-4">
          <CardTitle className="text-xl">School Forms List</CardTitle>
          <CardDescription>
            View, filter, and export all submitted school records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Filter, Search, and Export Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
            
            {/* Filters and Search - Left Side */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-[250px]">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by year, term, or count..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0); // Reset page on search
                  }}
                  className="pl-9 h-10 w-full"
                />
              </div>

              {/* Term Filter */}
              <Select value={termFilter} onValueChange={(value) => {setTermFilter(value); setPage(0);}}>
                <SelectTrigger className="w-full sm:w-[130px] h-10">
                  <Filter className="h-4 w-4 mr-2 text-primary/80" />
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
              <Select value={yearFilter} onValueChange={(value) => {setYearFilter(value); setPage(0);}}>
                <SelectTrigger className="w-full sm:w-[120px] h-10">
                  <Calendar className="h-4 w-4 mr-2 text-primary/80" />
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

            {/* Export Menu - Right Side */}
            <div className="flex justify-end w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 text-primary border-primary hover:bg-primary/5">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-red-500" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToWord} className="cursor-pointer">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    Export as Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* --- */}
          
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
                        <TableCell colSpan={6} align="center" className="py-10">
                          <div className="flex justify-center items-center space-x-2">
                            {/* Simple Loading Spinner */}
                            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Fetching school metrics...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" className="py-10">
                          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <p className="font-medium">No school forms found</p>
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
                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha('#f5f5f5', 0.7) } }} // Improved hover effect
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
                            {/* Re-ordered and fixed spacing cells */}
                            <TableCell align="right" sx={{ width: '15%' }}>{row.numberOfTeachers}</TableCell>
                            <TableCell align="right" sx={{ width: '15%' }}>{row.numberOfStudents}</TableCell>
                            <TableCell sx={{ width: '15%' }}>{`Term ${row.term}`}</TableCell>
                            <TableCell sx={{ width: '15%' }}>{row.year}</TableCell>
                            <TableCell align="right" sx={{ width: '15%' }}>
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
                                  <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteClick(row);}} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
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

      {/* --- */}

      {/* Edit Modal (no major changes, kept for completeness) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit School Form</DialogTitle>
            <DialogDescription>
              Update the school form details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="numberOfTeachers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-semibold">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <span>Number of Teachers</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 50"
                          // Fix for controlled number input: field.value is number|undefined, but onChange expects number|undefined
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
                      <FormLabel className="flex items-center space-x-2 font-semibold">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        <span>Number of Students</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 1200"
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
                      <FormLabel className="flex items-center space-x-2 font-semibold">
                        <Clock className="h-4 w-4 text-orange-500" />
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
                      <FormLabel className="flex items-center space-x-2 font-semibold">
                        <Calendar className="h-4 w-4 text-blue-500" />
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
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (no major changes, kept for completeness) */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-6 w-6 mr-2" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the school form
              for **Term {formToDelete?.term} {formToDelete?.year}** and remove its data from our servers.
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

export default SchoolFormListPage;
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
import { useRole } from '@/contexts/RoleContext';
import { getTermDates, updateTermDates, deleteTermDates } from '../core/_requests';
import { termDateData } from '../core/_models';
import { Plus, MoreHorizontal, Calendar, Clock, Edit, Trash2, Filter, Download, FileText, FileSpreadsheet, File, Search } from 'lucide-react';

// Types
interface TermDate {
  id: number;
  term: string;
  openingDate: string;
  closingDate: string;
  year: number;
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
  id: keyof TermDate;
  label: string;
  numeric: boolean;
  width?: string;
}

// Re-order and set custom widths for columns
const headCells: readonly HeadCell[] = [
  {
    id: 'term',
    numeric: false,
    disablePadding: false,
    label: 'Term',
    width: '20%',
  },
  {
    id: 'openingDate',
    numeric: false,
    disablePadding: false,
    label: 'Opening Date',
    width: '25%',
  },
  {
    id: 'closingDate',
    numeric: false,
    disablePadding: false,
    label: 'Closing Date',
    width: '25%',
  },
  {
    id: 'year',
    numeric: true,
    disablePadding: false,
    label: 'Year',
    width: '15%',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof TermDate) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof TermDate) => (event: React.MouseEvent<unknown>) => {
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
              'aria-label': 'select all term dates',
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

         
        <TableCell align="right" sx={{ width: '10%', fontWeight: 'bold' }}>Actions</TableCell>
        
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
          Term Dates
        </Typography>
      )}
    </Toolbar>
  );
}

// Form schema for editing
const editTermDateSchema = z.object({
  term: z.string().min(1, 'Please select a term'),
  openingDate: z.string().min(1, 'Opening date is required'),
  closingDate: z.string().min(1, 'Closing date is required'),
  year: z.number().min(2000, 'Year must be at least 2000').max(2100, 'Year seems too high'),
});

type EditTermDateData = z.infer<typeof editTermDateSchema>;

const TermDateListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [termDates, setTermDates] = React.useState<TermDate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<TermDate | null>(null);
  const [dateToDelete, setDateToDelete] = React.useState<TermDate | null>(null);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof TermDate>('term');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [termFilter, setTermFilter] = React.useState<string>('all');
  const [yearFilter, setYearFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Fetch term dates on component mount
  React.useEffect(() => {
    const fetchTermDates = async () => {
      try {
        setLoading(true);
        const response = await getTermDates();
        // Transform API data to component format
        const transformedData: TermDate[] = response.term_dates.map((item: any) => ({
          id: item.id,
          term: item.term_number.toString(),
          openingDate: item.opening_date.split('T')[0],
          closingDate: item.closing_date.split('T')[0],
          year: item.year,
          createdAt: item.created_at,
        }));
        setTermDates(transformedData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to load term dates.',
          variant: 'destructive',
        });
        setTermDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTermDates();
  }, [toast]);

  // Filter the data based on selected filters AND search term
  const filteredData = React.useMemo(() => {
    return termDates.filter((date) => {
      const matchesTerm = termFilter === 'all' || date.term === termFilter;
      const matchesYear = yearFilter === 'all' || date.year.toString() === yearFilter;
      const matchesSearch = searchTerm.toLowerCase() === '' ||
                            date.term.includes(searchTerm) ||
                            date.year.toString().includes(searchTerm) ||
                            date.openingDate.includes(searchTerm) ||
                            date.closingDate.includes(searchTerm);

      return matchesTerm && matchesYear && matchesSearch;
    });
  }, [termDates, termFilter, yearFilter, searchTerm]);

  const editForm = useForm<EditTermDateData>({
    resolver: zodResolver(editTermDateSchema),
    defaultValues: {
      term: '',
      openingDate: '',
      closingDate: '',
      year: new Date().getFullYear(),
    },
  });

  const handleEdit = (date: TermDate) => {
    setSelectedDate(date);
    editForm.reset({
      term: date.term,
      openingDate: date.openingDate,
      closingDate: date.closingDate,
      year: date.year,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (date: TermDate) => {
    setDateToDelete(date);
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async (data: EditTermDateData) => {
    if (!selectedDate) return;

    try {
      const apiData: termDateData = {
        id: selectedDate.id,
        term_number: data.term,
        opening_date: data.openingDate,
        closing_date: data.closingDate,
        year: data.year.toString(),
      };

      await updateTermDates(selectedDate.id, apiData);

      // Update local state
      setTermDates(prev =>
        prev.map(date =>
          date.id === selectedDate.id
            ? { ...date, term: data.term, openingDate: data.openingDate, closingDate: data.closingDate, year: data.year }
            : date
        )
      );

      toast({
        title: 'Success',
        description: 'Term date updated successfully.',
      });

      setShowEditModal(false);
      setSelectedDate(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update term date.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dateToDelete) return;

    try {
      await deleteTermDates(dateToDelete.id);

      // Remove the date from the list
      setTermDates(prev => prev.filter(date => date.id !== dateToDelete.id));

      // Unselect the item if it was selected
      setSelected(prev => prev.filter(id => id !== dateToDelete.id));

      toast({
        title: 'Deleted',
        description: 'Term date deleted successfully.',
      });

      setShowDeleteDialog(false);
      setDateToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete term date.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof TermDate,
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
    navigate('/termly-dates/add');
  };

  // Export functions
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();

      if (filteredData.length === 0) {
        doc.text('No data to export', 20, 20);
      } else {
        const headers = ['Term', 'Opening Date', 'Closing Date', 'Year'];
        const rows = filteredData.map(row => [
          `Term ${row.term}`,
          row.openingDate,
          row.closingDate,
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

      doc.save('term-dates.pdf');
    } catch (error) {
       toast({ title: 'Export Error', description: 'Failed to export PDF.', variant: 'destructive' });
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');

      const exportData = filteredData.map(row => ({
        'Term': `Term ${row.term}`,
        'Opening Date': row.openingDate,
        'Closing Date': row.closingDate,
        'Year': row.year,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Term Dates');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'term-dates.xlsx');
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
        saveAs(blob, 'term-dates.docx');
        return;
      }

      const headers = ['Term', 'Opening Date', 'Closing Date', 'Year'];

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
                `Term ${row.term}`,
                row.openingDate,
                row.closingDate,
                row.year.toString()
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
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Term Dates Report",
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            table
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'term-dates.docx');
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
            <Calendar className="h-7 w-7 mr-3 text-primary" />
            Term Dates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track term opening and closing dates.
          </p>
        </div>
        {(currentUser?.role === 'ministry_admin') && (
          <Button onClick={handleAddNew} variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Plus className="h-5 w-5 mr-2" />
            Add Term Date
          </Button>
        )}
      </div>

      <Card className="shadow-md">
        <CardHeader className="py-4">
          <CardTitle className="text-xl">Term Dates List</CardTitle>
          <CardDescription>
            View, filter, and export all term date records.
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
                  placeholder="Search by term, year, or date..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
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
                        <TableCell colSpan={5} align="center" className="py-10">
                          <div className="flex justify-center items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Fetching term dates...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="py-10">
                          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <p className="font-medium">No term dates found</p>
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
                            <TableCell sx={{ width: '20%' }}>{`Term ${row.term}`}</TableCell>
                            <TableCell sx={{ width: '25%' }}>{row.openingDate}</TableCell>
                            <TableCell sx={{ width: '25%' }}>{row.closingDate}</TableCell>
                            <TableCell align="right" sx={{ width: '15%' }}>{row.year}</TableCell>
                            <TableCell align="right" sx={{ width: '10%' }}>

                              {(currentUser?.role === 'ministry_admin') && (
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
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Term Date</DialogTitle>
            <DialogDescription>
              Update the term date details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
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
                  name="openingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-semibold">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>Opening Date</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-semibold">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>Closing Date</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
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
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>Year</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 2025"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-6 w-6 mr-2" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the term date
              for **Term {dateToDelete?.term} {dateToDelete?.year}** and remove its data from our servers.
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

export default TermDateListPage;
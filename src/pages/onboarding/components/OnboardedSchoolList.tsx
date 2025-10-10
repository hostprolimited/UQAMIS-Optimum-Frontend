import React, { useEffect, useState } from 'react';
import { getInstitutions } from '../core/_requests';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Plus, Download, Eye, MoreHorizontal } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '@/utils/api';
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

interface Institution {
  id: number;
  name: string;
  county: string;
  subcounty: string;
  ward?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  status?: string;
  type?: string;
  gender_based?: string;
  boarding_type?: string;
  total_students?: number;
  created_at?: string;
  updated_at?: string;
  total_submitted_assessments?: number;
  total_entities_for_assessment?: number;
  assessment_completion_percentage?: string;
}

const OnboardedSchoolList: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof Institution>('assessment_completion_percentage');
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [subcountyFilter, setSubcountyFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [percentageRange, setPercentageRange] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const fetchInstitutions = async () => {
  setLoading(true);
  try {
    const data = await getInstitutions();
    // If your API returns { institutions: [...] }
    setInstitutions(Array.isArray(data.institutions) ? data.institutions : []);
  } catch (e) {
    setInstitutions([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleSort = (key: keyof Institution) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.county.toLowerCase().includes(search.toLowerCase()) ||
      (inst.subcounty?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCounty = countyFilter ? inst.county === countyFilter : true;
    const matchesSubcounty = subcountyFilter ? inst.subcounty === subcountyFilter : true;
    const matchesWard = wardFilter ? inst.ward === wardFilter : true;
    const matchesPercentage = () => {
      if (!percentageRange) return true;
      const percentage = parseFloat(inst.assessment_completion_percentage || '0');
      switch (percentageRange) {
        case 'below25': return percentage < 25;
        case '25to50': return percentage >= 25 && percentage < 50;
        case '50to75': return percentage >= 50 && percentage < 75;
        case '75to100': return percentage >= 75;
        default: return true;
      }
    };
    return matchesSearch && matchesCounty && matchesSubcounty && matchesWard && matchesPercentage();
  });

  const sortedInstitutions = [...filteredInstitutions].sort((a, b) => {
    const numericKeys = ['total_students', 'total_submitted_assessments', 'total_entities_for_assessment', 'assessment_completion_percentage'];
    if (numericKeys.includes(sortKey)) {
      const aNum = parseFloat(a[sortKey] as string) || 0;
      const bNum = parseFloat(b[sortKey] as string) || 0;
      return sortAsc ? aNum - bNum : bNum - aNum;
    } else {
      const aStr = (a[sortKey] as string) || '';
      const bStr = (b[sortKey] as string) || '';
      if (aStr < bStr) return sortAsc ? -1 : 1;
      if (aStr > bStr) return sortAsc ? 1 : -1;
      return 0;
    }
  });

  const visibleInstitutions = React.useMemo(
    () => sortedInstitutions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedInstitutions, page, rowsPerPage]
  );

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the institution!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/institutions/${id}`);
        setInstitutions(institutions.filter(inst => inst.id !== id));
        MySwal.fire('Deleted!', 'Institution has been deleted.', 'success');
      } catch (e) {
        MySwal.fire('Error', 'Failed to delete institution.', 'error');
      }
    }
  };

  // Dummy export handlers (replace with real export logic as needed)
  const handleExport = (type: 'pdf' | 'excel') => {
    MySwal.fire('Export', `Exporting as ${type.toUpperCase()} (not implemented)`, 'info');
  };

  // Get unique counties, subcounties, and wards for filter dropdowns
  const countyOptions = Array.from(new Set(institutions.map(i => i.county))).filter(Boolean);
  const subcountyOptions = Array.from(new Set(institutions.map(i => i.subcounty))).filter(Boolean);
  const wardOptions = Array.from(new Set(institutions.map(i => i.ward))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Content Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Institutions</h1>
          <p className="text-muted-foreground text-sm">Browse, filter, and manage all onboarded schools and institutions.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button className="bg-primary text-primary-foreground flex items-center" onClick={() => navigate('/onboard')}>
            <Plus className="h-4 w-4 mr-1" /> Onboard School
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name, county, or subcounty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <select
          value={countyFilter}
          onChange={e => setCountyFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-48"
        >
          <option value="">All Counties</option>
          {countyOptions.map((county) => {
            return <option key={county} value={county}>{county}</option>;
          })}
        </select>
        <select
          value={subcountyFilter}
          onChange={e => setSubcountyFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-48"
        >
          <option value="">All Subcounties</option>
          {subcountyOptions.map((subcounty) => {
            return <option key={subcounty} value={subcounty}>{subcounty}</option>;
          })}
        </select>
        <select
          value={wardFilter}
          onChange={e => setWardFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-48"
        >
          <option value="">All Wards</option>
          {wardOptions.map((ward) => {
            return <option key={ward} value={ward}>{ward}</option>;
          })}
        </select>
        <select
          value={percentageRange}
          onChange={e => setPercentageRange(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-48"
        >
          <option value="">All Percentages</option>
          <option value="below25">Below 25%</option>
          <option value="25to50">25% - 50%</option>
          <option value="50to75">50% - 75%</option>
          <option value="75to100">75% - 100%</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selected.length === sortedInstitutions.length && sortedInstitutions.length > 0}
                  onChange={e => setSelected(e.target.checked ? sortedInstitutions.map(i => i.id) : [])}
                />
              </TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Name {sortKey === 'name' && (sortAsc ? '▲' : '▼')}</TableHead>
              <TableHead onClick={() => handleSort('county')} className="cursor-pointer">County {sortKey === 'county' && (sortAsc ? '▲' : '▼')}</TableHead>
              <TableHead onClick={() => handleSort('subcounty')} className="cursor-pointer">Subcounty {sortKey === 'subcounty' && (sortAsc ? '▲' : '▼')}</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Assessments</TableHead>
              <TableHead>Total Entities</TableHead>
              <TableHead onClick={() => handleSort('assessment_completion_percentage')} className="cursor-pointer">Completion % {sortKey === 'assessment_completion_percentage' && (sortAsc ? '▲' : '▼')}</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : sortedInstitutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">No institutions found.</TableCell>
              </TableRow>
            ) : (
              visibleInstitutions.map(inst => (
                <TableRow key={inst.id} className={selected.includes(inst.id) ? 'bg-muted/30' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(inst.id)}
                      onChange={() => handleSelect(inst.id)}
                    />
                  </TableCell>
                  <TableCell>{inst.name}</TableCell>
                  <TableCell>{inst.county}</TableCell>
                  <TableCell>{inst.subcounty}</TableCell>
                  <TableCell>{inst.type}</TableCell>
                  <TableCell>{inst.gender_based}</TableCell>
                  <TableCell>{inst.status}</TableCell>
                  <TableCell className="text-center">{inst.total_submitted_assessments || 0}</TableCell>
                  <TableCell className="text-center">{inst.total_entities_for_assessment || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${parseFloat(inst.assessment_completion_percentage || '0')}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{parseFloat(inst.assessment_completion_percentage || '0').toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate(`/assessments/view/${inst.id}`)}>
                          Review this school
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: update logic */}}>
                          Edit
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => handleDelete(inst.id)} className="text-destructive">
                          Delete
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading && sortedInstitutions.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, sortedInstitutions.length)} of {sortedInstitutions.length}
              </span>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangePage(page + 1)}
                  disabled={(page + 1) * rowsPerPage >= sortedInstitutions.length}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardedSchoolList;

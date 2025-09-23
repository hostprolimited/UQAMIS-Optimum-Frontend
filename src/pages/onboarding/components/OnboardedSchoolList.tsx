import React, { useEffect, useState } from 'react';
import { getInstitutions } from '../core/_requests';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Download } from 'lucide-react';
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
}

const OnboardedSchoolList: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof Institution>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
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
    return matchesSearch && matchesCounty;
  });

  const sortedInstitutions = [...filteredInstitutions].sort((a, b) => {
    const aValue = a[sortKey] || '';
    const bValue = b[sortKey] || '';
    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

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
  const handleExport = (type: 'pdf' | 'excel' | 'docs') => {
    MySwal.fire('Export', `Exporting as ${type.toUpperCase()} (not implemented)`, 'info');
  };

  // Get unique counties for filter dropdown
  const countyOptions = Array.from(new Set(institutions.map(i => i.county))).filter(Boolean);

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
          <div className="relative">
            <Button variant="outline" className="flex items-center" id="export-dropdown">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10 hidden group-hover:block" style={{ minWidth: 120 }}>
              <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => handleExport('pdf')}>PDF</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => handleExport('excel')}>Excel</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-muted" onClick={() => handleExport('docs')}>Docs</button>
            </div>
          </div>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : sortedInstitutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No institutions found.</TableCell>
              </TableRow>
            ) : (
              sortedInstitutions.map(inst => (
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
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => {/* TODO: update logic */}}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inst.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OnboardedSchoolList;

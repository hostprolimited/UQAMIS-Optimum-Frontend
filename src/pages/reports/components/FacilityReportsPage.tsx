import React, { useState } from 'react';
import { Search, Filter, Download, FileSpreadsheet, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/hooks/use-toast';

// Mock reports data - different for each role
const mockReports = [
  {
    id: '1',
    schoolName: 'Green Valley Primary School',
    county: 'Nairobi',
    subCounty: 'Westlands',
    type: 'Primary',
    location: 'Karen',
    state: 'Active',
    lastAssessment: '2024-01-15',
    overallScore: 87,
    infrastructure: 85,
    academic: 90,
    safety: 88,
    administration: 85,
    status: 'Approved'
  },
  {
    id: '2',
    schoolName: 'St. Mary Secondary School',
    county: 'Nairobi',
    subCounty: 'Dagoretti North',
    type: 'Secondary',
    location: 'Kawangware',
    state: 'Active',
    lastAssessment: '2024-01-20',
    overallScore: 92,
    infrastructure: 90,
    academic: 95,
    safety: 90,
    administration: 93,
    status: 'Approved'
  },
  {
    id: '3',
    schoolName: 'Hillside Academy',
    county: 'Nairobi',
    subCounty: 'Langata',
    type: 'Primary',
    location: 'Langata',
    state: 'Active',
    lastAssessment: '2024-01-10',
    overallScore: 78,
    infrastructure: 75,
    academic: 82,
    safety: 80,
    administration: 75,
    status: 'Pending Review'
  },
  {
    id: '4',
    schoolName: 'Riverside Primary',
    county: 'Mombasa',
    subCounty: 'Nyali',
    type: 'Primary',
    location: 'Nyali',
    state: 'Active',
    lastAssessment: '2024-01-05',
    overallScore: 65,
    infrastructure: 60,
    academic: 70,
    safety: 65,
    administration: 65,
    status: 'Needs Improvement'
  },
  {
    id: '5',
    schoolName: 'Coastal High School',
    county: 'Mombasa',
    subCounty: 'Kisauni',
    type: 'Secondary',
    location: 'Kisauni',
    state: 'Active',
    lastAssessment: '2024-01-18',
    overallScore: 84,
    infrastructure: 80,
    academic: 88,
    safety: 85,
    administration: 83,
    status: 'Approved'
  }
];

// Mock facility reports for school admin
const mockFacilityReports = [
  {
    id: '1',
    facilityName: 'Classroom Block A',
    type: 'Classrooms',
    condition: 'Good',
    lastInspection: '2024-01-15',
    score: 87,
    unitsTotal: 12,
    unitsGood: 10,
    unitsFair: 2,
    unitsPoor: 0,
    recommendations: 'Replace whiteboards in 2 classrooms',
    status: 'Active'
  },
  {
    id: '2',
    facilityName: 'Science Laboratory',
    type: 'Laboratory',
    condition: 'Fair',
    lastInspection: '2024-01-12',
    score: 75,
    unitsTotal: 2,
    unitsGood: 1,
    unitsFair: 1,
    unitsPoor: 0,
    recommendations: 'Update lab equipment, improve ventilation',
    status: 'Needs Attention'
  },
  {
    id: '3',
    facilityName: 'ICT Center',
    type: 'ICT',
    condition: 'Good',
    lastInspection: '2024-01-20',
    score: 82,
    unitsTotal: 1,
    unitsGood: 1,
    unitsFair: 0,
    unitsPoor: 0,
    recommendations: 'Add more power outlets, update software',
    status: 'Active'
  },
  {
    id: '4',
    facilityName: 'School Compound',
    type: 'Outdoor',
    condition: 'Excellent',
    lastInspection: '2024-01-10',
    score: 92,
    unitsTotal: 1,
    unitsGood: 1,
    unitsFair: 0,
    unitsPoor: 0,
    recommendations: 'Maintain current standards',
    status: 'Active'
  },
  {
    id: '5',
    facilityName: 'Library',
    type: 'Academic',
    condition: 'Good',
    lastInspection: '2024-01-08',
    score: 85,
    unitsTotal: 1,
    unitsGood: 1,
    unitsFair: 0,
    unitsPoor: 0,
    recommendations: 'Add more reading materials, improve lighting',
    status: 'Active'
  },
  {
    id: '6',
    facilityName: 'Sports Facilities',
    type: 'Recreation',
    condition: 'Fair',
    lastInspection: '2024-01-05',
    score: 70,
    unitsTotal: 3,
    unitsGood: 1,
    unitsFair: 2,
    unitsPoor: 0,
    recommendations: 'Repair basketball court, maintain football field',
    status: 'Needs Attention'
  }
];

const Reports = () => {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubCounty, setFilterSubCounty] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredReports = currentUser.role === 'school_admin' 
    ? mockFacilityReports.filter(report => {
        const matchesSearch = report.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             report.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || report.type === filterType;
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
      })
    : mockReports.filter(report => {
        const matchesSearch = report.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             report.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             report.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || report.type === filterType;
        const matchesSubCounty = filterSubCounty === 'all' || report.subCounty === filterSubCounty;
        const matchesLocation = filterLocation === 'all' || report.location === filterLocation;
        const matchesState = filterState === 'all' || report.state === filterState;
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        
        // Role-based filtering
        if (currentUser.role === 'agent') {
          return matchesSearch && matchesType && matchesSubCounty && matchesLocation && 
                 matchesState && matchesStatus && report.county === currentUser.county_code;
        }
        
        return matchesSearch && matchesType && matchesSubCounty && matchesLocation && 
               matchesState && matchesStatus;
      });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'Pending Review':
        return <Badge className="bg-warning text-warning-foreground">Pending Review</Badge>;
      case 'Needs Improvement':
        return <Badge className="bg-destructive text-destructive-foreground">Needs Improvement</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success font-semibold';
    if (score >= 75) return 'text-info font-semibold';
    if (score >= 60) return 'text-warning font-semibold';
    return 'text-destructive font-semibold';
  };

  const handleExportPDF = () => {
    toast({
      title: "PDF Export Started",
      description: "Your report is being generated. You'll receive a download link shortly.",
    });
    // Simulate export process
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    toast({
      title: "Excel Export Started",
      description: "Your spreadsheet is being generated. You'll receive a download link shortly.",
    });
    // Simulate export process
    console.log('Exporting to Excel...');
  };

  // Get unique values for filter dropdowns
  const uniqueSubCounties = [...new Set(filteredReports.map(r => r.subCounty))];
  const uniqueLocations = [...new Set(filteredReports.map(r => r.location))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assessment Reports</h1>
          <p className="text-muted-foreground">
            View and analyze quality assessment reports with advanced filtering
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
          </Badge>
          <div className="flex space-x-2">
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
          <CardDescription>
            Use the filters below to narrow down your search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by school name, county, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="School Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSubCounty} onValueChange={setFilterSubCounty}>
              <SelectTrigger>
                <SelectValue placeholder="Sub County" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub Counties</SelectItem>
                {uniqueSubCounties.map((subCounty) => (
                  <SelectItem key={subCounty} value={subCounty}>
                    {subCounty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterSubCounty('all');
                setFilterLocation('all');
                setFilterState('all');
                setFilterStatus('all');
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Reports Data</CardTitle>
          <CardDescription>
            Detailed view of all assessment reports with scoring breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Assessment</TableHead>
                  <TableHead>Overall Score</TableHead>
                  <TableHead>Infrastructure</TableHead>
                  <TableHead>Academic</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead>Administration</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{report.schoolName}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.subCounty}, {report.county}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{report.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(report.lastAssessment).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-warning" />
                        <span className={getScoreColor(report.overallScore)}>
                          {report.overallScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(report.infrastructure)}>
                        {report.infrastructure}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(report.academic)}>
                        {report.academic}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(report.safety)}>
                        {report.safety}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(report.administration)}>
                        {report.administration}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {currentUser.role === 'agent' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">
                No reports match your current filter criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredReports.length > 0 
                    ? Math.round(filteredReports.reduce((sum, r) => 
                        sum + (currentUser.role === 'school_admin' 
                          ? (r as any).score 
                          : (r as any).overallScore), 0) / filteredReports.length)
                    : 0
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {currentUser.role === 'school_admin' ? 'Good Condition' : 'Approved Schools'}
                </p>
                <p className="text-2xl font-bold text-success">
                  {currentUser.role === 'school_admin' 
                    ? filteredReports.filter((r: any) => r.condition === 'Good' || r.condition === 'Excellent').length
                    : filteredReports.filter((r: any) => r.status === 'Approved').length
                  }
                </p>
              </div>
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground text-sm font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-warning">
                  {filteredReports.filter(r => r.status === 'Pending Review').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                <span className="text-warning-foreground text-sm font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Improvement</p>
                <p className="text-2xl font-bold text-destructive">
                  {filteredReports.filter(r => r.status === 'Needs Improvement').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-destructive-foreground text-sm font-bold">×</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
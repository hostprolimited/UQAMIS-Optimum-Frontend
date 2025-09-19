import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Edit, Delete, Add, Search, FileDownload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Sample data structure - replace with your actual data from API
interface Assessment {
  id: string;
  schoolName: string;
  facilityType: string;
  assessmentDate: string;
  status: string;
  score: number;
}

// Sample data - replace with API call
const sampleAssessments: Assessment[] = [
  {
    id: '1',
    schoolName: 'Mzumbe Primary School',
    facilityType: 'Classroom',
    assessmentDate: '2025-09-10',
    status: 'Completed',
    score: 85,
  },
  {
    id: '2',
    schoolName: 'Kivukoni Secondary School',
    facilityType: 'Laboratory',
    assessmentDate: '2025-09-12',
    status: 'Pending',
    score: 0,
  },
  {
    id: '3',
    schoolName: 'Dar es Salaam Primary',
    facilityType: 'Classroom',
    assessmentDate: '2025-09-08',
    status: 'Completed',
    score: 72,
  },
];

function CustomToolbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <GridToolbarContainer className="flex justify-between p-2">
      <div className="flex items-center space-x-2">
        <GridToolbarFilterButton />
        
        <Button
          startIcon={<FileDownload />}
          size="small"
          onClick={handleClick}
        >
          Export
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <GridToolbarExport printOptions={{ disableToolbarButton: true }} csvOptions={{ fileName: 'assessments' }} />
          </MenuItem>
          <MenuItem onClick={handleClose}>Export as PDF</MenuItem>
          <MenuItem onClick={handleClose}>Export as DOCX</MenuItem>
        </Menu>
      </div>
    </GridToolbarContainer>
  );
}

const AssessmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Replace with actual API call
    setAssessments(sampleAssessments);
  }, []);
  
  const handleAddNew = () => {
    navigate('/assessment/add');
  };
  
  const handleEdit = (id: string) => {
    navigate(`/assessments/edit/${id}`);
  };
  
  const handleDelete = (id: string) => {
    // Add confirmation dialog in real implementation
    const updatedAssessments = assessments.filter(assessment => assessment.id !== id);
    setAssessments(updatedAssessments);
    toast.success('Assessment deleted successfully');
  };
  
  const filteredAssessments = assessments.filter(assessment => 
    assessment.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.facilityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'schoolName', headerName: 'School Name', flex: 1 },
    { field: 'facilityType', headerName: 'Facility Type', flex: 0.8 },
    { field: 'assessmentDate', headerName: 'Assessment Date', flex: 0.8 },
    { 
      field: 'status',
      headerName: 'Status',
      flex: 0.6,
      renderCell: (params: GridRenderCellParams<Assessment, string>) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Completed' ? 'success' : 'warning'} 
          size="small"
          variant="outlined" 
        />
      )
    },
    { 
      field: 'score', 
      headerName: 'Score', 
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<Assessment, number>) => (
        params.value > 0 ? `${params.value}%` : '-'
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 0.6,
      renderCell: (params: GridRenderCellParams<Assessment>) => (
        <Box>
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleEdit(params.row.id)}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className="p-4">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" className="font-bold">
          Assessment Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleAddNew}
        >
          Add New Assessment
        </Button>
      </Box>
      
      <TextField
        variant="outlined"
        placeholder="Search assessments..."
        fullWidth
        margin="normal"
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        size="small"
        className="mb-4"
      />
      
      <Box className="h-[calc(100vh-240px)] w-full bg-white rounded-md shadow">
        <DataGrid
          rows={filteredAssessments}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          density="compact"
          slots={{
            toolbar: CustomToolbar,
          }}
        />
      </Box>
    </Box>
  );
};

export default AssessmentListPage;
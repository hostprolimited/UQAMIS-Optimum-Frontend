import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Plus, Download, FileText, FileSpreadsheet, FileImage } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

import { MaintenanceReport } from '../core/_model';
import { getMaintenanceReports } from '../core/_request';

// Convert API response to display format
const mapMaintenanceReport = (report: MaintenanceReport): FacilityAssessment => ({
  id: report.id.toString(),
  schoolName: report.school_name,
  facilityType: report.facility_type,
  assessmentDate: report.assessment_date,
  urgentItems: report.urgent_items,
  attentionItems: report.attention_items,
  goodItems: report.good_items,
  totalItems: report.total_items,
  overallCondition: report.overall_condition,
  completionStatus: report.completion_status,
});

// Display interface
interface FacilityAssessment {
  id: string;
  schoolName: string;
  facilityType: string;
  assessmentDate: string;
  urgentItems: number;
  attentionItems: number;
  goodItems: number;
  totalItems: number;
  overallCondition: 'excellent' | 'good' | 'needs-attention' | 'critical';
  completionStatus: 'completed' | 'in-progress' | 'pending';
}

// Temporary sample data for development
const sampleFacilityAssessments: FacilityAssessment[] = [
  {
    id: '1',
    schoolName: 'Mzumbe Primary School',
    facilityType: 'Classroom',
    assessmentDate: '2025-09-10',
    urgentItems: 2,
    attentionItems: 3,
    goodItems: 7,
    totalItems: 12,
    overallCondition: 'good',
    completionStatus: 'completed',
  },
  {
    id: '2',
    schoolName: 'Kivukoni Secondary School',
    facilityType: 'ICT Lab',
    assessmentDate: '2025-09-12',
    urgentItems: 0,
    attentionItems: 2,
    goodItems: 8,
    totalItems: 10,
    overallCondition: 'good',
    completionStatus: 'completed',
  },
  {
    id: '3',
    schoolName: 'Dar es Salaam Primary',
    facilityType: 'Toilets',
    assessmentDate: '2025-09-08',
    urgentItems: 4,
    attentionItems: 3,
    goodItems: 3,
    totalItems: 10,
    overallCondition: 'critical',
    completionStatus: 'completed',
  },
  {
    id: '4',
    schoolName: 'Arusha Secondary School',
    facilityType: 'Sports Facilities',
    assessmentDate: '2025-09-15',
    urgentItems: 1,
    attentionItems: 4,
    goodItems: 5,
    totalItems: 10,
    overallCondition: 'needs-attention',
    completionStatus: 'in-progress',
  },
  {
    id: '5',
    schoolName: 'Mwanza Girls School',
    facilityType: 'Dormitories',
    assessmentDate: '2025-09-05',
    urgentItems: 0,
    attentionItems: 1,
    goodItems: 9,
    totalItems: 10,
    overallCondition: 'excellent',
    completionStatus: 'completed',
  },
  {
    id: '6',
    schoolName: 'Dodoma Secondary School',
    facilityType: 'Laboratories',
    assessmentDate: '2025-09-14',
    urgentItems: 2,
    attentionItems: 2,
    goodItems: 6,
    totalItems: 10,
    overallCondition: 'needs-attention',
    completionStatus: 'completed',
  },
  {
    id: '7',
    schoolName: 'Iringa Primary School',
    facilityType: 'Dining Halls',
    assessmentDate: '2025-09-11',
    urgentItems: 1,
    attentionItems: 2,
    goodItems: 7,
    totalItems: 10,
    overallCondition: 'good',
    completionStatus: 'completed',
  },
  {
    id: '8',
    schoolName: 'Mbeya Girls School',
    facilityType: 'Compound',
    assessmentDate: '2025-09-09',
    urgentItems: 0,
    attentionItems: 3,
    goodItems: 7,
    totalItems: 10,
    overallCondition: 'good',
    completionStatus: 'completed',
  },
  {
    id: '9',
    schoolName: 'Tanga Secondary School',
    facilityType: 'Offices',
    assessmentDate: '2025-09-13',
    urgentItems: 3,
    attentionItems: 4,
    goodItems: 3,
    totalItems: 10,
    overallCondition: 'critical',
    completionStatus: 'pending',
  },
];

const AssessmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<FacilityAssessment[]>([]);
  const [selectedRows, setSelectedRows] = useState<FacilityAssessment[]>([]);
  
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await getMaintenanceReports();
        const mappedAssessments = response.data.map(mapMaintenanceReport);
        setAssessments(mappedAssessments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assessments",
          variant: "destructive",
        });
        // Fall back to sample data in development
        if (process.env.NODE_ENV === 'development') {
          setAssessments(sampleFacilityAssessments);
        }
      }
    };
    
    fetchAssessments();
  }, [toast]);
  
  const handleAddNew = () => {
    navigate('/assessments/add');
  };
  
  const handleEdit = (id: string) => {
    navigate(`/assessments/edit/${id}`);
  };
  
  const handleDelete = async (id: string) => {
    try {
      // Add actual API call here
      const updatedAssessments = assessments.filter(assessment => assessment.id !== id);
      setAssessments(updatedAssessments);
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    }
  };

  const getOverallConditionBadge = (condition: FacilityAssessment['overallCondition']) => {
    const conditionConfig = {
      excellent: { label: 'Excellent', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      good: { label: 'Good', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
      'needs-attention': { label: 'Needs Attention', variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' },
      critical: { label: 'Critical', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    const config = conditionConfig[condition];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCompletionStatusBadge = (status: FacilityAssessment['completionStatus']) => {
    const statusConfig = {
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      pending: { label: 'Pending', className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Export functions
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF('landscape')
    
    const exportData = selectedRows.length > 0 ? selectedRows : assessments
    
    if (exportData.length === 0) {
      doc.text('No data to export', 20, 20)
    } else {
      doc.text('Facility Assessment Report', 20, 20)
      
      const headers = [
        'School Name', 'Facility Type', 'Assessment Date', 
        'Urgent', 'Attention', 'Good', 'Overall Condition', 'Status'
      ]
      
      const rows = exportData.map(assessment => [
        assessment.schoolName,
        assessment.facilityType,
        new Date(assessment.assessmentDate).toLocaleDateString(),
        assessment.urgentItems.toString(),
        assessment.attentionItems.toString(),
        assessment.goodItems.toString(),
        assessment.overallCondition,
        assessment.completionStatus
      ])
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      })
    }
    
    doc.save('facility-assessments.pdf')
    toast({
      title: "Success",
      description: "PDF exported successfully",
    });
  }

  const exportToExcel = async () => {
    const XLSX = await import('xlsx')
    const { saveAs } = await import('file-saver')
    
    const exportData = selectedRows.length > 0 ? selectedRows : assessments
    
    const ws = XLSX.utils.json_to_sheet(exportData.map(assessment => ({
      'School Name': assessment.schoolName,
      'Facility Type': assessment.facilityType,
      'Assessment Date': new Date(assessment.assessmentDate).toLocaleDateString(),
      'Urgent Items': assessment.urgentItems,
      'Attention Items': assessment.attentionItems,
      'Good Items': assessment.goodItems,
      'Total Items': assessment.totalItems,
      'Overall Condition': assessment.overallCondition,
      'Status': assessment.completionStatus
    })))
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Facility Assessments')
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, 'facility-assessments.xlsx')
    
    toast({
      title: "Success",
      description: "Excel file exported successfully",
    });
  }

  const exportToWord = async () => {
    const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = await import('docx')
    const { saveAs } = await import('file-saver')
    
    const exportData = selectedRows.length > 0 ? selectedRows : assessments
    
    if (exportData.length === 0) {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [new Paragraph({ children: [new TextRun("No data to export")] })]
        }]
      })
      
      const blob = await Packer.toBlob(doc)
      saveAs(blob, 'facility-assessments.docx')
      return
    }

    const headers = [
      'School Name', 'Facility Type', 'Assessment Date', 
      'Urgent', 'Attention', 'Good', 'Overall Condition', 'Status'
    ]
    
    const table = new Table({
      rows: [
        new TableRow({
          children: headers.map(header => 
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })]
            })
          )
        }),
        ...exportData.map(assessment => 
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.schoolName)] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.facilityType)] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(new Date(assessment.assessmentDate).toLocaleDateString())] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.urgentItems.toString())] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.attentionItems.toString())] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.goodItems.toString())] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.overallCondition)] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun(assessment.completionStatus)] })] }),
            ]
          })
        )
      ]
    })

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ children: [new TextRun({ text: "Facility Assessment Report", bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun("")] }),
          table
        ]
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, 'facility-assessments.docx')
    
    toast({
      title: "Success",
      description: "Word document exported successfully",
    });
  }

  const columns: ColumnDef<FacilityAssessment>[] = [
    // {
    //   accessorKey: "schoolName",
    //   header: "School Name",
    //   cell: ({ row }) => (
    //     <div className="font-medium max-w-[200px] truncate" title={row.getValue("schoolName")}>
    //       {row.getValue("schoolName")}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "facilityType",
      header: "Facility Type",
      cell: ({ row }) => (
        <div className="capitalize font-medium">{row.getValue("facilityType")}</div>
      ),
    },
    {
      accessorKey: "assessmentDate",
      header: "Assessment Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("assessmentDate"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "urgentItems",
      header: "Urgent",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-red-800 bg-red-100 rounded-full">
            {row.getValue("urgentItems")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "attentionItems",
      header: "Attention",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-yellow-800 bg-yellow-100 rounded-full">
            {row.getValue("attentionItems")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "goodItems",
      header: "Good",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-green-800 bg-green-100 rounded-full">
            {row.getValue("goodItems")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "overallCondition",
      header: "Overall Condition",
      cell: ({ row }) => getOverallConditionBadge(row.getValue("overallCondition")),
    },
    {
      accessorKey: "completionStatus",
      header: "Status",
      cell: ({ row }) => getCompletionStatusBadge(row.getValue("completionStatus")),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const assessment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(assessment.id)}
              >
                Copy assessment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(assessment.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit assessment
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(assessment.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Facility Maintenance Assessment Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track facility maintenance assessments with detailed condition reports
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToWord}>
                <FileImage className="mr-2 h-4 w-4" />
                Export as Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Assessment
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg border shadow-sm">
        <DataTable
          columns={columns}
          data={assessments}
          searchKey="schoolName"
          searchPlaceholder="Search schools or facilities..."
          enableRowSelection={true}
          dense={true}
        />
      </div>
    </div>
  );
};

export default AssessmentListPage;
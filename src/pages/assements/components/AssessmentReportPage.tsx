import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Building2,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
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

// Recharts for charts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getMaintenanceReports, getFacilities } from "../core/_request";
import { Facility } from "../core/_model";

// --- Types ---
interface AssessmentDetail {
  part_of_building: string;
  assessment_status: string;
  score?: number;
}

interface FacilityAssessment {
  id: string;
  schoolName: string;
  facilityType: string;
  assessmentDate: string; // ISO date string
  urgentItems: number;
  attentionItems: number;
  goodItems: number;
  totalItems: number;
  overallCondition: "excellent" | "good" | "needs-attention" | "critical";
  completionStatus: "completed" | "in-progress" | "pending";
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  agent_feedback?: string;
  totalScorePercentage?: number;
  created_at?: string;
  details?: AssessmentDetail[];
}

// Mapping helper (adapts API response to our UI model)
const mapMaintenanceReport = (report: any, facilityIdToName: Record<string, string>): FacilityAssessment => ({
  id: report.id?.toString() ?? "",
  schoolName: report.school_name ?? report.school ?? getCurrentInstitutionName(),
  facilityType:
    facilityIdToName[report.facility_id?.toString()] || report.facility_type || report.facility_id?.toString() || "",
  assessmentDate: report.assessment_date ?? report.date ?? "",
  urgentItems: report.urgent_items ?? 0,
  attentionItems: report.attention_items ?? 0,
  goodItems: report.good_items ?? 0,
  totalItems: report.total_items ?? 0,
  overallCondition: report.overall_condition ?? "good",
  completionStatus: report.completion_status ?? "pending",
  status: report.status ?? "pending",
  agent_feedback: report.agent_feedback,
  totalScorePercentage: report.total_score_percentage,
  created_at: report.created_at,
  details: report.details ?? [],
});

// Get current logged-in institution name from localStorage
const getCurrentInstitutionName = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.school || user?.name || "School";
    }
  } catch (e) {
    // ignore
  }
  return "School";
};

// --- Sample fallback data for dev (keeps UI useful when API fails) ---
const sampleFacilityAssessments: FacilityAssessment[] = [
  {
    id: "1",
    schoolName: "Mzumbe Primary School",
    facilityType: "Classroom",
    assessmentDate: "2025-09-10",
    urgentItems: 2,
    attentionItems: 3,
    goodItems: 7,
    totalItems: 12,
    overallCondition: "good",
    completionStatus: "completed",
    totalScorePercentage: 78,
  },
  {
    id: "2",
    schoolName: "Kivukoni Secondary School",
    facilityType: "ICT Lab",
    assessmentDate: "2025-09-12",
    urgentItems: 0,
    attentionItems: 2,
    goodItems: 8,
    totalItems: 10,
    overallCondition: "good",
    completionStatus: "completed",
    totalScorePercentage: 85,
  },
  {
    id: "3",
    schoolName: "Dar es Salaam Primary",
    facilityType: "Toilets",
    assessmentDate: "2025-09-08",
    urgentItems: 4,
    attentionItems: 3,
    goodItems: 3,
    totalItems: 10,
    overallCondition: "critical",
    completionStatus: "completed",
    totalScorePercentage: 42,
  },
];

// --- Component ---
const AssessmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assessments, setAssessments] = useState<FacilityAssessment[]>([]);
  const [filteredData, setFilteredData] = useState<FacilityAssessment[]>([]);
  const [facilityIdToName, setFacilityIdToName] = useState<Record<string, string>>({});

  const [selectedRows, setSelectedRows] = useState<FacilityAssessment[]>([]);

  // Filters
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAssessment, setEditAssessment] = useState<FacilityAssessment | null>(null);

  const MySwal = withReactContent(Swal);

  // Fetch facilities and assessments
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const facilitiesRes = await getFacilities();
        const facilities: Facility[] = facilitiesRes?.data || [];
        const idToName = facilities.reduce((acc, f) => {
          acc[f.id.toString()] = f.name;
          return acc;
        }, {} as Record<string, string>);

        if (!mounted) return;
        setFacilityIdToName(idToName);

        const resp = await getMaintenanceReports();
        const data = resp?.data || [];
        const mapped: FacilityAssessment[] = data.map((r: any) => mapMaintenanceReport(r, idToName));

        if (!mounted) return;
        setAssessments(mapped);
        setFilteredData(mapped);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load assessments", variant: "destructive" });
        if (process.env.NODE_ENV === "development") {
          setAssessments(sampleFacilityAssessments);
          setFilteredData(sampleFacilityAssessments);
        }
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Filtering logic
  useEffect(() => {
    let data = assessments.slice();

    if (facilityTypeFilter) {
      data = data.filter((d) => d.facilityType === facilityTypeFilter);
    }
    if (conditionFilter) {
      data = data.filter((d) => d.overallCondition === conditionFilter);
    }
    if (statusFilter) {
      data = data.filter((d) => d.completionStatus === statusFilter);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      data = data.filter((d) => new Date(d.assessmentDate) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      // include the whole day
      to.setHours(23, 59, 59, 999);
      data = data.filter((d) => new Date(d.assessmentDate) <= to);
    }

    setFilteredData(data);
  }, [assessments, facilityTypeFilter, conditionFilter, statusFilter, fromDate, toDate]);

  // Stats (memoized)
  const totalAssessments = useMemo(() => assessments.length, [assessments]);
  const totalSchools = useMemo(() => new Set(assessments.map((a) => a.schoolName)).size, [assessments]);
  const criticalFacilities = useMemo(() => assessments.filter((a) => a.overallCondition === "critical").length, [assessments]);
  const avgScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const sum = assessments.reduce((s, a) => s + (a.totalScorePercentage ?? 0), 0);
    return Math.round((sum / assessments.length) * 10) / 10;
  }, [assessments]);

  // Chart data
  const conditionData = useMemo(() => [
    { name: "Excellent", value: assessments.filter((a) => a.overallCondition === "excellent").length },
    { name: "Good", value: assessments.filter((a) => a.overallCondition === "good").length },
    { name: "Needs Attention", value: assessments.filter((a) => a.overallCondition === "needs-attention").length },
    { name: "Critical", value: assessments.filter((a) => a.overallCondition === "critical").length },
  ], [assessments]);

  const statusData = useMemo(() => [
    { name: "Completed", value: assessments.filter((a) => a.completionStatus === "completed").length },
    { name: "In Progress", value: assessments.filter((a) => a.completionStatus === "in-progress").length },
    { name: "Pending", value: assessments.filter((a) => a.completionStatus === "pending").length },
  ], [assessments]);

  const COLORS = ["#16a34a", "#3b82f6", "#facc15", "#dc2626"];

  // Table columns (keeps original richer columns for actions & details)
  const columns: ColumnDef<FacilityAssessment>[] = [
    
    {
      accessorKey: "facilityType",
      header: "Facility Type",
      cell: ({ row }) => (
        <div className="capitalize font-medium">{row.getValue("facilityType")}</div>
      ),
    },
    // {
    //   accessorKey: "assessmentDate",
    //   header: "Assessment Date",
    //   cell: ({ row }) => {
    //     <div className="font-medium max-w-[250px] truncate" title={String(row.getValue("created_at"))}>{row.getValue("created_at")}</div>
    //   },
    // },

    {
      accessorKey: "agent_feedback",
      header: "Agent Feedback",
      cell: ({ row }) => (
        <div className="font-medium max-w-[250px] truncate" title={String(row.getValue("agent_feedback"))}>{row.getValue("agent_feedback")}</div>
      ),
    },
    {
      accessorKey: "totalScorePercentage",
      header: "Score (%)",
      cell: ({ row }) => (
        <div className="text-center font-semibold">{row.getValue("totalScorePercentage") ?? '-'}</div>
      ),
    },
    {
      accessorKey: "overallCondition",
      header: "Condition",
      cell: ({ row }) => {
        const cond = row.getValue("overallCondition") as FacilityAssessment["overallCondition"];
        return getOverallConditionBadge(cond);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status") as FacilityAssessment["status"];
        return <div className="font-medium max-w-[250px] truncate" title={String(s)}>{s}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const assessment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Open actions for ${assessment.schoolName}`}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(assessment.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(assessment.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // --- Helpers for badges ---
  function getOverallConditionBadge(condition?: FacilityAssessment["overallCondition"]) {
    const conditionConfig: Record<string, { label: string; className: string }> = {
      excellent: { label: "Excellent", className: "bg-green-100 text-green-800" },
      good: { label: "Good", className: "bg-blue-100 text-blue-800" },
      "needs-attention": { label: "Needs Attention", className: "bg-yellow-100 text-yellow-800" },
      critical: { label: "Critical", className: "bg-red-100 text-red-800" },
    };
    if (!condition) return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    const config = conditionConfig[condition];
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  function getCompletionStatusBadge(status?: FacilityAssessment["completionStatus"]) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      pending: { label: "Pending", className: "bg-gray-100 text-gray-800" },
    };
    if (!status) return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  // --- Actions: Edit / Delete ---
  const handleEdit = (id: string) => {
    const found = assessments.find((a) => a.id === id);
    if (found) {
      setEditAssessment(found);
      setEditModalOpen(true);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editAssessment) return;
    const { name, value } = e.target;
    setEditAssessment({ ...editAssessment, [name]: value } as FacilityAssessment);
  };

  const handleEditSave = () => {
    if (!editAssessment) return;
    setAssessments((prev) => prev.map((a) => (a.id === editAssessment.id ? editAssessment : a)));
    setEditModalOpen(false);
    toast({ title: "Success", description: "Assessment updated." });
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. Do you want to delete this assessment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // TODO: call API to delete on server
        setAssessments((prev) => prev.filter((a) => a.id !== id));
        toast({ title: "Success", description: "Assessment deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete assessment", variant: "destructive" });
      }
    }
  };

  // --- UI ---
  return (
    <div className="space-y-8" role="main">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Assesments Reports</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor facility assessments across your institutions. Use the filters to focus on specific
            facility types, conditions or date ranges. This dashboard is designed for quick decisions and
            accessible interactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button onClick={() => navigate("/assessments/add")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Assessment
          </Button> */}
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" aria-label="Assessment statistics">
        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-total">
          <h3 id="stat-total" className="text-sm font-medium text-gray-500">Total Assessments</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{totalAssessments}</p>
          <p className="text-xs text-gray-500 mt-1">Assessments recorded in the selected date range (all by default)</p>
        </article>

        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-critical">
          <h3 id="stat-critical" className="text-sm font-medium text-gray-500">Critical Facilities</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-red-600">{criticalFacilities}</p>
          <p className="text-xs text-gray-500 mt-1">Facilities marked as &quot;Critical&quot; — require urgent attention</p>
        </article>

        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-avg">
          <h3 id="stat-avg" className="text-sm font-medium text-gray-500">Average Score</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{avgScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Average of available assessment scores</p>
        </article>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Assessment charts">
        <div className="bg-white rounded-lg p-5 shadow border" aria-hidden={false}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Facilities by Condition</h2>
            <span className="text-sm text-gray-500">Quick view of facility condition counts</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={conditionData} aria-label="Bar chart: facilities by condition">
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Assessment Status Distribution</h2>
            <span className="text-sm text-gray-500">Proportion of completed / in-progress / pending</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart aria-label="Pie chart: assessment status distribution">
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white rounded-lg p-4 shadow border" aria-label="filters">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
            <label className="flex flex-col" aria-label="Filter by facility type">
              <span className="text-xs text-gray-600 mb-1">Facility type</span>
              <select value={facilityTypeFilter} onChange={(e) => setFacilityTypeFilter(e.target.value)} className="border rounded px-2 py-2">
                <option value="">All facility types</option>
                {Array.from(new Set(assessments.map((a) => a.facilityType))).map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col" aria-label="Filter by condition">
              <span className="text-xs text-gray-600 mb-1">Condition</span>
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="border rounded px-2 py-2">
                <option value="">All conditions</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className="flex flex-col" aria-label="Filter by status">
              <span className="text-xs text-gray-600 mb-1">Status</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-2 py-2">
                <option value="">All statuses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col" aria-label="Filter from date">
                <span className="text-xs text-gray-600 mb-1">From</span>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded px-2 py-2" />
              </label>
              <label className="flex flex-col" aria-label="Filter to date">
                <span className="text-xs text-gray-600 mb-1">To</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded px-2 py-2" />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
              setFacilityTypeFilter("");
              setConditionFilter("");
              setStatusFilter("");
              setFromDate("");
              setToDate("");
            }} aria-label="Clear filters">
              Clear
            </Button>
            {/* <Button onClick={() => navigate('/assessments/add')} className="hidden md:inline-flex gap-2">
              <Plus className="h-4 w-4" /> New
            </Button> */}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-lg p-4 shadow border" aria-label="assessment records">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Assessment Records</h2>
            <p className="text-sm text-gray-500">Browse and manage facility maintenance assessments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { /* Could toggle dense rows or other table prefs */ }} aria-label="Table preferences">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          searchKey="schoolName"
          searchPlaceholder="Search schools or facilities..."
          enableRowSelection
          dense={false}
          onSelectionChange={(rows: any[]) => setSelectedRows(rows)}
        />
      </section>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assessment</DialogTitle>
            <DialogDescription>Update the assessment details and save changes.</DialogDescription>
          </DialogHeader>

          {editAssessment && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}>
              <div>
                <label className="block text-sm font-medium">Facility Type</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  name="facilityType"
                  value={editAssessment.facilityType}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Assessment Date</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  name="assessmentDate"
                  type="date"
                  value={editAssessment.assessmentDate}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Overall Condition</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  name="overallCondition"
                  value={editAssessment.overallCondition}
                  onChange={handleEditChange}
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="needs-attention">Needs Attention</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Completion Status</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  name="completionStatus"
                  value={editAssessment.completionStatus}
                  onChange={handleEditChange}
                  required
                >
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <DialogFooter>
                <Button type="submit">Save</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AssessmentListPage;

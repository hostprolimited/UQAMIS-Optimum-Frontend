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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import { getSafetyReports, getFacilities, agentReviewSafetyReport } from "../core/_request";
import { Facility } from "../core/_model";

// --- Types ---
interface AssessmentDetail {
  part_of_building: string;
  assessment_status: string;
  score?: number;
}

interface FacilityAssessment {
  id: string;
  institutionName: string;
  facilityType: string;
  class: string[];
  assessmentDate: string;
  urgentItems: number;
  attentionItems: number;
  goodItems: number;
  totalItems: number;
  averageCondition: "excellent" | "good" | "needs-attention" | "urgent_attention";
  completionStatus: "completed" | "in-progress" | "pending";
  status?: string;
  agent_feedback?: string;
  school_feedback?: string;
  totalScorePercentage?: number;
  created_at?: string;
  details?: AssessmentDetail[];
  agent_condition?: AssessmentDetail[];
}

// Mapping helper (adapts API response to our UI model)
const mapSafetyReport = (report: any, facilityIdToName: Record<string, string>): FacilityAssessment => ({
  id: report.id?.toString() ?? "",
  institutionName: report.institution_name || report.school_name || getCurrentInstitutionName(),
  class: report.class ? JSON.parse(report.class) : [],
  facilityType: facilityIdToName[report.facility_id?.toString()] || report.facility_type || report.facility_id?.toString() || "",
  assessmentDate: report.assessment_date ?? report.date ?? "",
  urgentItems: report.urgent_items ?? 0,
  attentionItems: report.attention_items ?? 0,
  goodItems: report.good_items ?? 0,
  totalItems: report.total_items ?? 0,
  averageCondition: report.average_condition ?? "good",
  completionStatus: report.completion_status ?? "pending",
  status: report.status,
  agent_feedback: report.agent_feedback,
  school_feedback: report.school_feedback,
  totalScorePercentage: report.total_score_percentage,
  created_at: report.created_at,
  details: report.details ?? [],
  agent_condition: report.agent_condition ?? [],
});

// Get current logged-in institution name from localStorage
const getCurrentInstitutionName = () => {
  const inst = localStorage.getItem("institutionName");
  if (inst) {
    try {
      const parsed = JSON.parse(inst);
      return parsed?.institution_name || "School";
    } catch (e) {
      // ignore
    }
  }
  return "School";
};

// --- Component ---
const SafetyReviewPage: React.FC = () => {
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

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FacilityAssessment | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: '',
    priority: '',
    remarks: '',
    recommendedAction: '',
  });

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

        const resp = await getSafetyReports();
        const data = resp?.data || [];
        const mapped: FacilityAssessment[] = data.map((r: any) => mapSafetyReport(r, idToName));

        if (!mounted) return;
        setAssessments(mapped);
        setFilteredData(mapped);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load safety assessments", variant: "destructive" });
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
      data = data.filter((d) => d.averageCondition === conditionFilter);
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
  const totalSchools = useMemo(() => new Set(assessments.map((a) => a.institutionName)).size, [assessments]);
  const criticalFacilities = useMemo(() => assessments.filter((a) => a.averageCondition === "urgent_attention").length, [assessments]);
  const avgScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const sum = assessments.reduce((s, a) => s + (a.totalScorePercentage ?? 0), 0);
    return Math.round((sum / assessments.length) * 10) / 10;
  }, [assessments]);

  // Chart data
  const conditionData = useMemo(() => [
    { name: "Good", value: assessments.filter((a) => a.averageCondition === "good").length },
    { name: "Needs Attention", value: assessments.filter((a) => a.averageCondition === "needs-attention").length },
    { name: "Critical", value: assessments.filter((a) => a.averageCondition === "urgent_attention").length },
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
      accessorKey: "institutionName",
      header: "School name",
      cell: ({ row }) => (
        <div className="capitalize font-medium">{row.getValue("institutionName")}</div>
      ),
    },
    {
      accessorKey: "facilityType",
      header: "Facility Type",
      cell: ({ row }) => (
        <div className="capitalize font-medium">{row.getValue("facilityType")}</div>
      ),
    },
   
    {
      accessorKey: "school_feedback",
      header: "School Feedback",
      cell: ({ row }) => (
        <div className="font-medium max-w-[250px] truncate" title={String(row.getValue("school_feedback"))}>{row.getValue("school_feedback")}</div>
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
      accessorKey: "averageCondition",
      header: "Condition",
      cell: ({ row }) => {
        const cond = row.getValue("averageCondition") as FacilityAssessment["averageCondition"];
        return getOverallConditionBadge(cond);
      },
    },
    {
      accessorKey: "completionStatus",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("completionStatus") as FacilityAssessment["completionStatus"];
        return getCompletionStatusBadge(s);
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
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Open actions for ${assessment.institutionName}`}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleReview(assessment.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Review assessment
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
  function getOverallConditionBadge(condition?: FacilityAssessment["averageCondition"]) {
    const conditionConfig: Record<string, { label: string; className: string }> = {
      excellent: { label: "Excellent", className: "bg-green-100 text-green-800" },
      good: { label: "Good", className: "bg-blue-100 text-blue-800" },
      attention: { label: "Needs Attention", className: "bg-yellow-100 text-yellow-800" },
      urgent_attention: { label: "Critical", className: "bg-red-100 text-red-800" },
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
      title: 'Are you sure?',
      text: 'This action cannot be undone. Do you want to delete this safety assessment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        // TODO: call API to delete on server
        setAssessments((prev) => prev.filter((a) => a.id !== id));
        toast({ title: "Success", description: "Safety assessment deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete safety assessment", variant: "destructive" });
      }
    }
  };

  // --- Actions: Review ---
  const handleReview = (id: string) => {
    const found = assessments.find((a) => a.id === id);
    if (found) {
      setSelectedSubmission(found);
      setReviewForm({ status: '', priority: '', remarks: '', recommendedAction: '' });
      setIsReviewModalOpen(true);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.status || !reviewForm.remarks || !reviewForm.recommendedAction) {
      toast({ title: "Error", description: "Status, remarks, and recommended action are required", variant: "destructive" });
      return;
    }
    try {
      const data = {
        review_decision: reviewForm.status as "approved" | "rejected" | "requires_clarification",
        review_remarks: reviewForm.remarks,
        recommended_action: reviewForm.recommendedAction,
        priority: reviewForm.priority as "low" | "medium" | "high" | "urgent" | undefined,
      };
      await agentReviewSafetyReport(parseInt(selectedSubmission!.id), data);
      toast({ title: "Success", description: "Review submitted successfully" });
      setIsReviewModalOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    }
  };

  // --- UI ---
  return (
    <div className="space-y-8" role="main">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Review Safety Assessments Records</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor facility safety assessments across institutions within the county. Use the filters to focus on specific facility types, conditions or date ranges. This dashboard is designed for quick decisions and
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
      {/* <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" aria-label="Safety assessment statistics">
        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-total">
          <h3 id="stat-total" className="text-sm font-medium text-gray-500">Total Safety Assessments</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{totalAssessments}</p>
          <p className="text-xs text-gray-500 mt-1">Safety assessments recorded in the selected date range (all by default)</p>
        </article>

        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-schools">
          <h3 id="stat-schools" className="text-sm font-medium text-gray-500">Total Schools</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{totalSchools}</p>
          <p className="text-xs text-gray-500 mt-1">Schools with safety assessments</p>
        </article>

        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-critical">
          <h3 id="stat-critical" className="text-sm font-medium text-gray-500">Critical Facilities</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-red-600">{criticalFacilities}</p>
          <p className="text-xs text-gray-500 mt-1">Facilities marked as "Critical" — require urgent safety attention</p>
        </article>

        <article className="bg-white rounded-lg p-4 shadow border" aria-labelledby="stat-avg">
          <h3 id="stat-avg" className="text-sm font-medium text-gray-500">Average Safety Score</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{avgScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Average of available safety assessment scores</p>
        </article>
      </section> */}

      {/* Charts */}
      {/* <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Safety assessment charts">
        <div className="bg-white rounded-lg p-5 shadow border" aria-hidden={false}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Facilities by Safety Condition</h2>
            <span className="text-sm text-gray-500">Quick view of facility safety condition counts</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={conditionData} aria-label="Bar chart: facilities by safety condition">
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* <div className="bg-white rounded-lg p-5 shadow border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Safety Assessment Status Distribution</h2>
            <span className="text-sm text-gray-500">Proportion of completed / in-progress / pending safety assessments</span>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart aria-label="Pie chart: safety assessment status distribution">
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
      </section> */}

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
              <span className="text-xs text-gray-600 mb-1">Safety Condition</span>
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="border rounded px-2 py-2">
                <option value="">All conditions</option>
                <option value="good">Good</option>
                <option value="attention">Needs Attention</option>
                <option value="urgent_attention">Critical</option>
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
      <section className="bg-white rounded-lg p-4 shadow border" aria-label="safety assessment records">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Safety Assessment Records</h2>
            <p className="text-sm text-gray-500">Browse and manage facility safety assessments.</p>
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
          searchKey="institutionName"
          searchPlaceholder="Search schools or facilities..."
          enableRowSelection
          dense={false}
        />
      </section>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Safety Assessment - {selectedSubmission?.institutionName}</DialogTitle>
            <DialogDescription>
              Review the safety assessment and provide your decision.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Assessment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Assessment Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Facility:</span> {selectedSubmission.facilityType}
                  </div>
                  <div>
                    <span className="font-medium">Overall Condition:</span> {getOverallConditionBadge(selectedSubmission.averageCondition)}
                  </div>
                  <div>
                    <span className="font-medium">Urgent Items:</span> {selectedSubmission.urgentItems}
                  </div>
                  <div>
                    <span className="font-medium">Score:</span> {selectedSubmission.totalScorePercentage ?? 0}%
                  </div>
                </div>

                {selectedSubmission.school_feedback && (
                  <div className="mt-3">
                    <span className="font-medium">School Admin Remarks:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedSubmission.school_feedback}</p>
                  </div>
                )}

                <div className="mt-3">
                  <span className="font-medium">Assessment Details Review:</span>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full bg-white border rounded">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Part of Building</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Original Condition</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Agent Condition</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Agent Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubmission.details?.map((detail, index) => {
                          const agentCondition = selectedSubmission.agent_condition?.find(ac => ac.part_of_building === detail.part_of_building);
                          return (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2 text-sm font-medium">{detail.part_of_building}</td>
                              <td className="px-4 py-2">
                                <Badge
                                  className={
                                    detail.assessment_status === 'Urgent Attention'
                                      ? 'bg-red-100 text-red-800'
                                      : detail.assessment_status === 'Attention Required'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }
                                >
                                  {detail.assessment_status}
                                </Badge>
                              </td>
                              <td className="px-4 py-2">
                                {agentCondition ? (
                                  <Badge
                                    className={
                                      agentCondition.assessment_status === 'Urgent Attention'
                                        ? 'bg-red-100 text-red-800'
                                        : agentCondition.assessment_status === 'Attention Required'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }
                                  >
                                    {agentCondition.assessment_status}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {agentCondition ? agentCondition.score : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="review-status">Review Decision *</Label>
                  <Select value={reviewForm.status} onValueChange={(value) => setReviewForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select review decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                      <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={reviewForm.priority} onValueChange={(value) => setReviewForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="review-remarks">Review Remarks *</Label>
                  <Textarea
                    id="review-remarks"
                    placeholder="Enter your review comments and observations..."
                    value={reviewForm.remarks}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="recommended-action">Recommended Action *</Label>
                  <Textarea
                    id="recommended-action"
                    placeholder="Specify recommended actions or next steps..."
                    value={reviewForm.recommendedAction}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, recommendedAction: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit}>
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SafetyReviewPage;
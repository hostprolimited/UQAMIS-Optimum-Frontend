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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

import { getMaintenanceReports, getFacilities, agentReviewMaintenanceReport } from "../../assements/core/_request";
import { Facility } from "../../assements/core/_model";

// charts
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// --- Types ---
interface AssessmentDetail {
  part_of_building: string;
  assessment_status: string;
  score?: number;
}

interface FacilityAssessment {
   id: string;
   institutionName: string;
   entity: string[];
   facilityType: string;
   assessmentDate: string; // ISO date string
   urgentItems: number;
   attentionItems: number;
   goodItems: number;
   totalItems: number;
   overallCondition: "good" | "attention required" | "urgent attention";
   status: 'pending' | 'reviewed' | 'approved' | 'rejected';
   agent_feedback?: string;
   school_feedback?: string;
   totalScorePercentage?: number;
   created_at?: string;
   details?: AssessmentDetail[];
 }

// Mapping helper
const mapMaintenanceReport = (report: any, facilityIdToName: Record<string, string>): FacilityAssessment => {
  let overallCondition: FacilityAssessment["overallCondition"] = "good";
  if (report.average_condition) {
    const cond = report.average_condition.toLowerCase();
    if (cond === "attention required") overallCondition = "attention required";
    else if (cond === "urgent attention") overallCondition = "urgent attention";
    else if (cond === "good") overallCondition = "good";
    else overallCondition = "good"; // default
  }

  return {
    id: report.id?.toString() ?? "",
    facilityType:
      facilityIdToName[report.facility_id?.toString()] || report.facility_type || report.facility_id?.toString() || "",
    assessmentDate: report.assessment_date ?? report.date ?? "",
    urgentItems: report.urgent_items ?? 0,
    entity: report.entity ? JSON.parse(report.entity) : [],
    attentionItems: report.attention_items ?? 0,
    goodItems: report.good_items ?? 0,
    totalItems: report.total_items ?? 0,
    overallCondition,
    status: report.status ?? "pending",
    agent_feedback: report.agent_feedback,
    institutionName: report.institution_name || report.school_name || getCurrentInstitutionName(),
    school_feedback: report.school_feedback,
    totalScorePercentage: report.total_score_percentage,
    created_at: report.created_at,
    details: report.details ?? [],
  };
};

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

const COLORS = ["#16a34a", "#3b82f6", "#facc15", "#dc2626"];

// --- Component ---
const MaintenanceAssessmentReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assessments, setAssessments] = useState<FacilityAssessment[]>([]);
  const [filteredData, setFilteredData] = useState<FacilityAssessment[]>([]);
  const [facilityIdToName, setFacilityIdToName] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

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
    status: "",
    priority: "",
    remarks: "",
    recommendedAction: "",
  });

  // Drilldown drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<FacilityAssessment | null>(null);

  const MySwal = withReactContent(Swal);

  // Fetch facilities and assessments
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
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
      } finally {
        if (mounted) setLoading(false);
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
      data = data.filter((d) => d.status === statusFilter);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      data = data.filter((d) => new Date(d.assessmentDate) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      data = data.filter((d) => new Date(d.assessmentDate) <= to);
    }

    setFilteredData(data);
  }, [assessments, facilityTypeFilter, conditionFilter, statusFilter, fromDate, toDate]);

  // Stats (memoized)
  const totalAssessments = useMemo(() => assessments.length, [assessments]);
  const totalSchools = useMemo(() => new Set(assessments.map((a) => a.institutionName)).size, [assessments]);
  const criticalFacilities = useMemo(() => assessments.filter((a) => a.overallCondition === "urgent attention").length, [assessments]);
  const avgScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const sum = assessments.reduce((s, a) => s + (a.totalScorePercentage ?? 0), 0);
    return Math.round((sum / assessments.length) * 10) / 10;
  }, [assessments]);

  // Chart data
  const conditionData = useMemo(
    () => [
      { name: "Good", value: assessments.filter((a) => a.overallCondition === "good").length },
      { name: "Attention Required", value: assessments.filter((a) => a.overallCondition === "attention required").length },
      { name: "Urgent Attention", value: assessments.filter((a) => a.overallCondition === "urgent attention").length },
    ],
    [assessments]
  );

  const statusData = useMemo(
    () => [
      { name: "Approved", value: assessments.filter((a) => a.status === "approved").length },
      { name: "Rejected", value: assessments.filter((a) => a.status === "rejected").length },
      { name: "Pending", value: assessments.filter((a) => a.status === "pending").length },
      { name: "Reviewed", value: assessments.filter((a) => a.status === "reviewed").length },
    ],
    [assessments]
  );

  // For simple time-series chart, group assessments by month (fallback to created_at or assessmentDate)
  const monthlyTrend = useMemo(() => {
    const map: Record<string, number> = {};
    assessments.forEach((a) => {
      const key = new Date(a.assessmentDate || a.created_at || "").toISOString().slice(0, 7); // YYYY-MM
      if (!map[key]) map[key] = 0;
      map[key] += 1;
    });
    return Object.keys(map)
      .sort()
      .map((k) => ({ month: k, value: map[k] }));
  }, [assessments]);

  // Table columns (keeps original richer columns for actions & details)
  const columns: ColumnDef<FacilityAssessment>[] = [
    {
      accessorKey: "institutionName",
      header: "School name",
      cell: ({ row }) => <div className="capitalize font-medium">{row.getValue("institutionName")}</div>,
    },
    {
      accessorKey: "facilityType",
      header: "Facility Type",
      cell: ({ row }) => <div className="capitalize font-medium">{row.getValue("facilityType")}</div>,
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => {
        const entityArray = row.getValue("entity") as string[];
        const displayText = entityArray.length > 0 ? entityArray.join(", ") : "N/A";
        return <div className="font-medium max-w-[250px] truncate" title={displayText}>{displayText}</div>;
      },
    },
    {
      accessorKey: "school_feedback",
      header: "School Feedback",
      cell: ({ row }) => (
        <div className="font-medium max-w-[250px] truncate" title={String(row.getValue("school_feedback"))}>
          {row.getValue("school_feedback")}
        </div>
      ),
    },
    {
      accessorKey: "totalScorePercentage",
      header: "Score (%)",
      cell: ({ row }) => <div className="text-center font-semibold">{row.getValue("totalScorePercentage") ?? "-"}</div>,
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
        return getStatusBadge(s);
      },
    },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   cell: ({ row }) => {
    //     const assessment = row.original;
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Open actions for ${assessment.institutionName}`}>
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem
    //             onClick={() => {
    //               // open review modal
    //               handleReview(assessment.id);
    //             }}
    //           >
    //             <Edit className="mr-2 h-4 w-4" />
    //             Review assessment
    //           </DropdownMenuItem>
    //           <DropdownMenuItem
    //             onClick={() => {
    //               // open drawer
    //               setDrawerItem(assessment);
    //               setDrawerOpen(true);
    //             }}
    //           >
    //             <BarChart3 className="mr-2 h-4 w-4" />
    //             View details
    //           </DropdownMenuItem>
    //           <DropdownMenuItem onClick={() => handleDelete(assessment.id)} className="text-red-600">
    //             <Trash2 className="mr-2 h-4 w-4" />
    //             Delete assessment
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];

  // --- Helpers for badges ---
  function getOverallConditionBadge(condition?: FacilityAssessment["overallCondition"]) {
    const conditionConfig: Record<string, { label: string; className: string }> = {
      good: { label: "Good", className: "bg-blue-100 text-blue-800" },
      "attention required": { label: "Attention Required", className: "bg-yellow-100 text-yellow-800" },
      "urgent attention": { label: "Urgent Attention", className: "bg-red-100 text-red-800" },
    };
    if (!condition) return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    const config = conditionConfig[condition];
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  function getStatusBadge(status?: FacilityAssessment["status"]) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      pending: { label: "Pending", className: "bg-gray-100 text-gray-800" },
      reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-800" },
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

  // --- Actions: Review ---
  const handleReview = (id: string) => {
    const found = assessments.find((a) => a.id === id);
    if (found) {
      setSelectedSubmission(found);
      setReviewForm({ status: "", priority: "", remarks: "", recommendedAction: "" });
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
      await agentReviewMaintenanceReport(parseInt(selectedSubmission!.id), data);
      toast({ title: "Success", description: "Review submitted successfully" });
      setIsReviewModalOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    }
  };

  // --- Export CSV ---
  const exportCSV = (rows: FacilityAssessment[]) => {
    if (!rows || rows.length === 0) {
      toast({ title: "No data", description: "No rows to export", variant: "destructive" });
      return;
    }
    const header = [
      "ID",
      "School",
      "Facility Type",
      "Assessment Date",
      "Urgent Items",
      "Attention Items",
      "Good Items",
      "Total Items",
      "Overall Condition",
      "Status",
      "Score (%)",
      "School Feedback",
    ];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.id,
          `"${(r.institutionName || "").replace(/"/g, '""')}"`,
          `"${(r.facilityType || "").replace(/"/g, '""')}"`,
          r.assessmentDate,
          r.urgentItems,
          r.attentionItems,
          r.goodItems,
          r.totalItems,
          r.overallCondition,
          r.status,
          r.totalScorePercentage ?? "",
          `"${(r.school_feedback || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `assessments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- UI ---
  return (
    <div className="space-y-8" role="main">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Maintenance Assessments Report</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor facility assessments across institutions. Use the filters to focus on specific facility types, conditions or date ranges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => exportCSV(filteredData)} aria-label="Export filtered as CSV" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()} aria-label="Print report" className="gap-2 hidden md:inline-flex">
            <FileText className="h-4 w-4" /> Print
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <section aria-label="summary metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Total Assessments</p>
            <h3 className="text-2xl font-bold">{loading ? "—" : totalAssessments}</h3>
            <p className="text-xs text-gray-400 mt-1">All loaded records</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Schools Covered</p>
            <h3 className="text-2xl font-bold">{loading ? "—" : totalSchools}</h3>
            <p className="text-xs text-gray-400 mt-1">Unique institutions</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Critical Facilities</p>
            <h3 className="text-2xl font-bold text-red-600">{loading ? "—" : criticalFacilities}</h3>
            <p className="text-xs text-gray-400 mt-1">Require immediate attention</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Average Score</p>
            <h3 className="text-2xl font-bold">{loading ? "—" : `${avgScore}%`}</h3>
            <p className="text-xs text-gray-400 mt-1">Across all assessments</p>
          </div>
        </div>
      </section>

      {/* Charts + Filters */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="charts and filters">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Trends & Distribution</h2>
            <div className="text-sm text-gray-500">Visual summary of conditions & status</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="value" name="Assessments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {statusData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex flex-col gap-1">
                  {statusData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 inline-block" style={{ background: COLORS[i] }} aria-hidden />
                      <span>{c.name} — {c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Box */}
        <aside className="bg-white p-4 rounded-lg shadow border" aria-label="filters">
          <h3 className="text-sm font-semibold mb-2">Filters</h3>
          <div className="space-y-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-600 mb-1">Facility type</span>
              <select value={facilityTypeFilter} onChange={(e) => setFacilityTypeFilter(e.target.value)} className="border rounded px-2 py-2" aria-label="Filter by facility type">
                <option value="">All facility types</option>
                {Array.from(new Set(assessments.map((a) => a.facilityType))).map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-xs text-gray-600 mb-1">Condition</span>
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="border rounded px-2 py-2" aria-label="Filter by condition">
                <option value="">All conditions</option>
                <option value="good">Good</option>
                <option value="attention required">Attention Required</option>
                <option value="urgent attention">Urgent Attention</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-xs text-gray-600 mb-1">Status</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-2 py-2" aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600 mb-1">From</span>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded px-2 py-2" aria-label="Filter from date" />
              </label>
              <label className="flex flex-col">
                <span className="text-xs text-gray-600 mb-1">To</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded px-2 py-2" aria-label="Filter to date" />
              </label>
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
              
            </div>
          </div>
        </aside>
      </section>

      {/* Table */}
      <section className="bg-white rounded-lg p-4 shadow border" aria-label="assessment records">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Schools Maintenance Assessment Records</h2>
            <p className="text-sm text-gray-500">Browse, filter and drill down into inspection results.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { /* toggle prefs */ }} aria-label="Table preferences">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => exportCSV(selectedRows.length ? selectedRows : filteredData)} aria-label="Export selection or filtered">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {/* simple skeleton loaders */}
            <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-40 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <AlertTriangle className="mx-auto mb-3" />
            <p>No assessments found for the selected filters.</p>
            <p className="text-sm mt-2">Adjust filters or try exporting all data.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            searchKey="institutionName"
            searchPlaceholder="Search schools or facilities..."
            enableRowSelection
            dense={false}
            onRowAction={(row, action) => {
              if (action === 'view') {
                setDrawerItem(row);
                setDrawerOpen(true);
              }
            }}
          />
        )}
      </section>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Assessment - {selectedSubmission?.institutionName}</DialogTitle>
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
                    <span className="font-medium">Overall Condition:</span> {selectedSubmission.overallCondition}
                  </div>
                  <div>
                    <span className="font-medium">Urgent Items:</span> {selectedSubmission.urgentItems}
                  </div>
                  <div>
                    <span className="font-medium">Assessment Date:</span> {new Date(selectedSubmission.assessmentDate).toLocaleDateString()}
                  </div>
                </div>

                {selectedSubmission.school_feedback && (
                  <div className="mt-3">
                    <span className="font-medium">School Admin Remarks:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedSubmission.school_feedback}</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="review-status">Review Decision *</Label>
                  <Select value={reviewForm.status} onValueChange={(value) => setReviewForm((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select review decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                      <SelectItem value="requires-clarification">Requires Clarification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={reviewForm.priority} onValueChange={(value) => setReviewForm((prev) => ({ ...prev, priority: value }))}>
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
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, remarks: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="recommended-action">Recommended Action</Label>
                  <Textarea
                    id="recommended-action"
                    placeholder="Specify recommended actions or next steps..."
                    value={reviewForm.recommendedAction}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, recommendedAction: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit}>Submit Review</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Drawer / Details dialog */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>{drawerItem?.institutionName} • {drawerItem?.facilityType}</DialogDescription>
          </DialogHeader>

          {drawerItem ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Assessment Date</p>
                  <p className="font-medium">{new Date(drawerItem.assessmentDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overall Condition</p>
                  <div className="mt-1">{getOverallConditionBadge(drawerItem.overallCondition)}</div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="font-medium">{drawerItem.totalScorePercentage ?? "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Items</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="p-2 border rounded text-sm">
                    <p className="text-xs text-gray-500">Urgent</p>
                    <p className="font-semibold">{drawerItem.urgentItems}</p>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <p className="text-xs text-gray-500">Needs Attention</p>
                    <p className="font-semibold">{drawerItem.attentionItems}</p>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <p className="text-xs text-gray-500">Good</p>
                    <p className="font-semibold">{drawerItem.goodItems}</p>
                  </div>
                </div>
              </div>

              {drawerItem.details && drawerItem.details.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Detailed Findings</p>
                  <ul className="mt-2 space-y-1">
                    {drawerItem.details.map((d, i) => (
                      <li key={i} className="text-sm">
                        <strong>{d.part_of_building}:</strong> {d.assessment_status} {d.score !== undefined ? `— ${d.score}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No details available</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceAssessmentReportPage;

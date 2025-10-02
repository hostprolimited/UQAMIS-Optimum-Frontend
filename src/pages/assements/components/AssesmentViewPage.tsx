import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ArrowLeft, FileText, Building2, AlertTriangle, CheckCircle, Clock, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

import { getMaintenanceReports, agentReviewMaintenanceReport, getFacilities, getSafetyReports, agentReviewSafetyReport, updateAssessment, deleteAssessment } from "../core/_request";
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
  status: string;
  agent_feedback?: string;
  school_feedback?: string;
  totalScorePercentage?: number;
  created_at?: string;
  details?: AssessmentDetail[];
}

// Mapping helper
const mapMaintenanceReport = (report: any, facilityIdToName: Record<string, string>): FacilityAssessment => ({
  id: report.id?.toString() ?? "",
  institutionName: report.institution_name || report.school_name || "School",
  class: report.class ? JSON.parse(report.class) : [],
  facilityType: facilityIdToName[report.facility_id?.toString()] || report.facility_type || report.facility_id?.toString() || "",
  assessmentDate: report.assessment_date ?? report.date ?? "",
  urgentItems: report.urgent_items ?? 0,
  attentionItems: report.attention_items ?? 0,
  goodItems: report.good_items ?? 0,
  totalItems: report.total_items ?? 0,
  averageCondition: report.average_condition ?? "good",
  completionStatus: report.completion_status ?? "pending",
  status: report.status ?? "pending",
  agent_feedback: report.agent_feedback,
  school_feedback: report.school_feedback,
  totalScorePercentage: report.total_score_percentage,
  created_at: report.created_at,
  details: report.details ?? [],
});

const AssessmentViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<FacilityAssessment | null>(null);
  const [allAssessments, setAllAssessments] = useState<FacilityAssessment[]>([]);
  const [safetyAssessments, setSafetyAssessments] = useState<FacilityAssessment[]>([]);
  const [facilityIdToName, setFacilityIdToName] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [assessmentType, setAssessmentType] = useState<'maintenance' | 'safety' | ''>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<FacilityAssessment | null>(null);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: '',
    priority: '',
    remarks: '',
    recommendedAction: '',
  });

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<AssessmentDetail | null>(null);
  const [editForm, setEditForm] = useState({
    part_of_building: '',
    assessment_status: '',
  });

  const MySwal = withReactContent(Swal);

  // Fetch assessment and facilities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch facilities for mapping
        const facilitiesRes = await getFacilities();
        const facilities: Facility[] = facilitiesRes?.data || [];
        const idToName = facilities.reduce((acc, f) => {
          acc[f.id.toString()] = f.name;
          return acc;
        }, {} as Record<string, string>);
        setFacilityIdToName(idToName);

        // Fetch assessments and find the one for this institution
        if (id) {
          // Fetch maintenance
          const maintenanceRes = await getMaintenanceReports();
          const maintenanceData = maintenanceRes?.data || [];
          const institutionMaintenance = maintenanceData.filter((report: any) => report.institution_id == parseInt(id));
          const mappedMaintenance = institutionMaintenance.map(report => mapMaintenanceReport(report, idToName));
          setAllAssessments(mappedMaintenance);

          // Fetch safety
          const safetyRes = await getSafetyReports();
          const safetyData = safetyRes?.data || [];
          const institutionSafety = safetyData.filter((report: any) => report.institution_id == parseInt(id));
          const mappedSafety = institutionSafety.map(report => mapMaintenanceReport(report, idToName));
          setSafetyAssessments(mappedSafety);

          // Take the most recent maintenance assessment for cards
          if (mappedMaintenance.length > 0) {
            const latestAssessment = mappedMaintenance.sort((a, b) =>
              new Date(b.created_at || b.assessmentDate).getTime() - new Date(a.created_at || a.assessmentDate).getTime()
            )[0];
            setAssessment(latestAssessment);
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load assessment", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  useEffect(() => {
    setSelectedFacility('');
    setSelectedAssessment(null);
  }, [assessmentType]);

  useEffect(() => {
    if (assessmentType && selectedFacility) {
      const assessments = assessmentType === 'maintenance' ? allAssessments : safetyAssessments;
      const ass = assessments.find(a => a.facilityType === selectedFacility);
      setSelectedAssessment(ass || null);
    } else {
      setSelectedAssessment(null);
    }
  }, [assessmentType, selectedFacility, allAssessments, safetyAssessments]);

  // Helpers for badges
  function getAverageConditionBadge(condition?: FacilityAssessment["averageCondition"]) {
    const conditionConfig: Record<string, { label: string; className: string }> = {
      excellent: { label: "Excellent", className: "bg-green-100 text-green-800" },
      good: { label: "Good", className: "bg-blue-100 text-blue-800" },
      attention: { label: "Needs Attention", className: "bg-yellow-100 text-yellow-800" },
      urgent_attention: { label: "Critical", className: "bg-red-100 text-red-800" },
    };
    if (!condition) return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    const config = conditionConfig[condition];
    if (!config) return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  function getStatusBadge(status?: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-gray-100 text-gray-800" },
      reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    };
    if (!status) return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    const config = statusConfig[status];
    if (!config) return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  // Review actions
  const handleReview = () => {
    setReviewForm({ status: '', priority: '', remarks: '', recommendedAction: '' });
    setIsReviewModalOpen(true);
  };

  // Edit actions
  const handleEditDetail = (detail: AssessmentDetail) => {
    setEditingDetail(detail);
    setEditForm({
      part_of_building: detail.part_of_building,
      assessment_status: detail.assessment_status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingDetail || !selectedAssessment) return;

    try {
      // Update the details array
      const updatedDetails = selectedAssessment.details?.map(d =>
        d.part_of_building === editingDetail.part_of_building
          ? { ...d, part_of_building: editForm.part_of_building, assessment_status: editForm.assessment_status }
          : d
      ) || [];

      await updateAssessment(parseInt(selectedAssessment.id), {
        status: selectedAssessment.status as any,
        school_feedback: selectedAssessment.school_feedback || '',
        agent_feedback: selectedAssessment.agent_feedback || '',
        class: selectedAssessment.class,
        details: updatedDetails.map(d => ({
          part_of_building: d.part_of_building,
          assessment_status: d.assessment_status as any,
        })),
      });

      toast({ title: "Success", description: "Detail updated successfully" });
      setIsEditModalOpen(false);
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update detail", variant: "destructive" });
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await deleteAssessment(parseInt(id));
      toast({ title: "Success", description: "Assessment deleted successfully" });
      navigate(-1); // Go back
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete assessment", variant: "destructive" });
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
      const reviewFunction = assessmentType === 'maintenance' ? agentReviewMaintenanceReport : agentReviewSafetyReport;
      await reviewFunction(parseInt(selectedAssessment!.id), data);
      toast({ title: "Success", description: "Review submitted successfully" });
      setIsReviewModalOpen(false);
      // Refresh assessment data
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested assessment could not be found.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const tableData = selectedAssessment ? selectedAssessment.details?.map(detail => ({
    ...detail,
    facilityType: selectedAssessment.facilityType,
    school_feedback: selectedAssessment.school_feedback,
    agent_feedback: selectedAssessment.agent_feedback,
  })) || [] : [];

  const columns: ColumnDef<typeof tableData[0]>[] = [
    {
      accessorKey: "part_of_building",
      header: "Part of Building",
    },
    {
      accessorKey: "facilityType",
      header: "Facility Type",
    },
    {
      accessorKey: "assessment_status",
      header: "Condition",
      cell: ({ row }) => {
        const status = row.getValue("assessment_status") as string;
        return (
          <Badge
            className={
              status === 'Urgent Attention'
                ? 'bg-red-100 text-red-800'
                : status === 'Attention Required'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => row.getValue("score") ?? '-',
    },
    {
      accessorKey: "school_feedback",
      header: "School Feedback",
      cell: ({ row }) => row.getValue("school_feedback") || '-',
    },
    {
      accessorKey: "agent_feedback",
      header: "Agent Feedback",
      cell: ({ row }) => row.getValue("agent_feedback") || '-',
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const detail = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditDetail(detail)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteAssessment(selectedAssessment!.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Assessment Review</h1>
          <p className="text-muted-foreground">Review assessment for {assessment.institutionName}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Assessment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Facility Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">School:</span> {assessment.institutionName}
            </div>
            <div>
              <span className="font-medium">Facility Type:</span> {assessment.facilityType}
            </div>
            <div>
              <span className="font-medium">Class:</span> {assessment.class.length > 0 ? assessment.class.join(", ") : "N/A"}
            </div>
            <div>
              <span className="font-medium">Assessment Date:</span> {new Date(assessment.assessmentDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Status:</span> {getStatusBadge(assessment.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Overall Condition:</span> {getAverageConditionBadge(assessment.averageCondition)}
            </div>
            <div>
              <span className="font-medium">Score:</span> {assessment.totalScorePercentage ?? 0}%
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-red-600">{assessment.urgentItems}</div>
                <div>Urgent</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{assessment.attentionItems}</div>
                <div>Attention</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{assessment.goodItems}</div>
                <div>Good</div>
              </div>
            </div>
          </CardContent>
        </Card> */}

      </div>

      {/* Assessment Selection */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Assessment To Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <Select value={assessmentType} onValueChange={(value: 'maintenance' | 'safety') => setAssessmentType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assessmentType && (
                <div className="flex-1">
                  <Label htmlFor="facility-type">Facility Type</Label>
                  <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set((assessmentType === 'maintenance' ? allAssessments : safetyAssessments).map(a => a.facilityType))].map(facility => (
                        <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedAssessment && (
                <Button onClick={handleReview} disabled={selectedAssessment.status === 'approved' || selectedAssessment.status === 'rejected'}>
                  {selectedAssessment.status === 'approved' || selectedAssessment.status === 'rejected' ? 'Reviewed' : 'Review'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Details */}
      {selectedAssessment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{assessmentType === 'maintenance' ? 'Maintenance' : 'Safety'} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={tableData} searchKey="part_of_building" />
          </CardContent>
        </Card>
      )}

      {/* Edit Detail Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Assessment Detail</DialogTitle>
            <DialogDescription>
              Update the assessment detail below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="part_of_building">Part of Building</Label>
              <Input
                id="part_of_building"
                value={editForm.part_of_building}
                onChange={(e) => setEditForm(prev => ({ ...prev, part_of_building: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="assessment_status">Condition</Label>
              <Select value={editForm.assessment_status} onValueChange={(value) => setEditForm(prev => ({ ...prev, assessment_status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Attention Required">Attention Required</SelectItem>
                  <SelectItem value="Urgent Attention">Urgent Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review {assessmentType} Assessment - {selectedAssessment?.institutionName}</DialogTitle>
            <DialogDescription>
              Review the {assessmentType} assessment and provide your decision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Assessment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Assessment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Facility:</span> {selectedAssessment?.facilityType}
                </div>
                <div>
                  <span className="font-medium">Overall Condition:</span> {selectedAssessment ? getAverageConditionBadge(selectedAssessment.averageCondition) : ''}
                </div>
                <div>
                  <span className="font-medium">Urgent Items:</span> {selectedAssessment?.urgentItems}
                </div>
                <div>
                  <span className="font-medium">Score:</span> {selectedAssessment?.totalScorePercentage ?? 0}%
                </div>
              </div>

              {selectedAssessment?.school_feedback && (
                <div className="mt-3">
                  <span className="font-medium">School Admin Remarks:</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedAssessment.school_feedback}</p>
                </div>
              )}
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentViewPage;
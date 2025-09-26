import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Building2,
  Calendar,
  User,
  MessageSquare,
  ChevronDown,
  MapPin
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import {getMaintenanceReportById, agentReviewMaintenanceReport} from '../core/_request';

// TypeScript interfaces for theupdateMaintenanceReport review system
interface FacilityAssessmentSubmission {
  id: string;
  schoolName: string;
  facilityType: string;
  region: string;
  district: string;
  submittedBy: string;
  submissionDate: string;
  assessmentDate: string;
  urgentItems: number;
  attentionItems: number;
  goodItems: number;
  totalItems: number;
  overallCondition: 'excellent' | 'good' | 'needs-attention' | 'critical';
  schoolAdminRemarks?: string;
  reviewStatus: 'pending-county' | 'pending-national' | 'approved' | 'rejected' | 'disbursed';
  countyReview?: AdminReview;
  nationalReview?: AdminReview;
  disbursementDetails?: DisbursementInfo;
}

interface AdminReview {
  reviewerId: string;
  reviewerName: string;
  reviewDate: string;
  status: 'approved' | 'rejected' | 'requires-clarification';
  remarks: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  recommendedAction?: string;
}

interface DisbursementInfo {
  disbursementDate: string;
  amount: number;
  disbursedBy: string;
  transactionId: string;
}

type ReviewUserRole = 'county_admin' | 'admin';

// Sample assessment submissions for review
const sampleSubmissions: FacilityAssessmentSubmission[] = [
    {
        id: 'SUB001',
        schoolName: 'Nyeri Primary School',
        facilityType: 'Classroom',
        region: 'Central',
        district: 'Nyeri County',
        submittedBy: 'John Wanjiku',
        submissionDate: '2025-09-18',
        assessmentDate: '2025-09-15',
        urgentItems: 5,
        attentionItems: 3,
        goodItems: 2,
        totalItems: 10,
        overallCondition: 'critical',
        schoolAdminRemarks: 'Roof leaking badly, windows broken, desks damaged. Urgent repairs needed before rainy season.',
        reviewStatus: 'pending-county'
    },
    {
        id: 'SUB002',
        schoolName: 'Mombasa Secondary School',
        facilityType: 'ICT Lab',
        region: 'Coast',
        district: 'Mombasa County',
        submittedBy: 'Mary Achieng',
        submissionDate: '2025-09-17',
        assessmentDate: '2025-09-14',
        urgentItems: 2,
        attentionItems: 4,
        goodItems: 6,
        totalItems: 12,
        overallCondition: 'needs-attention',
        schoolAdminRemarks: 'Some computers not working, need new software licenses, air conditioning unit broken.',
        reviewStatus: 'pending-national',
        countyReview: {
            reviewerId: 'CAD001',
            reviewerName: 'Dr. Hassan Juma',
            reviewDate: '2025-09-18',
            status: 'approved',
            remarks: 'Assessment looks thorough. ICT lab improvements are essential for digital learning. Recommend approval.',
            priority: 'medium',
            recommendedAction: 'Approve funding for computer repairs and software licenses'
        }
    },
    {
        id: 'SUB003',
        schoolName: 'Nakuru Girls Secondary',
        facilityType: 'Dormitories',
        region: 'Rift Valley',
        district: 'Nakuru County',
        submittedBy: 'Sister Agnes Wafula',
        submissionDate: '2025-09-16',
        assessmentDate: '2025-09-13',
        urgentItems: 1,
        attentionItems: 2,
        goodItems: 9,
        totalItems: 12,
        overallCondition: 'good',
        schoolAdminRemarks: 'Overall condition is good. Need to improve ventilation in two rooms.',
        reviewStatus: 'approved',
        countyReview: {
            reviewerId: 'CAD002',
            reviewerName: 'Eng. Fatuma Abdi',
            reviewDate: '2025-09-17',
            status: 'approved',
            remarks: 'Minor improvements needed. Good maintenance practices observed.',
            priority: 'low'
        },
        nationalReview: {
            reviewerId: 'NAD001',
            reviewerName: 'Prof. James Ochieng',
            reviewDate: '2025-09-18',
            status: 'approved',
            remarks: 'Approved for minor ventilation improvements. Well-maintained facility.',
            priority: 'low',
            recommendedAction: 'Allocate funds for ventilation system upgrade'
        }
    },
    {
        id: 'SUB004',
        schoolName: 'Kisumu Technical Institute',
        facilityType: 'Laboratories',
        region: 'Nyanza',
        district: 'Kisumu County',
        submittedBy: 'Dr. Paul Otieno',
        submissionDate: '2025-09-19',
        assessmentDate: '2025-09-16',
        urgentItems: 0,
        attentionItems: 1,
        goodItems: 11,
        totalItems: 12,
        overallCondition: 'excellent',
        schoolAdminRemarks: 'Laboratory equipment in excellent condition. Only minor calibration needed.',
        reviewStatus: 'disbursed',
        countyReview: {
            reviewerId: 'CAD003',
            reviewerName: 'Dr. Mariam Kamau',
            reviewDate: '2025-09-18',
            status: 'approved',
            remarks: 'Exemplary maintenance. Minimal funding required.',
            priority: 'low'
        },
        nationalReview: {
            reviewerId: 'NAD001',
            reviewerName: 'Prof. James Ochieng',
            reviewDate: '2025-09-19',
            status: 'approved',
            remarks: 'Approved for equipment calibration. This is a model facility.',
            recommendedAction: 'Allocate minimal funds for calibration services'
        },
        disbursementDetails: {
            disbursementDate: '2025-09-19',
            amount: 150000,
            disbursedBy: 'Ministry of Education',
            transactionId: 'TXN-2025-001'
        }
    }
];

const AssessmentReviewPage: React.FC = () => {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [submissions, setSubmissions] = useState<FacilityAssessmentSubmission[]>(sampleSubmissions);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FacilityAssessmentSubmission[]>(sampleSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FacilityAssessmentSubmission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Get the current user role for review permissions
  const currentUserRole: ReviewUserRole = currentUser.role === 'ministry_admin' ? 'admin' : 'county_admin';
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    status: '',
    remarks: '',
    priority: '',
    recommendedAction: ''
  });

  // Filter submissions based on search and status
  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.facilityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.reviewStatus === statusFilter);
    }

    // Filter based on user role - county admin sees pending-county, national admin sees pending-national
    if (currentUserRole === 'county_admin') {
      filtered = filtered.filter(submission => 
        submission.reviewStatus === 'pending-county' || submission.reviewStatus === 'pending-national' || 
        submission.reviewStatus === 'approved' || submission.reviewStatus === 'disbursed'
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, currentUserRole]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending-county': { className: 'bg-yellow-100 text-yellow-800', label: 'Pending County Review' },
      'pending-national': { className: 'bg-blue-100 text-blue-800', label: 'Pending National Review' },
      'approved': { className: 'bg-green-100 text-green-800', label: 'Approved' },
      'rejected': { className: 'bg-red-100 text-red-800', label: 'Rejected' },
      'disbursed': { className: 'bg-purple-100 text-purple-800', label: 'Disbursed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getConditionBadge = (condition: string) => {
    const conditionConfig = {
      'excellent': { className: 'bg-green-100 text-green-800', icon: CheckCircle },
      'good': { className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'needs-attention': { className: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'critical': { className: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = conditionConfig[condition as keyof typeof conditionConfig];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {condition.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const openReviewModal = (submission: FacilityAssessmentSubmission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      status: '',
      remarks: '',
      priority: '',
      recommendedAction: ''
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedSubmission || !reviewForm.status || !reviewForm.remarks) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedSubmissions = submissions.map(submission => {
      if (submission.id === selectedSubmission.id) {
        const newReview: AdminReview = {
          reviewerId: currentUserRole === 'county_admin' ? 'CAD004' : 'NAD002',
          reviewerName: currentUserRole === 'county_admin' ? 'Current County Admin' : 'Current National Admin',
          reviewDate: new Date().toISOString().split('T')[0],
          status: reviewForm.status as 'approved' | 'rejected' | 'requires-clarification',
          remarks: reviewForm.remarks,
          priority: reviewForm.priority as 'low' | 'medium' | 'high' | 'urgent',
          recommendedAction: reviewForm.recommendedAction
        };

        let newStatus = submission.reviewStatus;
        if (currentUserRole === 'county_admin') {
          submission.countyReview = newReview;
          if (reviewForm.status === 'approved') {
            newStatus = 'pending-national';
          } else if (reviewForm.status === 'rejected') {
            newStatus = 'rejected';
          }
        } else if (currentUserRole === 'admin') {
          submission.nationalReview = newReview;
          if (reviewForm.status === 'approved') {
            newStatus = 'approved';
          } else if (reviewForm.status === 'rejected') {
            newStatus = 'rejected';
          }
        }

        return { ...submission, reviewStatus: newStatus };
      }
      return submission;
    });

    setSubmissions(updatedSubmissions);
    setIsReviewModalOpen(false);
    setSelectedSubmission(null);
    
    toast({
      title: "Success",
      description: `Review submitted successfully`,
    });
  };

  const canReview = (submission: FacilityAssessmentSubmission) => {
    if (currentUserRole === 'county_admin') {
      return submission.reviewStatus === 'pending-county';
    } else if (currentUserRole === 'admin') {
      return submission.reviewStatus === 'pending-national';
    }
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assessment Review Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {currentUserRole === 'county_admin' ? 'County Administrator' : 'National Administrator'} Review Panel
            </p>
          </div>
          
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search schools, facilities, regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending-county">Pending County Review</SelectItem>
                <SelectItem value="pending-national">Pending National Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="bg-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {submission.schoolName}
                  </CardTitle>
                  {getStatusBadge(submission.reviewStatus)}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Building2 className="w-4 h-4 mr-1" />
                  {submission.facilityType}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location and Date Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {submission.region}, {submission.district}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Assessed: {new Date(submission.assessmentDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    Submitted by: {submission.submittedBy}
                  </div>
                </div>

                {/* Condition Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Condition:</span>
                    {getConditionBadge(submission.overallCondition)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-red-50 p-2 rounded">
                      <div className="text-lg font-bold text-red-600">{submission.urgentItems}</div>
                      <div className="text-xs text-red-600">Urgent</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <div className="text-lg font-bold text-yellow-600">{submission.attentionItems}</div>
                      <div className="text-xs text-yellow-600">Attention</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-lg font-bold text-green-600">{submission.goodItems}</div>
                      <div className="text-xs text-green-600">Good</div>
                    </div>
                  </div>
                </div>

                {/* School Admin Remarks */}
                {submission.schoolAdminRemarks && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">School Admin Notes:</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {submission.schoolAdminRemarks}
                    </p>
                  </div>
                )}

                {/* Review Status and Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // View details functionality - could open a detailed view modal
                      toast({
                        title: "View Details",
                        description: `Opening detailed view for ${submission.schoolName}`,
                      });
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {canReview(submission) && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openReviewModal(submission)}
                    >
                      Review
                    </Button>
                  )}
                </div>

                {/* Previous Review Info */}
                {submission.countyReview && currentUserRole === 'admin' && (
                  <div className="bg-blue-50 p-3 rounded-md mt-3">
                    <div className="text-sm font-medium text-blue-700 mb-1">County Review:</div>
                    <div className="text-sm text-blue-600">
                      <strong>{submission.countyReview.reviewerName}</strong> - {submission.countyReview.status}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{submission.countyReview.remarks}</p>
                  </div>
                )}

                {/* Disbursement Info */}
                {/* {submission.disbursementDetails && (
                  <div className="bg-purple-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-purple-700 mb-1">Disbursement:</div>
                    <div className="text-sm text-purple-600">
                      Amount: TZS {submission.disbursementDetails.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">
                      Date: {new Date(submission.disbursementDetails.disbursementDate).toLocaleDateString()}
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No assessment submissions available for review.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Assessment - {selectedSubmission?.schoolName}</DialogTitle>
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
                
                {selectedSubmission.schoolAdminRemarks && (
                  <div className="mt-3">
                    <span className="font-medium">School Admin Remarks:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedSubmission.schoolAdminRemarks}</p>
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
                      <SelectItem value="requires-clarification">Requires Clarification</SelectItem>
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
                  <Label htmlFor="recommended-action">Recommended Action</Label>
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

export default AssessmentReviewPage;

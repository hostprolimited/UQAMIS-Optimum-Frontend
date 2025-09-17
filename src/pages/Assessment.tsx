import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Filter, Plus, FileText, Star, Clock, CheckCircle, Building2, FlaskConical, Monitor, TreePine, BookOpen, Users, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';

// Mock facilities data for school admin
const mockFacilities = [
  { id: '1', name: 'Classrooms', icon: Building2, description: 'Classroom infrastructure and condition', assessments: 3, lastAssessment: '2024-01-15', avgScore: 87 },
  { id: '2', name: 'Laboratory', icon: FlaskConical, description: 'Science lab equipment and safety', assessments: 1, lastAssessment: '2024-01-10', avgScore: 75 },
  { id: '3', name: 'ICT Center', icon: Monitor, description: 'Computer lab and digital resources', assessments: 2, lastAssessment: '2024-01-20', avgScore: 82 },
  { id: '4', name: 'Compound', icon: TreePine, description: 'School grounds and outdoor facilities', assessments: 1, lastAssessment: '2024-01-05', avgScore: 90 },
  { id: '5', name: 'Library', icon: BookOpen, description: 'Library resources and study areas', assessments: 2, lastAssessment: '2024-01-12', avgScore: 85 },
  { id: '6', name: 'Sports Facilities', icon: Users, description: 'Playgrounds and sports equipment', assessments: 1, lastAssessment: '2024-01-08', avgScore: 78 },
];

// Mock school assessments for county review
const mockSchoolAssessments = [
  { 
    id: '1', 
    schoolName: 'Green Valley Primary School', 
    submittedBy: 'John Doe', 
    submittedDate: '2024-01-15',
    status: 'pending',
    overallScore: 87,
    facilities: [
      { name: 'Classrooms', score: 90, comments: 'Good condition, adequate lighting', recommendations: 'Add more whiteboards' },
      { name: 'Laboratory', score: 75, comments: 'Equipment needs maintenance', recommendations: 'Replace old microscopes' },
      { name: 'ICT Center', score: 82, comments: 'Modern computers, good internet', recommendations: 'Add more power outlets' }
    ]
  },
  { 
    id: '2', 
    schoolName: 'St. Mary Secondary School', 
    submittedBy: 'Mary Smith', 
    submittedDate: '2024-01-20',
    status: 'approved',
    overallScore: 92,
    facilities: [
      { name: 'Classrooms', score: 95, comments: 'Excellent condition', recommendations: 'Maintain current standards' },
      { name: 'Library', score: 88, comments: 'Well stocked with books', recommendations: 'Add digital resources' }
    ]
  }
];

// Assessment form schema for facility assessment
const facilityAssessmentSchema = z.object({
  facilityId: z.string().min(1, 'Please select a facility'),
  numberOfUnits: z.number().min(1, 'Please specify number of units'),
  averageCapacity: z.number().min(1, 'Please specify average capacity'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor'], {
    required_error: 'Please select condition',
  }),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  comments: z.string().min(10, 'Please provide detailed comments (minimum 10 characters)'),
  recommendations: z.string().min(10, 'Please provide recommendations (minimum 10 characters)'),
});

type FacilityAssessmentFormData = z.infer<typeof facilityAssessmentSchema>;

const assessmentCategories = {
  'Infrastructure': [
    'Building Safety & Condition',
    'Classroom Adequacy',
    'Sanitation Facilities',
    'Water Supply',
    'Electrical Systems',
    'Library & Resources'
  ],
  'Academic Quality': [
    'Teaching Standards',
    'Curriculum Compliance',
    'Student Performance',
    'Assessment Methods',
    'Learning Materials',
    'Teacher Qualifications'
  ],
  'Safety & Security': [
    'Emergency Preparedness',
    'Security Measures',
    'Child Protection Policies',
    'First Aid Facilities',
    'Fire Safety',
    'Playground Safety'
  ],
  'Administration': [
    'Record Keeping',
    'Financial Management',
    'Staff Management',
    'Parent Communication',
    'Policy Implementation',
    'Compliance Documentation'
  ]
};

const Assessment = () => {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<typeof mockFacilities[0] | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<typeof mockSchoolAssessments[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const facilityForm = useForm<FacilityAssessmentFormData>({
    resolver: zodResolver(facilityAssessmentSchema),
    defaultValues: {
      facilityId: '',
      numberOfUnits: 0,
      averageCapacity: 0,
      condition: 'good',
      score: 0,
      comments: '',
      recommendations: '',
    },
  });

  // Filter data based on user role
  const getFilteredData = () => {
    if (currentUser.role === 'school_admin') {
      return mockFacilities.filter(facility => 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (currentUser.role === 'county_admin') {
      return mockSchoolAssessments.filter(assessment => {
        const matchesSearch = assessment.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || assessment.status === filterStatus;
        return matchesSearch && matchesFilter;
      });
    }
    return [];
  };

  const filteredData = getFilteredData();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-info';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const handleFacilityAssessmentSubmit = async (data: FacilityAssessmentFormData) => {
    console.log('Facility Assessment Data:', data);
    
    toast({
      title: "Assessment Submitted Successfully!",
      description: `Assessment for ${selectedFacility?.name} has been recorded.`,
    });
    
    facilityForm.reset();
    setIsModalOpen(false);
    setSelectedFacility(null);
  };

  const handleAssessmentReview = async (action: 'approve' | 'reject', comments?: string) => {
    console.log('Assessment Review:', { action, assessmentId: selectedAssessment?.id, comments });
    
    toast({
      title: action === 'approve' ? "Assessment Approved!" : "Assessment Sent Back for Review",
      description: `${selectedAssessment?.schoolName} assessment has been ${action}d.`,
    });
    
    setIsReviewModalOpen(false);
    setSelectedAssessment(null);
  };

  const openFacilityAssessmentModal = (facility: typeof mockFacilities[0]) => {
    setSelectedFacility(facility);
    facilityForm.setValue('facilityId', facility.id);
    setIsModalOpen(true);
  };

  const openReviewModal = (assessment: typeof mockSchoolAssessments[0]) => {
    setSelectedAssessment(assessment);
    setIsReviewModalOpen(true);
  };

  const selectedCategory = facilityForm.watch('condition');

  // Render different views based on user role
  const renderSchoolAdminView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(filteredData as typeof mockFacilities).map((facility) => (
        <Card key={facility.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <facility.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {facility.description}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Assessments:</span>
              </div>
              <span className="text-sm font-semibold">{facility.assessments}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Avg Score:</span>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(facility.avgScore)}`}>
                {facility.avgScore}/100
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last: {new Date(facility.lastAssessment).toLocaleDateString()}
              </span>
            </div>

            <Button
              onClick={() => openFacilityAssessmentModal(facility)}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCountyAdminView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(filteredData as typeof mockSchoolAssessments).map((assessment) => (
        <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight">{assessment.schoolName}</CardTitle>
                <CardDescription className="mt-1">
                  Submitted by: {assessment.submittedBy}
                </CardDescription>
              </div>
              {getStatusBadge(assessment.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Overall Score:</span>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(assessment.overallScore)}`}>
                {assessment.overallScore}/100
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Submitted: {new Date(assessment.submittedDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {assessment.facilities.length} facilities assessed
              </span>
            </div>

            <Button
              onClick={() => openReviewModal(assessment)}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Review Assessment
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quality Assessment</h1>
          <p className="text-muted-foreground">
            {currentUser.role === 'school_admin' 
              ? 'Conduct facility assessments for your school'
              : 'Review and approve school assessments'
            }
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredData.length} {currentUser.role === 'school_admin' ? 'facilities' : 'assessments'} available
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={currentUser.role === 'school_admin' 
                  ? "Search facilities..." 
                  : "Search school assessments..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {currentUser.role === 'county_admin' && (
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Render based on user role */}
      {currentUser.role === 'school_admin' && renderSchoolAdminView()}
      {currentUser.role === 'county_admin' && renderCountyAdminView()}

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No {currentUser.role === 'school_admin' ? 'Facilities' : 'Assessments'} Found
            </h3>
            <p className="text-muted-foreground">
              No {currentUser.role === 'school_admin' ? 'facilities' : 'assessments'} match your current search criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Facility Assessment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>New Facility Assessment</span>
            </DialogTitle>
            <DialogDescription>
              {selectedFacility && `Create a new assessment for ${selectedFacility.name}`}
            </DialogDescription>
          </DialogHeader>

          <Form {...facilityForm}>
            <form onSubmit={facilityForm.handleSubmit(handleFacilityAssessmentSubmit)} className="space-y-4">
              {/* Number of Units */}
              <FormField
                control={facilityForm.control}
                name="numberOfUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Units</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., Number of classrooms, labs, etc."
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Average Capacity */}
              <FormField
                control={facilityForm.control}
                name="averageCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., Average students per classroom"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Condition */}
              <FormField
                control={facilityForm.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Score Input */}
              <FormField
                control={facilityForm.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter assessment score"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comments */}
              <FormField
                control={facilityForm.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed observations and findings..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recommendations */}
              <FormField
                control={facilityForm.control}
                name="recommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide recommendations for improvement..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Submit Assessment
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assessment Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Review Assessment</span>
            </DialogTitle>
            <DialogDescription>
              {selectedAssessment && `Assessment for ${selectedAssessment.schoolName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Name</p>
                  <p className="font-semibold">{selectedAssessment.schoolName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-semibold">{selectedAssessment.submittedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submission Date</p>
                  <p className="font-semibold">{new Date(selectedAssessment.submittedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className={`font-semibold text-lg ${getScoreColor(selectedAssessment.overallScore)}`}>
                    {selectedAssessment.overallScore}/100
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Facility Assessments</h3>
                {selectedAssessment.facilities.map((facility, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{facility.name}</CardTitle>
                        <span className={`font-semibold ${getScoreColor(facility.score)}`}>
                          {facility.score}/100
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Comments:</p>
                        <p className="text-sm">{facility.comments}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommendations:</p>
                        <p className="text-sm">{facility.recommendations}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAssessmentReview('reject')}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Send Back for Review
                </Button>
                <Button
                  onClick={() => handleAssessmentReview('approve')}
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Assessment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assessment;
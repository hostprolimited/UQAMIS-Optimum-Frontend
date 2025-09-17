import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Filter, Plus, FileText, Star, Clock, CheckCircle } from 'lucide-react';
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

// Mock schools data
const mockSchools = [
  { id: '1', name: 'Green Valley Primary School', county: 'Nairobi', subCounty: 'Westlands', status: 'pending', lastAssessment: '2024-01-15', score: 87 },
  { id: '2', name: 'St. Mary Secondary School', county: 'Nairobi', subCounty: 'Dagoretti North', status: 'completed', lastAssessment: '2024-01-20', score: 92 },
  { id: '3', name: 'Hillside Academy', county: 'Nairobi', subCounty: 'Langata', status: 'in-progress', lastAssessment: '2024-01-10', score: 78 },
  { id: '4', name: 'Riverside Primary', county: 'Mombasa', subCounty: 'Nyali', status: 'needs-review', lastAssessment: '2024-01-05', score: 65 },
];

// Assessment form schema
const assessmentSchema = z.object({
  schoolId: z.string().min(1, 'Please select a school'),
  category: z.string().min(1, 'Please select a category'),
  criteria: z.string().min(1, 'Please select criteria'),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  comments: z.string().min(10, 'Please provide detailed comments (minimum 10 characters)'),
  recommendations: z.string().min(10, 'Please provide recommendations (minimum 10 characters)'),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

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
  const [selectedSchool, setSelectedSchool] = useState<typeof mockSchools[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      schoolId: '',
      category: '',
      criteria: '',
      score: 0,
      comments: '',
      recommendations: '',
    },
  });

  const filteredSchools = mockSchools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.county.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || school.status === filterStatus;
    
    // Role-based filtering
    if (currentUser.role === 'county_admin') {
      return matchesSearch && matchesFilter && school.county === currentUser.county;
    }
    if (currentUser.role === 'school_admin') {
      return matchesSearch && matchesFilter && school.name === currentUser.school;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-info text-info-foreground">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'needs-review':
        return <Badge className="bg-destructive text-destructive-foreground">Needs Review</Badge>;
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

  const handleAssessmentSubmit = async (data: AssessmentFormData) => {
    console.log('Assessment Data:', data);
    
    toast({
      title: "Assessment Submitted Successfully!",
      description: `Assessment for ${selectedSchool?.name} has been recorded.`,
    });
    
    form.reset();
    setIsModalOpen(false);
    setSelectedSchool(null);
  };

  const openAssessmentModal = (school: typeof mockSchools[0]) => {
    setSelectedSchool(school);
    form.setValue('schoolId', school.id);
    setIsModalOpen(true);
  };

  const selectedCategory = form.watch('category');
  const criteriaOptions = selectedCategory ? assessmentCategories[selectedCategory as keyof typeof assessmentCategories] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quality Assessment</h1>
          <p className="text-muted-foreground">
            Conduct and manage quality assessments for educational institutions
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} available
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools by name or county..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="needs-review">Needs Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{school.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {school.subCounty}, {school.county}
                  </CardDescription>
                </div>
                {getStatusBadge(school.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Latest Score:</span>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(school.score)}`}>
                  {school.score}/100
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last Assessment: {new Date(school.lastAssessment).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => openAssessmentModal(school)}
                  className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
                
                {currentUser.role === 'county_admin' && (
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Schools Found</h3>
            <p className="text-muted-foreground">
              No schools match your current search criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assessment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>New Quality Assessment</span>
            </DialogTitle>
            <DialogDescription>
              {selectedSchool && `Create a new assessment for ${selectedSchool.name}`}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAssessmentSubmit)} className="space-y-4">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('criteria', ''); // Reset criteria when category changes
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assessment category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(assessmentCategories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Criteria Selection */}
              <FormField
                control={form.control}
                name="criteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Criteria</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specific criteria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {criteriaOptions.map((criteria) => (
                          <SelectItem key={criteria} value={criteria}>
                            {criteria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Score Input */}
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
    </div>
  );
};

export default Assessment;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Plus, Upload, X, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { getFacilities, createMaintenanceAssessment } from "../core/_request";
import { Facility } from "../core/_model";

// Facility type mappings for consistent naming
const FACILITY_TYPE_MAPPINGS: { [key: string]: string } = {
  'class room': 'classroom',
  'class rooms': 'classroom',
  'classroom': 'classroom',
  'classrooms': 'classroom',
  'dormitory': 'dormitory',
  'dormitories': 'dormitory',
  'laboratory': 'laboratory',
  'laboratories': 'laboratory',
  'lab': 'laboratory',
  'labs': 'laboratory',
  'toilet': 'toilet',
  'toilets': 'toilet',
  'washroom': 'toilet',
  'washrooms': 'toilet',
  'library': 'library',
  'libraries': 'library',
  'office': 'office',
  'offices': 'office',
  'dining hall': 'dining_hall',
  'dining halls': 'dining_hall',
  'dining_hall': 'dining_hall',
  'compound': 'compound',
  'grounds': 'compound',
  'school compound': 'compound'
};

// Facility parts configuration
const FACILITY_PARTS = {
  classroom: [
    'Outside wall',
    'Verandah',
    'Roof',
    'Door',
    'Floor',
    'Inside wall',
    'Blackboard',
    'Ceiling'
  ],
  dormitory: [
    'Outside wall',
    'Flower beds',
    'Roof',
    'Door',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Hanging lines',
    'Curtains',
    'Ceiling'
  ],
  laboratory: [
    'Outside wall',
    'Gas taps',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Water taps',
    'Cupboards',
    'Ceiling',
    'Black board',
    'Tables',
    'Stools'
  ],
  toilet: [
    'Outside wall',
    'Drainage',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall'
  ],
  library: [
    'Outside wall',
    'Verandah',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Shelves',
    'Tables/Chairs',
    'Ceiling'
  ],
  office: [
    'Outside wall',
    'Verandah',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Tables/Chairs',
    'Ceiling'
  ],
  dining_hall: [
    'Outside wall',
    'Flower beds',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Tables',
    'Seats',
    'Ceiling'
  ],
  compound: [
    'Lawns',
    'Flowers',
    'Ornamentals',
    'Hedges',
    'Trees',
    'Fences',
    'Walk ways',
    'Pavements',
    'Road'
  ],
  ICTLab: [
    'Outside wall',
    'Verandah',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Tables/Chairs',
    'Ceiling'
  ],
  SportsFacilities: [
    'Outside wall',
    'Verandah',
    'Roof',
    'Door',
    'Door lock',
    'Window panes',
    'Window lock',
    'Floor',
    'Inside wall',
    'Tables/Chairs',
    'Ceiling'
  ]

};

// Facility assessment schema
const facilityAssessmentSchema = z.object({
  institution_id: z.number(),
  facility_id: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  details: z.array(z.object({
    part_of_building: z.string(),
    assessment_status: z.enum(['Urgent Attention', 'Attention', 'Good'], {
      required_error: 'Please select a condition'
    })
  })),
  school_feedback: z.string().min(1, 'School feedback is required'),
  agent_feedback: z.string().optional(),
  files: z.array(z.instanceof(File)).optional()
});

type FacilityAssessmentData = z.infer<typeof facilityAssessmentSchema>;

// Helper function to get facility parts based on facility type
const getFacilityParts = (facilityType: string): string[] => {
  // Clean and normalize the input facility type
  const normalizedInput = facilityType.toLowerCase().trim();
  // Get the standard type from our mappings
  const standardType = FACILITY_TYPE_MAPPINGS[normalizedInput] || normalizedInput;
  const parts = FACILITY_PARTS[standardType as keyof typeof FACILITY_PARTS];
  if (!parts) {
    
  }
  return parts || [];
};

const AssessmentAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilityParts, setFacilityParts] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getFacilities();
        setFacilities(response.data || []); // Access the data property of the APIResponse
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load facilities.",
          variant: "destructive",
        });
        setFacilities([]); // Set empty array as fallback
      }
    };
    fetchFacilities();
  }, [toast]);

  // Initialize form with empty values
  const facilityForm = useForm<FacilityAssessmentData>({
    resolver: zodResolver(facilityAssessmentSchema),
    defaultValues: {
      institution_id: 1,
      facility_id: 0,
      status: 'pending',
      details: [],
      school_feedback: '',
      agent_feedback: '',
      files: []
    }
  });
  
  // Update form when a facility is selected
  useEffect(() => {
    if (selectedFacility) {
      const parts = getFacilityParts(selectedFacility.name);
      setFacilityParts(parts);
      facilityForm.reset({
        institution_id: selectedFacility.institution_id || 1,
        facility_id: selectedFacility.id,
        status: 'pending',
        details: parts.map(name => ({
          part_of_building: name,
          assessment_status: 'Good'
        })),
        school_feedback: '',
        agent_feedback: '',
        files: []
      });
    }
  }, [selectedFacility]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    facilityForm.setValue('files', newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    facilityForm.setValue('files', newFiles);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    facilityForm.setValue('files', newFiles);
  };

  const openAssessmentModal = (facility: Facility) => {
    setSelectedFacility(facility);
    
    // Get the parts for this facility type
    const facilityParts = getFacilityParts(facility.name);
    setFacilityParts(facilityParts);
    
    // Initialize form with default values for each part
      facilityForm.reset({ 
        facility_id: facility.id,
        details: facilityParts.map(name => ({ part_of_building: name, assessment_status: 'Good' })),
        files: []
      });    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleFacilityAssessmentSubmit = async (data: FacilityAssessmentData) => {
    try {
      if (!selectedFacility) return;

      // Create the assessment input object matching MaintenanceAssessmentInput type
      const assessmentInput = {
        institution_id: selectedFacility.institution_id || 1,
        facility_id: data.facility_id,
        status: 'pending' as 'pending',
        details: data.details.map(detail => ({
          part_of_building: detail.part_of_building,
          assessment_status: detail.assessment_status
        })),
        school_feedback: data.school_feedback,
        agent_feedback: data.agent_feedback,
        files: uploadedFiles
      };

      const response = await createMaintenanceAssessment(assessmentInput);

      if (response && response.status === 'error') {
        toast({
          title: 'Submission Error',
          description: response.message || 'Failed to submit assessment',
          variant: 'destructive',
        });
        return;
      }

      // Update the assessments list with the new assessment
      const newAssessment = {
        id: Date.now().toString(),
        facilityId: data.facility_id,
        facilityType: selectedFacility.name,
        assessmentDate: new Date().toISOString(),
        details: data.details,
      };

      setAssessments(prev => [newAssessment, ...prev]);

      toast({
        title: 'Assessment Submitted',
        description: `${selectedFacility.name} assessment submitted successfully!`,
        variant: 'default',
      });

      setIsModalOpen(false);
      setUploadedFiles([]);
      facilityForm.reset();
      setSelectedFacility(null);
    } catch (error: any) {
      // Try to extract backend error message
      let message = 'Failed to submit assessment';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      toast({
        title: 'Submission Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const getAssessmentCount = (facilityId: string) => {
    return assessments.filter(assessment => assessment.facilityId === facilityId).length;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">Facility Assessment</h1>
          <p className="text-muted-foreground mt-1">Select a facility type to begin assessment</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/maintenance/assessment')}
          className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>
      </div>

  {/* Facility Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {facilities.map((facility) => {
          const assessmentCount = getAssessmentCount(facility.id.toString());
          return (
            <Card key={facility.id} className={`${facility.color ?? "bg-white hover:bg-gray-50 border-gray-200"} cursor-pointer transition-all hover:shadow-lg border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">{facility.name}</CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">{facility.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">{facility.statistics}</span>
                  {assessmentCount > 0 && (
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {assessmentCount} completed
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => openAssessmentModal(facility)}
                  className="w-full bg-[#010162] hover:bg-[#010162]/90 text-white"
                  variant="default"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Assessment
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      

      {/* Assessment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFacility?.name} Assessment
            </DialogTitle>
          </DialogHeader>
          
          {selectedFacility && (
            <Form {...facilityForm}>
              <form
                onSubmit={facilityForm.handleSubmit(handleFacilityAssessmentSubmit)}
                className="space-y-6"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">S/No</th>
                        <th className="border px-4 py-2 text-left">Part of Building</th>
                        <th className="border px-4 py-2 text-center">Urgent Attention</th>
                        <th className="border px-4 py-2 text-center">Attention</th>
                        <th className="border px-4 py-2 text-center">Good</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilityParts.map((part, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">{index + 1}</td>
                          <td className="border px-4 py-2">{part}</td>
                          {['urgent', 'attention', 'good'].map((condition) => (
                            <td key={condition} className="border px-4 py-2 text-center">
                              <FormField
                                control={facilityForm.control}
                                name={`details.${index}.assessment_status`}
                                render={({ field }) => (
                                  <FormItem className="flex justify-center">
                                    <FormControl>
                                      <input
                                        type="radio"
                                        value={condition}
                                        checked={field.value === (condition === 'urgent' ? 'Urgent Attention' : condition === 'attention' ? 'Attention' : 'Good')}
                                        onChange={() => {
                                          const updatedDetails = [...facilityForm.getValues().details];
                                          updatedDetails[index] = {
                                            part_of_building: part,
                                            assessment_status: condition === 'urgent' ? 'Urgent Attention' : condition === 'attention' ? 'Attention' : 'Good'
                                          };
                                          facilityForm.setValue('details', updatedDetails);
                                        }}
                                        className={`h-4 w-4 ${condition === 'urgent' && field.value === 'Urgent Attention' ? 'text-red-600' : ''}`}
                                        style={condition === 'urgent' && field.value === 'Urgent Attention' ? { accentColor: '#dc2626' } : {}}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <FormField
                    control={facilityForm.control}
                    name="files"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Upload Supporting Documents</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {/* File Upload Area */}
                            <div
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-lg font-medium text-gray-700">Drop files here or click to upload</p>
                              <p className="text-sm text-gray-500 mt-1">Support for multiple files (PDF, DOC, JPG, PNG)</p>
                              <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>

                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                      <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* School Feedback Section */}
                  <FormField
                    control={facilityForm.control}
                    name="school_feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter notes, concerns, and priorities..."
                            className="min-h-[120px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agent Feedback Section */}
                  {/* <FormField
                    control={facilityForm.control}
                    name="agent_feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Agent Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your assessment notes, observations, and recommendations..."
                            className="min-h-[120px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>

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
                    className="flex-1 bg-[#F89B0C] hover:bg-[#F89B0C]/90 text-primary-foreground"
                  >
                    Submit Assessment
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentAddPage;
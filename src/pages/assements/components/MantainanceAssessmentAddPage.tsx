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

// Facility assessment schema
const facilityAssessmentSchema = z.object({
  facility: z.array(z.object({
    condition: z.enum(['urgent', 'attention', 'good'], {
      required_error: 'Please select a condition'
    })
  })),
  reviewRemarks: z.string().min(1, 'Review remarks are required'),
  files: z.array(z.instanceof(File)).optional()
});

type FacilityAssessmentData = z.infer<typeof facilityAssessmentSchema>;

const AssessmentAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
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

  const facilityForm = useForm<FacilityAssessmentData>({
    resolver: zodResolver(facilityAssessmentSchema),
    defaultValues: {
      facility: [],
      reviewRemarks: '',
      files: []
    }
  });

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
    // Initialize form with default values for each part
    const defaultFacility = (facility.parts || []).map(() => ({ condition: undefined }));
    facilityForm.reset({ 
      facility: defaultFacility,
      reviewRemarks: '',
      files: []
    });
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleFacilityAssessmentSubmit = async (data: FacilityAssessmentData) => {
    try {
      if (!selectedFacility) return;
      const payload = {
        facilityId: selectedFacility.id,
        reviewRemarks: data.reviewRemarks,
        parts: (selectedFacility.parts || []).map((part, index) => ({
          name: part,
          condition: data.facility[index]?.condition || 'good'
        })),
        files: uploadedFiles,
      };
      await createMaintenanceAssessment(payload);
      toast({
        title: "Success",
        description: `${selectedFacility.name} assessment submitted successfully`,
      });
      setIsModalOpen(false);
      setUploadedFiles([]);
      facilityForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive",
      });
    }
  };

  const getAssessmentCount = (facilityId: string) => {
    return assessments.filter(assessment => assessment.facilityId === facilityId).length;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/assessments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Facility Assessment</h1>
          <p className="text-muted-foreground">
            Select a facility type to begin assessment
          </p>
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Assessments</h2>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{assessment.facilityType}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(assessment.assessmentDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Urgent Attention:</strong> {' '}
                      {assessment.parts.filter((p: any) => p.condition === 'urgent').length}
                    </div>
                    <div>
                      <strong>Needs Attention:</strong> {' '}
                      {assessment.parts.filter((p: any) => p.condition === 'attention').length}
                    </div>
                    <div>
                      <strong>Good Condition:</strong> {' '}
                      {assessment.parts.filter((p: any) => p.condition === 'good').length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
                      {selectedFacility.parts?.map((part, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">{index + 1}</td>
                          <td className="border px-4 py-2">{part}</td>
                          {["urgent", "attention", "good"].map((condition) => (
                            <td key={condition} className="border px-4 py-2 text-center">
                              <FormField
                                control={facilityForm.control}
                                name={`facility.${index}.condition`}
                                render={({ field }) => (
                                  <FormItem className="flex justify-center">
                                    <FormControl>
                                      <input
                                        type="radio"
                                        value={condition}
                                        checked={field.value === condition}
                                        onChange={() => field.onChange(condition)}
                                        className="h-4 w-4"
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

                  {/* Review Remarks Section */}
                  <FormField
                    control={facilityForm.control}
                    name="reviewRemarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Review Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter detailed review remarks, observations, and recommendations for this facility assessment..."
                            className="min-h-[120px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Facility assessment schema
const facilityAssessmentSchema = z.object({
  facility: z.array(z.object({
    condition: z.enum(['urgent', 'attention', 'good'], {
      required_error: 'Please select a condition'
    })
  }))
});

type FacilityAssessmentData = z.infer<typeof facilityAssessmentSchema>;

// Facility types with their configurations
const facilitiesConfig = [
  {
    id: 'classroom',
    name: 'Classroom',
    description: 'Learning spaces for student education',
    statistics: '12 assessment items • Primary learning facility',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Outside wall",
      "Verandah", 
      "Roof",
      "Door",
      "Door lock",
      "Window panes",
      "Window lock",
      "Floor",
      "Inside wall",
      "Black Board",
      "Notice board",
      "Ceiling"
    ]
  },
  {
    id: 'compound',
    name: 'Compound',
    description: 'School perimeter and external facilities',
    statistics: '10 assessment items • Safety & security focus',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Main gate",
      "Fence perimeter",
      "Pathways",
      "Drainage system",
      "Lighting",
      "Security features",
      "Landscape/Gardens",
      "Parking area",
      "Assembly area",
      "Waste disposal area"
    ]
  },
  {
    id: 'ict-lab',
    name: 'ICT Lab',
    description: 'Information and Communication Technology facility',
    statistics: '10 assessment items • Technology infrastructure',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Computer workstations",
      "Server/Network equipment",
      "Electrical wiring",
      "Air conditioning",
      "Internet connectivity",
      "Security systems",
      "Furniture",
      "Projection equipment",
      "Software licenses",
      "Cable management"
    ]
  },
  {
    id: 'toilets',
    name: 'Toilets',
    description: 'Sanitation and hygiene facilities',
    statistics: '10 assessment items • Health & sanitation',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Toilet bowls/Squat pans",
      "Water supply",
      "Sewerage system",
      "Hand washing facilities",
      "Doors and locks",
      "Roof and walls",
      "Ventilation",
      "Accessibility features",
      "Cleanliness supplies",
      "Septic tank/Connection"
    ]
  },
  {
    id: 'laboratories',
    name: 'Laboratories',
    description: 'Science and research facilities',
    statistics: '10 assessment items • Scientific equipment',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Work benches",
      "Chemical storage",
      "Safety equipment",
      "Ventilation system",
      "Water supply",
      "Gas connections",
      "Electrical fittings",
      "Emergency exits",
      "Fire safety",
      "Waste disposal"
    ]
  },
  {
    id: 'dining-halls',
    name: 'Dining Halls',
    description: 'Food service and dining facilities',
    statistics: '10 assessment items • Nutrition & hygiene',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Dining tables",
      "Seating",
      "Kitchen facilities",
      "Food storage",
      "Water supply",
      "Waste management",
      "Ventilation",
      "Hygiene facilities",
      "Serving area",
      "Floor and walls"
    ]
  },
  {
    id: 'sports-facilities',
    name: 'Sports Facilities',
    description: 'Physical education and recreational areas',
    statistics: '10 assessment items • Sports & recreation',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Playing fields",
      "Equipment storage",
      "Changing rooms",
      "Spectator areas",
      "Boundary marking",
      "Goal posts/Nets",
      "Safety barriers",
      "Lighting",
      "Drainage",
      "Access paths"
    ]
  },
  {
    id: 'dormitories',
    name: 'Dormitories',
    description: 'Student residential accommodation',
    statistics: '10 assessment items • Accommodation & welfare',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Sleeping areas",
      "Beds and mattresses",
      "Personal storage",
      "Common areas",
      "Bathroom access",
      "Security features",
      "Ventilation",
      "Lighting",
      "Emergency exits",
      "Study areas"
    ]
  },
  {
    id: 'offices',
    name: 'Offices',
    description: 'Administrative and staff work areas',
    statistics: '10 assessment items • Administration & management',
    color: 'bg-white hover:bg-gray-50 border-gray-200',
    parts: [
      "Furniture",
      "Filing systems",
      "Electrical fittings",
      "Communication systems",
      "Security features",
      "Ventilation",
      "Lighting",
      "Access control",
      "Emergency equipment",
      "Storage facilities"
    ]
  }
];

const AssessmentAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<typeof facilitiesConfig[0] | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  const facilityForm = useForm<FacilityAssessmentData>({
    resolver: zodResolver(facilityAssessmentSchema),
    defaultValues: {
      facility: []
    }
  });

  const openAssessmentModal = (facility: typeof facilitiesConfig[0]) => {
    setSelectedFacility(facility);
    // Initialize form with default values for each part
    const defaultFacility = facility.parts.map(() => ({ condition: undefined }));
    facilityForm.reset({ facility: defaultFacility });
    setIsModalOpen(true);
  };

  const handleFacilityAssessmentSubmit = async (data: FacilityAssessmentData) => {
    try {
      if (!selectedFacility) return;

      // Create assessment object
      const assessment = {
        id: Date.now().toString(),
        facilityType: selectedFacility.name,
        facilityId: selectedFacility.id,
        parts: selectedFacility.parts.map((part, index) => ({
          name: part,
          condition: data.facility[index]?.condition || 'good'
        })),
        assessmentDate: new Date().toISOString(),
        assessor: 'Current User' // Replace with actual user
      };

      // Add to assessments list
      setAssessments(prev => [...prev, assessment]);

      toast({
        title: "Success",
        description: `${selectedFacility.name} assessment submitted successfully`,
      });

      setIsModalOpen(false);
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
        {facilitiesConfig.map((facility) => {
          const assessmentCount = getAssessmentCount(facility.id);
          
          return (
            <Card key={facility.id} className={`${facility.color} cursor-pointer transition-all hover:shadow-lg border-2`}>
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                      {selectedFacility.parts.map((part, index) => (
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
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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

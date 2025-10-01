
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Plus, Upload, X, FileText, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { getFacilities, createMaintenanceAssessment, createSafetyAssessment } from "../core/_request";
import { Facility } from "../core/_model";
import { getSchoolEntities } from '../../facilities/core/_requests';
import ClassSafetyForm from './SafetyFormPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';

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

// Facility safety parts configuration
const FACILITY_SAFETY_PARTS = {
  classroom: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  library: [
    "Door opens outside",
    "Windows open outside",
    "Windows have grills",
    "Spacing between tables adequate",
    "At least 5 students in every class are trained to evacuate the rest in case of emergency",
    "Students from every class have undertaken an evacuation drill in case of emergency",
    "Basic first aid kit is available.",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the library provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the Library.",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  laboratory: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher, sand bucket and fire blanket within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
    "There is a reliable source of tap water",
    "There is a fully fitted first aid kit",
  ],
  dormitory: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between beds adequate",
    "At least 10 students in the dorm are trained to evacuate the rest in case of emergency",
    "The dorm members have undertaken an evacuation drill in case of emergency",
    "At least 10 students in the dorm have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the dormitory provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the dormitory",
    "At least 10 students in the dorm are trained on how to handle the available fire extinguisher",
  ],
  toilet: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  office: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  dining_hall: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between tables adequate",
    "At least 5 students in every class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in every class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the dining hall provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the dining hall.",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  compound: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  ICTLab: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
  SportsFacilities: [
    "Door opens outside",
    "Windows open outside",
    "Windows have no grills",
    "Spacing between desks adequate",
    "At least 5 students in class are trained to evacuate the rest in case of emergency",
    "The class have undertaken an evacuation drill in case of emergency",
    "At least five students in class have basic first aid skills",
    "The floor provides appropriate grip",
    "The space immediately outside the classroom provides easy movement in case of emergency",
    "There is a clear display of action expected in case of emergency",
    "There is a clear display of assembly point in case of emergency",
    "There is a fire extinguisher within close proximity from the classroom",
    "At least five students are trained on how to handle the available fire extinguisher",
  ],
};

// Facility assessment schema
const facilityAssessmentSchema = z.object({
  institution_id: z.number(),
  facility_id: z.number(),
  class: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  details: z.array(z.object({
    part_of_building: z.string(),
    assessment_status: z.enum(['Urgent Attention', 'Attention Required', 'Good'], {
      required_error: 'Please select a condition'
    })
  })),
  school_feedback: z.string().min(1, 'School feedback is required'),
  agent_feedback: z.string().optional(),
  files: z.array(z.instanceof(File)).optional(),
  classes: z.array(z.string()).optional(),
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
    console.warn(`No parts defined for facility type: ${facilityType} (mapped to: ${standardType})`);
    return [];
  }
  return parts || [];
};

// Helper function to get facility safety parts based on facility type
const getFacilitySafetyParts = (facilityType: string): string[] => {
  // Clean and normalize the input facility type
  const normalizedInput = facilityType.toLowerCase().trim();
  // Get the standard type from our mappings
  const standardType = FACILITY_TYPE_MAPPINGS[normalizedInput] || normalizedInput;
  const parts = FACILITY_SAFETY_PARTS[standardType as keyof typeof FACILITY_SAFETY_PARTS];
  if (!parts) {
    console.warn(`No safety parts defined for facility type: ${facilityType} (mapped to: ${standardType})`);
    return [];
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
  const [realClassOptions, setRealClassOptions] = useState<string[]>([]);
  const [toiletOptions, setToiletOptions] = useState<string[]>([]);
  const [laboratoryOptions, setLaboratoryOptions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safety data
  const [safetyData, setSafetyData] = useState<any[]>([]);

  // Toilet specific states
  const [hasToiletFacility, setHasToiletFacility] = useState<boolean | null>(null);
  const [toiletAbsenceReason, setToiletAbsenceReason] = useState('');
  const [selectedToiletTypes, setSelectedToiletTypes] = useState<string[]>([]);
  const [toiletQuantities, setToiletQuantities] = useState<{[key: string]: number}>({});

  // Laboratory specific states
  const [hasLaboratoryFacility, setHasLaboratoryFacility] = useState<boolean | null>(null);
  const [laboratoryAbsenceReason, setLaboratoryAbsenceReason] = useState('');
  const [selectedLaboratoryTypes, setSelectedLaboratoryTypes] = useState<string[]>([]);
  const [laboratoryQuantities, setLaboratoryQuantities] = useState<{[key: string]: number}>({});

  // Fetch facilities and entities data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch facilities
        const facilitiesResponse = await getFacilities();
        setFacilities(facilitiesResponse.data || []);

        // Fetch entities to get real class data
        const entitiesResponse = await getSchoolEntities();
        const entities = entitiesResponse.data || [];

        // Filter for classroom entities (facility_id: 1) and use the full names directly
        const classroomEntities = entities.filter((entity: any) => entity.facility_id === 1);
        const classOptions = classroomEntities.map((entity: any) => entity.name).sort();

        setRealClassOptions(classOptions);

        // Filter for toilet entities (facility_id: 4) and use the names
        const toiletEntities = entities.filter((entity: any) => entity.facility_id === 4);
        const toiletOpts = toiletEntities.map((entity: any) => entity.name).sort();

        setToiletOptions(toiletOpts);

        // Filter for laboratory entities (facility_id: 3) and use the names
        const laboratoryEntities = entities.filter((entity: any) => entity.facility_id === 3);
        const laboratoryOpts = laboratoryEntities.map((entity: any) => entity.name).sort();

        setLaboratoryOptions(laboratoryOpts);

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
        setFacilities([]);
        setRealClassOptions([]);
        setToiletOptions([]);
        setLaboratoryOptions([]);
      }
    };
    fetchData();
  }, [toast]);

  // Initialize form with empty values
  const facilityForm = useForm<FacilityAssessmentData>({
    resolver: zodResolver(facilityAssessmentSchema),
    defaultValues: {
      institution_id: 1,
      facility_id: 0,
      class: '',
      status: 'pending',
      details: [],
      school_feedback: '',
      agent_feedback: '',
      files: [],
      classes: [],
    }
  });
  
  // Update form when a facility is selected
  useEffect(() => {
    if (selectedFacility) {
      const parts = getFacilityParts(selectedFacility.name);
      setFacilityParts(parts);
      const safetyParts = getFacilitySafetyParts(selectedFacility.name);
      const initialSafetyData = safetyParts.map((part, index) => ({
        id: index + 1,
        part: part,
        attentionRequired: false,
        good: false,
      }));
      setSafetyData(initialSafetyData);
      const isClassFacility = selectedFacility.name.toLowerCase().includes('class');
      facilityForm.reset({
        institution_id: selectedFacility.institution_id || 1,
        facility_id: selectedFacility.id,
        class: isClassFacility ? '' : undefined,
        status: 'pending',
        details: parts.map(name => ({
          part_of_building: name,
          assessment_status: undefined as any
        })),
        school_feedback: '',
        agent_feedback: '',
        files: [],
        classes: [],
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
      details: facilityParts.map(name => ({ part_of_building: name, assessment_status: undefined as any })),
      files: []
    });
    setUploadedFiles([]);
    setIsModalOpen(true);
    // Reset facility-specific states
    setHasToiletFacility(null);
    setToiletAbsenceReason('');
    setSelectedToiletTypes([]);
    setToiletQuantities({});
    setHasLaboratoryFacility(null);
    setLaboratoryAbsenceReason('');
    setSelectedLaboratoryTypes([]);
    setLaboratoryQuantities({});
  };

  const handleFacilityAssessmentSubmit = async (data: FacilityAssessmentData) => {
    try {
      if (!selectedFacility) return;

      const isClassFacility = selectedFacility.name.toLowerCase().includes('class');
      const isToiletFacility = selectedFacility.name.toLowerCase().includes('toilet');
      const isLaboratoryFacility = selectedFacility.name.toLowerCase().includes('laboratory');

      // Special handling for toilet facilities when not available
      if (isToiletFacility && hasToiletFacility === false) {
        if (!toiletAbsenceReason.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Please provide a reason for the absence of toilet facilities.',
            variant: 'destructive',
          });
          return;
        }

        // Submit only the absence reason for toilet facilities
        toast({
          title: 'Assessment Submitted',
          description: `Toilet facility absence recorded for ${selectedFacility.name}. Reason: ${toiletAbsenceReason}`,
          variant: 'default',
        });

        setIsModalOpen(false);
        setUploadedFiles([]);
        facilityForm.reset();
        setSelectedFacility(null);
        setSafetyData([]);
        setHasToiletFacility(null);
        setToiletAbsenceReason('');
        setSelectedToiletTypes([]);
        setToiletQuantities({});
        return;
      }

      // Special handling for laboratory facilities when not available
      if (isLaboratoryFacility && hasLaboratoryFacility === false) {
        if (!laboratoryAbsenceReason.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Please provide a reason for the absence of laboratory facilities.',
            variant: 'destructive',
          });
          return;
        }

        // Submit only the absence reason for laboratory facilities
        toast({
          title: 'Assessment Submitted',
          description: `Laboratory facility absence recorded for ${selectedFacility.name}. Reason: ${laboratoryAbsenceReason}`,
          variant: 'default',
        });

        setIsModalOpen(false);
        setUploadedFiles([]);
        facilityForm.reset();
        setSelectedFacility(null);
        setSafetyData([]);
        setHasLaboratoryFacility(null);
        setLaboratoryAbsenceReason('');
        setSelectedLaboratoryTypes([]);
        setLaboratoryQuantities({});
        return;
      }

      let maintenanceSubmitted = false;
      let safetySubmitted = false;

      // Check if maintenance has changes
      const hasMaintenanceChanges = data.details.some(detail => detail.assessment_status !== 'Good');

      // Check if safety has changes
      const hasSafetyChanges = safetyData.some(item => item.attentionRequired || item.good);

      if (hasMaintenanceChanges) {
        // Create the assessment input object matching MaintenanceAssessmentInput type
        const assessmentInput = {
          institution_id: selectedFacility.institution_id || 1,
          institution_name: 'Institution', // Add required institution_name
          facility_id: data.facility_id,
          class: isClassFacility && data.classes ? data.classes : [],
          status: 'pending' as 'pending',
          details: data.details.map(detail => ({
            part_of_building: detail.part_of_building,
            assessment_status: detail.assessment_status || 'Good'
          })),
          school_feedback: data.school_feedback,
          agent_feedback: data.agent_feedback,
          files: uploadedFiles,
        };

        const response = await createMaintenanceAssessment(assessmentInput);

        if (response && response.status === 'error') {
          toast({
            title: 'Maintenance Submission Error',
            description: response.message || 'Failed to submit maintenance assessment',
            variant: 'destructive',
          });
          return;
        }
        maintenanceSubmitted = true;
      }

      if (hasSafetyChanges) {
        // Create safety assessment input
        const safetyInput = {
          institution_id: selectedFacility.institution_id || 1,
          institution_name: 'Institution',
          facility_id: data.facility_id,
          class: isClassFacility && data.classes ? data.classes : [],
          status: 'pending' as 'pending',
          details: safetyData.map(item => ({
            part_of_building: item.part,
            assessment_status: item.attentionRequired ? ('Attention Required' as const) : ('Good' as const)
          })),
          school_feedback: data.school_feedback,
          agent_feedback: data.agent_feedback,
          files: uploadedFiles,
        };

        const safetyResponse = await createSafetyAssessment(safetyInput);

        if (safetyResponse && safetyResponse.status === 'error') {
          toast({
            title: 'Safety Submission Error',
            description: safetyResponse.message || 'Failed to submit safety assessment',
            variant: 'destructive',
          });
          return;
        }
        safetySubmitted = true;
      }

      if (!maintenanceSubmitted && !safetySubmitted) {
        toast({
          title: 'No Changes',
          description: 'No assessments were submitted as no changes were made.',
          variant: 'default',
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

      const submittedTypes = [];
      if (maintenanceSubmitted) submittedTypes.push('Maintenance');
      if (safetySubmitted) submittedTypes.push('Safety');

      toast({
        title: 'Assessment Submitted',
        description: `${submittedTypes.join(' and ')} assessment${submittedTypes.length > 1 ? 's' : ''} for ${selectedFacility.name} submitted successfully!`,
        variant: 'default',
      });

      setIsModalOpen(false);
      setUploadedFiles([]);
      facilityForm.reset();
      setSelectedFacility(null);
      setSafetyData([]);
      // Reset toilet-specific states
      setHasToiletFacility(null);
      setToiletAbsenceReason('');
      setSelectedToiletTypes([]);
      setToiletQuantities({});
      // Reset laboratory-specific states
      setHasLaboratoryFacility(null);
      setLaboratoryAbsenceReason('');
      setSelectedLaboratoryTypes([]);
      setLaboratoryQuantities({});
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


interface ClassSelectProps {
  onChange: (selected: string[]) => void;
  value: string[];
  classOptions: string[];
}

const ClassSelect: React.FC<ClassSelectProps> = ({ onChange, value, classOptions }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value.length > 0 ? `${value.length} selected` : "Select classes..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No classes found.</CommandEmpty>
            <CommandGroup>
              {classOptions.map((option) => {
                const isSelected = value.includes(option);
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      const newValue = isSelected
                        ? value.filter((v) => v !== option)
                        : [...value, option];
                      onChange(newValue);
                    }}
                  >
                    {isSelected ? <Check className="mr-2 h-4 w-4" /> : <div className="mr-2 h-4 w-4" />}
                    {option}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
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
              <form onSubmit={facilityForm.handleSubmit(handleFacilityAssessmentSubmit)}>
                <Tabs defaultValue="maintenance" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="maintenance" disabled={hasToiletFacility === false || hasLaboratoryFacility === false}>Maintenance</TabsTrigger>
                    <TabsTrigger value="safety" disabled={hasToiletFacility === false || hasLaboratoryFacility === false}>Safety</TabsTrigger>
                  </TabsList>
                  <TabsContent value="maintenance">
                    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
                      <h2 className="text-xl font-semibold text-center mb-6 text-gray-700">MAINTENANCE REPORT</h2>
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
                                            disabled={hasToiletFacility === false || hasLaboratoryFacility === false}
                                            checked={field.value === (condition === 'urgent' ? 'Urgent Attention' : condition === 'attention' ? 'Attention Required' : 'Good')}
                                            onChange={() => {
                                              const updatedDetails = [...facilityForm.getValues().details];
                                              updatedDetails[index] = {
                                                part_of_building: part,
                                                assessment_status: condition === 'urgent' ? 'Urgent Attention' : condition === 'attention' ? 'Attention Required' : 'Good'
                                              };
                                              facilityForm.setValue('details', updatedDetails);
                                            }}
                                            className={`h-4 w-4 ${
                                              condition === 'urgent' && field.value === 'Urgent Attention' ? 'text-red-600' :
                                              condition === 'attention' && field.value === 'Attention Required' ? 'text-blue-600' :
                                              condition === 'good' && field.value === 'Good' ? 'text-green-600' : ''
                                            } ${hasToiletFacility === false || hasLaboratoryFacility === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            style={
                                              condition === 'urgent' && field.value === 'Urgent Attention' ? { accentColor: '#dc2626' } :
                                              condition === 'attention' && field.value === 'Attention Required' ? { accentColor: '#2563eb' } :
                                              condition === 'good' && field.value === 'Good' ? { accentColor: '#16a34a' } : {}
                                            }
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
                  </TabsContent>
                  <TabsContent value="safety">
                    <div className={hasToiletFacility === false || hasLaboratoryFacility === false ? 'opacity-50 pointer-events-none' : ''}>
                      <ClassSafetyForm safetyData={safetyData} onSafetyDataChange={setSafetyData} />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Show message when facility availability is not selected */}
                {/* {hasToiletFacility === null && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Please select whether the school has toilet facilities to continue with the assessment.</p>
                  </div>
                )} */}

                {/* Class Selection */}
                {selectedFacility?.name.toLowerCase().includes('class') && (
                  <FormField
                    control={facilityForm.control}
                    name="classes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 font-semibold">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span>Classes</span>
                        </FormLabel>
                        <FormControl>
                          <ClassSelect
                            onChange={field.onChange}
                            value={field.value || []}
                            classOptions={realClassOptions}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Toilets Section */}
                {selectedFacility?.name.toLowerCase().includes('toilet') && (
                  <div className="space-y-6">
                    {/* Facility Availability Check */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Does the school have this facility?
                        </Label>
                        <Select
                          value={hasToiletFacility === null ? '' : hasToiletFacility ? 'yes' : 'no'}
                          onValueChange={(value) => {
                            const isAvailable = value === 'yes';
                            setHasToiletFacility(isAvailable);
                            if (!isAvailable) {
                              // Clear maintenance and safety data when facility is not available
                              setSafetyData([]);
                              facilityForm.setValue('details', []);
                              setToiletAbsenceReason('');
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show absence reason if facility is not available */}
                      {hasToiletFacility === false && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Reason for Absence
                          </Label>
                          <Textarea
                            placeholder="Please provide the reason why the school does not have toilet facilities..."
                            value={toiletAbsenceReason}
                            onChange={(e) => setToiletAbsenceReason(e.target.value)}
                            className="w-full min-h-[100px]"
                          />
                        </div>
                      )}

                      {/* Show toilet configuration if facility is available */}
                      {hasToiletFacility === true && (
                        <>
                          <div className="space-y-4">
                            {/* Toilet Type Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Select Toilet Types Available
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {toiletOptions.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={type}
                                      checked={selectedToiletTypes.includes(type)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedToiletTypes(prev => [...prev, type]);
                                          setToiletQuantities(prev => ({ ...prev, [type]: 1 }));
                                        } else {
                                          setSelectedToiletTypes(prev => prev.filter(t => t !== type));
                                          setToiletQuantities(prev => {
                                            const newQuantities = { ...prev };
                                            delete newQuantities[type];
                                            return newQuantities;
                                          });
                                        }
                                      }}
                                    />
                                    <Label htmlFor={type} className="text-sm capitalize">
                                      {type}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Toilet Quantities */}
                            {selectedToiletTypes.length > 0 && (
                              <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">
                                  Number of Toilets for Each Type
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedToiletTypes.map((type) => (
                                    <div key={type} className="space-y-2">
                                      <Label className="text-sm capitalize">{type}</Label>
                                      <Input
                                        type="number"
                                        placeholder="Enter number"
                                        value={toiletQuantities[type] || 1}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 1 : Number(e.target.value);
                                          setToiletQuantities(prev => ({ ...prev, [type]: value }));
                                        }}
                                        className="w-full"
                                        min="1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Laboratories Section */}
                {selectedFacility?.name.toLowerCase().includes('laboratory') && (
                  <div className="space-y-6">
                    {/* Facility Availability Check */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Does the school have this facility?
                        </Label>
                        <Select
                          value={hasLaboratoryFacility === null ? '' : hasLaboratoryFacility ? 'yes' : 'no'}
                          onValueChange={(value) => {
                            const isAvailable = value === 'yes';
                            setHasLaboratoryFacility(isAvailable);
                            if (!isAvailable) {
                              // Clear maintenance and safety data when facility is not available
                              setSafetyData([]);
                              facilityForm.setValue('details', []);
                              setLaboratoryAbsenceReason('');
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show absence reason if facility is not available */}
                      {hasLaboratoryFacility === false && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Reason for Absence
                          </Label>
                          <Textarea
                            placeholder="Please provide the reason why the school does not have laboratory facilities..."
                            value={laboratoryAbsenceReason}
                            onChange={(e) => setLaboratoryAbsenceReason(e.target.value)}
                            className="w-full min-h-[100px]"
                          />
                        </div>
                      )}

                      {/* Show laboratory configuration if facility is available */}
                      {hasLaboratoryFacility === true && (
                        <>
                          <div className="space-y-4">
                            {/* Laboratory Type Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Select Laboratory Types Available
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {laboratoryOptions.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={type}
                                      checked={selectedLaboratoryTypes.includes(type)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedLaboratoryTypes(prev => [...prev, type]);
                                          setLaboratoryQuantities(prev => ({ ...prev, [type]: 1 }));
                                        } else {
                                          setSelectedLaboratoryTypes(prev => prev.filter(t => t !== type));
                                          setLaboratoryQuantities(prev => {
                                            const newQuantities = { ...prev };
                                            delete newQuantities[type];
                                            return newQuantities;
                                          });
                                        }
                                      }}
                                    />
                                    <Label htmlFor={type} className="text-sm capitalize">
                                      {type}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Laboratory Quantities */}
                            {selectedLaboratoryTypes.length > 0 && (
                              <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">
                                  Number of Laboratories for Each Type
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedLaboratoryTypes.map((type) => (
                                    <div key={type} className="space-y-2">
                                      <Label className="text-sm capitalize">{type}</Label>
                                      <Input
                                        type="number"
                                        placeholder="Enter number"
                                        value={laboratoryQuantities[type] || 1}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 1 : Number(e.target.value);
                                          setLaboratoryQuantities(prev => ({ ...prev, [type]: value }));
                                        }}
                                        className="w-full"
                                        min="1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* File Upload Section */}
                <div className={`space-y-4 ${hasToiletFacility === false || hasLaboratoryFacility === false ? 'opacity-50 pointer-events-none' : ''}`}>
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
                              onDragOver={hasToiletFacility === false || hasLaboratoryFacility === false ? undefined : handleDragOver}
                              onDrop={hasToiletFacility === false || hasLaboratoryFacility === false ? undefined : handleDrop}
                              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${hasToiletFacility === false || hasLaboratoryFacility === false ? 'cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}`}
                              onClick={hasToiletFacility === false || hasLaboratoryFacility === false ? undefined : () => fileInputRef.current?.click()}
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
                                disabled={hasToiletFacility === false || hasLaboratoryFacility === false}
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
                                        onClick={hasToiletFacility === false || hasLaboratoryFacility === false ? undefined : () => removeFile(index)}
                                        disabled={hasToiletFacility === false || hasLaboratoryFacility === false}
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
                            disabled={hasToiletFacility === false || hasLaboratoryFacility === false}
                            placeholder="Enter notes, concerns, and priorities..."
                            className={`min-h-[120px] resize-none ${hasToiletFacility === false || hasLaboratoryFacility === false ? 'cursor-not-allowed' : ''}`}
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

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
import { useRole } from '@/contexts/RoleContext';

import { getFacilities, createMaintenanceAssessment, createSafetyAssessment } from "../core/_request";
import { Facility } from "../core/_model";
import { getSchoolEntities } from '../../facilities/core/_requests';
import ClassSafetyForm from './SafetyFormPage';
import { createIncident } from '../../reports/core/requests';
import { CreateIncidentInput } from '../../reports/core/_models';
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
    assessment_status: z.enum(['Urgent Attention', 'Attention Required', 'Good']).optional()
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

// Helper function to get standardized facility type
const getFacilityType = (facilityName: string): string => {
  const normalizedInput = facilityName.toLowerCase().trim();
  return FACILITY_TYPE_MAPPINGS[normalizedInput] || normalizedInput;
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

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AssessmentAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilityParts, setFacilityParts] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [realClassOptions, setRealClassOptions] = useState<string[]>([]);
  const [toiletOptions, setToiletOptions] = useState<string[]>([]);
  const [laboratoryOptions, setLaboratoryOptions] = useState<string[]>([]);
  const [diningHallOptions, setDiningHallOptions] = useState<string[]>([]);
  const [dormitoryOptions, setDormitoryOptions] = useState<string[]>([]);
  const [officeOptions, setOfficeOptions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Safety data
  const [safetyData, setSafetyData] = useState<any[]>([]);

  // Toilet specific states
  const [hasToiletFacility, setHasToiletFacility] = useState<boolean | null>(null);
  const [selectedToiletTypes, setSelectedToiletTypes] = useState<string[]>([]);
  const [toiletQuantities, setToiletQuantities] = useState<{[key: string]: number}>({});

  // Laboratory specific states
  const [hasLaboratoryFacility, setHasLaboratoryFacility] = useState<boolean | null>(null);
  const [selectedLaboratoryTypes, setSelectedLaboratoryTypes] = useState<string[]>([]);
  const [laboratoryQuantities, setLaboratoryQuantities] = useState<{[key: string]: number}>({});

  // Dining Hall specific states
  const [hasDiningHallFacility, setHasDiningHallFacility] = useState<boolean | null>(null);
  const [selectedDiningHallTypes, setSelectedDiningHallTypes] = useState<string[]>([]);
  const [diningHallQuantities, setDiningHallQuantities] = useState<{[key: string]: number}>({});

  // Dormitory specific states
  const [hasDormitoryFacility, setHasDormitoryFacility] = useState<boolean | null>(null);
  const [selectedDormitoryTypes, setSelectedDormitoryTypes] = useState<string[]>([]);
  const [dormitoryQuantities, setDormitoryQuantities] = useState<{[key: string]: number}>({});

  // Office specific states
  const [hasOfficeFacility, setHasOfficeFacility] = useState<boolean | null>(null);
  const [selectedOfficeTypes, setSelectedOfficeTypes] = useState<string[]>([]);
  const [officeQuantities, setOfficeQuantities] = useState<{[key: string]: number}>({});

  // Incident reporting state
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('');
  const [incidentFiles, setIncidentFiles] = useState<File[]>([]);
  const [selectedIncidentFacility, setSelectedIncidentFacility] = useState<string>('');
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

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

  // Draft management
  const saveDraft = () => {
    const draftData = {
      selectedFacility,
      facilityParts,
      safetyData,
      hasToiletFacility,
      selectedToiletTypes,
      toiletQuantities,
      hasLaboratoryFacility,
      selectedLaboratoryTypes,
      laboratoryQuantities,
      hasDiningHallFacility,
      selectedDiningHallTypes,
      diningHallQuantities,
      hasDormitoryFacility,
      selectedDormitoryTypes,
      dormitoryQuantities,
      hasOfficeFacility,
      selectedOfficeTypes,
      officeQuantities,
      formData: facilityForm.getValues(),
      timestamp: Date.now()
    };
    localStorage.setItem('assessmentDraft', JSON.stringify(draftData));
  };

  const clearDraft = () => {
    localStorage.removeItem('assessmentDraft');
    setIsDraftLoaded(false);
  };

  // Fetch facilities and entities data
  useEffect(() => {
    console.log('useEffect triggered for fetching data');
    const fetchData = async () => {
      try {
        console.log('Starting to fetch facilities and entities...');

        // Fetch facilities
        const facilitiesResponse = await getFacilities();
        const facilitiesData = facilitiesResponse.data || [];
        console.log('Fetched facilities:', facilitiesData);
        // Log facility type mappings
        facilitiesData.forEach(facility => {
          console.log(`Facility: ${facility.name} -> Type: ${getFacilityType(facility.name)}`);
        });
        setFacilities(facilitiesData);

        // Fetch entities to get real class data
        const entitiesResponse = await getSchoolEntities();
        const rawEntities = entitiesResponse.data || [];
        console.log('Fetched raw entities:', rawEntities);

        // Transform entities to include facilityName (same as EntitiesListPage)
        const entities = rawEntities.map((entity: any) => {
          const facility = facilitiesData.find(f => f.id === entity.facility_id);
          const facilityName = facility ? facility.name : 'Unknown Facility';
          return {
            ...entity,
            facilityName
          };
        });
        console.log('Transformed entities:', entities);

        // Filter entities by finding facility IDs that match each type
        const classroomFacilityIds = facilitiesData.filter(f => getFacilityType(f.name) === 'classroom').map(f => f.id);
        console.log('Classroom facility IDs:', classroomFacilityIds);
        const classroomEntities = entities.filter((entity: any) => classroomFacilityIds.includes(entity.facility_id));
        console.log('Classroom entities:', classroomEntities);
        const classOptions = classroomEntities.map((entity: any) => entity.name).sort();
        console.log('Class options:', classOptions);
        setRealClassOptions(classOptions);
        console.log('Set class options state');

        const toiletFacilityIds = facilitiesData.filter(f => getFacilityType(f.name) === 'toilet').map(f => f.id);
        console.log('Toilet facility IDs:', toiletFacilityIds);
        const toiletEntities = entities.filter((entity: any) => toiletFacilityIds.includes(entity.facility_id));
        console.log('Toilet entities:', toiletEntities);
        const toiletOpts = toiletEntities.map((entity: any) => entity.name).sort();
        console.log('Toilet options:', toiletOpts);
        setToiletOptions(toiletOpts);

        const laboratoryFacilityIds = facilitiesData.filter(f => getFacilityType(f.name) === 'laboratory').map(f => f.id);
        console.log('Laboratory facility IDs:', laboratoryFacilityIds);
        const laboratoryEntities = entities.filter((entity: any) => laboratoryFacilityIds.includes(entity.facility_id));
        console.log('Laboratory entities:', laboratoryEntities);
        const laboratoryOpts = laboratoryEntities.map((entity: any) => entity.name).sort();
        console.log('Laboratory options:', laboratoryOpts);
        setLaboratoryOptions(laboratoryOpts);

        const diningHallFacilityIds = facilitiesData.filter(f => getFacilityType(f.name) === 'dining_hall').map(f => f.id);
        console.log('Dining hall facility IDs:', diningHallFacilityIds);
        const diningHallEntities = entities.filter((entity: any) => diningHallFacilityIds.includes(entity.facility_id));
        console.log('Dining hall entities:', diningHallEntities);
        const diningHallOpts = diningHallEntities.map((entity: any) => entity.name).sort();
        console.log('Dining hall options:', diningHallOpts);
        setDiningHallOptions(diningHallOpts);

        const dormitoryFacilityIds = facilitiesData.filter(f => getFacilityType(f.name) === 'dormitory').map(f => f.id);
        console.log('Dormitory facility IDs:', dormitoryFacilityIds);
        const dormitoryEntities = entities.filter((entity: any) => dormitoryFacilityIds.includes(entity.facility_id));
        console.log('Dormitory entities:', dormitoryEntities);
        const dormitoryOpts = dormitoryEntities.map((entity: any) => entity.name).sort();
        console.log('Dormitory options:', dormitoryOpts);
        setDormitoryOptions(dormitoryOpts);

        const officeFacilityIds = facilitiesData.filter(f => getFacilityType(f.name) === 'office').map(f => f.id);
        console.log('Office facility IDs:', officeFacilityIds);
        const officeEntities = entities.filter((entity: any) => officeFacilityIds.includes(entity.facility_id));
        console.log('Office entities:', officeEntities);
        const officeOpts = officeEntities.map((entity: any) => entity.name).sort();
        console.log('Office options:', officeOpts);
        setOfficeOptions(officeOpts);

        // Validation logs
        console.log('Data loading summary:');
        console.log('- Facilities loaded:', facilitiesData.length);
        console.log('- Entities loaded:', entities.length);
        console.log('- Class options:', classOptions.length);
        console.log('- Toilet options:', toiletOpts.length);
        console.log('- Laboratory options:', laboratoryOpts.length);
        console.log('- Dining hall options:', diningHallOpts.length);
        console.log('- Dormitory options:', dormitoryOpts.length);
        console.log('- Office options:', officeOpts.length);

        // Validation checks
        if (facilitiesData.length === 0) {
          console.warn('Warning: No facilities loaded!');
        }
        if (entities.length === 0) {
          console.warn('Warning: No entities loaded!');
        }
        if (classOptions.length === 0) {
          console.warn('Warning: No class options found!');
        }
        if (toiletOpts.length === 0) {
          console.warn('Warning: No toilet options found!');
        }
        if (laboratoryOpts.length === 0) {
          console.warn('Warning: No laboratory options found!');
        }
        if (diningHallOpts.length === 0) {
          console.warn('Warning: No dining hall options found!');
        }
        if (dormitoryOpts.length === 0) {
          console.warn('Warning: No dormitory options found!');
        }
        if (officeOpts.length === 0) {
          console.warn('Warning: No office options found!');
        }

      } catch (error) {
        console.error('Error fetching facilities and entities:', error);
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
        setFacilities([]);
        setRealClassOptions([]);
        setToiletOptions([]);
        setLaboratoryOptions([]);
        setDiningHallOptions([]);
        setDormitoryOptions([]);
        setOfficeOptions([]);
      }
  };
  fetchData();
  console.log('useEffect completed');
}, [toast]);


// Save draft on state changes
useEffect(() => {
  if (isDraftLoaded) return; // Don't save while loading
  saveDraft();
}, [
  selectedFacility,
  facilityParts,
  safetyData,
  hasToiletFacility,
  selectedToiletTypes,
  toiletQuantities,
  hasLaboratoryFacility,
  selectedLaboratoryTypes,
  laboratoryQuantities,
  hasDiningHallFacility,
  selectedDiningHallTypes,
  diningHallQuantities,
  hasDormitoryFacility,
  selectedDormitoryTypes,
  dormitoryQuantities,
  hasOfficeFacility,
  selectedOfficeTypes,
  officeQuantities
]);

// Save draft on form changes
useEffect(() => {
  const subscription = facilityForm.watch(() => {
    if (isDraftLoaded) return;
    saveDraft();
  });
  return () => subscription.unsubscribe();
}, [facilityForm, isDraftLoaded]);

// Debug: Monitor option changes
useEffect(() => {
  console.log('realClassOptions changed:', realClassOptions);
}, [realClassOptions]);

useEffect(() => {
  console.log('toiletOptions changed:', toiletOptions);
}, [toiletOptions]);

useEffect(() => {
  console.log('laboratoryOptions changed:', laboratoryOptions);
}, [laboratoryOptions]);

useEffect(() => {
  console.log('diningHallOptions changed:', diningHallOptions);
}, [diningHallOptions]);

useEffect(() => {
  console.log('dormitoryOptions changed:', dormitoryOptions);
}, [dormitoryOptions]);

useEffect(() => {
  console.log('officeOptions changed:', officeOptions);
}, [officeOptions]);



  // Load draft data on component mount
  useEffect(() => {
    const draftData = localStorage.getItem('assessmentDraft');
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        setSelectedFacility(parsed.selectedFacility || null);
        setFacilityParts(parsed.facilityParts || []);
        setSafetyData(parsed.safetyData || []);
        setHasToiletFacility(parsed.hasToiletFacility ?? null);
        setSelectedToiletTypes(parsed.selectedToiletTypes || []);
        setToiletQuantities(parsed.toiletQuantities || {});
        setHasLaboratoryFacility(parsed.hasLaboratoryFacility ?? null);
        setSelectedLaboratoryTypes(parsed.selectedLaboratoryTypes || []);
        setLaboratoryQuantities(parsed.laboratoryQuantities || {});
        setHasDiningHallFacility(parsed.hasDiningHallFacility ?? null);
        setSelectedDiningHallTypes(parsed.selectedDiningHallTypes || []);
        setDiningHallQuantities(parsed.diningHallQuantities || {});
        setHasDormitoryFacility(parsed.hasDormitoryFacility ?? null);
        setSelectedDormitoryTypes(parsed.selectedDormitoryTypes || []);
        setDormitoryQuantities(parsed.dormitoryQuantities || {});
        setHasOfficeFacility(parsed.hasOfficeFacility ?? null);
        setSelectedOfficeTypes(parsed.selectedOfficeTypes || []);
        setOfficeQuantities(parsed.officeQuantities || {});
        if (parsed.formData) {
          facilityForm.reset(parsed.formData);
        }
        setIsDraftLoaded(true);
        toast({
          title: 'Draft Loaded',
          description: 'Your previous unsaved assessment data has been restored.',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [facilityForm, toast]);
  
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
      const facilityType = getFacilityType(selectedFacility.name);
      const isClassFacility = facilityType === 'classroom';
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
    setSelectedToiletTypes([]);
    setToiletQuantities({});
    setHasLaboratoryFacility(null);
    setSelectedLaboratoryTypes([]);
    setLaboratoryQuantities({});
    setHasDiningHallFacility(null);
    setSelectedDiningHallTypes([]);
    setDiningHallQuantities({});
    setHasDormitoryFacility(null);
    setSelectedDormitoryTypes([]);
    setDormitoryQuantities({});
  };

  const handleFacilityAssessmentSubmit = async (data: FacilityAssessmentData) => {
    try {
      if (!selectedFacility) return;

      const facilityType = getFacilityType(selectedFacility.name);
      const isClassFacility = facilityType === 'classroom';
      const isToiletFacility = facilityType === 'toilet';
      const isLaboratoryFacility = facilityType === 'laboratory';
      const isDiningHallFacility = facilityType === 'dining_hall';
      const isDormitoryFacility = facilityType === 'dormitory';
      const isOfficeFacility = facilityType === 'office';

      // Validation: Check if all maintenance details are marked
      const allMaintenanceMarked = data.details.every(detail => detail.assessment_status !== undefined);
      if (!allMaintenanceMarked) {
        toast({
          title: 'Validation Error',
          description: 'Please mark all maintenance assessment areas before submitting.',
          variant: 'destructive',
        });
        return;
      }

      // Validation: Check if all safety details are marked (only if there are safety items)
      const allSafetyMarked = safetyData.length === 0 || safetyData.every(item => item.attentionRequired || item.good);
      if (!allSafetyMarked) {
        toast({
          title: 'Validation Error',
          description: 'Please mark all safety assessment areas before submitting.',
          variant: 'destructive',
        });
        return;
      }

      let maintenanceSubmitted = false;
      let safetySubmitted = false;

      // Check if maintenance has changes
      const hasMaintenanceChanges = data.details.some(detail => detail.assessment_status !== 'Good');

      // Check if safety has changes
      const hasSafetyChanges = safetyData.some(item => item.attentionRequired || item.good);

      // Check if facility is not available
      const isFacilityNotAvailable = (isToiletFacility && hasToiletFacility === false) ||
                                    (isLaboratoryFacility && hasLaboratoryFacility === false) ||
                                    (isDiningHallFacility && hasDiningHallFacility === false) ||
                                    (isDormitoryFacility && hasDormitoryFacility === false) ||
                                    (isOfficeFacility && hasOfficeFacility === false);

      // Always submit maintenance if there are changes or notes
      if (hasMaintenanceChanges || (isFacilityNotAvailable && data.school_feedback.trim())) {
        // Create the assessment input object matching MaintenanceAssessmentInput type
         const assessmentInput = {
           institution_id: selectedFacility.institution_id || 1,
           institution_name: 'Institution', // Add required institution_name
           facility_id: data.facility_id,
           entity: isClassFacility ? (data.classes || []) :
                   isToiletFacility ? selectedToiletTypes :
                   [],
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

      // Always submit safety if there are changes
      if (hasSafetyChanges) {
        // Create safety assessment input
        const safetyInput = {
          institution_id: selectedFacility.institution_id || 1,
          institution_name: 'Institution',
          facility_id: data.facility_id,
          entity: isClassFacility ? (data.classes || []) :
                  isToiletFacility ? selectedToiletTypes :
                  [],
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

      if (!maintenanceSubmitted && !safetySubmitted && !data.school_feedback.trim()) {
        toast({
          title: 'No Changes',
          description: 'Please provide notes or make assessment changes.',
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
      setSelectedToiletTypes([]);
      setToiletQuantities({});
      // Reset laboratory-specific states
      setHasLaboratoryFacility(null);
      setSelectedLaboratoryTypes([]);
      setLaboratoryQuantities({});
      // Reset dining hall-specific states
      setHasDiningHallFacility(null);
      setSelectedDiningHallTypes([]);
      setDiningHallQuantities({});
      // Reset dormitory-specific states
      setHasDormitoryFacility(null);
      setSelectedDormitoryTypes([]);
      setDormitoryQuantities({});
      // Reset office-specific states
      setHasOfficeFacility(null);
      setSelectedOfficeTypes([]);
      setOfficeQuantities({});
      setHasOfficeFacility(null);

      setSelectedOfficeTypes([]);
      setOfficeQuantities({});
      // Clear draft after successful submission
      clearDraft();
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
  return (
    <Select value={value[0] || ''} onValueChange={(selectedValue) => onChange([selectedValue])}>
      <SelectTrigger>
        <SelectValue placeholder="Select a class..." />
      </SelectTrigger>
      <SelectContent>
        {classOptions.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

  const getAssessmentCount = (facilityId: string) => {
    return assessments.filter(assessment => assessment.facilityId === facilityId).length;
  };

  return (
    <div className="container mx-auto py-6">
      {/* {isDraftLoaded && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Draft Data Loaded</p>
              <p className="text-xs text-blue-600">Your previous unsaved assessment has been restored</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearDraft}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Clear Draft
          </Button>
        </div>
      )} */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">Facility Assessment</h1>
          <p className="text-muted-foreground mt-1">Select a facility type to begin assessment</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 bg-red-600 hover:bg-red-700"
          >
            🚨 Report Incident
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/maintenance/assessment')}
            className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </div>
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
                    <TabsTrigger value="maintenance" disabled={hasToiletFacility === false || hasLaboratoryFacility === false || hasDiningHallFacility === false || hasDormitoryFacility === false || hasOfficeFacility === false}>Maintenance</TabsTrigger>
                    <TabsTrigger value="safety" disabled={hasToiletFacility === false || hasLaboratoryFacility === false || hasDiningHallFacility === false || hasDormitoryFacility === false || hasOfficeFacility === false}>Safety</TabsTrigger>
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
                                            disabled={hasToiletFacility === false || hasLaboratoryFacility === false || hasDiningHallFacility === false || hasDormitoryFacility === false || hasOfficeFacility === false}
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
                    <div className={hasToiletFacility === false || hasLaboratoryFacility === false || hasDiningHallFacility === false || hasDormitoryFacility === false || hasOfficeFacility === false ? 'opacity-50 pointer-events-none' : ''}>
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
                {getFacilityType(selectedFacility?.name || '') === 'classroom' && (
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
                {getFacilityType(selectedFacility?.name || '') === 'toilet' && (
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
                {getFacilityType(selectedFacility?.name || '') === 'laboratory' && (
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

                {/* Dining Halls Section */}
                {getFacilityType(selectedFacility?.name || '') === 'dining_hall' && (
                  <div className="space-y-6">
                    {/* Facility Availability Check */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Does the school have this facility?
                        </Label>
                        <Select
                          value={hasDiningHallFacility === null ? '' : hasDiningHallFacility ? 'yes' : 'no'}
                          onValueChange={(value) => {
                            const isAvailable = value === 'yes';
                            setHasDiningHallFacility(isAvailable);
                            if (!isAvailable) {
                              // Clear maintenance and safety data when facility is not available
                              setSafetyData([]);
                              facilityForm.setValue('details', []);
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


                      {/* Show dining hall configuration if facility is available */}
                      {hasDiningHallFacility === true && (
                        <>
                          <div className="space-y-4">
                            {/* Dining Hall Type Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Select Dining Hall Types Available
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {diningHallOptions.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={type}
                                      checked={selectedDiningHallTypes.includes(type)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedDiningHallTypes(prev => [...prev, type]);
                                          setDiningHallQuantities(prev => ({ ...prev, [type]: 1 }));
                                        } else {
                                          setSelectedDiningHallTypes(prev => prev.filter(t => t !== type));
                                          setDiningHallQuantities(prev => {
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

                            {/* Dining Hall Quantities */}
                            {selectedDiningHallTypes.length > 0 && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedDiningHallTypes.map((type) => (
                                    <div key={type} className="space-y-2">
                                      <Label className="text-sm capitalize">{type}</Label>
                                      <Input
                                        type="number"
                                        placeholder="Enter number"
                                        value={diningHallQuantities[type] || 1}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 1 : Number(e.target.value);
                                          setDiningHallQuantities(prev => ({ ...prev, [type]: value }));
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

                {/* Dormitories Section */}
                {getFacilityType(selectedFacility?.name || '') === 'dormitory' && (
                  <div className="space-y-6">
                    {/* Facility Availability Check */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Does the school have this facility?
                        </Label>
                        <Select
                          value={hasDormitoryFacility === null ? '' : hasDormitoryFacility ? 'yes' : 'no'}
                          onValueChange={(value) => {
                            const isAvailable = value === 'yes';
                            setHasDormitoryFacility(isAvailable);
                            if (!isAvailable) {
                              // Clear maintenance and safety data when facility is not available
                              setSafetyData([]);
                              facilityForm.setValue('details', []);
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


                      {/* Show dormitory configuration if facility is available */}
                      {hasDormitoryFacility === true && (
                        <>
                          <div className="space-y-4">
                            {/* Dormitory Type Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Select Dormitory Types Available
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {dormitoryOptions.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={type}
                                      checked={selectedDormitoryTypes.includes(type)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedDormitoryTypes(prev => [...prev, type]);
                                          setDormitoryQuantities(prev => ({ ...prev, [type]: 1 }));
                                        } else {
                                          setSelectedDormitoryTypes(prev => prev.filter(t => t !== type));
                                          setDormitoryQuantities(prev => {
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

                            {/* Dormitory Quantities */}
                            {selectedDormitoryTypes.length > 0 && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedDormitoryTypes.map((type) => (
                                    <div key={type} className="space-y-2">
                                      <Label className="text-sm capitalize">{type}</Label>
                                      <Input
                                        type="number"
                                        placeholder="Enter number"
                                        value={dormitoryQuantities[type] || 1}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 1 : Number(e.target.value);
                                          setDormitoryQuantities(prev => ({ ...prev, [type]: value }));
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

                {/* Offices Section */}
                {getFacilityType(selectedFacility?.name || '') === 'office' && (
                  <div className="space-y-6">
                    {/* Facility Availability Check */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Does the school have this facility?
                        </Label>
                        <Select
                          value={hasOfficeFacility === null ? '' : hasOfficeFacility ? 'yes' : 'no'}
                          onValueChange={(value) => {
                            const isAvailable = value === 'yes';
                            setHasOfficeFacility(isAvailable);
                            if (!isAvailable) {
                              // Clear maintenance and safety data when facility is not available
                              setSafetyData([]);
                              facilityForm.setValue('details', []);
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


                      {/* Show office configuration if facility is available */}
                      {hasOfficeFacility === true && (
                        <>
                          <div className="space-y-4">
                            {/* Office Type Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Select Office Types Available
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {officeOptions.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={type}
                                      checked={selectedOfficeTypes.includes(type)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedOfficeTypes(prev => [...prev, type]);
                                          setOfficeQuantities(prev => ({ ...prev, [type]: 1 }));
                                        } else {
                                          setSelectedOfficeTypes(prev => prev.filter(t => t !== type));
                                          setOfficeQuantities(prev => {
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

                            {/* Office Quantities */}
                            {selectedOfficeTypes.length > 0 && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedOfficeTypes.map((type) => (
                                    <div key={type} className="space-y-2">
                                      <Label className="text-sm capitalize">{type}</Label>
                                      <Input
                                        type="number"
                                        placeholder="Enter number"
                                        value={officeQuantities[type] || 1}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 1 : Number(e.target.value);
                                          setOfficeQuantities(prev => ({ ...prev, [type]: value }));
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
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-gray-400 cursor-pointer"
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

      {/* Incident Report Modal */}
      <Dialog open={isIncidentModalOpen} onOpenChange={setIsIncidentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-red-600">🚨</span>
              <span>Report Incident</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Auto-filled info */}
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">School:</span>
                <span className="ml-2 text-gray-600">{currentUser?.institution?.name || 'N/A'}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Admin:</span>
                <span className="ml-2 text-gray-600">{currentUser?.name || 'N/A'}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Timestamp:</span>
                <span className="ml-2 text-gray-600">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Facility Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Related Facility</Label>
              <Select value={selectedIncidentFacility} onValueChange={setSelectedIncidentFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id.toString()}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="incident-description" className="text-sm font-medium">
                Incident Description
              </Label>
              <Textarea
                id="incident-description"
                placeholder="Describe the incident..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attach Photo/Document (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIncidentFiles([file]);
                    }
                  }}
                  className="hidden"
                  id="incident-file"
                />
                <label htmlFor="incident-file" className="cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {incidentFiles.length > 0 ? incidentFiles[0].name : 'Click to upload or drag and drop'}
                  </p>
                </label>
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Severity Level</Label>
              <Select value={incidentSeverity} onValueChange={setIncidentSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIncidentModalOpen(false)}
                className="flex-1"
                disabled={isSubmittingIncident}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!incidentDescription.trim() || !incidentSeverity || !selectedIncidentFacility) {
                    toast({
                      title: 'Validation Error',
                      description: 'Please fill in all required fields.',
                      variant: 'destructive',
                    });
                    return;
                  }

                  setIsSubmittingIncident(true);
                  try {
                    let attachmentBase64 = '';
                    if (incidentFiles.length > 0) {
                      attachmentBase64 = await fileToBase64(incidentFiles[0]);
                    }

                    const incidentData: CreateIncidentInput = {
                      incident_description: incidentDescription,
                      facility_id: selectedIncidentFacility,
                      severity_level: incidentSeverity,
                      attachment: attachmentBase64,
                    };

                    await createIncident(incidentData);

                    toast({
                      title: 'Incident Reported',
                      description: 'Your incident report has been submitted successfully.',
                      variant: 'default',
                    });

                    // Reset form
                    setIsIncidentModalOpen(false);
                    setIncidentDescription('');
                    setIncidentSeverity('');
                    setIncidentFiles([]);
                    setSelectedIncidentFacility('');
                  } catch (error: any) {
                    console.error('Error creating incident:', error);
                    toast({
                      title: 'Error',
                      description: error?.response?.data?.message || error?.message || 'Failed to submit incident report.',
                      variant: 'destructive',
                    });
                  } finally {
                    setIsSubmittingIncident(false);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!incidentDescription.trim() || !incidentSeverity || !selectedIncidentFacility || isSubmittingIncident}
              >
                {isSubmittingIncident ? 'Sending...' : 'Send Alert'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentAddPage;
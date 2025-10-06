// import React, { useState, useEffect } from 'react';
// import { Plus, X } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';
// import { getFacilities } from '../../assements/core/_request';
// import { Facility } from '../../assements/core/_model';
// import { createSchoolEntities } from '../core/_requests';
// import { entitiesData } from '../core/_models';

// const FacilityAddPage = () => {
//   const { toast } = useToast();
//   const [facilities, setFacilities] = useState<Facility[]>([]);
//   const [selectedFacility, setSelectedFacility] = useState('');
//   const [classrooms, setClassrooms] = useState([{ grade: '', stream: '', numberOfClasses: '' as number | '' }]);
//   const [laboratories, setLaboratories] = useState([{ labType: '', numberOfLaboratories: '' as number | '' }]);
//   const [toilets, setToilets] = useState([{ toiletType: '', numberOfToilets: '' as number | '' }]);
//   const [dormitories, setDormitories] = useState([{ names: '', numberOfDormitories: '' as number | '' }]);
//   const [diningHalls, setDiningHalls] = useState([{ names: '', numberOfDiningHalls: '' as number | '' }]);
//   const [compounds, setCompounds] = useState([{ areas: '', numberOfCompounds: '' as number | '' }]);
//   const [offices, setOffices] = useState([{ names: '', numberOfOffices: '' as number | '' }]);

//   useEffect(() => {
//     const fetchFacilities = async () => {
//       try {
//         const response = await getFacilities();
//         setFacilities(response.data || []);
//       } catch (error) {
//         console.error('Error fetching facilities:', error);
//         setFacilities([]);
//       }
//     };
//     fetchFacilities();
//   }, []);

//   // Functions to manage multiple entries
//   const addClassroom = () => setClassrooms([...classrooms, { grade: '', stream: '', numberOfClasses: '' }]);
//   const removeClassroom = (index: number) => setClassrooms(classrooms.filter((_, i) => i !== index));
//   const updateClassroom = (index: number, field: string, value: any) => {
//     const updated = [...classrooms];
//     updated[index] = { ...updated[index], [field]: value };
//     setClassrooms(updated);
//   };

//   const addLaboratory = () => setLaboratories([...laboratories, { labType: '', numberOfLaboratories: '' }]);
//   const removeLaboratory = (index: number) => setLaboratories(laboratories.filter((_, i) => i !== index));
//   const updateLaboratory = (index: number, field: string, value: any) => {
//     const updated = [...laboratories];
//     updated[index] = { ...updated[index], [field]: value };
//     setLaboratories(updated);
//   };

//   const addToilet = () => setToilets([...toilets, { toiletType: '', numberOfToilets: '' }]);
//   const removeToilet = (index: number) => setToilets(toilets.filter((_, i) => i !== index));
//   const updateToilet = (index: number, field: string, value: any) => {
//     const updated = [...toilets];
//     updated[index] = { ...updated[index], [field]: value };
//     setToilets(updated);
//   };

//   const addDormitory = () => setDormitories([...dormitories, { names: '', numberOfDormitories: '' }]);
//   const removeDormitory = (index: number) => setDormitories(dormitories.filter((_, i) => i !== index));
//   const updateDormitory = (index: number, field: string, value: any) => {
//     const updated = [...dormitories];
//     updated[index] = { ...updated[index], [field]: value };
//     setDormitories(updated);
//   };

//   const addDiningHall = () => setDiningHalls([...diningHalls, { names: '', numberOfDiningHalls: '' }]);
//   const removeDiningHall = (index: number) => setDiningHalls(diningHalls.filter((_, i) => i !== index));
//   const updateDiningHall = (index: number, field: string, value: any) => {
//     const updated = [...diningHalls];
//     updated[index] = { ...updated[index], [field]: value };
//     setDiningHalls(updated);
//   };

//   const addCompound = () => setCompounds([...compounds, { areas: '', numberOfCompounds: '' }]);
//   const removeCompound = (index: number) => setCompounds(compounds.filter((_, i) => i !== index));
//   const updateCompound = (index: number, field: string, value: any) => {
//     const updated = [...compounds];
//     updated[index] = { ...updated[index], [field]: value };
//     setCompounds(updated);
//   };

//   const addOffice = () => setOffices([...offices, { names: '', numberOfOffices: '' }]);
//   const removeOffice = (index: number) => setOffices(offices.filter((_, i) => i !== index));
//   const updateOffice = (index: number, field: string, value: any) => {
//     const updated = [...offices];
//     updated[index] = { ...updated[index], [field]: value };
//     setOffices(updated);
//   };

//   const handleSubmit = async () => {
//     try {
//       // Find the selected facility ID
//       const selectedFacilityData = facilities.find(f => f.name === selectedFacility);
//       if (!selectedFacilityData) {
//         console.error('Selected facility not found');
//         return;
//       }

//       const facilityId = selectedFacilityData.id;
//       let entities: entitiesData['entities'] = [];

//       // Transform data based on facility type
//       if (selectedFacility.toLowerCase().includes('classroom')) {
//         entities = classrooms
//           .filter(classroom => classroom.grade && classroom.stream && classroom.numberOfClasses)
//           .map(classroom => ({
//             grade: classroom.grade,
//             stream: classroom.stream,
//             total: classroom.numberOfClasses as number
//           }));
//       } else if (selectedFacility.toLowerCase().includes('laboratory') || selectedFacility.toLowerCase().includes('lab')) {
//         entities = laboratories
//           .filter(lab => lab.labType && lab.numberOfLaboratories)
//           .map(lab => ({
//             name: lab.labType,
//             total: lab.numberOfLaboratories as number
//           }));
//       } else if (selectedFacility.toLowerCase().includes('toilet')) {
//         entities = toilets
//           .filter(toilet => toilet.toiletType && toilet.numberOfToilets)
//           .map(toilet => ({
//             name: toilet.toiletType,
//             total: toilet.numberOfToilets as number
//           }));
//       } else if (selectedFacility.toLowerCase().includes('dormitory') || selectedFacility.toLowerCase().includes('dorm')) {
//         entities = dormitories
//           .filter(dorm => dorm.names && dorm.numberOfDormitories)
//           .map(dorm => ({
//             name: dorm.names,
//             total: dorm.numberOfDormitories as number
//           }));
//       } else if (selectedFacility.toLowerCase().includes('dining')) {
//         entities = diningHalls
//           .filter(dining => dining.names && dining.numberOfDiningHalls)
//           .map(dining => ({
//             name: dining.names,
//             total: dining.numberOfDiningHalls as number
//           }));
//       } else if (selectedFacility.toLowerCase().includes('compound')) {
//         entities = compounds
//           .filter(compound => compound.areas && compound.numberOfCompounds)
//           .map(compound => ({
//             name: compound.areas,
//             total: compound.numberOfCompounds as number
//           }));
//       } else if (selectedFacility.toLowerCase().includes('office')) {
//         entities = offices
//           .filter(office => office.names && office.numberOfOffices)
//           .map(office => ({
//             name: office.names,
//             total: office.numberOfOffices as number
//           }));
//       }

//       if (entities.length === 0) {
//         console.error('No valid entities to submit');
//         return;
//       }

//       const payload: entitiesData = {
//         facility_id: facilityId,
//         entities: entities
//       };

//       console.log('Submitting payload:', payload);

//       const response = await createSchoolEntities(payload);
//       console.log('API Response:', response);

//       // Show success toast
//       toast({
//         title: 'Success',
//         description: `Entities for ${selectedFacility} have been created successfully!`,
//         variant: 'default',
//       });

//       // Reset form after successful submission
//       setSelectedFacility('');
//       setClassrooms([{ grade: '', stream: '', numberOfClasses: '' }]);
//       setLaboratories([{ labType: '', numberOfLaboratories: '' }]);
//       setToilets([{ toiletType: '', numberOfToilets: '' }]);
//       setDormitories([{ names: '', numberOfDormitories: '' }]);
//       setDiningHalls([{ names: '', numberOfDiningHalls: '' }]);
//       setCompounds([{ areas: '', numberOfCompounds: '' }]);
//       setOffices([{ names: '', numberOfOffices: '' }]);

//     } catch (error: any) {
//       console.error('Error submitting entities:', error);

//       // Show error toast
//       toast({
//         title: 'Error',
//         description: error?.response?.data?.message || 'Failed to create entities. Please try again.',
//         variant: 'destructive',
//       });
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 bg-white">
//       <Card className="w-full max-w-lg shadow-lg border-0 mx-auto">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold text-gray-800">Add Entities</CardTitle>
//           <p className="text-sm text-gray-600">Enter the details for the new facility</p>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="facility" className="text-sm font-medium text-gray-700">
//               Facility
//             </Label>
//             <Select value={selectedFacility} onValueChange={setSelectedFacility}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select a facility" />
//               </SelectTrigger>
//               <SelectContent>
//                 {facilities.map((facility) => (
//                   <SelectItem key={facility.id} value={facility.name}>
//                     {facility.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <p className="text-xs text-gray-500">
//               Select the facility type to add specific details
//             </p>
//           </div>

//           {/* Conditional fields based on facility type */}
//           {selectedFacility.toLowerCase().includes('classroom') && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Classrooms</Label>
//                 <Button type="button" onClick={addClassroom} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Classroom
//                 </Button>
//               </div>
//               {classrooms.map((classroom, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Classroom {index + 1}</h4>
//                     {classrooms.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeClassroom(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Grade
//                       </Label>
//                       <Select
//                         value={classroom.grade}
//                         onValueChange={(value) => updateClassroom(index, 'grade', value)}
//                       >
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder="Select a grade" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="PP1">PP1</SelectItem>
//                           <SelectItem value="PP2">PP2</SelectItem>
//                           {Array.from({ length: 12 }, (_, i) => (
//                             <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
//                               Grade {i + 1}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Stream
//                       </Label>
//                       <Input
//                         placeholder="Enter stream name"
//                         value={classroom.stream}
//                         onChange={(e) => updateClassroom(index, 'stream', e.target.value)}
//                         disabled={!classroom.grade}
//                         className="w-full"
//                       />
//                       {!classroom.grade && (
//                         <p className="text-xs text-gray-500">Select a grade first</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-gray-700">
//                       Number of Classes
//                     </Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter number of classes"
//                       value={classroom.numberOfClasses}
//                       onChange={(e) => updateClassroom(index, 'numberOfClasses', e.target.value === '' ? '' : Number(e.target.value))}
//                       className="w-full"
//                       min="1"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {(selectedFacility.toLowerCase().includes('laboratory') || selectedFacility.toLowerCase().includes('lab')) && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Laboratories</Label>
//                 <Button type="button" onClick={addLaboratory} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Laboratory
//                 </Button>
//               </div>
//               {laboratories.map((lab, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Laboratory {index + 1}</h4>
//                     {laboratories.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeLaboratory(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Lab Type
//                       </Label>
//                       <Select
//                         value={lab.labType}
//                         onValueChange={(value) => updateLaboratory(index, 'labType', value)}
//                       >
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder="Select lab type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="chemistry">Chemistry</SelectItem>
//                           <SelectItem value="physics">Physics</SelectItem>
//                           <SelectItem value="biology">Biology</SelectItem>
//                           <SelectItem value="mixed">Mixed</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Number of Laboratories
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter number"
//                         value={lab.numberOfLaboratories}
//                         onChange={(e) => updateLaboratory(index, 'numberOfLaboratories', e.target.value === '' ? '' : Number(e.target.value))}
//                         className="w-full"
//                         min="1"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {selectedFacility.toLowerCase().includes('toilet') && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Toilets</Label>
//                 <Button type="button" onClick={addToilet} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Toilet
//                 </Button>
//               </div>
//               {toilets.map((toilet, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Toilet {index + 1}</h4>
//                     {toilets.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeToilet(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Toilet Type
//                       </Label>
//                       <Select
//                         value={toilet.toiletType}
//                         onValueChange={(value) => updateToilet(index, 'toiletType', value)}
//                       >
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder="Select toilet type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="boys">Boys</SelectItem>
//                           <SelectItem value="girls">Girls</SelectItem>
//                           <SelectItem value="staff">Staff</SelectItem>
//                           <SelectItem value="disabled">Disabled</SelectItem>
//                           <SelectItem value="mixed">Mixed</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Number of Toilets
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter number"
//                         value={toilet.numberOfToilets}
//                         onChange={(e) => updateToilet(index, 'numberOfToilets', e.target.value === '' ? '' : Number(e.target.value))}
//                         className="w-full"
//                         min="1"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {(selectedFacility.toLowerCase().includes('dormitory') || selectedFacility.toLowerCase().includes('dorm')) && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Dormitories</Label>
//                 <Button type="button" onClick={addDormitory} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Dormitory
//                 </Button>
//               </div>
//               {dormitories.map((dorm, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Dormitory {index + 1}</h4>
//                     {dormitories.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeDormitory(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Dormitory Names
//                       </Label>
//                       <Input
//                         placeholder="Enter names separated by commas"
//                         value={dorm.names}
//                         onChange={(e) => updateDormitory(index, 'names', e.target.value)}
//                         className="w-full"
//                       />
//                       <p className="text-xs text-gray-500">
//                         e.g., Dorm A, Dorm B
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Number of Dormitories
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter number"
//                         value={dorm.numberOfDormitories}
//                         onChange={(e) => updateDormitory(index, 'numberOfDormitories', e.target.value === '' ? '' : Number(e.target.value))}
//                         className="w-full"
//                         min="1"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {selectedFacility.toLowerCase().includes('dining') && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Dining Halls</Label>
//                 <Button type="button" onClick={addDiningHall} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Dining Hall
//                 </Button>
//               </div>
//               {diningHalls.map((dining, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Dining Hall {index + 1}</h4>
//                     {diningHalls.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeDiningHall(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Dining Hall Names
//                       </Label>
//                       <Input
//                         placeholder="Enter names separated by commas"
//                         value={dining.names}
//                         onChange={(e) => updateDiningHall(index, 'names', e.target.value)}
//                         className="w-full"
//                       />
//                       <p className="text-xs text-gray-500">
//                         e.g., Main Dining Hall
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Number of Dining Halls
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter number"
//                         value={dining.numberOfDiningHalls}
//                         onChange={(e) => updateDiningHall(index, 'numberOfDiningHalls', e.target.value === '' ? '' : Number(e.target.value))}
//                         className="w-full"
//                         min="1"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {selectedFacility.toLowerCase().includes('compound') && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Compounds</Label>
//                 <Button type="button" onClick={addCompound} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Compound
//                 </Button>
//               </div>
//               {compounds.map((compound, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Compound {index + 1}</h4>
//                     {compounds.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeCompound(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Compound Areas
//                       </Label>
//                       <Input
//                         placeholder="Enter areas separated by commas"
//                         value={compound.areas}
//                         onChange={(e) => updateCompound(index, 'areas', e.target.value)}
//                         className="w-full"
//                       />
//                       <p className="text-xs text-gray-500">
//                         e.g., Lawns, Flowers, Trees
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Number of Compounds
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter number"
//                         value={compound.numberOfCompounds}
//                         onChange={(e) => updateCompound(index, 'numberOfCompounds', e.target.value === '' ? '' : Number(e.target.value))}
//                         className="w-full"
//                         min="1"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {selectedFacility.toLowerCase().includes('office') && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium text-gray-700">Offices</Label>
//                 <Button type="button" onClick={addOffice} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-1" /> Add Office
//                 </Button>
//               </div>
//               {offices.map((office, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium">Office {index + 1}</h4>
//                     {offices.length > 1 && (
//                       <Button
//                         type="button"
//                         onClick={() => removeOffice(index)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Office Names
//                       </Label>
//                       <Input
//                         placeholder="Enter names separated by commas"
//                         value={office.names}
//                         onChange={(e) => updateOffice(index, 'names', e.target.value)}
//                         className="w-full"
//                       />
//                       <p className="text-xs text-gray-500">
//                         e.g., Principal's Office
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Number of Offices
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter number"
//                         value={office.numberOfOffices}
//                         onChange={(e) => updateOffice(index, 'numberOfOffices', e.target.value === '' ? '' : Number(e.target.value))}
//                         className="w-full"
//                         min="1"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <Button
//             onClick={handleSubmit}
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
//           >
//             Submit Entities
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default FacilityAddPage;
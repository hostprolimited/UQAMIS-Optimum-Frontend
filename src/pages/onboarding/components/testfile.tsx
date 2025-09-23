// const onSubmit = async (data: OnboardingFormData) => {
//      try {
//       setIsSubmitting(true);
//       console.log('onSubmit called with data:', data);
//       // Transform data to match API expectations
//       const transformedData = data.schools.map((school) => ({
//         name: school.name,
//         type: school.schoolType,
//         county: school.county,
//         subcounty: school.subCounty,
//         ward: school.ward || '',
//         address: school.address,
//         phone_number: school.phoneNumber,
//         location: school.location,
//         total_students: school.numberOfStudents ? Number(school.numberOfStudents) : 0,
//         email: school.email,
//         gender_based: school.gender,
//         status: 'active',
//         boarding_type: school.boardingType,
//         total_teachers: school.numberOfTeachers ? Number(school.numberOfTeachers) : 0,
//       }));
//       const res = await onboardSchools(transformedData);
//       toast({
//         title: 'Success',
//         description: 'Schools onboarded successfully',
//       });
//       form.reset();
//       navigate('/onboarded-schools'); // Redirect after submit
//      }
//       catch (error: any) {
//         console.error('Error during onboarding:', error);
//         toast({
//           title: 'Error',
//           description: error?.response?.data?.message || 'An error occurred during onboarding. Please try again.',
//           variant: 'destructive',
//         });
//       } finally {
//         setIsSubmitting(false);
//       } 
//   };

// <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">School Onboarding</h1>
//           <p className="text-muted-foreground">
//             Register new schools in the quality assurance system
//           </p>
//         </div>
//         <Badge variant="outline" className="text-sm">
//           {fields.length} school{fields.length !== 1 ? 's' : ''} to register
//         </Badge>
//       </div>

//   const getSubCounties = (countyName: string) => {
//     const county = counties.find(
//       (c): c is { county_id: string; county_name: string } =>
//         typeof c === 'object' && 'county_name' in c && typeof (c as any).county_name === 'string' && (c as any).county_name.toLowerCase() === countyName.toLowerCase()
//     );
//     if (!county) return [];
//     return getSubCountiesByCountyId(county.county_id).map((s) => s.constituency_name);
//   };
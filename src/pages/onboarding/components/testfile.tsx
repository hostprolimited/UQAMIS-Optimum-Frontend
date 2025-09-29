// import { useEffect } from 'react';
// import React, { useState } from 'react';
// import data from '@/constants/data.json';
// import { useRole } from '@/contexts/RoleContext';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Plus, Trash2, School, MapPin, Phone, Mail } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useToast } from '@/hooks/use-toast';
// import { Badge } from '@/components/ui/badge';
// import { onboardSchools } from "@/pages/onboarding/core/_requests";


// // Extract counties, subcounties, and wards from JSON
// const counties = data.find((t) => t.name === 'counties').data;
// const subcounties = data.find((t) => t.name === 'subcounties').data;
// const wards = data.find((t) => t.name === 'station').data;
// // Utility functions
// function getCountyByCode(code) {
//   return counties.find(
//     (c): c is { county_id: string; county_name: string } =>
//       typeof c === 'object' && 'county_id' in c && (c as any).county_id === code
//   );
// }
// function getSubCountiesByCountyId(county_id) {
//   return subcounties
//     .filter((s): s is { subcounty_id: string; county_id: string; constituency_name: string } => 'county_id' in s && 'constituency_name' in s)
//     .filter((s) => s.county_id === county_id);
// }
// function getWardsBySubCountyName(subCountyName) {
//   return wards
//     .filter((w): w is { station_id: string; subcounty_id: string; constituency_name: string; ward: string } =>
//       typeof w === 'object' && 'constituency_name' in w && typeof w.constituency_name === 'string'
//     )
//     .filter((w) => w.constituency_name.toLowerCase() === subCountyName.toLowerCase());
// }


// const schoolSchema = z.object({
//   name: z.string().min(3, 'School name must be at least 3 characters'),
//   county_code: z.string().optional(),
//   numberOfStudents: z.number().min(1, 'Number of students must be at least 1').max(10000, 'Number of students seems too high').optional(),
//   numberOfTeachers: z.number().min(1, 'Number of teachers must be at least 1').max(1000, 'Number of teachers seems too high').optional(),
//   county: z.string().min(1, 'Please select a county'),
//   subCounty: z.string().min(1, 'Please select a sub-county'),
//   totalTeachers: z.number().min(1, 'Total teachers must be at least 1').max(1000, 'Total teachers seems too high').optional(),
//   ward: z.string().optional(),
//   location: z.string().min(3, 'Location must be at least 3 characters'),
//   address: z.string().min(10, 'Address must be at least 10 characters'),
//   phoneNumber: z.string().regex(/^(
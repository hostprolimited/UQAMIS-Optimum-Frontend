import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { Users, GraduationCap, Calendar, Clock, Building } from 'lucide-react';
import { createSchoolMetrics } from '../core/_request';

import { useNavigate } from 'react-router-dom';

// Get current year and term
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1; // 1-12

// Determine current term based on month
const getCurrentTerm = () => {
  if (currentMonth >= 1 && currentMonth <= 3) return '1';
  if (currentMonth >= 4 && currentMonth <= 7) return '2';
  if (currentMonth >= 8 && currentMonth <= 11) return '3';
  return '1'; // December defaults to Term 1 of next year, but for simplicity
};

const schoolFormSchema = z.object({
  numberOfTeachers: z.number().min(0, 'Number of teachers must be at least 0').max(1000, 'Number of teachers seems too high'),
  numberOfStudents: z.number().min(0, 'Number of students must be at least 0').max(10000, 'Number of students seems too high'),
  term: z.string().min(1, 'Please select a term'),
  year: z.string().min(1, 'Please select a year'),
  class: z.string().optional(),
  streams: z.string().optional(),
});

type SchoolFormData = z.infer<typeof schoolFormSchema>;

const SchoolFormAddPage = () => {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<SchoolFormData | null>(null);

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      numberOfTeachers: undefined,
      numberOfStudents: undefined,
      term: getCurrentTerm(),
      year: currentYear.toString(),
      class: '',
      streams: '',
    },
  });

  const onSubmit = (data: SchoolFormData) => {
    setFormDataToSubmit(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formDataToSubmit || !currentUser?.institution_id) return;

    try {
      setIsSubmitting(true);
      setShowConfirmDialog(false);

      const response = await createSchoolMetrics({
        institution_id: currentUser.institution_id,
        students_count: formDataToSubmit.numberOfStudents ?? 0,
        teachers_count: formDataToSubmit.numberOfTeachers ?? 0,
        term: formDataToSubmit.term,
        year: formDataToSubmit.year,
        class: formDataToSubmit.class,
        streams: formDataToSubmit.streams ? formDataToSubmit.streams.split(',').map(s => s.trim()) : [],
      });

      if (response.status === 'success') {
        toast({
          title: 'Success',
          description: 'School form submitted successfully',
        });
        navigate('/school-metrics');
      } else {
        throw new Error(response.message || 'Failed to submit school form');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit school form',
        variant: 'destructive',
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
      setFormDataToSubmit(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">School Metrics Submission</h1>
        <p className="text-muted-foreground">
          Submit school statistics for the current term
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>
            Enter the current school statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Number of Teachers */}
                <FormField
                  control={form.control}
                  name="numberOfTeachers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Number of Teachers</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 25"
                          type="number"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Number of Students */}
                <FormField
                  control={form.control}
                  name="numberOfStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Number of Students</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 500"
                          type="number"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term */}
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Term</span>
                      </FormLabel>
                      <Select disabled onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Term 1</SelectItem>
                          <SelectItem value="2">Term 2</SelectItem>
                          <SelectItem value="3">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Year</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Class */}
                {/* <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Class</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Form 1">Form 1</SelectItem>
                          <SelectItem value="Form 2">Form 2</SelectItem>
                          <SelectItem value="Form 3">Form 3</SelectItem>
                          <SelectItem value="Form 4">Form 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Streams */}
                {/* <FormField
                  control={form.control}
                  name="streams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Streams</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Blue, Green, Yellow"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the information before submitting:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Number of Teachers:</span>
                <p className="text-muted-foreground">{formDataToSubmit?.numberOfTeachers}</p>
              </div>
              <div>
                <span className="font-medium">Number of Students:</span>
                <p className="text-muted-foreground">{formDataToSubmit?.numberOfStudents}</p>
              </div>
              <div>
                <span className="font-medium">Term:</span>
                <p className="text-muted-foreground">Term {formDataToSubmit?.term}</p>
              </div>
              <div>
                <span className="font-medium">Year:</span>
                <p className="text-muted-foreground">{formDataToSubmit?.year}</p>
              </div>
              {/* <div>
                <span className="font-medium">Class:</span>
                <p className="text-muted-foreground">{formDataToSubmit?.class || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Streams:</span>
                <p className="text-muted-foreground">{formDataToSubmit?.streams || 'N/A'}</p>
              </div> */}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Edit</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolFormAddPage;
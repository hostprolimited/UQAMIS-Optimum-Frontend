import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, School, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Counties and their sub-counties data
const countiesData = {
  'Nairobi': ['Westlands', 'Dagoretti North', 'Dagoretti South', 'Langata', 'Kibra', 'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North', 'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare'],
  'Mombasa': ['Changamwe', 'Jomba', 'Kisauni', 'Nyali', 'Likoni', 'Mvita'],
  'Kisumu': ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach'],
  'Nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Kuresoi North', 'Kuresoi South', 'Gilgil', 'Naivasha', 'Molo', 'Njoro', 'Bahati', 'Subukia', 'Rongai'],
  'Kiambu': ['Thika Town', 'Ruiru', 'Juja', 'Kiambu', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari', 'Githunguri', 'Gatundu South', 'Gatundu North']
};

const schoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters'),
  county: z.string().min(1, 'Please select a county'),
  subCounty: z.string().min(1, 'Please select a sub-county'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  phoneNumber: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number'),
  email: z.string().email('Please enter a valid email address'),
});

const onboardingSchema = z.object({
  schools: z.array(schoolSchema).min(1, 'At least one school must be added'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const Onboard = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      schools: [
        {
          name: '',
          county: '',
          subCounty: '',
          location: '',
          address: '',
          phoneNumber: '',
          email: '',
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schools',
  });

  const addSchool = () => {
    append({
      name: '',
      county: '',
      subCounty: '',
      location: '',
      address: '',
      phoneNumber: '',
      email: '',
    });
  };

  const removeSchool = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Onboarding Data:', data);
    
    toast({
      title: "Schools Onboarded Successfully!",
      description: `${data.schools.length} school(s) have been added to the system.`,
    });
    
    // Reset form
    form.reset();
    setIsSubmitting(false);
  };

  const getSubCounties = (county: string) => {
    return countiesData[county as keyof typeof countiesData] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">School Onboarding</h1>
          <p className="text-muted-foreground">
            Register new schools in the quality assurance system
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {fields.length} school{fields.length !== 1 ? 's' : ''} to register
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => {
            const selectedCounty = form.watch(`schools.${index}.county`);
            const subCounties = getSubCounties(selectedCounty);

            return (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <School className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        School #{index + 1}
                      </CardTitle>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSchool(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Enter the school details below
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School Name */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center space-x-2">
                            <School className="h-4 w-4" />
                            <span>School Name</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Green Valley Primary School" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* County */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.county`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset sub-county when county changes
                              form.setValue(`schools.${index}.subCounty`, '');
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select county" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(countiesData).map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sub County */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.subCounty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub County</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!selectedCounty}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub-county" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subCounties.map((subCounty) => (
                                <SelectItem key={subCounty} value={subCounty}>
                                  {subCounty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.location`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Location</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Karen, Langata Road" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.address`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physical Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., P.O. Box 1234-00100, Nairobi" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.phoneNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Phone Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., +254712345678" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name={`schools.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email Address</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., info@greenvally.ac.ke" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={addSchool}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another School</span>
            </Button>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isSubmitting ? 'Submitting...' : 'Submit All Schools'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Onboard;
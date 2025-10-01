import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createTermDates } from '../core/_requests';

const termDatesSchema = z.object({
  term: z.enum(['1', '2', '3']),
  openingDate: z.date(),
  closingDate: z.date(),
  year: z.number().default(new Date().getFullYear()),
});

type TermDatesData = z.infer<typeof termDatesSchema>;

const TermDates: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<TermDatesData>({
    resolver: zodResolver(termDatesSchema),
    defaultValues: {
      term: '1',
      openingDate: new Date(),
      closingDate: new Date(),
      year: new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: TermDatesData) => {
    try {
      const apiData = {
        id: 0, // Placeholder for create
        term: data.term,
        startDate: data.openingDate.toISOString().split('T')[0],
        endDate: data.closingDate.toISOString().split('T')[0],
      };

      await createTermDates(apiData);

      toast({
        title: 'Success',
        description: 'Term dates created successfully.',
      });

      navigate('/termly-dates');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create term dates.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white">
      <Card className="w-full max-w-lg shadow-lg border-0 mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Term Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Term</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
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

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium text-gray-700">
                      Year
                    </Label>
                    <Input
                      id="year"
                      value={new Date().getFullYear()}
                      readOnly
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Opening Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            label="Opening Date"
                            value={dayjs(field.value)}
                            onChange={(newValue) => field.onChange(newValue?.toDate())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Closing Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            label="Closing Date"
                            value={dayjs(field.value)}
                            onChange={(newValue) => field.onChange(newValue?.toDate())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Submit
                </Button>
              </form>
          </Form>
        </LocalizationProvider>
      </CardContent>
      </Card>
    </div>
  );
};

export default TermDates;
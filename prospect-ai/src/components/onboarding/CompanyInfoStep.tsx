'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

const companyInfoSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;

interface CompanyInfoStepProps {
  defaultValues?: Partial<CompanyInfoFormData>;
  onNext: (data: CompanyInfoFormData) => void;
  onBack?: () => void;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Other',
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

export function CompanyInfoStep({ defaultValues, onNext, onBack }: CompanyInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues,
  });

  const onSubmit = async (data: CompanyInfoFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
          <p className="text-sm text-gray-600">Tell us about your company</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <Label htmlFor="name" required>
            Company Name
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Acme Corporation"
            error={!!errors.name}
            errorMessage={errors.name?.message}
            className="mt-1"
          />
        </div>

        {/* Industry */}
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select
            id="industry"
            {...register('industry')}
            error={!!errors.industry}
            className="mt-1"
          >
            <SelectOption value="">Select an industry</SelectOption>
            {INDUSTRIES.map((industry) => (
              <SelectOption key={industry} value={industry}>
                {industry}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Company Size */}
        <div>
          <Label htmlFor="size">Company Size</Label>
          <Select
            id="size"
            {...register('size')}
            error={!!errors.size}
            className="mt-1"
          >
            <SelectOption value="">Select company size</SelectOption>
            {COMPANY_SIZES.map((size) => (
              <SelectOption key={size} value={size}>
                {size}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Website */}
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            {...register('website')}
            placeholder="https://example.com"
            error={!!errors.website}
            errorMessage={errors.website?.message}
            className="mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of your company and what you do..."
            rows={4}
            error={!!errors.description}
            errorMessage={errors.description?.message}
            className="mt-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
}

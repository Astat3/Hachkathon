'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const targetMarketSchema = z.object({
  targetIndustries: z.array(z.string()).min(1, 'Select at least one industry'),
  targetCompanySize: z.array(z.string()).min(1, 'Select at least one company size'),
  targetLocations: z.array(z.string()).min(1, 'Add at least one location'),
  targetRoles: z.array(z.string()).min(1, 'Add at least one role'),
  targetCriteria: z.string().optional(),
});

export type TargetMarketFormData = z.infer<typeof targetMarketSchema>;

interface TargetMarketStepProps {
  defaultValues?: Partial<TargetMarketFormData>;
  onNext: (data: TargetMarketFormData) => void;
  onBack: () => void;
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
  'E-commerce',
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

export function TargetMarketStep({ defaultValues, onNext, onBack }: TargetMarketStepProps) {
  const [locationInput, setLocationInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TargetMarketFormData>({
    resolver: zodResolver(targetMarketSchema),
    defaultValues: {
      targetIndustries: defaultValues?.targetIndustries || [],
      targetCompanySize: defaultValues?.targetCompanySize || [],
      targetLocations: defaultValues?.targetLocations || [],
      targetRoles: defaultValues?.targetRoles || [],
      targetCriteria: defaultValues?.targetCriteria || '',
    },
  });

  const targetIndustries = watch('targetIndustries');
  const targetCompanySize = watch('targetCompanySize');
  const targetLocations = watch('targetLocations');
  const targetRoles = watch('targetRoles');

  const toggleIndustry = (industry: string) => {
    const current = targetIndustries || [];
    if (current.includes(industry)) {
      setValue('targetIndustries', current.filter((i) => i !== industry));
    } else {
      setValue('targetIndustries', [...current, industry]);
    }
  };

  const toggleCompanySize = (size: string) => {
    const current = targetCompanySize || [];
    if (current.includes(size)) {
      setValue('targetCompanySize', current.filter((s) => s !== size));
    } else {
      setValue('targetCompanySize', [...current, size]);
    }
  };

  const addLocation = () => {
    if (locationInput.trim()) {
      const current = targetLocations || [];
      if (!current.includes(locationInput.trim())) {
        setValue('targetLocations', [...current, locationInput.trim()]);
      }
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    setValue('targetLocations', targetLocations.filter((l) => l !== location));
  };

  const addRole = () => {
    if (roleInput.trim()) {
      const current = targetRoles || [];
      if (!current.includes(roleInput.trim())) {
        setValue('targetRoles', [...current, roleInput.trim()]);
      }
      setRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setValue('targetRoles', targetRoles.filter((r) => r !== role));
  };

  const onSubmit = async (data: TargetMarketFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Target className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Target Market</h2>
          <p className="text-sm text-gray-600">Define your ideal customer profile</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Target Industries */}
        <div>
          <Label required>Target Industries</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => toggleIndustry(industry)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  targetIndustries?.includes(industry)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {industry}
              </button>
            ))}
          </div>
          {errors.targetIndustries && (
            <p className="mt-1 text-sm text-red-600">{errors.targetIndustries.message}</p>
          )}
        </div>

        {/* Target Company Size */}
        <div>
          <Label required>Target Company Size</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleCompanySize(size)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  targetCompanySize?.includes(size)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {errors.targetCompanySize && (
            <p className="mt-1 text-sm text-red-600">{errors.targetCompanySize.message}</p>
          )}
        </div>

        {/* Target Locations */}
        <div>
          <Label required>Target Locations</Label>
          <div className="mt-1 flex gap-2">
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLocation();
                }
              }}
              placeholder="e.g., United States, Europe, Asia"
            />
            <Button type="button" onClick={addLocation} variant="outline">
              Add
            </Button>
          </div>
          {targetLocations && targetLocations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {targetLocations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.targetLocations && (
            <p className="mt-1 text-sm text-red-600">{errors.targetLocations.message}</p>
          )}
        </div>

        {/* Target Roles */}
        <div>
          <Label required>Target Roles</Label>
          <div className="mt-1 flex gap-2">
            <Input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRole();
                }
              }}
              placeholder="e.g., CEO, CTO, Marketing Director"
            />
            <Button type="button" onClick={addRole} variant="outline">
              Add
            </Button>
          </div>
          {targetRoles && targetRoles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {targetRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.targetRoles && (
            <p className="mt-1 text-sm text-red-600">{errors.targetRoles.message}</p>
          )}
        </div>

        {/* Additional Criteria */}
        <div>
          <Label htmlFor="targetCriteria">Additional Criteria (Optional)</Label>
          <Controller
            name="targetCriteria"
            control={control}
            render={({ field }) => (
              <Textarea
                id="targetCriteria"
                {...field}
                placeholder="Any other specific criteria for your target market..."
                rows={3}
                className="mt-1"
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
}

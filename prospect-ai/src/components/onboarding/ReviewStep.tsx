'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Building2, Target, BookOpen, Edit } from 'lucide-react';
import type { CompanyInfoFormData } from './CompanyInfoStep';
import type { TargetMarketFormData } from './TargetMarketStep';
import type { KnowledgeSourceFormData } from './KnowledgeSourceStep';

interface ReviewStepProps {
  companyInfo: CompanyInfoFormData;
  targetMarket: TargetMarketFormData;
  knowledgeSource: KnowledgeSourceFormData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({
  companyInfo,
  targetMarket,
  knowledgeSource,
  onEdit,
  onSubmit,
  isSubmitting,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
          <p className="text-sm text-gray-600">Review your information before submitting</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Company Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Company Information</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="h-8"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Company Name</p>
              <p className="text-base text-gray-900">{companyInfo.name}</p>
            </div>
            {companyInfo.industry && (
              <div>
                <p className="text-sm font-medium text-gray-500">Industry</p>
                <p className="text-base text-gray-900">{companyInfo.industry}</p>
              </div>
            )}
            {companyInfo.size && (
              <div>
                <p className="text-sm font-medium text-gray-500">Company Size</p>
                <p className="text-base text-gray-900">{companyInfo.size}</p>
              </div>
            )}
            {companyInfo.website && (
              <div>
                <p className="text-sm font-medium text-gray-500">Website</p>
                <a
                  href={companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-600 hover:underline"
                >
                  {companyInfo.website}
                </a>
              </div>
            )}
            {companyInfo.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base text-gray-900">{companyInfo.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Market */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Target Market</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="h-8"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Target Industries</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {targetMarket.targetIndustries.map((industry) => (
                  <span
                    key={industry}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Target Company Size</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {targetMarket.targetCompanySize.map((size) => (
                  <span
                    key={size}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Target Locations</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {targetMarket.targetLocations.map((location) => (
                  <span
                    key={location}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Target Roles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {targetMarket.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            {targetMarket.targetCriteria && (
              <div>
                <p className="text-sm font-medium text-gray-500">Additional Criteria</p>
                <p className="text-base text-gray-900">{targetMarket.targetCriteria}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Source */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Knowledge Source</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="h-8"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Source Type</p>
              <p className="text-base text-gray-900 capitalize">{knowledgeSource.knowledgeType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Content Preview</p>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {knowledgeSource.knowledgeSource.substring(0, 300)}
                  {knowledgeSource.knowledgeSource.length > 300 && '...'}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {knowledgeSource.knowledgeSource.length} characters
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => onEdit(3)}>
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="min-w-[150px]"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Submitting...
            </>
          ) : (
            'Complete Onboarding'
          )}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator, type Step } from '@/components/onboarding/StepIndicator';
import { CompanyInfoStep, type CompanyInfoFormData } from '@/components/onboarding/CompanyInfoStep';
import { TargetMarketStep, type TargetMarketFormData } from '@/components/onboarding/TargetMarketStep';
import { KnowledgeSourceStep, type KnowledgeSourceFormData } from '@/components/onboarding/KnowledgeSourceStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';

const STEPS: Step[] = [
  {
    id: 1,
    name: 'Company Info',
    description: 'Basic information',
  },
  {
    id: 2,
    name: 'Target Market',
    description: 'Define your ICP',
  },
  {
    id: 3,
    name: 'Knowledge',
    description: 'Add company data',
  },
  {
    id: 4,
    name: 'Review',
    description: 'Confirm details',
  },
];

interface OnboardingData {
  companyInfo?: CompanyInfoFormData;
  targetMarket?: TargetMarketFormData;
  knowledgeSource?: KnowledgeSourceFormData;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const handleCompanyInfoNext = (data: CompanyInfoFormData) => {
    setOnboardingData((prev) => ({ ...prev, companyInfo: data }));
    setCurrentStep(2);
  };

  const handleTargetMarketNext = (data: TargetMarketFormData) => {
    setOnboardingData((prev) => ({ ...prev, targetMarket: data }));
    setCurrentStep(3);
  };

  const handleKnowledgeSourceNext = (data: KnowledgeSourceFormData) => {
    setOnboardingData((prev) => ({ ...prev, knowledgeSource: data }));
    setCurrentStep(4);
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!onboardingData.companyInfo || !onboardingData.targetMarket || !onboardingData.knowledgeSource) {
      alert('Please complete all steps');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...onboardingData.companyInfo,
          ...onboardingData.targetMarket,
          ...onboardingData.knowledgeSource,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create company');
      }

      const result = await response.json();
      
      // Show success message
      alert('Onboarding completed successfully!');
      
      // Redirect to dashboard or company page
      router.push('/');
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Onboarding</h1>
        <p className="mt-2 text-gray-600">
          Let's get your company set up in ProspectAI
        </p>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <Card>
        <CardContent className="p-6 sm:p-8">
          {currentStep === 1 && (
            <CompanyInfoStep
              defaultValues={onboardingData.companyInfo}
              onNext={handleCompanyInfoNext}
            />
          )}

          {currentStep === 2 && (
            <TargetMarketStep
              defaultValues={onboardingData.targetMarket}
              onNext={handleTargetMarketNext}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <KnowledgeSourceStep
              defaultValues={onboardingData.knowledgeSource}
              onNext={handleKnowledgeSourceNext}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && onboardingData.companyInfo && onboardingData.targetMarket && onboardingData.knowledgeSource && (
            <ReviewStep
              companyInfo={onboardingData.companyInfo}
              targetMarket={onboardingData.targetMarket}
              knowledgeSource={onboardingData.knowledgeSource}
              onEdit={handleEdit}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Step {currentStep} of {STEPS.length}
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex-1',
                stepIdx !== steps.length - 1 && 'pr-8 sm:pr-20'
              )}
            >
              {/* Connector Line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute left-0 top-4 -ml-px mt-0.5 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}

              <div className="group relative flex flex-col items-start">
                <span className="flex h-9 items-center" aria-hidden="true">
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                      isCompleted &&
                        'bg-blue-600 hover:bg-blue-700',
                      isCurrent &&
                        'border-2 border-blue-600 bg-white',
                      isUpcoming && 'border-2 border-gray-300 bg-white'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          isCurrent && 'bg-blue-600',
                          isUpcoming && 'bg-transparent'
                        )}
                      />
                    )}
                  </span>
                </span>
                <span className="mt-2 flex min-w-0 flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isCurrent && 'text-blue-600',
                      isCompleted && 'text-gray-900',
                      isUpcoming && 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

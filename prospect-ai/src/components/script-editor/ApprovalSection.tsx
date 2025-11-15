"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

const approvalSchema = z.object({
  approved: z.boolean().refine((val) => val === true, {
    message: "You must approve the script before proceeding",
  }),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ApprovalSectionProps {
  isApproved: boolean;
  approvedAt?: Date;
  onApprove: () => Promise<void>;
  onProceedToVoice?: () => void;
}

export function ApprovalSection({
  isApproved,
  approvedAt,
  onApprove,
  onProceedToVoice,
}: ApprovalSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      approved: isApproved,
    },
  });

  const isChecked = watch("approved");

  const onSubmit = async (data: ApprovalFormData) => {
    if (!data.approved) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onApprove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve script");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isApproved && approvedAt) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Script Approved
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-700">
            <p className="font-medium">This script has been approved for use in calls.</p>
            <p className="mt-1 text-green-600">
              Approved on {formatDate(approvedAt)}
            </p>
          </div>

          {onProceedToVoice && (
            <div className="pt-4 border-t border-green-200">
              <Button
                variant="primary"
                onClick={onProceedToVoice}
                className="w-full"
              >
                Proceed to Voice Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          Script Approval Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              Before proceeding to voice selection, you must review and approve this script. 
              Once approved, the script will be locked and ready for use in your calls.
            </p>
          </div>

          <div className="space-y-4">
            <Checkbox
              id="approval-checkbox"
              {...register("approved")}
              label="I have reviewed this script and approve it for use in calls"
              error={!!errors.approved}
              errorMessage={errors.approved?.message}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={!isChecked || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Approve Script
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>By approving this script, you confirm that:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>The content is accurate and appropriate for your target audience</li>
              <li>The script complies with all relevant regulations and guidelines</li>
              <li>You have reviewed the script for any errors or issues</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

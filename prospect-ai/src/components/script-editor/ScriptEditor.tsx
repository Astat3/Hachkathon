"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useState } from "react";

const scriptSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(10, "Script must be at least 10 characters").max(5000, "Script is too long"),
});

export type ScriptFormData = z.infer<typeof scriptSchema>;

interface ScriptEditorProps {
  initialData?: ScriptFormData;
  onSave: (data: ScriptFormData) => Promise<void>;
  isApproved?: boolean;
  disabled?: boolean;
}

export function ScriptEditor({
  initialData,
  onSave,
  isApproved = false,
  disabled = false,
}: ScriptEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<ScriptFormData>({
    resolver: zodResolver(scriptSchema),
    defaultValues: initialData || {
      title: "",
      content: "",
    },
  });

  const content = watch("content");
  const characterCount = content?.length || 0;

  const onSubmit = async (data: ScriptFormData) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await onSave(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save script");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Script Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          disabled={disabled || isApproved}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Enter script title..."
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Content Textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Script Content
          </label>
          <span className={`text-sm ${characterCount > 4500 ? "text-red-600" : "text-gray-500"}`}>
            {characterCount} / 5000 characters
          </span>
        </div>
        <Textarea
          id="content"
          {...register("content")}
          disabled={disabled || isApproved}
          rows={15}
          className="font-mono text-sm"
          placeholder="Enter your script content here..."
          error={!!errors.content}
          errorMessage={errors.content?.message}
        />
      </div>

      {/* Save Button and Messages */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {saveSuccess && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
              Script saved successfully!
            </p>
          )}
          {saveError && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              {saveError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={disabled || isApproved || !isDirty || isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {isApproved && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">
            This script has been approved and is locked for editing. To make changes, you'll need to create a new version.
          </p>
        </div>
      )}
    </form>
  );
}

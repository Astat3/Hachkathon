"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignCreateSchema, CampaignCreateInput, DAY_NAMES } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CampaignFormProps {
  onSubmit: (data: CampaignCreateInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CampaignCreateInput>;
  scripts?: Array<{ id: string; companyName: string }>;
  voices?: Array<{ voice_id: string; name: string }>;
}

export function CampaignForm({
  onSubmit,
  isLoading,
  defaultValues,
  scripts = [],
  voices = [],
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CampaignCreateInput>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      name: "",
      scriptId: "",
      voiceId: "",
      dailyLimit: 50,
      timeWindows: [{ start: "09:00", end: "17:00" }],
      activeDays: [1, 2, 3, 4, 5], // Monday to Friday
      maxAttempts: 3,
      status: "draft",
      ...defaultValues,
    },
  });

  const timeWindows = watch("timeWindows");
  const activeDays = watch("activeDays");

  const addTimeWindow = () => {
    setValue("timeWindows", [...timeWindows, { start: "09:00", end: "17:00" }]);
  };

  const removeTimeWindow = (index: number) => {
    setValue(
      "timeWindows",
      timeWindows.filter((_, i) => i !== index)
    );
  };

  const updateTimeWindow = (index: number, field: "start" | "end", value: string) => {
    const updated = [...timeWindows];
    updated[index][field] = value;
    setValue("timeWindows", updated);
  };

  const toggleDay = (day: number) => {
    const updated = activeDays.includes(day)
      ? activeDays.filter((d) => d !== day)
      : [...activeDays, day].sort((a, b) => a - b);
    setValue("activeDays", updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              {...register("name")}
              error={!!errors.name}
              errorMessage={errors.name?.message}
              placeholder="e.g., Q1 Outreach Campaign"
            />
          </div>

          <div>
            <Label htmlFor="scriptId">Script *</Label>
            <Select
              id="scriptId"
              {...register("scriptId")}
              error={!!errors.scriptId}
            >
              <SelectOption value="">Select a script</SelectOption>
              {scripts.map((script) => (
                <SelectOption key={script.id} value={script.id}>
                  {script.companyName}
                </SelectOption>
              ))}
            </Select>
            {errors.scriptId && (
              <p className="mt-1 text-sm text-red-600">{errors.scriptId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="voiceId">Voice *</Label>
            <Select
              id="voiceId"
              {...register("voiceId")}
              error={!!errors.voiceId}
            >
              <SelectOption value="">Select a voice</SelectOption>
              {voices.map((voice) => (
                <SelectOption key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </SelectOption>
              ))}
            </Select>
            {errors.voiceId && (
              <p className="mt-1 text-sm text-red-600">{errors.voiceId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Call Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dailyLimit">Daily Call Limit *</Label>
            <Input
              id="dailyLimit"
              type="number"
              {...register("dailyLimit", { valueAsNumber: true })}
              error={!!errors.dailyLimit}
              errorMessage={errors.dailyLimit?.message}
              min={1}
              max={1000}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of calls per day (1-1000)
            </p>
          </div>

          <div>
            <Label htmlFor="maxAttempts">Max Attempts per Prospect *</Label>
            <Input
              id="maxAttempts"
              type="number"
              {...register("maxAttempts", { valueAsNumber: true })}
              error={!!errors.maxAttempts}
              errorMessage={errors.maxAttempts?.message}
              min={1}
              max={10}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of call attempts per prospect (1-10)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Time Windows */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Windows</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTimeWindow}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Window
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeWindows.map((window, index) => (
            <div key={index} className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor={`start-${index}`}>Start Time</Label>
                <Input
                  id={`start-${index}`}
                  type="time"
                  value={window.start}
                  onChange={(e) => updateTimeWindow(index, "start", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`end-${index}`}>End Time</Label>
                <Input
                  id={`end-${index}`}
                  type="time"
                  value={window.end}
                  onChange={(e) => updateTimeWindow(index, "end", e.target.value)}
                />
              </div>
              {timeWindows.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeTimeWindow(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.timeWindows && (
            <p className="text-sm text-red-600">{errors.timeWindows.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Active Days */}
      <Card>
        <CardHeader>
          <CardTitle>Active Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DAY_NAMES.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${index}`}
                  checked={activeDays.includes(index)}
                  onCheckedChange={() => toggleDay(index)}
                />
                <Label
                  htmlFor={`day-${index}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {day}
                </Label>
              </div>
            ))}
          </div>
          {errors.activeDays && (
            <p className="mt-2 text-sm text-red-600">{errors.activeDays.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading} variant="primary" size="lg">
          {isLoading ? "Creating..." : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
}

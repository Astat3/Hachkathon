"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScriptEditor, ScriptFormData } from "@/components/script-editor/ScriptEditor";
import { ScriptPreview } from "@/components/script-editor/ScriptPreview";
import { ApprovalSection } from "@/components/script-editor/ApprovalSection";

// Mock data - replace with real data from your API
const mockScripts: Record<string, any> = {
  "1": {
    id: "1",
    title: "Cold Call Introduction Script",
    content: "Hi, this is [Your Name] from [Company]. I'm reaching out because I noticed your company is in the [Industry] space, and we've been helping similar businesses increase their revenue by 30% through our innovative solutions. Do you have a few minutes to discuss how we might be able to help you achieve similar results?",
    createdAt: new Date("2024-11-10T10:00:00"),
    updatedAt: new Date("2024-11-12T14:30:00"),
    isApproved: true,
    approvedAt: new Date("2024-11-12T15:00:00"),
  },
  "2": {
    id: "2",
    title: "Follow-up Call Script",
    content: "Hello [Prospect Name], this is [Your Name] from [Company]. I wanted to follow up on our previous conversation about [Topic]. I've prepared some additional information that I think you'll find valuable. Would now be a good time to discuss this further?",
    createdAt: new Date("2024-11-11T09:00:00"),
    updatedAt: new Date("2024-11-13T11:20:00"),
    isApproved: false,
  },
  "3": {
    id: "3",
    title: "Product Demo Script",
    content: "Thank you for your interest in [Product Name]. Today, I'd like to walk you through the key features that make our solution unique. We'll cover how it can help you [Benefit 1], [Benefit 2], and [Benefit 3]. This demo should take about 15 minutes. Does that work for you?",
    createdAt: new Date("2024-11-09T15:00:00"),
    updatedAt: new Date("2024-11-09T16:45:00"),
    isApproved: true,
    approvedAt: new Date("2024-11-09T17:00:00"),
  },
};

interface ScriptDetailPageProps {
  params: {
    id: string;
  };
}

export default function ScriptDetailPage({ params }: ScriptDetailPageProps) {
  const router = useRouter();
  const [script, setScript] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState({ title: "", content: "" });

  useEffect(() => {
    // Simulate API call
    const loadScript = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from API: await fetch(`/api/scripts/${params.id}`)
        await new Promise((resolve) => setTimeout(resolve, 500));
        const scriptData = mockScripts[params.id];
        
        if (!scriptData) {
          router.push("/scripts");
          return;
        }

        setScript(scriptData);
        setCurrentContent({
          title: scriptData.title,
          content: scriptData.content,
        });
      } catch (error) {
        console.error("Failed to load script:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScript();
  }, [params.id, router]);

  const handleSave = async (data: ScriptFormData) => {
    // In a real app, save to API: await fetch(`/api/scripts/${params.id}`, { method: 'PUT', body: JSON.stringify(data) })
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setScript({
      ...script,
      title: data.title,
      content: data.content,
      updatedAt: new Date(),
    });
    
    setCurrentContent({
      title: data.title,
      content: data.content,
    });
  };

  const handleApprove = async () => {
    // In a real app, approve via API: await fetch(`/api/scripts/${params.id}/approve`, { method: 'POST' })
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setScript({
      ...script,
      isApproved: true,
      approvedAt: new Date(),
    });
  };

  const handleProceedToVoice = () => {
    // Navigate to voice selection page
    router.push(`/scripts/${params.id}/voice`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading script...</p>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Script not found</p>
        <Link href="/scripts">
          <Button variant="outline" className="mt-4">
            Back to Scripts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/scripts">
          <Button variant="ghost" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Scripts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {script.isApproved ? "View Script" : "Edit Script"}
        </h1>
        <p className="mt-2 text-gray-600">
          {script.isApproved
            ? "This script has been approved and is ready for use."
            : "Review and edit your script, then approve it to proceed to voice selection."}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Script Editor
            </h2>
            <ScriptEditor
              initialData={{
                title: script.title,
                content: script.content,
              }}
              onSave={handleSave}
              isApproved={script.isApproved}
            />
          </div>
        </div>

        {/* Right Column - Preview and Approval */}
        <div className="space-y-6">
          {/* Preview */}
          <ScriptPreview
            title={currentContent.title}
            content={currentContent.content}
          />

          {/* Approval Section */}
          <ApprovalSection
            isApproved={script.isApproved}
            approvedAt={script.approvedAt}
            onApprove={handleApprove}
            onProceedToVoice={handleProceedToVoice}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="font-medium text-gray-900 mt-1">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(script.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <p className="font-medium text-gray-900 mt-1">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(script.updatedAt)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <p className="font-medium text-gray-900 mt-1">
              {script.isApproved ? "Approved" : "Draft"}
            </p>
          </div>
          {script.isApproved && script.approvedAt && (
            <div>
              <span className="text-gray-600">Approved:</span>
              <p className="font-medium text-gray-900 mt-1">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(script.approvedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

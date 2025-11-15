"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { ScriptCard } from "@/components/scripts/ScriptCard";
import { GenerateScriptButton } from "@/components/scripts/GenerateScriptButton";

// Mock data - replace with real data from your API
const mockScripts = [
  {
    id: "1",
    title: "Cold Call Introduction Script",
    content: "Hi, this is [Your Name] from [Company]. I'm reaching out because I noticed your company is in the [Industry] space, and we've been helping similar businesses increase their revenue by 30% through our innovative solutions. Do you have a few minutes to discuss how we might be able to help you achieve similar results?",
    createdAt: new Date("2024-11-10T10:00:00"),
    updatedAt: new Date("2024-11-12T14:30:00"),
    isApproved: true,
    approvedAt: new Date("2024-11-12T15:00:00"),
    characterCount: 312,
  },
  {
    id: "2",
    title: "Follow-up Call Script",
    content: "Hello [Prospect Name], this is [Your Name] from [Company]. I wanted to follow up on our previous conversation about [Topic]. I've prepared some additional information that I think you'll find valuable. Would now be a good time to discuss this further?",
    createdAt: new Date("2024-11-11T09:00:00"),
    updatedAt: new Date("2024-11-13T11:20:00"),
    isApproved: false,
    characterCount: 278,
  },
  {
    id: "3",
    title: "Product Demo Script",
    content: "Thank you for your interest in [Product Name]. Today, I'd like to walk you through the key features that make our solution unique. We'll cover how it can help you [Benefit 1], [Benefit 2], and [Benefit 3]. This demo should take about 15 minutes. Does that work for you?",
    createdAt: new Date("2024-11-09T15:00:00"),
    updatedAt: new Date("2024-11-09T16:45:00"),
    isApproved: true,
    approvedAt: new Date("2024-11-09T17:00:00"),
    characterCount: 295,
  },
];

export default function ScriptsPage() {
  const [scripts] = useState(mockScripts);
  const [isLoading] = useState(false);

  const handleGenerateScript = async () => {
    // In a real implementation, this would navigate to a script generation flow
    // or open a modal to create a new script
    console.log("Generate new script");
  };

  const approvedScripts = scripts.filter((s) => s.isApproved);
  const draftScripts = scripts.filter((s) => !s.isApproved);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scripts</h1>
          <p className="mt-2 text-gray-600">
            Create, edit, and manage your call scripts. Approve scripts before using them in campaigns.
          </p>
        </div>
        <GenerateScriptButton onGenerate={handleGenerateScript} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scripts.length}</p>
              <p className="text-sm text-gray-600">Total Scripts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedScripts.length}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{draftScripts.length}</p>
              <p className="text-sm text-gray-600">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && scripts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No scripts yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by generating your first call script.
          </p>
          <GenerateScriptButton onGenerate={handleGenerateScript} />
        </div>
      )}

      {/* Draft Scripts */}
      {!isLoading && draftScripts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Drafts ({draftScripts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftScripts.map((script) => (
              <ScriptCard key={script.id} {...script} />
            ))}
          </div>
        </div>
      )}

      {/* Approved Scripts */}
      {!isLoading && approvedScripts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Approved Scripts ({approvedScripts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedScripts.map((script) => (
              <ScriptCard key={script.id} {...script} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

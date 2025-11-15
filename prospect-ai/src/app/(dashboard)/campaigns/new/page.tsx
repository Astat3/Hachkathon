"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { CampaignCreateInput } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scripts, setScripts] = useState<Array<{ id: string; companyName: string }>>([]);
  const [voices, setVoices] = useState<Array<{ voice_id: string; name: string }>>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch scripts
      const scriptsResponse = await fetch("/api/scripts");
      if (scriptsResponse.ok) {
        const scriptsData = await scriptsResponse.json();
        setScripts(scriptsData.scripts || []);
      }

      // Fetch voices
      const voicesResponse = await fetch("/api/voices");
      if (voicesResponse.ok) {
        const voicesData = await voicesResponse.json();
        setVoices(voicesData.voices || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (data: CampaignCreateInput) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create campaign");
      }

      const result = await response.json();
      
      // Redirect to the campaign detail page
      router.push(`/campaigns/${result.campaign.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create campaign");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="mt-2 text-gray-600">
            Configure your campaign settings and launch when ready.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {dataLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Form */}
      {!dataLoading && (
        <>
          {scripts.length === 0 || voices.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">
                Setup Required
              </h3>
              <p className="text-yellow-800 mb-4">
                Before creating a campaign, you need to:
              </p>
              <ul className="list-disc list-inside text-yellow-800 space-y-2 mb-4">
                {scripts.length === 0 && (
                  <li>Create at least one script</li>
                )}
                {voices.length === 0 && (
                  <li>Configure at least one voice</li>
                )}
              </ul>
              <div className="flex gap-4">
                {scripts.length === 0 && (
                  <Link href="/scripts">
                    <Button variant="primary">Go to Scripts</Button>
                  </Link>
                )}
                {voices.length === 0 && (
                  <Link href="/voices">
                    <Button variant="primary">Go to Voices</Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <CampaignForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              scripts={scripts}
              voices={voices}
            />
          )}
        </>
      )}
    </div>
  );
}

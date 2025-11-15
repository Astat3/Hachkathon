"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Campaign } from "@/types/campaign";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/campaigns");
      
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunch = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/campaigns/${id}/launch`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to launch campaign");
      }

      // Refresh campaigns list
      await fetchCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to launch campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/campaigns/${id}/pause`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to pause campaign");
      }

      // Refresh campaigns list
      await fetchCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to pause campaign");
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate summary stats
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Manage your outreach campaigns and track performance.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button variant="primary" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Campaigns</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Paused</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.paused}</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCampaigns}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No campaigns yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first campaign.
          </p>
          <Link href="/campaigns/new">
            <Button variant="primary">
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>
      )}

      {/* Campaigns Grid */}
      {!isLoading && !error && campaigns.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onLaunch={handleLaunch}
              onPause={handlePause}
              isLoading={actionLoading === campaign.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

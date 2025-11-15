"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Campaign, CampaignStats as CampaignStatsType, STATUS_VARIANTS, DAY_NAMES } from "@/types/campaign";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Phone,
  FileText,
  Mic,
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch campaign");
      }

      const data = await response.json();
      setCampaign(data.campaign);
      
      // Calculate stats
      const campaignStats: CampaignStatsType = {
        totalCalls: data.campaign.totalCalls || 0,
        successfulCalls: data.campaign.successfulCalls || 0,
        failedCalls: data.campaign.failedCalls || 0,
        pendingCalls: 0, // This would come from prospects data
        successRate: data.campaign.totalCalls > 0 
          ? Math.round((data.campaign.successfulCalls / data.campaign.totalCalls) * 100)
          : 0,
        averageCallDuration: 0, // This would come from call logs
        callsToday: 0, // This would come from call logs
      };
      setStats(campaignStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunch = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to launch campaign");
      }

      await fetchCampaign();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to launch campaign");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to pause campaign");
      }

      await fetchCampaign();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to pause campaign");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      router.push("/campaigns");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete campaign");
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Not Found</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Campaign not found"}</p>
        </div>
      </div>
    );
  }

  const activeDayNames = campaign.activeDays
    .sort((a, b) => a - b)
    .map(day => DAY_NAMES[day])
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[campaign.status]}>
                {campaign.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {campaign.status === "draft" && (
            <Button
              variant="primary"
              onClick={handleLaunch}
              disabled={actionLoading}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Launch Campaign
            </Button>
          )}

          {campaign.status === "active" && (
            <Button
              variant="secondary"
              onClick={handlePause}
              disabled={actionLoading}
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause Campaign
            </Button>
          )}

          {campaign.status === "paused" && (
            <Button
              variant="primary"
              onClick={handleLaunch}
              disabled={actionLoading}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Resume Campaign
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && <CampaignStats stats={stats} />}

      {/* Configuration Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Call Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Daily Call Limit</p>
              <p className="text-lg font-semibold">{campaign.dailyLimit} calls</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Attempts per Prospect</p>
              <p className="text-lg font-semibold">{campaign.maxAttempts} attempts</p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Active Days</p>
              <p className="text-lg font-semibold">{activeDayNames}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Windows</p>
              <div className="space-y-1">
                {campaign.timeWindows.map((window, index) => (
                  <p key={index} className="text-lg font-semibold">
                    {window.start} - {window.end}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Script & Voice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Script
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">Script ID</p>
            <p className="text-lg font-semibold mb-4">{campaign.scriptId}</p>
            <Link href={`/scripts/${campaign.scriptId}`}>
              <Button variant="outline" size="sm">
                View Script
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Voice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">Voice ID</p>
            <p className="text-lg font-semibold mb-4">{campaign.voiceId}</p>
            <Link href="/voices">
              <Button variant="outline" size="sm">
                View Voices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Created</span>
            <span className="font-medium">
              {new Date(campaign.createdAt).toLocaleString()}
            </span>
          </div>
          {campaign.launchedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Launched</span>
              <span className="font-medium">
                {new Date(campaign.launchedAt).toLocaleString()}
              </span>
            </div>
          )}
          {campaign.completedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">
                {new Date(campaign.completedAt).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium">
              {new Date(campaign.updatedAt).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

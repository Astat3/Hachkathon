"use client";

import Link from "next/link";
import { Campaign, STATUS_VARIANTS, DAY_NAMES } from "@/types/campaign";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  PauseCircle, 
  Eye, 
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onLaunch?: (id: string) => void;
  onPause?: (id: string) => void;
  isLoading?: boolean;
}

export function CampaignCard({ campaign, onLaunch, onPause, isLoading }: CampaignCardProps) {
  const successRate = campaign.totalCalls > 0 
    ? Math.round((campaign.successfulCalls / campaign.totalCalls) * 100) 
    : 0;

  const activeDayNames = campaign.activeDays
    .sort((a, b) => a - b)
    .map(day => DAY_NAMES[day].slice(0, 3))
    .join(", ");

  const timeWindowsDisplay = campaign.timeWindows
    .map(tw => `${tw.start}-${tw.end}`)
    .join(", ");

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{campaign.name}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[campaign.status]}>
                {campaign.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Total Calls</p>
              <p className="text-lg font-semibold">{campaign.totalCalls}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Success</p>
              <p className="text-lg font-semibold text-green-600">
                {campaign.successfulCalls}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-red-600">
                {campaign.failedCalls}
              </p>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        {campaign.totalCalls > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Success Rate</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{activeDayNames}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{timeWindowsDisplay}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span>Daily Limit: {campaign.dailyLimit} calls</span>
          </div>
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Created: {new Date(campaign.createdAt).toLocaleDateString()}</p>
          {campaign.launchedAt && (
            <p>Launched: {new Date(campaign.launchedAt).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/campaigns/${campaign.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>

        {campaign.status === "draft" && onLaunch && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onLaunch(campaign.id)}
            disabled={isLoading}
            className="flex-1"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Launch
          </Button>
        )}

        {campaign.status === "active" && onPause && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPause(campaign.id)}
            disabled={isLoading}
            className="flex-1"
          >
            <PauseCircle className="h-4 w-4 mr-2" />
            Pause
          </Button>
        )}

        {campaign.status === "paused" && onLaunch && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onLaunch(campaign.id)}
            disabled={isLoading}
            className="flex-1"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

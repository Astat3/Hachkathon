"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Prospect, ProspectStatusType } from "@/types/prospect";
import { Building2, User, Phone, Mail, MapPin, Briefcase } from "lucide-react";

interface ProspectCardProps {
  prospect: Prospect;
  onStatusChange?: (prospectId: string, status: ProspectStatusType) => void;
  onViewDetails?: (prospect: Prospect) => void;
}

const statusConfig: Record<
  ProspectStatusType,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  contacted: { label: "Contacted", variant: "default" },
  interested: { label: "Interested", variant: "success" },
  "not-interested": { label: "Not Interested", variant: "destructive" },
  converted: { label: "Converted", variant: "success" },
};

export function ProspectCard({ prospect, onStatusChange, onViewDetails }: ProspectCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ProspectStatusType) => {
    if (onStatusChange && newStatus !== prospect.status) {
      setIsUpdating(true);
      try {
        await onStatusChange(prospect.id, newStatus);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const statusInfo = statusConfig[prospect.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold text-lg">{prospect.companyName}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-3.5 w-3.5" />
              <span>{prospect.contactName}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{prospect.contactRole}</span>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          <a
            href={`tel:${prospect.phoneNumber}`}
            className="hover:text-blue-600 transition-colors"
          >
            {prospect.phoneNumber}
          </a>
        </div>

        {prospect.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <a
              href={`mailto:${prospect.email}`}
              className="hover:text-blue-600 transition-colors truncate"
            >
              {prospect.email}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="h-3.5 w-3.5 text-gray-400" />
          <span>{prospect.industry}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{prospect.companySize} employees</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span>{prospect.location}</span>
        </div>

        {prospect.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{prospect.notes}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t border-gray-100">
        {prospect.status === "pending" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusChange("contacted")}
              disabled={isUpdating}
              className="flex-1"
            >
              Mark Contacted
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails?.(prospect)}
              className="flex-1"
            >
              View Details
            </Button>
          </>
        )}

        {prospect.status === "contacted" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusChange("interested")}
              disabled={isUpdating}
              className="flex-1"
            >
              Interested
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusChange("not-interested")}
              disabled={isUpdating}
              className="flex-1"
            >
              Not Interested
            </Button>
          </>
        )}

        {prospect.status === "interested" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusChange("converted")}
              disabled={isUpdating}
              className="flex-1"
            >
              Mark Converted
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails?.(prospect)}
              className="flex-1"
            >
              View Details
            </Button>
          </>
        )}

        {(prospect.status === "not-interested" || prospect.status === "converted") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(prospect)}
            className="w-full"
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

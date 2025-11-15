"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Prospect, ProspectStatusType } from "@/types/prospect";
import { ArrowUpDown, Phone, Mail, ExternalLink } from "lucide-react";

interface ProspectTableProps {
  prospects: Prospect[];
  onStatusChange?: (prospectId: string, status: ProspectStatusType) => void;
  onViewDetails?: (prospect: Prospect) => void;
}

type SortField = "companyName" | "contactName" | "industry" | "location" | "status";
type SortOrder = "asc" | "desc";

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

export function ProspectTable({ prospects, onStatusChange, onViewDetails }: ProspectTableProps) {
  const [sortField, setSortField] = useState<SortField>("companyName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
    }
    if (typeof bValue === "string") {
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleStatusChange = async (prospectId: string, newStatus: ProspectStatusType) => {
    if (onStatusChange) {
      setUpdatingId(prospectId);
      try {
        await onStatusChange(prospectId, newStatus);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </button>
  );

  if (prospects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No prospects found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="companyName">Company</SortButton>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="contactName">Contact</SortButton>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact Info
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="industry">Industry</SortButton>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="location">Location</SortButton>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="status">Status</SortButton>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedProspects.map((prospect) => {
            const statusInfo = statusConfig[prospect.status];
            const isUpdating = updatingId === prospect.id;

            return (
              <tr key={prospect.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900">{prospect.companyName}</div>
                    <div className="text-xs text-gray-500">{prospect.companySize} employees</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900">{prospect.contactName}</div>
                    <div className="text-xs text-gray-500">{prospect.contactRole}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <a
                      href={`tel:${prospect.phoneNumber}`}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {prospect.phoneNumber}
                    </a>
                    {prospect.email && (
                      <a
                        href={`mailto:${prospect.email}`}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[200px]"
                      >
                        <Mail className="h-3 w-3" />
                        {prospect.email}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prospect.industry}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prospect.location}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {prospect.status === "pending" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusChange(prospect.id, "contacted")}
                        disabled={isUpdating}
                      >
                        Contact
                      </Button>
                    )}
                    {prospect.status === "contacted" && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStatusChange(prospect.id, "interested")}
                          disabled={isUpdating}
                        >
                          Interested
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(prospect.id, "not-interested")}
                          disabled={isUpdating}
                        >
                          Not Interested
                        </Button>
                      </>
                    )}
                    {prospect.status === "interested" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusChange(prospect.id, "converted")}
                        disabled={isUpdating}
                      >
                        Convert
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails?.(prospect)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

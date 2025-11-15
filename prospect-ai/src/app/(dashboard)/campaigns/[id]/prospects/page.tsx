"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProspectCard } from "@/components/prospects/ProspectCard";
import { ProspectTable } from "@/components/prospects/ProspectTable";
import type { Prospect, ProspectStatusType } from "@/types/prospect";
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Loader2,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ViewMode = "grid" | "table";

export default function CampaignProspectsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatusType | "all">("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [isIdentifying, setIsIdentifying] = useState(false);

  useEffect(() => {
    if (campaignId) {
      fetchProspects();
    }
  }, [campaignId]);

  useEffect(() => {
    applyFilters();
  }, [prospects, searchQuery, statusFilter, industryFilter, locationFilter]);

  const fetchProspects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ campaignId });
      const response = await fetch(`/api/prospects?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch prospects");
      }

      const data = await response.json();
      setProspects(data.prospects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...prospects];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.companyName.toLowerCase().includes(query) ||
          p.contactName.toLowerCase().includes(query) ||
          p.industry.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.phoneNumber.includes(query) ||
          (p.email && p.email.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Apply industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter((p) => p.industry === industryFilter);
    }

    // Apply location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((p) => p.location === locationFilter);
    }

    setFilteredProspects(filtered);
  };

  const handleStatusChange = async (prospectId: string, status: ProspectStatusType) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update prospect");
      }

      // Update local state
      setProspects((prev) =>
        prev.map((p) => (p.id === prospectId ? { ...p, status, updatedAt: new Date() } : p))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update prospect");
    }
  };

  const handleViewDetails = (prospect: Prospect) => {
    // In a full implementation, this would open a modal or navigate to a detail page
    console.log("View details for:", prospect);
    alert(`Viewing details for ${prospect.companyName}\n\nThis would open a detailed view in a full implementation.`);
  };

  const handleIdentifyProspects = async () => {
    try {
      setIsIdentifying(true);

      // Step 1: Identify prospects
      const identifyResponse = await fetch("/api/prospects/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          targetMarket: {
            industries: ["Technology", "Healthcare", "Finance"],
            companySizes: ["11-50", "51-200"],
            locations: ["San Francisco, CA", "New York, NY", "Austin, TX"],
          },
          count: 50,
        }),
      });

      if (!identifyResponse.ok) {
        throw new Error("Failed to identify prospects");
      }

      const identifyData = await identifyResponse.json();

      // Step 2: Save prospects
      const saveResponse = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          prospects: identifyData.data.prospects,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save prospects");
      }

      // Refresh the list
      await fetchProspects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to identify prospects");
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleExport = () => {
    // Export prospects to CSV
    const csv = [
      ["Company", "Contact", "Role", "Phone", "Email", "Industry", "Size", "Location", "Status"],
      ...filteredProspects.map((p) => [
        p.companyName,
        p.contactName,
        p.contactRole,
        p.phoneNumber,
        p.email || "",
        p.industry,
        p.companySize,
        p.location,
        p.status,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospects-${campaignId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique industries and locations for filters
  const industries = Array.from(new Set(prospects.map((p) => p.industry))).sort();
  const locations = Array.from(new Set(prospects.map((p) => p.location))).sort();

  // Calculate stats
  const stats = {
    total: prospects.length,
    pending: prospects.filter((p) => p.status === "pending").length,
    contacted: prospects.filter((p) => p.status === "contacted").length,
    interested: prospects.filter((p) => p.status === "interested").length,
    converted: prospects.filter((p) => p.status === "converted").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Prospects</h1>
          <p className="mt-2 text-gray-600">
            Manage and track prospects for this campaign.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchProspects}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={filteredProspects.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="primary"
            onClick={handleIdentifyProspects}
            disabled={isIdentifying}
          >
            {isIdentifying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Identify Prospects
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Prospects</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Contacted</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.contacted}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Interested</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.interested}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Converted</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{stats.converted}</p>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search prospects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="not-interested">Not Interested</option>
              <option value="converted">Converted</option>
            </select>

            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 border border-gray-300 rounded-md p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded ${
                viewMode === "table"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(statusFilter !== "all" || industryFilter !== "all" || locationFilter !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {statusFilter !== "all" && (
              <Badge variant="secondary">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="ml-1 hover:text-gray-900"
                >
                  ×
                </button>
              </Badge>
            )}
            {industryFilter !== "all" && (
              <Badge variant="secondary">
                Industry: {industryFilter}
                <button
                  onClick={() => setIndustryFilter("all")}
                  className="ml-1 hover:text-gray-900"
                >
                  ×
                </button>
              </Badge>
            )}
            {locationFilter !== "all" && (
              <Badge variant="secondary">
                Location: {locationFilter}
                <button
                  onClick={() => setLocationFilter("all")}
                  className="ml-1 hover:text-gray-900"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
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
          <Button variant="outline" size="sm" onClick={fetchProspects} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && prospects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by identifying prospects for this campaign.
          </p>
          <Button variant="primary" onClick={handleIdentifyProspects} disabled={isIdentifying}>
            {isIdentifying ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            Identify Prospects
          </Button>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && prospects.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredProspects.length} of {prospects.length} prospects
        </div>
      )}

      {/* Prospects Display */}
      {!isLoading && !error && filteredProspects.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <ProspectTable
              prospects={filteredProspects}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && !error && prospects.length > 0 && filteredProspects.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No prospects match your filters</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setIndustryFilter("all");
              setLocationFilter("all");
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { FileText, Calendar, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ScriptCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
  approvedAt?: Date;
  characterCount: number;
}

export function ScriptCard({
  id,
  title,
  content,
  createdAt,
  updatedAt,
  isApproved,
  approvedAt,
  characterCount,
}: ScriptCardProps) {
  // Truncate content for preview
  const previewContent = content.length > 150 
    ? content.substring(0, 150) + "..." 
    : content;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isApproved ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Approved
            </Badge>
          ) : (
            <Badge variant="warning" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Draft
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {previewContent}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(updatedAt)}</span>
          </div>
          <div>
            <span>{characterCount} characters</span>
          </div>
        </div>

        {isApproved && approvedAt && (
          <div className="mt-2 text-xs text-green-600">
            Approved on {formatDate(approvedAt)}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 border-t border-gray-200">
        <Link href={`/scripts/${id}`} className="w-full">
          <Button variant="outline" className="w-full">
            {isApproved ? "View Script" : "Edit & Approve"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

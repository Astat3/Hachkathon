"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Type } from "lucide-react";

interface ScriptPreviewProps {
  title: string;
  content: string;
}

export function ScriptPreview({ title, content }: ScriptPreviewProps) {
  const characterCount = content.length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.ceil(wordCount / 150); // Average reading speed: 150 words per minute

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Script Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script Title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title || "Untitled Script"}</h3>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{characterCount}</div>
            <div className="text-xs text-gray-600 mt-1">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{wordCount}</div>
            <div className="text-xs text-gray-600 mt-1">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{estimatedReadTime}</div>
            <div className="text-xs text-gray-600 mt-1">Min Read</div>
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Content</span>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {content ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No content yet. Start typing to see your script preview.
              </p>
            )}
          </div>
        </div>

        {/* Character Count Warning */}
        {characterCount > 4500 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              Your script is approaching the maximum character limit. Consider shortening it for better readability.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

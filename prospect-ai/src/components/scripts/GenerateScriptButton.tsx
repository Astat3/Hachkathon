"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateScriptButtonProps {
  onGenerate?: () => void;
  disabled?: boolean;
}

export function GenerateScriptButton({
  onGenerate,
  disabled = false,
}: GenerateScriptButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (onGenerate) {
        await onGenerate();
      }
      // In a real implementation, this would call an API to generate a script
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2"
    >
      <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
      {isGenerating ? "Generating..." : "Generate New Script"}
    </Button>
  );
}

'use client';

/**
 * VoiceCard Component
 * Displays a single voice option with details and preview capability
 */

import { Voice } from '@/types/voice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Play, Check } from 'lucide-react';

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: (voiceId: string) => void;
  onPreview?: (voiceId: string) => void;
  disabled?: boolean;
}

export function VoiceCard({
  voice,
  isSelected = false,
  isPlaying = false,
  onSelect,
  onPreview,
  disabled = false,
}: VoiceCardProps) {
  const gender = voice.labels?.gender || 'Unknown';
  const accent = voice.labels?.accent;
  const age = voice.labels?.age;
  const useCase = voice.labels?.use_case;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md cursor-pointer',
        isSelected && 'ring-2 ring-blue-600 border-blue-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && onSelect?.(voice.voice_id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {voice.name}
              {isSelected && (
                <Check className="h-5 w-5 text-blue-600" />
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {voice.description || `${gender} voice`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Voice attributes */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {gender}
          </Badge>
          {accent && (
            <Badge variant="outline" className="text-xs">
              {accent}
            </Badge>
          )}
          {age && (
            <Badge variant="outline" className="text-xs">
              {age}
            </Badge>
          )}
          {useCase && (
            <Badge variant="outline" className="text-xs">
              {useCase}
            </Badge>
          )}
        </div>

        {/* Preview button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              onPreview?.(voice.voice_id);
            }
          }}
          disabled={disabled || isPlaying}
        >
          <Play className={cn('h-4 w-4', isPlaying && 'animate-pulse')} />
          {isPlaying ? 'Playing...' : 'Preview Voice'}
        </Button>
      </CardContent>
    </Card>
  );
}

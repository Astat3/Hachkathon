'use client';

/**
 * Voices Page
 * Voice selection interface for campaigns
 */

import { useEffect, useState } from 'react';
import { Voice } from '@/types/voice';
import { VoiceCard } from '@/components/voice-selector/VoiceCard';
import { VoicePreview } from '@/components/voice-selector/VoicePreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectOption } from '@/components/ui/select';
import { Loader2, Search, Mic2 } from 'lucide-react';

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [accentFilter, setAccentFilter] = useState<string>('all');

  // Fetch voices on mount
  useEffect(() => {
    fetchVoices();
  }, []);

  // Filter voices when search or filters change
  useEffect(() => {
    filterVoices();
  }, [voices, searchQuery, genderFilter, accentFilter]);

  const fetchVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/voices');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch voices');
      }

      setVoices(data.voices || []);
    } catch (err) {
      console.error('Error fetching voices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load voices');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVoices = () => {
    let filtered = [...voices];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (voice) =>
          voice.name.toLowerCase().includes(query) ||
          voice.description?.toLowerCase().includes(query)
      );
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(
        (voice) => voice.labels?.gender?.toLowerCase() === genderFilter.toLowerCase()
      );
    }

    // Accent filter
    if (accentFilter !== 'all') {
      filtered = filtered.filter(
        (voice) => voice.labels?.accent?.toLowerCase() === accentFilter.toLowerCase()
      );
    }

    setFilteredVoices(filtered);
  };

  const handlePreview = async (voiceId: string) => {
    try {
      setIsGeneratingPreview(true);
      setPreviewError(null);
      setPreviewVoiceId(voiceId);
      setPreviewAudio(null);

      const response = await fetch('/api/voices/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_id: voiceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate preview');
      }

      setPreviewAudio(data.audio);
    } catch (err) {
      console.error('Error generating preview:', err);
      setPreviewError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
  };

  const handleSaveSelection = () => {
    if (selectedVoiceId) {
      // TODO: Save voice selection to campaign or user preferences
      alert(`Voice selected: ${selectedVoiceId}`);
    }
  };

  // Get unique genders and accents for filters
  const genders = Array.from(
    new Set(voices.map((v) => v.labels?.gender).filter(Boolean))
  );
  const accents = Array.from(
    new Set(voices.map((v) => v.labels?.accent).filter(Boolean))
  );

  const selectedVoice = voices.find((v) => v.voice_id === previewVoiceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Mic2 className="h-8 w-8 text-blue-600" />
          Voice Selection
        </h1>
        <p className="mt-2 text-gray-600">
          Choose the perfect voice for your AI calling campaigns
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search voices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Gender filter */}
          <Select 
            value={genderFilter} 
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <SelectOption value="all">All Genders</SelectOption>
            {genders.map((gender) => (
              <SelectOption key={gender} value={gender!.toLowerCase()}>
                {gender}
              </SelectOption>
            ))}
          </Select>

          {/* Accent filter */}
          <Select 
            value={accentFilter} 
            onChange={(e) => setAccentFilter(e.target.value)}
          >
            <SelectOption value="all">All Accents</SelectOption>
            {accents.map((accent) => (
              <SelectOption key={accent} value={accent!.toLowerCase()}>
                {accent}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredVoices.length} of {voices.length} voices
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading voices...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error loading voices</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button
            variant="outline"
            onClick={fetchVoices}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Voice grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVoices.map((voice) => (
              <VoiceCard
                key={voice.voice_id}
                voice={voice}
                isSelected={selectedVoiceId === voice.voice_id}
                isPlaying={previewVoiceId === voice.voice_id && isGeneratingPreview}
                onSelect={handleSelectVoice}
                onPreview={handlePreview}
              />
            ))}
          </div>

          {/* No results */}
          {filteredVoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No voices found matching your filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setGenderFilter('all');
                  setAccentFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Preview player */}
      {(previewAudio || isGeneratingPreview || previewError) && (
        <VoicePreview
          audioBase64={previewAudio || undefined}
          isLoading={isGeneratingPreview}
          error={previewError || undefined}
          voiceName={selectedVoice?.name}
          onClose={() => {
            setPreviewAudio(null);
            setPreviewError(null);
            setPreviewVoiceId(null);
          }}
        />
      )}

      {/* Save button */}
      {selectedVoiceId && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">Voice Selected</p>
              <p className="text-gray-600">
                {voices.find((v) => v.voice_id === selectedVoiceId)?.name}
              </p>
            </div>
            <Button onClick={handleSaveSelection} variant="primary">
              Save Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

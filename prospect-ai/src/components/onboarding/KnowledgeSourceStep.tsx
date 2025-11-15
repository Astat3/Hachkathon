'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Link as LinkIcon, MessageSquare, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractTextFromPDF, isPDF, isValidPDFSize } from '@/lib/pdf-extractor';
import { scrapeURL, isValidURL, normalizeURL } from '@/lib/url-scraper';

const knowledgeSourceSchema = z.object({
  knowledgeSource: z.string().min(10, 'Knowledge source must be at least 10 characters'),
  knowledgeType: z.enum(['pdf', 'url', 'text']),
});

export type KnowledgeSourceFormData = z.infer<typeof knowledgeSourceSchema>;

interface KnowledgeSourceStepProps {
  defaultValues?: Partial<KnowledgeSourceFormData>;
  onNext: (data: KnowledgeSourceFormData) => void;
  onBack: () => void;
}

type TabType = 'pdf' | 'url' | 'text';

export function KnowledgeSourceStep({ defaultValues, onNext, onBack }: KnowledgeSourceStepProps) {
  const [activeTab, setActiveTab] = useState<TabType>(
    (defaultValues?.knowledgeType as TabType) || 'pdf'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<KnowledgeSourceFormData>({
    resolver: zodResolver(knowledgeSourceSchema),
    defaultValues: {
      knowledgeSource: defaultValues?.knowledgeSource || '',
      knowledgeType: defaultValues?.knowledgeType || 'pdf',
    },
  });

  const knowledgeSource = watch('knowledgeSource');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isPDF(file)) {
      alert('Please upload a PDF file');
      return;
    }

    // Validate file size
    if (!isValidPDFSize(file)) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Extracting text from PDF...');

    try {
      const result = await extractTextFromPDF(file);
      setValue('knowledgeSource', result.text);
      setValue('knowledgeType', 'pdf');
      setProcessingMessage(`Successfully extracted ${result.numPages} pages`);
      setTimeout(() => setProcessingMessage(''), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleURLScrape = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a URL');
      return;
    }

    const normalizedURL = normalizeURL(urlInput.trim());
    
    if (!isValidURL(normalizedURL)) {
      alert('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Scraping content from URL...');

    try {
      const result = await scrapeURL(normalizedURL);
      setValue('knowledgeSource', result.text);
      setValue('knowledgeType', 'url');
      setProcessingMessage(`Successfully scraped: ${result.title || 'Content'}`);
      setTimeout(() => setProcessingMessage(''), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to scrape URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: KnowledgeSourceFormData) => {
    onNext(data);
  };

  const tabs = [
    { id: 'pdf' as TabType, label: 'PDF Upload', icon: FileText },
    { id: 'url' as TabType, label: 'URL', icon: LinkIcon },
    { id: 'text' as TabType, label: 'Text', icon: MessageSquare },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Source</h2>
          <p className="text-sm text-gray-600">Provide information about your company</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setValue('knowledgeType', tab.id);
                }}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'pdf' && (
          <div>
            <Label htmlFor="pdf-upload">Upload PDF Document</Label>
            <div className="mt-2">
              <label
                htmlFor="pdf-upload"
                className={cn(
                  'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                  isProcessing
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  )}
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div>
            <Label htmlFor="url-input">Website URL</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="url-input"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                disabled={isProcessing}
              />
              <Button
                type="button"
                onClick={handleURLScrape}
                disabled={isProcessing || !urlInput.trim()}
                variant="outline"
                className="whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Scraping...
                  </>
                ) : (
                  'Scrape URL'
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter a URL to automatically extract content from the website
            </p>
          </div>
        )}

        {activeTab === 'text' && (
          <div>
            <Label htmlFor="text-input">Enter Text</Label>
            <Controller
              name="knowledgeSource"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="text-input"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setValue('knowledgeType', 'text');
                  }}
                  placeholder="Paste or type information about your company, products, services, value proposition, etc..."
                  rows={10}
                  className="mt-2"
                  error={!!errors.knowledgeSource}
                  errorMessage={errors.knowledgeSource?.message}
                />
              )}
            />
          </div>
        )}

        {/* Processing Message */}
        {processingMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">{processingMessage}</p>
          </div>
        )}

        {/* Preview */}
        {knowledgeSource && knowledgeSource.length > 0 && (
          <div>
            <Label>Content Preview</Label>
            <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {knowledgeSource.substring(0, 500)}
                {knowledgeSource.length > 500 && '...'}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {knowledgeSource.length} characters
              </p>
            </div>
          </div>
        )}

        {errors.knowledgeSource && (
          <p className="text-sm text-red-600">{errors.knowledgeSource.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isProcessing || !knowledgeSource}
        >
          {isSubmitting ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
}

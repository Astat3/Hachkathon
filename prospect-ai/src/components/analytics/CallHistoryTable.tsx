'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { CallData, formatDuration } from '@/lib/analytics/calculator';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface CallHistoryTableProps {
  calls: CallData[];
  isLoading?: boolean;
}

const outcomeColors: Record<CallData['outcome'], string> = {
  answered: 'success',
  voicemail: 'secondary',
  busy: 'warning',
  'no-answer': 'warning',
  failed: 'destructive',
};

const outcomeLabels: Record<CallData['outcome'], string> = {
  answered: 'Answered',
  voicemail: 'Voicemail',
  busy: 'Busy',
  'no-answer': 'No Answer',
  failed: 'Failed',
};

export function CallHistoryTable({ calls, isLoading = false }: CallHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');

  const columns = useMemo<ColumnDef<CallData>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 font-medium"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Date & Time
              <ArrowUpDown className="h-4 w-4" />
            </button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.timestamp);
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {date.toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-500">
                {date.toLocaleTimeString()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'campaignName',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 font-medium"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Campaign
              <ArrowUpDown className="h-4 w-4" />
            </button>
          );
        },
        cell: ({ row }) => (
          <span className="font-medium">{row.original.campaignName}</span>
        ),
      },
      {
        accessorKey: 'prospectName',
        header: 'Prospect',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.prospectName}</span>
            <span className="text-xs text-gray-500">
              {row.original.prospectPhone}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'outcome',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 font-medium"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Outcome
              <ArrowUpDown className="h-4 w-4" />
            </button>
          );
        },
        cell: ({ row }) => (
          <Badge variant={outcomeColors[row.original.outcome] as any}>
            {outcomeLabels[row.original.outcome]}
          </Badge>
        ),
      },
      {
        accessorKey: 'duration',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 font-medium"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Duration
              <ArrowUpDown className="h-4 w-4" />
            </button>
          );
        },
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatDuration(row.original.duration)}
          </span>
        ),
      },
      {
        accessorKey: 'converted',
        header: 'Converted',
        cell: ({ row }) => (
          <Badge variant={row.original.converted ? 'success' : 'secondary'}>
            {row.original.converted ? 'Yes' : 'No'}
          </Badge>
        ),
      },
    ],
    []
  );

  const filteredCalls = useMemo(() => {
    if (outcomeFilter === 'all') return calls;
    return calls.filter(call => call.outcome === outcomeFilter);
  }, [calls, outcomeFilter]);

  const table = useReactTable({
    data: filteredCalls,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading call history...</span>
        </div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="text-center">
          <p className="text-gray-600">No calls found</p>
          <p className="mt-1 text-sm text-gray-500">
            Start making calls to see your history here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="outcome-filter" className="text-sm font-medium text-gray-700">
            Filter by outcome:
          </label>
          <Select
            id="outcome-filter"
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="voicemail">Voicemail</option>
            <option value="busy">Busy</option>
            <option value="no-answer">No Answer</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          {filteredCalls.length} {filteredCalls.length === 1 ? 'call' : 'calls'}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

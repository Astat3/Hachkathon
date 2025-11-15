import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createCompanySchema = z.object({
  name: z.string().min(2),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  targetIndustries: z.array(z.string()),
  targetCompanySize: z.array(z.string()),
  targetLocations: z.array(z.string()),
  targetRoles: z.array(z.string()),
  targetCriteria: z.string().optional(),
  knowledgeSource: z.string(),
  knowledgeType: z.enum(['pdf', 'url', 'text']),
});

/**
 * POST /api/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Create company in database
    const company = await prisma.company.create({
      data: {
        userId: session.user.email || '', // Using email as userId for now
        name: validatedData.name,
        industry: validatedData.industry,
        size: validatedData.size,
        website: validatedData.website || null,
        description: validatedData.description,
        targetIndustries: validatedData.targetIndustries,
        targetCompanySize: validatedData.targetCompanySize,
        targetLocations: validatedData.targetLocations,
        targetRoles: validatedData.targetRoles,
        targetCriteria: validatedData.targetCriteria,
        knowledgeSource: validatedData.knowledgeSource,
        knowledgeType: validatedData.knowledgeType,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        company,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating company:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create company',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/companies
 * Get all companies for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all companies for the user
    const companies = await prisma.company.findMany({
      where: {
        userId: session.user.email || '',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch companies',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

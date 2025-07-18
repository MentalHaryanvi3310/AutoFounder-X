import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserFromToken, extractTokenFromHeader } from '@/lib/auth';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mvpSchema = z.object({
  projectId: z.number().int('Project ID must be an integer'),
});

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Validate input
    const body = await request.json();
    const validationResult = mvpSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { projectId } = validationResult.data;

    // Get project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.userId,
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    if (!project.idea) {
      return NextResponse.json(
        { error: 'Project must have an idea to generate MVP plan' },
        { status: 400 }
      );
    }

    // Generate MVP plan using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an experienced product manager and startup consultant. Create detailed, actionable MVP development plans that are realistic and achievable within 3-6 months."
        },
        {
          role: "user",
          content: `Create a comprehensive step-by-step MVP development plan for this startup idea: ${project.idea}. Include: 1) Core features for MVP, 2) Technical requirements, 3) Development phases with timelines, 4) Resource needs, 5) Testing strategy, 6) Launch checklist. Format as a clear, actionable plan.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const mvpPlan = completion.choices[0]?.message?.content || 'Failed to generate MVP plan';

    // Update project with MVP plan
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        mvpPlan,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'MVP plan generated successfully',
      project: {
        id: updatedProject.id,
        title: updatedProject.title,
        idea: updatedProject.idea,
        mvpPlan: updatedProject.mvpPlan,
        updatedAt: updatedProject.updatedAt,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('MVP plan generation error:', error);
    
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserFromToken, extractTokenFromHeader } from '@/lib/auth';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ideaSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(100, 'Topic too long'),
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
    const validationResult = ideaSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { topic } = validationResult.data;

    // Generate startup idea using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert startup consultant. Generate unique, innovative, and practical startup ideas based on the given topic. Focus on solving real problems with clear value propositions."
        },
        {
          role: "user",
          content: `Generate a unique startup idea based on the theme: ${topic}. Include: 1) Problem statement, 2) Solution description, 3) Target market, 4) Revenue model, 5) Key features. Keep it concise but comprehensive.`
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    const ideaText = completion.choices[0]?.message?.content || 'Failed to generate idea';

    // Create project in database
    const project = await prisma.project.create({
      data: {
        title: `AI Generated: ${topic}`,
        description: `Startup idea generated for: ${topic}`,
        idea: ideaText,
        userId: user.userId,
        status: 'active',
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
      message: 'Idea generated successfully',
      project: {
        id: project.id,
        title: project.title,
        idea: project.idea,
        createdAt: project.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('AI Idea generation error:', error);
    
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

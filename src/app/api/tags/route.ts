import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - List all tags
export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

// POST - Create new tag
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
        }

        const tag = await prisma.tag.create({
            data: {
                name: body.name.trim(),
                color: body.color || '#6366f1',
            },
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Tag already exists' }, { status: 400 });
        }
        console.error('Failed to create tag:', error);
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}

// DELETE - Delete a tag
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
        }

        await prisma.tag.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete tag:', error);
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
    }
}

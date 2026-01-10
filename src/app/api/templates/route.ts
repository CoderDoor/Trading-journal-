import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - List all templates
export async function GET() {
    try {
        const templates = await prisma.tradeTemplate.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Failed to fetch templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// POST - Create new template
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
        }

        const template = await prisma.tradeTemplate.create({
            data: {
                name: body.name.trim(),
                description: body.description || null,
                instrument: body.instrument || null,
                tradeType: body.tradeType || null,
                timeframe: body.timeframe || null,
                strategyLogic: body.strategyLogic || null,
                htfBiasAligned: Boolean(body.htfBiasAligned),
                liquidityTaken: Boolean(body.liquidityTaken),
                entryAtPOI: Boolean(body.entryAtPOI),
                riskManaged: Boolean(body.riskManaged),
                bosConfirmed: Boolean(body.bosConfirmed),
                mssConfirmed: Boolean(body.mssConfirmed),
                chochConfirmed: Boolean(body.chochConfirmed),
                orderBlockEntry: Boolean(body.orderBlockEntry),
                fvgEntry: Boolean(body.fvgEntry),
                killZoneEntry: Boolean(body.killZoneEntry),
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Failed to create template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}

// PUT - Update template
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        const template = await prisma.tradeTemplate.update({
            where: { id: body.id },
            data: {
                name: body.name?.trim(),
                description: body.description,
                instrument: body.instrument,
                tradeType: body.tradeType,
                timeframe: body.timeframe,
                strategyLogic: body.strategyLogic,
                htfBiasAligned: body.htfBiasAligned !== undefined ? Boolean(body.htfBiasAligned) : undefined,
                liquidityTaken: body.liquidityTaken !== undefined ? Boolean(body.liquidityTaken) : undefined,
                entryAtPOI: body.entryAtPOI !== undefined ? Boolean(body.entryAtPOI) : undefined,
                riskManaged: body.riskManaged !== undefined ? Boolean(body.riskManaged) : undefined,
                bosConfirmed: body.bosConfirmed !== undefined ? Boolean(body.bosConfirmed) : undefined,
                mssConfirmed: body.mssConfirmed !== undefined ? Boolean(body.mssConfirmed) : undefined,
                chochConfirmed: body.chochConfirmed !== undefined ? Boolean(body.chochConfirmed) : undefined,
                orderBlockEntry: body.orderBlockEntry !== undefined ? Boolean(body.orderBlockEntry) : undefined,
                fvgEntry: body.fvgEntry !== undefined ? Boolean(body.fvgEntry) : undefined,
                killZoneEntry: body.killZoneEntry !== undefined ? Boolean(body.killZoneEntry) : undefined,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Failed to update template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        await prisma.tradeTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all accounts
export async function GET() {
    try {
        const accounts = await prisma.tradingAccount.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ accounts });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}

// POST create new account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, broker, accountType, accountSize, currency, status, notes } = body;

        if (!name || !accountType) {
            return NextResponse.json({ error: 'Name and account type are required' }, { status: 400 });
        }

        const account = await prisma.tradingAccount.create({
            data: {
                name,
                broker: broker || null,
                accountType,
                accountSize: accountSize ? parseFloat(accountSize) : null,
                currency: currency || 'USD',
                status: status || 'ACTIVE',
                notes: notes || null,
            }
        });

        return NextResponse.json({ account });
    } catch (error) {
        console.error('Error creating account:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}

// PUT update account
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }

        const account = await prisma.tradingAccount.update({
            where: { id },
            data: {
                ...data,
                accountSize: data.accountSize ? parseFloat(data.accountSize) : null,
            }
        });

        return NextResponse.json({ account });
    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
    }
}

// DELETE account
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }

        await prisma.tradingAccount.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}

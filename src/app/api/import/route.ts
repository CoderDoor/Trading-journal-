import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface MT4Trade {
    ticket: string;
    openTime: Date;
    closeTime: Date;
    type: 'buy' | 'sell';
    lots: number;
    symbol: string;
    openPrice: number;
    closePrice: number;
    stopLoss: number;
    takeProfit: number;
    profit: number;
    commission: number;
    swap: number;
}

// POST - Import trades from MT4/MT5 exported file (CSV/HTML)
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const format = formData.get('format') as string || 'csv'; // csv, mt4html, mt5html

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const content = await file.text();
        let trades: MT4Trade[] = [];

        // Parse based on format
        switch (format) {
            case 'csv':
                trades = parseCSV(content);
                break;
            case 'mt4html':
                trades = parseMT4HTML(content);
                break;
            case 'mt5html':
                trades = parseMT5HTML(content);
                break;
            default:
                return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
        }

        if (trades.length === 0) {
            return NextResponse.json({ error: 'No trades found in file' }, { status: 400 });
        }

        // Convert trades to journal entries
        const createdEntries = [];
        for (const trade of trades) {
            const entry = await prisma.journalEntry.create({
                data: {
                    instrument: trade.symbol,
                    tradeType: trade.type.toUpperCase(),
                    entryPrice: trade.openPrice,
                    stopLoss: trade.stopLoss || null,
                    target: trade.takeProfit || null,
                    outcome: trade.profit > 0 ? 'WIN' : trade.profit < 0 ? 'LOSS' : 'BE',
                    riskReward: trade.takeProfit && trade.stopLoss && trade.openPrice
                        ? Math.abs((trade.takeProfit - trade.openPrice) / (trade.openPrice - trade.stopLoss))
                        : null,
                    tradeReason: `Imported from MT4/MT5 - Ticket #${trade.ticket}`,
                    strategyLogic: 'Imported Trade',
                    rawTranscript: `Imported: ${trade.type.toUpperCase()} ${trade.lots} lots ${trade.symbol} @ ${trade.openPrice}, Closed @ ${trade.closePrice}, P&L: ${trade.profit}`,
                    createdAt: trade.closeTime || trade.openTime,
                },
            });
            createdEntries.push(entry);
        }

        return NextResponse.json({
            success: true,
            imported: createdEntries.length,
            trades: createdEntries,
        });
    } catch (error: any) {
        console.error('Failed to import trades:', error);
        return NextResponse.json({ error: `Import failed: ${error.message}` }, { status: 500 });
    }
}

// Parse generic CSV format
function parseCSV(content: string): MT4Trade[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const trades: MT4Trade[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length < 5) continue;

        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        // Try to map common column names
        const trade: MT4Trade = {
            ticket: row['ticket'] || row['order'] || row['id'] || String(i),
            openTime: new Date(row['open time'] || row['opentime'] || row['time'] || Date.now()),
            closeTime: new Date(row['close time'] || row['closetime'] || row['time'] || Date.now()),
            type: (row['type'] || row['side'] || '').toLowerCase().includes('sell') ? 'sell' : 'buy',
            lots: parseFloat(row['lots'] || row['volume'] || row['size'] || '0.01'),
            symbol: row['symbol'] || row['instrument'] || row['pair'] || 'UNKNOWN',
            openPrice: parseFloat(row['open price'] || row['openprice'] || row['entry'] || '0'),
            closePrice: parseFloat(row['close price'] || row['closeprice'] || row['exit'] || '0'),
            stopLoss: parseFloat(row['sl'] || row['stop loss'] || row['stoploss'] || '0'),
            takeProfit: parseFloat(row['tp'] || row['take profit'] || row['takeprofit'] || '0'),
            profit: parseFloat(row['profit'] || row['pnl'] || row['p&l'] || '0'),
            commission: parseFloat(row['commission'] || '0'),
            swap: parseFloat(row['swap'] || '0'),
        };

        if (trade.symbol && trade.symbol !== 'UNKNOWN') {
            trades.push(trade);
        }
    }

    return trades;
}

// Parse MT4 Statement HTML
function parseMT4HTML(content: string): MT4Trade[] {
    const trades: MT4Trade[] = [];

    // MT4 exports trades in HTML tables
    // Look for "Closed Transactions" section
    const closedMatch = content.match(/Closed Transactions[\s\S]*?<\/table>/i);
    if (!closedMatch) return trades;

    // Extract table rows
    const rowMatches = Array.from(closedMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));

    for (const match of rowMatches) {
        const row = match[1];
        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m =>
            m[1].replace(/<[^>]+>/g, '').trim()
        );

        // MT4 typical columns: Ticket, Open Time, Type, Size, Item, Price, S/L, T/P, Close Time, Price, Commission, Taxes, Swap, Profit
        if (cells.length >= 14 && !isNaN(parseInt(cells[0]))) {
            const type = cells[2].toLowerCase();
            if (type === 'buy' || type === 'sell') {
                trades.push({
                    ticket: cells[0],
                    openTime: new Date(cells[1]),
                    type: type as 'buy' | 'sell',
                    lots: parseFloat(cells[3]) || 0.01,
                    symbol: cells[4],
                    openPrice: parseFloat(cells[5]) || 0,
                    stopLoss: parseFloat(cells[6]) || 0,
                    takeProfit: parseFloat(cells[7]) || 0,
                    closeTime: new Date(cells[8]),
                    closePrice: parseFloat(cells[9]) || 0,
                    commission: parseFloat(cells[10]) || 0,
                    swap: parseFloat(cells[12]) || 0,
                    profit: parseFloat(cells[13]) || 0,
                });
            }
        }
    }

    return trades;
}

// Parse MT5 Statement HTML (similar structure with slight differences)
function parseMT5HTML(content: string): MT4Trade[] {
    const trades: MT4Trade[] = [];

    // MT5 uses similar table structure
    const dealsMatch = content.match(/Deals[\s\S]*?<\/table>/i);
    if (!dealsMatch) return parseMT4HTML(content); // Fall back to MT4 parser

    const rowMatches = Array.from(dealsMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));

    for (const match of rowMatches) {
        const row = match[1];
        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(m =>
            m[1].replace(/<[^>]+>/g, '').trim()
        );

        // MT5 columns may vary, try to detect structure
        if (cells.length >= 10 && !isNaN(parseInt(cells[0]))) {
            const direction = cells.find(c => c.toLowerCase() === 'buy' || c.toLowerCase() === 'sell');
            if (direction) {
                const priceIdx = cells.findIndex(c => !isNaN(parseFloat(c)) && parseFloat(c) > 0);
                trades.push({
                    ticket: cells[0],
                    openTime: new Date(cells[1] || Date.now()),
                    closeTime: new Date(cells[1] || Date.now()),
                    type: direction.toLowerCase() as 'buy' | 'sell',
                    lots: parseFloat(cells.find(c => parseFloat(c) > 0 && parseFloat(c) < 100) || '0.01'),
                    symbol: cells.find(c => /^[A-Z]{6,}$/i.test(c)) || 'UNKNOWN',
                    openPrice: parseFloat(cells[priceIdx] || '0'),
                    closePrice: parseFloat(cells[priceIdx + 1] || cells[priceIdx] || '0'),
                    stopLoss: 0,
                    takeProfit: 0,
                    profit: parseFloat(cells[cells.length - 1] || '0'),
                    commission: 0,
                    swap: 0,
                });
            }
        }
    }

    return trades;
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

export async function POST(request: NextRequest) {
    console.log('🔍 AI Analyze API called');

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('❌ No GEMINI_API_KEY');
            return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });
        }

        // Get trades
        const entries = await prisma.journalEntry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const wins = entries.filter(e => e.outcome === 'WIN').length;
        const losses = entries.filter(e => e.outcome === 'LOSS').length;
        const total = wins + losses;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        if (entries.length < 3) {
            return NextResponse.json({
                patterns: ['Add more trades for pattern detection'],
                strengths: ['Starting your trading journey!'],
                weaknesses: [],
                suggestions: ['Keep journaling consistently'],
                riskScore: 5,
                summary: 'Need more data',
                totalTrades: entries.length,
                winRate
            });
        }

        // Simple stats for prompt
        const instruments = Array.from(new Set(entries.map(e => e.instrument).filter(Boolean)));
        const emotions = Array.from(new Set(entries.map(e => e.emotionState).filter(Boolean)));

        const prompt = `Analyze this trading data and respond with ONLY a JSON object (no markdown, no explanation):

Stats: ${entries.length} trades, ${wins} wins, ${losses} losses, ${winRate}% win rate
Pairs: ${instruments.join(', ')}
Emotions: ${emotions.join(', ')}

Return ONLY this JSON format:
{"patterns":["pattern1","pattern2"],"strengths":["strength1","strength2"],"weaknesses":["weakness1"],"suggestions":["suggestion1","suggestion2"],"riskScore":7,"summary":"Brief summary"}`;

        console.log('📤 Calling Gemini...');
        const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1500,
                }
            })
        });

        if (!response.ok) {
            console.error('❌ Gemini error:', await response.text());
            return NextResponse.json({
                patterns: ['AI service error'],
                strengths: [`Win rate: ${winRate}%`],
                weaknesses: [],
                suggestions: ['Try again'],
                riskScore: 5,
                summary: 'AI unavailable',
                totalTrades: entries.length,
                winRate
            });
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('📥 Response:', aiText);

        // Try to parse JSON
        try {
            // Clean the response
            let cleaned = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleaned);
            console.log('✅ Parsed!');
            return NextResponse.json({
                ...json,
                totalTrades: entries.length,
                winRate,
                generatedAt: new Date().toISOString()
            });
        } catch (e) {
            console.error('❌ Parse failed, trying regex');
            // Try regex
            const match = aiText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
            if (match) {
                try {
                    const json = JSON.parse(match[0]);
                    return NextResponse.json({
                        ...json,
                        totalTrades: entries.length,
                        winRate,
                        generatedAt: new Date().toISOString()
                    });
                } catch { }
            }
        }

        // Fallback
        return NextResponse.json({
            patterns: ['Pattern detection in progress'],
            strengths: [`${winRate}% win rate with ${entries.length} trades`],
            weaknesses: winRate < 50 ? ['Win rate below 50%'] : [],
            suggestions: ['Continue building your journal'],
            riskScore: winRate >= 50 ? 7 : 4,
            summary: `${wins} wins, ${losses} losses`,
            totalTrades: entries.length,
            winRate,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}

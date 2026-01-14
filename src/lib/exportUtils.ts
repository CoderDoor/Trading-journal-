'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface TradeEntry {
    id: string;
    instrument?: string | null;
    tradeType?: string | null;
    timeframe?: string | null;
    entryPrice?: number | null;
    stopLoss?: number | null;
    target?: number | null;
    riskReward?: number | null;
    outcome?: string | null;
    tradeReason?: string | null;
    strategyLogic?: string | null;
    emotionState?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// Export trades to PDF
export const exportToPDF = (trades: TradeEntry[], filename: string = 'trade-history') => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // Purple
    doc.text('TrackEdge - Trade Report', 14, 22);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Summary Stats
    const wins = trades.filter(t => t.outcome === 'WIN').length;
    const losses = trades.filter(t => t.outcome === 'LOSS').length;
    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Trades: ${trades.length}`, 14, 40);
    doc.text(`Wins: ${wins} | Losses: ${losses} | Win Rate: ${winRate}%`, 14, 48);

    // Trades Table
    const tableData = trades.map(trade => [
        new Date(trade.createdAt).toLocaleDateString(),
        trade.instrument || '-',
        trade.tradeType || '-',
        trade.timeframe || '-',
        trade.entryPrice?.toFixed(5) || '-',
        trade.riskReward?.toFixed(2) || '-',
        trade.outcome || 'RUNNING',
        trade.emotionState || '-'
    ]);

    autoTable(doc, {
        startY: 55,
        head: [['Date', 'Pair', 'Type', 'TF', 'Entry', 'R:R', 'Outcome', 'Emotion']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [139, 92, 246],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        styles: { fontSize: 8, cellPadding: 2 }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} | TrackEdge Trading Journal`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    doc.save(`${filename}.pdf`);
};

// Export trades to Excel
export const exportToExcel = (trades: TradeEntry[], filename: string = 'trade-history') => {
    // Prepare data
    const data = trades.map(trade => ({
        'Date': new Date(trade.createdAt).toLocaleString(),
        'Instrument': trade.instrument || '',
        'Trade Type': trade.tradeType || '',
        'Timeframe': trade.timeframe || '',
        'Entry Price': trade.entryPrice || '',
        'Stop Loss': trade.stopLoss || '',
        'Target': trade.target || '',
        'Risk:Reward': trade.riskReward || '',
        'Outcome': trade.outcome || 'RUNNING',
        'Trade Reason': trade.tradeReason || '',
        'Strategy': trade.strategyLogic || '',
        'Emotion': trade.emotionState || '',
        'Updated': new Date(trade.updatedAt).toLocaleString()
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');

    // Auto-size columns
    const colWidths = [
        { wch: 18 }, // Date
        { wch: 12 }, // Instrument
        { wch: 8 },  // Trade Type
        { wch: 10 }, // Timeframe
        { wch: 12 }, // Entry
        { wch: 12 }, // SL
        { wch: 12 }, // Target
        { wch: 10 }, // R:R
        { wch: 10 }, // Outcome
        { wch: 30 }, // Reason
        { wch: 30 }, // Strategy
        { wch: 12 }, // Emotion
        { wch: 18 }, // Updated
    ];
    ws['!cols'] = colWidths;

    // Add summary sheet
    const wins = trades.filter(t => t.outcome === 'WIN').length;
    const losses = trades.filter(t => t.outcome === 'LOSS').length;
    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';

    const summaryData = [
        { 'Metric': 'Total Trades', 'Value': trades.length },
        { 'Metric': 'Wins', 'Value': wins },
        { 'Metric': 'Losses', 'Value': losses },
        { 'Metric': 'Win Rate', 'Value': `${winRate}%` },
        { 'Metric': 'Report Generated', 'Value': new Date().toLocaleString() }
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
};

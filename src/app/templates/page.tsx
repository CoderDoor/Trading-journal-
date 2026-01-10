'use client';

import { useState, useEffect } from 'react';

interface TradeTemplate {
    id: string;
    name: string;
    description: string | null;
    instrument: string | null;
    tradeType: string | null;
    timeframe: string | null;
    strategyLogic: string | null;
    htfBiasAligned: boolean;
    liquidityTaken: boolean;
    entryAtPOI: boolean;
    riskManaged: boolean;
    bosConfirmed: boolean;
    mssConfirmed: boolean;
    chochConfirmed: boolean;
    orderBlockEntry: boolean;
    fvgEntry: boolean;
    killZoneEntry: boolean;
    createdAt: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<TradeTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TradeTemplate | null>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', instrument: '', tradeType: '', timeframe: '', strategyLogic: '',
        htfBiasAligned: false, liquidityTaken: false, entryAtPOI: false, riskManaged: false,
        bosConfirmed: false, mssConfirmed: false, chochConfirmed: false, orderBlockEntry: false, fvgEntry: false, killZoneEntry: false,
    });

    useEffect(() => { fetchTemplates(); }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/templates');
            if (response.ok) setTemplates(await response.json());
        } catch (error) { console.error('Failed to fetch templates:', error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingTemplate ? 'PUT' : 'POST';
            const body = editingTemplate ? { ...formData, id: editingTemplate.id } : formData;
            const response = await fetch('/api/templates', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (response.ok) {
                await fetchTemplates();
                resetForm();
            }
        } catch (error) { console.error('Failed to save template:', error); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        try {
            const response = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
            if (response.ok) setTemplates(templates.filter(t => t.id !== id));
        } catch (error) { console.error('Failed to delete template:', error); }
    };

    const handleEdit = (template: TradeTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name, description: template.description || '', instrument: template.instrument || '',
            tradeType: template.tradeType || '', timeframe: template.timeframe || '', strategyLogic: template.strategyLogic || '',
            htfBiasAligned: template.htfBiasAligned, liquidityTaken: template.liquidityTaken,
            entryAtPOI: template.entryAtPOI, riskManaged: template.riskManaged,
            bosConfirmed: template.bosConfirmed, mssConfirmed: template.mssConfirmed,
            chochConfirmed: template.chochConfirmed, orderBlockEntry: template.orderBlockEntry,
            fvgEntry: template.fvgEntry, killZoneEntry: template.killZoneEntry,
        });
        setShowForm(true);
    };

    const handleUseTemplate = (template: TradeTemplate) => {
        // Store template data in sessionStorage and redirect to journal
        sessionStorage.setItem('templateData', JSON.stringify(template));
        window.location.href = '/';
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingTemplate(null);
        setFormData({
            name: '', description: '', instrument: '', tradeType: '', timeframe: '', strategyLogic: '',
            htfBiasAligned: false, liquidityTaken: false, entryAtPOI: false, riskManaged: false,
            bosConfirmed: false, mssConfirmed: false, chochConfirmed: false, orderBlockEntry: false, fvgEntry: false, killZoneEntry: false,
        });
    };

    const checklistItems = [
        { key: 'htfBiasAligned', label: 'HTF Bias' },
        { key: 'liquidityTaken', label: 'Liquidity' },
        { key: 'entryAtPOI', label: 'POI Entry' },
        { key: 'riskManaged', label: 'Risk' },
        { key: 'bosConfirmed', label: 'BOS' },
        { key: 'mssConfirmed', label: 'MSS' },
        { key: 'chochConfirmed', label: 'CHoCH' },
        { key: 'orderBlockEntry', label: 'OB' },
        { key: 'fvgEntry', label: 'FVG' },
        { key: 'killZoneEntry', label: 'KZ' },
    ];

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'var(--color-text)' }}>📋 Trade Templates</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ New Template</button>
            </div>

            {/* Template Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>{editingTemplate ? '✏️ Edit Template' : '➕ New Template'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Template Name *</label>
                                    <input className="input-field" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., London Session Breakout" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Instrument</label>
                                    <input className="input-field" value={formData.instrument} onChange={(e) => setFormData(prev => ({ ...prev, instrument: e.target.value }))} placeholder="e.g., EURUSD, GOLD" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Trade Type</label>
                                    <select className="input-field select-field" value={formData.tradeType} onChange={(e) => setFormData(prev => ({ ...prev, tradeType: e.target.value }))}>
                                        <option value="">Any</option>
                                        <option value="BUY">BUY</option><option value="SELL">SELL</option>
                                        <option value="CALL">CALL</option><option value="PUT">PUT</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Timeframe</label>
                                    <select className="input-field select-field" value={formData.timeframe} onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}>
                                        <option value="">Any</option>
                                        <option value="1M">1M</option><option value="5M">5M</option><option value="15M">15M</option>
                                        <option value="1H">1H</option><option value="4H">4H</option><option value="D">Daily</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Description</label>
                                <textarea className="input-field" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe when to use this template..." style={{ minHeight: '60px' }} />
                            </div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Strategy Logic</label>
                                <input className="input-field" value={formData.strategyLogic} onChange={(e) => setFormData(prev => ({ ...prev, strategyLogic: e.target.value }))} placeholder="e.g., BOS, CHoCH, FVG" />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Pre-Checked Items</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {checklistItems.map(item => (
                                        <button key={item.key} type="button"
                                            className={`btn ${(formData as any)[item.key] ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                                            {(formData as any)[item.key] ? '✓ ' : ''}{item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary">💾 Save Template</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Templates Grid */}
            {loading ? (
                <div className="grid grid-3" style={{ gap: '1rem' }}>
                    {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }} />)}
                </div>
            ) : templates.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 style={{ color: 'var(--color-text)' }}>No templates yet</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Create templates for your common trade setups to speed up journaling!</p>
                </div>
            ) : (
                <div className="grid grid-3" style={{ gap: '1rem' }}>
                    {templates.map(template => (
                        <div key={template.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <h4 style={{ margin: 0, color: 'var(--color-text)' }}>{template.name}</h4>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-secondary" onClick={() => handleEdit(template)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>✏️</button>
                                    <button className="btn btn-secondary" onClick={() => handleDelete(template.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: 'var(--color-loss)' }}>🗑️</button>
                                </div>
                            </div>
                            {template.description && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{template.description}</p>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                {template.instrument && <span className="tag">{template.instrument}</span>}
                                {template.tradeType && <span className="tag">{template.tradeType}</span>}
                                {template.timeframe && <span className="tag">{template.timeframe}</span>}
                            </div>
                            {template.strategyLogic && <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginBottom: '0.75rem' }}>📊 {template.strategyLogic}</div>}
                            <button className="btn btn-primary" onClick={() => handleUseTemplate(template)} style={{ width: '100%' }}>Use Template</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

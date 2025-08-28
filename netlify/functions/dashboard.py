# netlify/functions/dashboard.py
"""
Netlify Function to serve the ResponsibleAI Dashboard
"""

import json
import os
import sys
from pathlib import Path

# Add src to path for imports
function_dir = Path(__file__).parent
project_root = function_dir.parent.parent
sys.path.insert(0, str(project_root / 'src'))

def handler(event, context):
    """
    Netlify Function handler for the dashboard
    """
    
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': ''
        }
    
    # Serve the dashboard HTML
    dashboard_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ResponsibleAI Content Dashboard</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            :root {
                --primary-color: #2563eb;
                --primary-light: #3b82f6;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --danger-color: #ef4444;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-300: #d1d5db;
                --gray-600: #4b5563;
                --gray-700: #374151;
                --gray-800: #1f2937;
                --gray-900: #111827;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--gray-50);
                color: var(--gray-900);
                line-height: 1.6;
            }
            
            .header {
                background: white;
                border-bottom: 1px solid var(--gray-200);
                padding: 1rem 0;
                position: sticky;
                top: 0;
                z-index: 100;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .logo {
                display: flex;
                align-items: center;
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color);
            }
            
            .logo i {
                margin-right: 0.5rem;
            }
            
            .stats-bar {
                display: flex;
                gap: 2rem;
                font-size: 0.875rem;
                color: var(--gray-600);
            }
            
            .stat {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .stat i {
                color: var(--primary-color);
            }
            
            .main-content {
                padding: 2rem 0;
            }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .content-section {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .section-title {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .loading {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
            }
            
            .spinner {
                border: 3px solid var(--gray-200);
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                width: 24px;
                height: 24px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .content-card {
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                background: white;
                transition: all 0.2s ease;
            }
            
            .content-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }
            
            .card-meta {
                font-size: 0.875rem;
                color: var(--gray-600);
                margin-bottom: 0.5rem;
            }
            
            .quality-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            
            .quality-high {
                background: #dcfce7;
                color: #166534;
            }
            
            .quality-medium {
                background: #fef3c7;
                color: #92400e;
            }
            
            .quality-low {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .tweet-preview {
                background: var(--gray-50);
                border-radius: 4px;
                padding: 1rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI';
                font-size: 0.95rem;
                line-height: 1.4;
                white-space: pre-wrap;
                margin: 1rem 0;
            }
            
            .btn {
                padding: 0.5rem 1rem;
                border-radius: 6px;
                border: none;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                text-decoration: none;
            }
            
            .btn-primary {
                background: var(--primary-color);
                color: white;
            }
            
            .btn-primary:hover {
                background: var(--primary-light);
            }
            
            .btn-success {
                background: var(--success-color);
                color: white;
            }
            
            .btn-success:hover {
                background: #059669;
            }
            
            .action-buttons {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
                flex-wrap: wrap;
            }
            
            .sidebar {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            
            .analytics-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid var(--gray-100);
            }
            
            .metric:last-child {
                border-bottom: none;
            }
            
            .metric-label {
                font-size: 0.875rem;
                color: var(--gray-600);
            }
            
            .metric-value {
                font-weight: 600;
                color: var(--gray-900);
            }
            
            .no-content {
                text-align: center;
                padding: 3rem;
                color: var(--gray-600);
            }
            
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                color: white;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 1000;
            }
            
            .toast.show {
                transform: translateX(0);
            }
            
            .toast.success {
                background: var(--success-color);
            }
            
            .toast.error {
                background: var(--danger-color);
            }
            
            @media (max-width: 768px) {
                .dashboard-grid {
                    grid-template-columns: 1fr;
                }
                
                .header-content {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .stats-bar {
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <i class="fas fa-robot"></i>
                        ResponsibleAI Dashboard
                    </div>
                    <div class="stats-bar">
                        <div class="stat">
                            <i class="fas fa-clock"></i>
                            <span id="lastUpdate">Loading...</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-chart-line"></i>
                            <span id="qualityAvg">Loading...</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-check-circle"></i>
                            <span id="approvalRate">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="main-content">
                <div class="dashboard-grid">
                    <!-- Main Content Area -->
                    <div class="pending-content">
                        <div class="content-section">
                            <h2 class="section-title">
                                <i class="fas fa-edit"></i>
                                Pending Review
                            </h2>
                            
                            <div id="pendingContent">
                                <div class="loading">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="sidebar">
                        <!-- Analytics Card -->
                        <div class="analytics-card">
                            <h3 class="section-title">
                                <i class="fas fa-chart-bar"></i>
                                Analytics
                            </h3>
                            <div class="metric">
                                <span class="metric-label">Total Entries</span>
                                <span class="metric-value" id="totalEntries">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">This Month</span>
                                <span class="metric-value" id="monthlyEntries">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Approval Rate</span>
                                <span class="metric-value" id="approvalRateDetail">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Avg Quality</span>
                                <span class="metric-value" id="avgQuality">-</span>
                            </div>
                        </div>

                        <!-- Quick Actions Card -->
                        <div class="analytics-card">
                            <h3 class="section-title">
                                <i class="fas fa-bolt"></i>
                                Quick Actions
                            </h3>
                            <button class="btn btn-primary" onclick="refreshDashboard()" style="width: 100%; margin-bottom: 0.5rem;">
                                <i class="fas fa-sync-alt"></i>
                                Refresh Data
                            </button>
                            <a href="/api/export" class="btn btn-success" style="width: 100%; justify-content: center;">
                                <i class="fas fa-download"></i>
                                Export Data
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast notifications -->
        <div id="toast" class="toast"></div>

        <script>
            // Dashboard JavaScript
            let dashboardData = { entries: [], analytics: {} };

            // Initialize dashboard
            document.addEventListener('DOMContentLoaded', function() {
                loadDashboardData();
                setInterval(loadDashboardData, 5 * 60 * 1000); // Auto-refresh every 5 minutes
            });

            // Load dashboard data from Netlify Functions
            async function loadDashboardData() {
                try {
                    const [entriesResponse, analyticsResponse] = await Promise.all([
                        fetch('/api/entries'),
                        fetch('/api/analytics')
                    ]);
                    
                    const entriesData = await entriesResponse.json();
                    const analyticsData = await analyticsResponse.json();
                    
                    if (entriesData.success) {
                        dashboardData.entries = entriesData.entries;
                        renderPendingContent(entriesData.entries);
                        updateHeaderStats(analyticsData.analytics || {});
                    }
                    
                    if (analyticsData.success) {
                        updateAnalytics(analyticsData.analytics);
                    }
                    
                } catch (error) {
                    console.error('Failed to load dashboard data:', error);
                    showToast('Failed to load data. Using demo data.', 'error');
                    loadDemoData();
                }
            }

            function loadDemoData() {
                // Demo data for when backend isn't available
                const demoData = {
                    entries: [{
                        id: "demo_entry",
                        created_at: new Date().toISOString(),
                        status: "pending_review",
                        research_context: {
                            trending_topics: ["AI governance", "responsible AI", "AI ethics"],
                            news_articles_count: 5
                        },
                        content_options: [{
                            option_number: 1,
                            content: "You don't need a computer science degree to make AI work for you.\\n\\nHere's what I discovered: the best AI practitioners ask better questions, not better algorithms.\\n\\nWhat's one area where AI could simplify your work? #ResponsibleAI #AIEthics",
                            score: 8.5,
                            voice_score: 8.2,
                            recommended: true
                        }]
                    }],
                    analytics: {
                        total_entries: 15,
                        recent_entries: 5,
                        approval_rate: 82.5,
                        average_quality_score: 7.8
                    }
                };
                
                renderPendingContent(demoData.entries);
                updateHeaderStats(demoData.analytics);
                updateAnalytics(demoData.analytics);
            }

            function updateHeaderStats(analytics) {
                document.getElementById('lastUpdate').textContent = 'Just now';
                document.getElementById('qualityAvg').textContent = `${(analytics.average_quality_score || 0).toFixed(1)}/10`;
                document.getElementById('approvalRate').textContent = `${Math.round(analytics.approval_rate || 0)}%`;
            }

            function renderPendingContent(entries) {
                const container = document.getElementById('pendingContent');
                
                if (!entries || entries.length === 0) {
                    container.innerHTML = `
                        <div class="no-content">
                            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                            <p>No content pending review</p>
                            <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">
                                New content will appear here when generated
                            </p>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = entries.map(entry => createContentCard(entry)).join('');
            }

            function createContentCard(entry) {
                const bestOption = entry.content_options[0];
                const qualityClass = bestOption.score >= 8 ? 'quality-high' : 
                                  bestOption.score >= 6 ? 'quality-medium' : 'quality-low';
                
                return `
                    <div class="content-card" data-entry-id="${entry.id}">
                        <div class="card-header">
                            <div>
                                <div class="card-meta">
                                    Generated ${new Date(entry.created_at).toLocaleString()}
                                </div>
                                <div class="card-meta">
                                    Based on: ${entry.research_context.trending_topics.join(', ')}
                                </div>
                            </div>
                            <span class="quality-badge ${qualityClass}">
                                ${bestOption.score.toFixed(1)}/10
                            </span>
                        </div>
                        
                        ${entry.content_options.map((option, index) => `
                            <div style="border: 1px solid var(--gray-200); border-radius: 6px; padding: 1rem; margin-bottom: 0.75rem; ${index === 0 ? 'border-color: var(--success-color); background: #f0f9f4;' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 500;">
                                    <span>
                                        ${index === 0 ? '🏆 ' : index === 1 ? '🥈 ' : '🥉 '}
                                        Option ${option.option_number}
                                        ${option.recommended ? '(Recommended)' : ''}
                                    </span>
                                    <span style="color: var(--gray-600);">
                                        Voice: ${option.voice_score.toFixed(1)}/10
                                    </span>
                                </div>
                                
                                <div class="tweet-preview">${option.content}</div>
                                
                                <div style="font-size: 0.75rem; color: var(--gray-600); text-align: right; margin-bottom: 0.75rem;">
                                    ${option.content.length}/280 characters
                                </div>
                                
                                <div class="action-buttons">
                                    <button class="btn btn-success" onclick="approveOption('${entry.id}', ${option.option_number})">
                                        <i class="fas fa-check"></i>
                                        Approve & Copy
                                    </button>
                                    <button class="btn btn-primary" onclick="copyToClipboard(\`${option.content.replace(/`/g, '\\`').replace(/\\n/g, '\\n')}\`)">
                                        <i class="fas fa-copy"></i>
                                        Copy Only
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            function updateAnalytics(analytics) {
                document.getElementById('totalEntries').textContent = analytics.total_entries || 0;
                document.getElementById('monthlyEntries').textContent = analytics.recent_entries || 0;
                document.getElementById('approvalRateDetail').textContent = `${Math.round(analytics.approval_rate || 0)}%`;
                document.getElementById('avgQuality').textContent = `${(analytics.average_quality_score || 0).toFixed(1)}/10`;
            }

            // Action handlers
            async function approveOption(entryId, optionNumber) {
                const entry = dashboardData.entries.find(e => e.id === entryId);
                const option = entry?.content_options.find(o => o.option_number === optionNumber);
                
                if (option) {
                    await copyToClipboard(option.content);
                    await updateEntryStatus(entryId, 'approved', { approved_option: optionNumber });
                    showToast('Content approved and copied to clipboard!', 'success');
                }
            }

            async function copyToClipboard(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    showToast('Copied to clipboard!', 'success');
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showToast('Copied to clipboard!', 'success');
                }
            }

            async function updateEntryStatus(entryId, status, feedback = null) {
                try {
                    const response = await fetch(`/api/entries/${entryId}/status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status, feedback })
                    });
                    
                    if (response.ok) {
                        // Update local data
                        const entry = dashboardData.entries.find(e => e.id === entryId);
                        if (entry) {
                            entry.status = status;
                            entry.user_feedback = feedback;
                        }
                        
                        // Re-render
                        renderPendingContent(dashboardData.entries.filter(e => e.status === 'pending_review'));
                    }
                } catch (error) {
                    console.error('Failed to update entry status:', error);
                }
            }

            function refreshDashboard() {
                showToast('Refreshing...', 'success');
                loadDashboardData();
            }

            function showToast(message, type = 'success') {
                const toast = document.getElementById('toast');
                toast.textContent = message;
                toast.className = `toast ${type}`;
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        </script>
    </body>
    </html>
    """
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
        },
        'body': dashboard_html
    }

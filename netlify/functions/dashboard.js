// netlify/functions/dashboard.js - COMPLETE LIVE VERSION
// Full dashboard interface with GitHub Issues integration and Twitter posting

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: ''
    };
  }

  const dashboardHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ResponsibleAI Content Dashboard - LIVE</title>
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1.5rem 0;
                position: sticky;
                top: 0;
                z-index: 100;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .logo {
                display: flex;
                align-items: center;
                font-size: 1.75rem;
                font-weight: 700;
            }
            
            .logo i {
                margin-right: 0.75rem;
                font-size: 2rem;
            }
            
            .live-indicator {
                background: rgba(16, 185, 129, 0.2);
                border: 1px solid #10b981;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-left: 1rem;
            }
            
            .live-dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .stats-bar {
                display: flex;
                gap: 2rem;
                font-size: 0.875rem;
                flex-wrap: wrap;
            }
            
            .stat {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(255,255,255,0.1);
                padding: 0.5rem 1rem;
                border-radius: 6px;
                backdrop-filter: blur(10px);
            }
            
            .stat i {
                color: #10b981;
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
                border: 1px solid var(--gray-200);
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
                padding: 3rem;
                flex-direction: column;
                gap: 1rem;
            }
            
            .spinner {
                border: 3px solid var(--gray-200);
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .content-card {
                border: 1px solid var(--gray-200);
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                background: white;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .content-card:hover {
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                transform: translateY(-2px);
            }
            
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-100);
            }
            
            .card-meta {
                font-size: 0.875rem;
                color: var(--gray-600);
                margin-bottom: 0.5rem;
            }
            
            .github-link {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: 500;
            }
            
            .github-link:hover {
                text-decoration: underline;
            }
            
            .quality-badge {
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.875rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .quality-high {
                background: #dcfce7;
                color: #166534;
                border: 1px solid #bbf7d0;
            }
            
            .quality-medium {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
            }
            
            .quality-low {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fecaca;
            }
            
            .tweet-preview {
                background: var(--gray-50);
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                padding: 1.25rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI';
                font-size: 1rem;
                line-height: 1.5;
                white-space: pre-wrap;
                margin: 1rem 0;
                position: relative;
            }
            
            .tweet-preview::before {
                content: "🐦";
                position: absolute;
                top: 0.75rem;
                right: 0.75rem;
                font-size: 1.25rem;
            }
            
            .character-count {
                font-size: 0.75rem;
                color: var(--gray-600);
                text-align: right;
                margin-bottom: 1rem;
                font-weight: 500;
            }
            
            .character-count.warning {
                color: var(--warning-color);
            }
            
            .character-count.danger {
                color: var(--danger-color);
            }
            
            .btn {
                padding: 0.75rem 1.25rem;
                border-radius: 8px;
                border: none;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                text-decoration: none;
                white-space: nowrap;
            }
            
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: var(--primary-color);
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: var(--primary-light);
                transform: translateY(-1px);
            }
            
            .btn-success {
                background: var(--success-color);
                color: white;
            }
            
            .btn-success:hover:not(:disabled) {
                background: #059669;
                transform: translateY(-1px);
            }
            
            .btn-warning {
                background: var(--warning-color);
                color: white;
            }
            
            .btn-danger {
                background: var(--danger-color);
                color: white;
            }
            
            .btn-danger:hover:not(:disabled) {
                background: #dc2626;
            }
            
            .btn-secondary {
                background: var(--gray-600);
                color: white;
            }
            
            .action-buttons {
                display: flex;
                gap: 0.75rem;
                margin-top: 1.5rem;
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
                border: 1px solid var(--gray-200);
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
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                color: white;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 1000;
                max-width: 400px;
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
            
            .option-container {
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                padding: 1.25rem;
                margin-bottom: 1rem;
                background: white;
                transition: all 0.2s ease;
            }
            
            .option-recommended {
                border-color: var(--success-color);
                background: linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%);
                position: relative;
            }
            
            .option-recommended::before {
                content: "RECOMMENDED";
                position: absolute;
                top: -8px;
                right: 1rem;
                background: var(--success-color);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.625rem;
                font-weight: 700;
                letter-spacing: 0.05em;
            }
            
            .option-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            .connection-status {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid #10b981;
                color: #065f46;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .error-status {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid #ef4444;
                color: #991b1b;
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
                
                .action-buttons {
                    flex-direction: column;
                }
                
                .btn {
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="container">
                <div class="header-content">
                    <div style="display: flex; align-items: center;">
                        <div class="logo">
                            <i class="fas fa-robot"></i>
                            ResponsibleAI Dashboard
                        </div>
                        <div class="live-indicator">
                            <div class="live-dot"></div>
                            LIVE SYSTEM
                        </div>
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
                        <div class="stat">
                            <i class="fas fa-database"></i>
                            <span id="dataSource">Live Data</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="main-content">
                <!-- Connection Status -->
                <div id="connectionStatus" class="connection-status">
                    <i class="fas fa-wifi"></i>
                    <span>Connecting to GitHub Issues API and Twitter...</span>
                </div>

                <div class="dashboard-grid">
                    <!-- Main Content Area -->
                    <div class="pending-content">
                        <div class="content-section">
                            <h2 class="section-title">
                                <i class="fas fa-edit"></i>
                                Pending Review
                                <span id="pendingCount" style="background: var(--primary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: auto;">0</span>
                            </h2>
                            
                            <div id="pendingContent">
                                <div class="loading">
                                    <div class="spinner"></div>
                                    <p>Loading content from GitHub Issues...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="sidebar">
                        <!-- Real-time Analytics Card -->
                        <div class="analytics-card">
                            <h3 class="section-title">
                                <i class="fas fa-chart-bar"></i>
                                Live Analytics
                            </h3>
                            <div class="metric">
                                <span class="metric-label">Total Entries</span>
                                <span class="metric-value" id="totalEntries">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">This Week</span>
                                <span class="metric-value" id="weeklyEntries">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Approval Rate</span>
                                <span class="metric-value" id="approvalRateDetail">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Avg Quality</span>
                                <span class="metric-value" id="avgQuality">-</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Pipeline Success</span>
                                <span class="metric-value" id="pipelineSuccess">-</span>
                            </div>
                        </div>

                        <!-- System Status Card -->
                        <div class="analytics-card">
                            <h3 class="section-title">
                                <i class="fas fa-server"></i>
                                System Status
                            </h3>
                            <div class="metric">
                                <span class="metric-label">GitHub API</span>
                                <span class="metric-value" id="githubStatus">🔄 Checking...</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Twitter API</span>
                                <span class="metric-value" id="twitterStatus">🔄 Checking...</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Last Health Check</span>
                                <span class="metric-value" id="lastHealthCheck">-</span>
                            </div>
                        </div>

                        <!-- Quick Actions Card -->
                        <div class="analytics-card">
                            <h3 class="section-title">
                                <i class="fas fa-bolt"></i>
                                Quick Actions
                            </h3>
                            <button class="btn btn-primary" onclick="refreshDashboard()" style="width: 100%; margin-bottom: 0.75rem;">
                                <i class="fas fa-sync-alt"></i>
                                Refresh Data
                            </button>
                            <button class="btn btn-success" onclick="triggerPipeline()" style="width: 100%; margin-bottom: 0.75rem;">
                                <i class="fas fa-play"></i>
                                Trigger Content Generation
                            </button>
                            <a href="https://github.com/${getRepoOwner()}/${getRepoName()}/issues?q=is%3Aissue+label%3Acontent-review" target="_blank" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                                <i class="fab fa-github"></i>
                                View All Issues
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast notifications -->
        <div id="toast" class="toast"></div>

        <script>
            // Dashboard JavaScript - LIVE VERSION
            let dashboardData = { entries: [], analytics: {} };
            let systemHealth = { github: false, twitter: false };

            // Initialize dashboard
            document.addEventListener('DOMContentLoaded', function() {
                console.log('🚀 Initializing Live ResponsibleAI Dashboard...');
                loadSystemHealth();
                loadDashboardData();
                
                // Auto-refresh every 2 minutes for live system
                setInterval(loadDashboardData, 2 * 60 * 1000);
                
                // Health check every 5 minutes
                setInterval(loadSystemHealth, 5 * 60 * 1000);
            });

            // Check system health and API connectivity
            async function loadSystemHealth() {
                try {
                    const healthUrl = window.location.origin + '/.netlify/functions/health';
                    const response = await fetch(healthUrl);
                    const healthData = await response.json();
                    
                    console.log('System health:', healthData);
                    
                    if (healthData.api_connectivity) {
                        updateSystemStatus(healthData);
                    }
                    
                } catch (error) {
                    console.error('Failed to load system health:', error);
                    updateConnectionStatus('❌ System health check failed', 'error');
                }
            }

            function updateSystemStatus(healthData) {
                const { api_connectivity, api_configuration } = healthData;
                
                // Update connection status banner
                if (api_connectivity.github.status === 'connected' && api_connectivity.twitter.status === 'connected') {
                    updateConnectionStatus('✅ All systems connected - GitHub Issues & Twitter API', 'success');
                } else {
                    const issues = [];
                    if (api_connectivity.github.status !== 'connected') issues.push('GitHub');
                    if (api_connectivity.twitter.status !== 'connected') issues.push('Twitter');
                    updateConnectionStatus(`⚠️ Connection issues: ${issues.join(', ')}`, 'error');
                }
                
                // Update sidebar status
                document.getElementById('githubStatus').textContent = 
                    api_connectivity.github.status === 'connected' ? '✅ Connected' : 
                    api_connectivity.github.status === 'error' ? '❌ Error' : '⚠️ Not configured';
                    
                document.getElementById('twitterStatus').textContent = 
                    api_connectivity.twitter.status === 'connected' ? '✅ Connected' : 
                    api_connectivity.twitter.status === 'error' ? '❌ Error' : '⚠️ Not configured';
                    
                document.getElementById('lastHealthCheck').textContent = new Date().toLocaleTimeString();
            }

            function updateConnectionStatus(message, type) {
                const statusEl = document.getElementById('connectionStatus');
                const iconClass = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle';
                statusEl.innerHTML = '<i class="fas fa-' + iconClass + '"></i><span>' + message + '</span>';
                statusEl.className = 'connection-status' + (type === 'error' ? ' error-status' : '');
            }

            // Load dashboard data from GitHub Issues API
            async function loadDashboardData() {
                try {
                    console.log('Loading live dashboard data from GitHub...');
                    
                    const entriesUrl = window.location.origin + '/.netlify/functions/entries';
                    const analyticsUrl = window.location.origin + '/.netlify/functions/analytics';
                    
                    const [entriesResponse, analyticsResponse] = await Promise.all([
                        fetch(entriesUrl),
                        fetch(analyticsUrl)
                    ]);
                    
                    const entriesData = await entriesResponse.json();
                    const analyticsData = await analyticsResponse.json();
                    
                    console.log('Entries data:', entriesData);
                    console.log('Analytics data:', analyticsData);
                    
                    if (entriesData.success) {
                        dashboardData.entries = entriesData.entries || [];
                        renderPendingContent(entriesData.entries || []);
                        document.getElementById('pendingCount').textContent = (entriesData.entries || []).length;
                        
                        if (!entriesData.demo_mode) {
                            updateConnectionStatus('✅ Live data loaded from GitHub Issues', 'success');
                        }
                    } else if (entriesData.error) {
                        updateConnectionStatus(\`❌ \${entriesData.error}\`, 'error');
                        renderPendingContent([]);
                    }
                    
                    if (analyticsData.success) {
                        updateHeaderStats(analyticsData.analytics || {});
                        updateAnalytics(analyticsData.analytics || {});
                    }
                    
                } catch (error) {
                    console.error('Failed to load dashboard data:', error);
                    updateConnectionStatus('❌ Failed to connect to APIs - check environment variables', 'error');
                    renderPendingContent([]);
                }
            }

            function updateHeaderStats(analytics) {
                const lastUpdate = analytics.last_generated ? 
                    new Date(analytics.last_generated).toLocaleString() : 'Never';
                    
                document.getElementById('lastUpdate').textContent = lastUpdate;
                document.getElementById('qualityAvg').textContent = \`\${(analytics.average_quality_score || 0).toFixed(1)}/10\`;
                document.getElementById('approvalRate').textContent = \`\${Math.round(analytics.approval_rate || 0)}%\`;
                document.getElementById('dataSource').textContent = analytics.demo_mode ? 'Demo Data' : 'Live Data';
            }

            function renderPendingContent(entries) {
                const container = document.getElementById('pendingContent');
                
                if (!entries || entries.length === 0) {
                    container.innerHTML = 
                        '<div class="no-content">' +
                        '<i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>' +
                        '<p><strong>No content pending review</strong></p>' +
                        '<p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">' +
                        'New content will appear here when your Python agent creates GitHub issues' +
                        '</p>' +
                        '<p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 1rem;">' +
                        'Connected to: GitHub Issues API • Twitter API • Live Data' +
                        '</p>' +
                        '<button class="btn btn-primary" onclick="triggerPipeline()" style="margin-top: 1rem;">' +
                        '<i class="fas fa-play"></i> Generate New Content' +
                        '</button>' +
                        '</div>';
                    return;
                }
                
                container.innerHTML = entries.map(entry => createContentCard(entry)).join('');
            }

            function createContentCard(entry) {
                const bestOption = entry.content_options[0];
                const qualityClass = bestOption.score >= 8 ? 'quality-high' : 
                                  bestOption.score >= 6 ? 'quality-medium' : 'quality-low';
                
                const repoOwner = 'your-username'; // Will be dynamically set
                const repoName = 'responsible-ai-agent';
                const githubUrl = entry.github_issue_url || 'https://github.com/' + repoOwner + '/' + repoName + '/issues/' + entry.id;
                
                let cardHtml = '<div class="content-card" data-entry-id="' + entry.id + '">';
                
                // Card header
                cardHtml += '<div class="card-header">';
                cardHtml += '<div>';
                cardHtml += '<div class="card-meta">';
                cardHtml += '<i class="fab fa-github"></i> ';
                cardHtml += 'Generated ' + new Date(entry.created_at).toLocaleString();
                cardHtml += ' • <a href="' + githubUrl + '" target="_blank" class="github-link">Issue #' + entry.id + '</a>';
                cardHtml += '</div>';
                cardHtml += '<div class="card-meta">';
                cardHtml += '📊 Based on: ' + entry.research_context.trending_topics.join(', ');
                cardHtml += '</div>';
                cardHtml += '</div>';
                cardHtml += '<span class="quality-badge ' + qualityClass + '">';
                cardHtml += '<i class="fas fa-star"></i> ';
                cardHtml += bestOption.score.toFixed(1) + '/10';
                cardHtml += '</span>';
                cardHtml += '</div>';
                
                // Content options
                entry.content_options.forEach((option, index) => {
                    const isRecommended = option.recommended;
                    const emoji = index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉';
                    
                    cardHtml += '<div class="option-container' + (isRecommended ? ' option-recommended' : '') + '">';
                    
                    // Option header
                    cardHtml += '<div class="option-header">';
                    cardHtml += '<span>' + emoji + ' Option ' + option.option_number;
                    cardHtml += (isRecommended ? ' (Recommended)' : '') + '</span>';
                    cardHtml += '<span style="color: var(--gray-600);">Voice: ' + option.voice_score.toFixed(1) + '/10</span>';
                    cardHtml += '</div>';
                    
                    // Tweet preview
                    cardHtml += '<div class="tweet-preview">' + escapeHtml(option.content) + '</div>';
                    
                    // Character count
                    const charClass = option.content.length > 280 ? ' danger' : option.content.length > 250 ? ' warning' : '';
                    cardHtml += '<div class="character-count' + charClass + '">';
                    cardHtml += option.content.length + '/280 characters';
                    cardHtml += '</div>';
                    
                    // Action buttons
                    cardHtml += '<div class="action-buttons">';
                    
                    // Approve & Post button
                    const disabledAttr = option.content.length > 280 ? ' disabled' : '';
                    cardHtml += '<button class="btn btn-success" onclick="approveAndPost(\'' + entry.id + '\', ' + option.option_number + ', this)"' + disabledAttr + '>';
                    cardHtml += '<i class="fas fa-paper-plane"></i> Approve & Post to Twitter';
                    cardHtml += '</button>';
                    
                    // Approve & Copy button  
                    cardHtml += '<button class="btn btn-primary" onclick="approveOption(\'' + entry.id + '\', ' + option.option_number + ')">';
                    cardHtml += '<i class="fas fa-check"></i> Approve & Copy Only';
                    cardHtml += '</button>';
                    
                    // Copy button
                    cardHtml += '<button class="btn btn-secondary" onclick="copyContent(this, \'' + entry.id + '\', ' + option.option_number + ')">';
                    cardHtml += '<i class="fas fa-copy"></i> Copy Text';
                    cardHtml += '</button>';
                    
                    // Reject button
                    cardHtml += '<button class="btn btn-danger" onclick="rejectOption(\'' + entry.id + '\', ' + option.option_number + ')">';
                    cardHtml += '<i class="fas fa-times"></i> Reject';
                    cardHtml += '</button>';
                    
                    cardHtml += '</div>'; // Close action-buttons
                    cardHtml += '</div>'; // Close option-container
                });
                
                cardHtml += '</div>'; // Close content-card
                
                return cardHtml;
            }

            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            function updateAnalytics(analytics) {
                document.getElementById('totalEntries').textContent = analytics.total_entries || 0;
                document.getElementById('weeklyEntries').textContent = analytics.recent_entries || 0;
                document.getElementById('approvalRateDetail').textContent = \`\${Math.round(analytics.approval_rate || 0)}%\`;
                document.getElementById('avgQuality').textContent = \`\${(analytics.average_quality_score || 0).toFixed(1)}/10\`;
                document.getElementById('pipelineSuccess').textContent = \`\${Math.round(analytics.pipeline_success_rate || 0)}%\`;
            }

            // Action handlers for LIVE system
            async function approveAndPost(entryId, optionNumber, buttonElement) {
                if (!confirm('This will approve the content AND post it directly to @ResponsibleAI Twitter. Are you sure?')) {
                    return;
                }

                try {
                    // Get content from the entry data
                    const entry = dashboardData.entries.find(e => e.id === entryId);
                    const option = entry?.content_options.find(o => o.option_number === optionNumber);
                    
                    if (!option) {
                        throw new Error('Content option not found');
                    }
                    
                    // Disable button to prevent double posting
                    const originalText = buttonElement.innerHTML;
                    buttonElement.disabled = true;
                    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
                    
                    showToast('Posting to Twitter...', 'success');
                    
                    // Post to Twitter via live function
                    const postUrl = window.location.origin + '/.netlify/functions/post-to-twitter';
                    const postResponse = await fetch(postUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: option.content,
                            entryId: entryId,
                            githubIssueNumber: entryId
                        })
                    });

                    const postResult = await postResponse.json();
                    console.log('Twitter post result:', postResult);

                    if (postResult.success) {
                        // Update entry status in GitHub
                        await updateEntryStatus(entryId, 'approved', { 
                            approved_option: optionNumber,
                            posted_to_twitter: true,
                            tweet_url: postResult.tweet.url,
                            tweet_id: postResult.tweet.id
                        });
                        
                        showToast('✅ Posted to Twitter! ' + postResult.tweet.url, 'success');
                        
                        // Optional: Open tweet in new tab
                        if (confirm('Open tweet in new tab?')) {
                            window.open(postResult.tweet.url, '_blank');
                        }
                        
                        // Refresh dashboard to remove posted content
                        setTimeout(loadDashboardData, 1000);
                        
                    } else {
                        throw new Error(postResult.error || 'Failed to post to Twitter');
                    }

                } catch (error) {
                    console.error('Post to Twitter error:', error);
                    showToast('❌ Failed to post: ' + error.message, 'error');
                } finally {
                    // Re-enable button if still exists
                    if (buttonElement && !buttonElement.disabled) return;
                    if (buttonElement) {
                        buttonElement.disabled = false;
                        buttonElement.innerHTML = '<i class="fas fa-paper-plane"></i> Approve & Post to Twitter';
                    }
                }
            }

            async function approveOption(entryId, optionNumber) {
                const entry = dashboardData.entries.find(e => e.id === entryId);
                const option = entry?.content_options.find(o => o.option_number === optionNumber);
                
                if (option) {
                    const success = await copyToClipboard(option.content);
                    if (success) {
                        await updateEntryStatus(entryId, 'approved', { 
                            approved_option: optionNumber,
                            posted_to_twitter: false,
                            manual_approval: true
                        });
                        showToast('✅ Content approved and copied to clipboard!', 'success');
                        
                        // Refresh dashboard
                        setTimeout(loadDashboardData, 500);
                    }
                }
            }

            async function copyContent(buttonElement, entryId, optionNumber) {
                const entry = dashboardData.entries.find(e => e.id === entryId);
                const option = entry?.content_options.find(o => o.option_number === optionNumber);
                
                if (option) {
                    const success = await copyToClipboard(option.content);
                    if (success) {
                        showToast('📋 Copied to clipboard!', 'success');
                        
                        // Visual feedback on button
                        const originalText = buttonElement.innerHTML;
                        buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        setTimeout(() => {
                            buttonElement.innerHTML = originalText;
                        }, 1500);
                    }
                }
            }

            async function rejectOption(entryId, optionNumber) {
                const reason = prompt('Why is this content being rejected? (This will be added to the GitHub issue)');
                
                if (reason === null) return; // User cancelled
                
                try {
                    await updateEntryStatus(entryId, 'rejected', { 
                        rejected_option: optionNumber,
                        rejection_reason: reason || 'No reason provided',
                        rejected_at: new Date().toISOString()
                    });
                    
                    showToast('❌ Content rejected', 'error');
                    
                    // Refresh dashboard
                    setTimeout(loadDashboardData, 500);
                } catch (error) {
                    showToast('Failed to reject content: ' + error.message, 'error');
                }
            }

            async function updateEntryStatus(entryId, status, feedback = null) {
                try {
                    const statusUrl = window.location.origin + '/.netlify/functions/entry-status';
                    
                    const response = await fetch(statusUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            entryId: entryId,
                            status: status, 
                            feedback: feedback 
                        })
                    });
                    
                    const result = await response.json();
                    console.log('Status update result:', result);
                    
                    if (!result.success) {
                        throw new Error(result.error || 'Failed to update status');
                    }
                    
                } catch (error) {
                    console.error('Failed to update entry status:', error);
                    showToast(\`❌ Failed to update status: \${error.message}\`, 'error');
                    throw error; // Re-throw so calling functions can handle it
                }
            }

            async function copyToClipboard(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return true;
                }
            }

            async function triggerPipeline() {
                const confirmed = confirm('This will trigger your GitHub Action to generate new content. Continue?');
                if (!confirmed) return;
                
                showToast('🤖 Triggering content generation pipeline...', 'success');
                
                // This would integrate with GitHub Actions API to trigger workflow
                // For now, just provide instructions
                showToast('⚠️ To trigger pipeline: Go to GitHub Actions and run "Daily ResponsibleAI Content Generation"', 'warning');
                
                // Optional: Open GitHub Actions in new tab
                setTimeout(() => {
                    const actionsUrl = \`https://github.com/\${getRepoOwner()}/\${getRepoName()}/actions\`;
                    window.open(actionsUrl, '_blank');
                }, 1000);
            }

            function refreshDashboard() {
                showToast('🔄 Refreshing live data...', 'success');
                loadSystemHealth();
                loadDashboardData();
            }

            function showToast(message, type = 'success') {
                const toast = document.getElementById('toast');
                toast.textContent = message;
                toast.className = \`toast \${type}\`;
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, type === 'warning' ? 5000 : 3000);
            }

            function getRepoOwner() {
                // This would come from environment variables in a real implementation
                return 'your-username'; // Replace with actual logic to get from health endpoint
            }

            function getRepoName() {
                // This would come from environment variables in a real implementation  
                return 'responsible-ai-agent'; // Replace with actual logic to get from health endpoint
            }
        </script>
    </body>
    </html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
    body: dashboardHtml
  };
};

// netlify/functions/dashboard.js - CLEAN SYNTAX VERSION
// Fixed all JavaScript syntax issues with simple string building

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

  // Create the HTML page
  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResponsibleAI Dashboard - LIVE</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2563eb;
            --success-color: #10b981;
            --danger-color: #ef4444;
            --warning-color: #f59e0b;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-600: #4b5563;
            --gray-700: #374151;
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
        }
        
        .live-indicator {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .stats-bar {
            display: flex;
            gap: 1rem;
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
        }
        
        .main-content {
            padding: 2rem 0;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 2rem;
            align-items: start;
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
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
            overflow: visible;
            word-wrap: break-word;
        }
        
        .content-card:hover {
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
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
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 0.25rem;
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
            margin: 1rem 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI';
            font-size: 1rem;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: break-word;
            position: relative;
            min-height: 100px;
            max-height: none;
            overflow: visible;
        }
        
        .tweet-preview::after {
            content: "🐦";
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            font-size: 1.25rem;
        }
        
        .char-count {
            font-size: 0.75rem;
            text-align: right;
            margin: 0.5rem 0 1rem 0;
            font-weight: 500;
        }
        
        .char-count.warning {
            color: var(--warning-color);
        }
        
        .char-count.danger {
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
            margin: 0.25rem;
            transition: all 0.2s ease;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-success {
            background: var(--success-color);
            color: white;
        }
        
        .btn-danger {
            background: var(--danger-color);
            color: white;
        }
        
        .btn-secondary {
            background: var(--gray-600);
            color: white;
        }
        
        .action-buttons {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--gray-100);
        }
        
        .analytics-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid var(--gray-200);
            margin-bottom: 1.5rem;
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
        }
        
        .error-status {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
            color: #991b1b;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
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
        
        .no-content {
            text-align: center;
            padding: 3rem;
            color: var(--gray-600);
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            .header-content {
                flex-direction: column;
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
                    <div class="live-indicator">🟢 LIVE SYSTEM</div>
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
            <div id="connectionStatus" class="connection-status">
                <i class="fas fa-wifi"></i>
                <span>Connecting to GitHub Issues API and Twitter...</span>
            </div>

            <div class="dashboard-grid">
                <div class="pending-content">
                    <div class="content-section">
                        <h2 class="section-title">
                            <i class="fas fa-edit"></i>
                            Pending Review
                        </h2>
                        <div id="pendingContent">
                            <div class="loading">
                                <div class="spinner"></div>
                                <p>Loading content from GitHub Issues...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sidebar">
                    <div class="analytics-card">
                        <h3 class="section-title">
                            <i class="fas fa-chart-bar"></i>
                            Live Analytics
                        </h3>
                        <div class="metric">
                            <span>Total Entries</span>
                            <span id="totalEntries">-</span>
                        </div>
                        <div class="metric">
                            <span>This Week</span>
                            <span id="weeklyEntries">-</span>
                        </div>
                        <div class="metric">
                            <span>Approval Rate</span>
                            <span id="approvalRateDetail">-</span>
                        </div>
                        <div class="metric">
                            <span>Avg Quality</span>
                            <span id="avgQuality">-</span>
                        </div>
                    </div>

                    <div class="analytics-card">
                        <h3 class="section-title">
                            <i class="fas fa-bolt"></i>
                            Quick Actions
                        </h3>
                        <button class="btn btn-primary" onclick="refreshDashboard()" style="width: 100%; margin-bottom: 0.75rem;">
                            <i class="fas fa-sync-alt"></i>
                            Refresh Data
                        </button>
                        <button class="btn btn-success" onclick="createTestIssue()" style="width: 100%;">
                            <i class="fas fa-plus"></i>
                            Create Test Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script>
        let dashboardData = { entries: [], analytics: {} };

        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Initializing Live ResponsibleAI Dashboard...');
            loadDashboardData();
            setInterval(loadDashboardData, 2 * 60 * 1000);
        });

        async function loadDashboardData() {
            try {
                console.log('Loading live data from GitHub...');
                
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
                    updateConnectionStatus('✅ Connected to GitHub Issues API', 'success');
                } else {
                    updateConnectionStatus('❌ GitHub API Error: ' + (entriesData.error || 'Unknown'), 'error');
                }
                
                if (analyticsData.success) {
                    updateHeaderStats(analyticsData.analytics || {});
                    updateAnalytics(analyticsData.analytics || {});
                }
                
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                updateConnectionStatus('❌ Failed to connect to APIs', 'error');
                renderPendingContent([]);
            }
        }

        function renderPendingContent(entries) {
            const container = document.getElementById('pendingContent');
            
            if (!entries || entries.length === 0) {
                container.innerHTML = 
                    '<div class="no-content">' +
                    '<i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>' +
                    '<h3 style="margin-bottom: 1rem;">No content pending review</h3>' +
                    '<p style="margin-bottom: 2rem;">New content will appear when your Python agent creates GitHub issues</p>' +
                    '<button class="btn btn-primary" onclick="createTestIssue()">' +
                    '<i class="fas fa-plus"></i> Create Test Issue' +
                    '</button>' +
                    '</div>';
                return;
            }
            
            let contentHtml = '';
            entries.forEach(function(entry) {
                contentHtml += createContentCard(entry);
            });
            container.innerHTML = contentHtml;
        }

        function createContentCard(entry) {
            const option = entry.content_options[0];
            const score = option.score || 0;
            const voiceScore = option.voice_score || 0;
            const content = option.content || '';
            const charCount = content.length;
            
            // Determine quality class
            let qualityClass = 'quality-low';
            if (score >= 8) qualityClass = 'quality-high';
            else if (score >= 6) qualityClass = 'quality-medium';
            
            // Determine char count class
            let charClass = '';
            if (charCount > 280) charClass = ' danger';
            else if (charCount > 250) charClass = ' warning';
            
            let cardHtml = '<div class="content-card" data-entry-id="' + entry.id + '">';
            
            // Header
            cardHtml += '<div class="card-header">';
            cardHtml += '<div>';
            cardHtml += '<div class="card-meta">';
            cardHtml += '<i class="fab fa-github"></i> ';
            cardHtml += 'Generated ' + new Date(entry.created_at).toLocaleString();
            cardHtml += '</div>';
            cardHtml += '<div class="card-meta">';
            cardHtml += '<a href="https://github.com/gbrandonwade/responsible-ai-agent/issues/' + entry.id + '" target="_blank" class="github-link">Issue #' + entry.id + '</a>';
            cardHtml += ' • Topics: ' + entry.research_context.trending_topics.join(', ');
            cardHtml += '</div>';
            cardHtml += '</div>';
            cardHtml += '<div class="quality-badge ' + qualityClass + '">';
            cardHtml += '<i class="fas fa-star"></i> ';
            cardHtml += score.toFixed(1) + '/10';
            cardHtml += '</div>';
            cardHtml += '</div>';
            
            // Content preview
            cardHtml += '<div class="tweet-preview">';
            cardHtml += escapeHtml(content);
            cardHtml += '</div>';
            
            // Character count
            cardHtml += '<div class="char-count' + charClass + '">';
            cardHtml += charCount + '/280 characters • Voice: ' + voiceScore.toFixed(1) + '/10';
            cardHtml += '</div>';
            
            // Action buttons
            cardHtml += '<div class="action-buttons">';
            
            // Post to Twitter button
            if (charCount <= 280) {
                cardHtml += '<button class="btn btn-success" onclick="postToTwitter(\'' + entry.id + '\', \'' + option.option_number + '\')">';
                cardHtml += '<i class="fas fa-paper-plane"></i> Post to Twitter';
                cardHtml += '</button>';
            } else {
                cardHtml += '<button class="btn btn-success" disabled title="Content exceeds 280 characters">';
                cardHtml += '<i class="fas fa-paper-plane"></i> Too Long for Twitter';
                cardHtml += '</button>';
            }
            
            // Other action buttons
            cardHtml += '<button class="btn btn-primary" onclick="approveContent(\'' + entry.id + '\', \'' + option.option_number + '\')">';
            cardHtml += '<i class="fas fa-check"></i> Approve & Copy';
            cardHtml += '</button>';
            
            cardHtml += '<button class="btn btn-secondary" onclick="copyContent(\'' + entry.id + '\', \'' + option.option_number + '\')">';
            cardHtml += '<i class="fas fa-copy"></i> Copy Text';
            cardHtml += '</button>';
            
            cardHtml += '<button class="btn btn-danger" onclick="rejectContent(\'' + entry.id + '\')">';
            cardHtml += '<i class="fas fa-times"></i> Reject';
            cardHtml += '</button>';
            
            cardHtml += '</div>';
            cardHtml += '</div>';
            
            return cardHtml;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function updateConnectionStatus(message, type) {
            const statusEl = document.getElementById('connectionStatus');
            const iconClass = type === 'success' ? 'check-circle' : 'exclamation-triangle';
            statusEl.innerHTML = '<i class="fas fa-' + iconClass + '"></i><span>' + message + '</span>';
            statusEl.className = 'connection-status' + (type === 'error' ? ' error-status' : '');
        }

        function updateHeaderStats(analytics) {
            document.getElementById('lastUpdate').textContent = analytics.last_generated ? 
                new Date(analytics.last_generated).toLocaleString() : 'Never';
            document.getElementById('qualityAvg').textContent = (analytics.average_quality_score || 0).toFixed(1) + '/10';
            document.getElementById('approvalRate').textContent = Math.round(analytics.approval_rate || 0) + '%';
        }

        function updateAnalytics(analytics) {
            document.getElementById('totalEntries').textContent = analytics.total_entries || 0;
            document.getElementById('weeklyEntries').textContent = analytics.recent_entries || 0;
            document.getElementById('approvalRateDetail').textContent = Math.round(analytics.approval_rate || 0) + '%';
            document.getElementById('avgQuality').textContent = (analytics.average_quality_score || 0).toFixed(1) + '/10';
        }

        // Action handlers
        async function postToTwitter(entryId, optionNumber) {
            if (!confirm('Post this content to @ResponsibleAI Twitter?')) return;
            
            const entry = dashboardData.entries.find(e => e.id === entryId);
            const option = entry.content_options.find(o => o.option_number == optionNumber);
            
            if (!option) {
                showToast('❌ Content option not found', 'error');
                return;
            }
            
            try {
                showToast('Posting to Twitter...', 'success');
                
                const response = await fetch(window.location.origin + '/.netlify/functions/post-to-twitter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        content: option.content, 
                        entryId: entryId,
                        githubIssueNumber: entryId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast('✅ Posted to Twitter successfully!', 'success');
                    await updateEntryStatus(entryId, 'approved');
                    setTimeout(loadDashboardData, 1000);
                    
                    if (result.tweet && result.tweet.url) {
                        if (confirm('Open tweet in new tab?')) {
                            window.open(result.tweet.url, '_blank');
                        }
                    }
                } else {
                    throw new Error(result.error || 'Unknown error');
                }
                
            } catch (error) {
                console.error('Twitter posting error:', error);
                showToast('❌ Failed to post: ' + error.message, 'error');
            }
        }

        async function approveContent(entryId, optionNumber) {
            const entry = dashboardData.entries.find(e => e.id === entryId);
            const option = entry.content_options.find(o => o.option_number == optionNumber);
            
            if (!option) return;
            
            try {
                await navigator.clipboard.writeText(option.content);
                await updateEntryStatus(entryId, 'approved');
                showToast('✅ Content approved and copied to clipboard!', 'success');
                setTimeout(loadDashboardData, 500);
            } catch (error) {
                showToast('❌ Failed to approve content', 'error');
            }
        }

        async function copyContent(entryId, optionNumber) {
            const entry = dashboardData.entries.find(e => e.id === entryId);
            const option = entry.content_options.find(o => o.option_number == optionNumber);
            
            if (!option) return;
            
            try {
                await navigator.clipboard.writeText(option.content);
                showToast('📋 Copied to clipboard!', 'success');
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = option.content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('📋 Copied to clipboard!', 'success');
            }
        }

        async function rejectContent(entryId) {
            const reason = prompt('Rejection reason (optional):');
            if (reason === null) return; // User cancelled
            
            try {
                await updateEntryStatus(entryId, 'rejected');
                showToast('❌ Content rejected', 'error');
                setTimeout(loadDashboardData, 500);
            } catch (error) {
                showToast('❌ Failed to reject content', 'error');
            }
        }

        async function updateEntryStatus(entryId, status) {
            try {
                const response = await fetch(window.location.origin + '/.netlify/functions/entry-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entryId: entryId, status: status })
                });
                
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Failed to update status');
                }
            } catch (error) {
                console.error('Failed to update entry status:', error);
                throw error;
            }
        }

        function refreshDashboard() {
            showToast('🔄 Refreshing...', 'success');
            loadDashboardData();
        }

        function createTestIssue() {
            const confirmed = confirm('This will open GitHub to create a test content review issue. Continue?');
            if (!confirmed) return;
            
            const issueUrl = 'https://github.com/gbrandonwade/responsible-ai-agent/issues/new';
            const title = encodeURIComponent('Content Review Required - Manual Test');
            const body = encodeURIComponent('## Generated Content\\nYou don\\'t need a computer science degree to make AI work for you.\\n\\nHere\\'s what I discovered: the best AI practitioners ask better questions, not better algorithms.\\n\\nWhat\\'s one area where AI could simplify your work? #ResponsibleAI #AIEthics\\n\\n## Quality Analysis\\n- **Quality Score:** 8.5\\n- **Voice Score:** 8.2\\n- **Timestamp:** ' + new Date().toISOString() + '\\n\\n---\\n*This is a test issue created from the ResponsibleAI dashboard.*');
            const labels = encodeURIComponent('content-review,needs-human-review');
            
            window.open(issueUrl + '?title=' + title + '&body=' + body + '&labels=' + labels, '_blank');
            showToast('Opening GitHub to create test issue...', 'success');
        }

        function showToast(message, type) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast ' + type;
            toast.classList.add('show');
            
            setTimeout(function() {
                toast.classList.remove('show');
            }, 3000);
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

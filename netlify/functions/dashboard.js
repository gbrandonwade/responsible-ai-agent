// netlify/functions/dashboard.js - SIMPLE CLEAN VERSION
// No complex string escaping - guaranteed to work

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*'
    },
    body: buildDashboardHTML()
  };
};

function buildDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResponsibleAI Dashboard - LIVE</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-600: #4b5563;
            --gray-900: #111827;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
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
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .logo {
            display: flex;
            align-items: center;
            font-size: 1.75rem;
            font-weight: 700;
        }
        
        .logo i { margin-right: 0.75rem; }
        
        .live-badge {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .stats {
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
        
        .main { padding: 2rem 0; }
        
        .grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
        }
        
        .section {
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
            text-align: center;
            padding: 3rem;
        }
        
        .spinner {
            border: 3px solid var(--gray-200);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .card {
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--gray-100);
        }
        
        .meta {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 0.5rem;
        }
        
        .link {
            color: var(--primary);
            text-decoration: none;
        }
        
        .link:hover { text-decoration: underline; }
        
        .badge {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .badge-high {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        
        .badge-medium {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        
        .badge-low {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .content-preview {
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
            position: relative;
            min-height: 80px;
        }
        
        .content-preview::after {
            content: "🐦";
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            font-size: 1.25rem;
        }
        
        .char-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0 1rem 0;
            font-size: 0.75rem;
            color: var(--gray-600);
        }
        
        .char-warning { color: var(--warning); }
        .char-danger { color: var(--danger); }
        
        .actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--gray-100);
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
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-primary { background: var(--primary); color: white; }
        .btn-success { background: var(--success); color: white; }
        .btn-danger { background: var(--danger); color: white; }
        .btn-secondary { background: var(--gray-600); color: white; }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--gray-100);
        }
        
        .metric:last-child { border-bottom: none; }
        
        .status {
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
        
        .status-error {
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
        
        .toast.show { transform: translateX(0); }
        .toast.success { background: var(--success); }
        .toast.error { background: var(--danger); }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--gray-600);
        }
        
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            .header-content { flex-direction: column; }
            .actions { flex-direction: column; }
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
                    <div class="live-badge">🟢 LIVE SYSTEM</div>
                </div>
                <div class="stats">
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
        <div class="main">
            <div id="statusBar" class="status">
                <i class="fas fa-wifi"></i>
                <span>Connecting to GitHub Issues API...</span>
            </div>

            <div class="grid">
                <div class="section">
                    <h2 class="section-title">
                        <i class="fas fa-edit"></i>
                        Pending Review
                    </h2>
                    <div id="contentArea">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading content from GitHub Issues...</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="section">
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
                            <span id="approvalRate2">-</span>
                        </div>
                        <div class="metric">
                            <span>Avg Quality</span>
                            <span id="avgQuality">-</span>
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">
                            <i class="fas fa-bolt"></i>
                            Quick Actions
                        </h3>
                        <button class="btn btn-primary" onclick="refreshData()" style="width: 100%; margin-bottom: 0.75rem;">
                            <i class="fas fa-sync-alt"></i>
                            Refresh Data
                        </button>
                        <button class="btn btn-success" onclick="openGitHub()" style="width: 100%;">
                            <i class="fas fa-external-link-alt"></i>
                            Open GitHub Issues
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="toastArea" class="toast"></div>

    <script>
        var app = {
            entries: [],
            analytics: {}
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', init);

        function init() {
            console.log('Starting ResponsibleAI Dashboard...');
            loadAllData();
            setInterval(loadAllData, 120000);
        }

        async function loadAllData() {
            try {
                console.log('Loading dashboard data...');
                updateStatus('🔄 Loading data from GitHub...', 'info');
                
                var baseUrl = window.location.origin;
                
                // Load entries
                var entriesResponse = await fetch(baseUrl + '/.netlify/functions/entries');
                if (!entriesResponse.ok) {
                    throw new Error('Entries API returned ' + entriesResponse.status);
                }
                var entriesData = await entriesResponse.json();
                
                // Load analytics
                var analyticsResponse = await fetch(baseUrl + '/.netlify/functions/analytics');
                if (!analyticsResponse.ok) {
                    throw new Error('Analytics API returned ' + analyticsResponse.status);
                }
                var analyticsData = await analyticsResponse.json();
                
                console.log('Entries response:', entriesData);
                console.log('Analytics response:', analyticsData);
                
                // Process entries
                if (entriesData.success) {
                    app.entries = entriesData.entries || [];
                    displayContent(app.entries);
                    updateStatus('✅ Connected to GitHub Issues API (' + app.entries.length + ' entries)', 'success');
                } else {
                    throw new Error(entriesData.error || 'Failed to load entries');
                }
                
                // Process analytics
                if (analyticsData.success) {
                    app.analytics = analyticsData.analytics || {};
                    updateDisplayedStats();
                }
                
            } catch (error) {
                console.error('Load error:', error);
                updateStatus('❌ Error: ' + error.message, 'error');
                displayContent([]);
            }
        }

        function displayContent(entries) {
            var container = document.getElementById('contentArea');
            
            if (!entries || entries.length === 0) {
                container.innerHTML = createEmptyState();
                return;
            }
            
            var html = '';
            for (var i = 0; i < entries.length; i++) {
                html += createContentCard(entries[i]);
            }
            container.innerHTML = html;
        }

        function createEmptyState() {
            return '<div class="empty-state">' +
                '<i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;"></i>' +
                '<h3>No content pending review</h3>' +
                '<p style="margin: 1rem 0;">Your dashboard is connected to GitHub but no issues found with content-review label.</p>' +
                '<button class="btn btn-primary" onclick="openGitHub()">' +
                '<i class="fas fa-plus"></i> View GitHub Issues' +
                '</button>' +
                '</div>';
        }

        function createContentCard(entry) {
            if (!entry.content_options || entry.content_options.length === 0) {
                return '<div class="card"><p>No content options available for entry ' + entry.id + '</p></div>';
            }
            
            var option = entry.content_options[0];
            var score = parseFloat(option.score) || 0;
            var voice = parseFloat(option.voice_score) || 0;
            var content = option.content || 'No content';
            var chars = content.length;
            
            var badgeClass = score >= 8 ? 'badge-high' : score >= 6 ? 'badge-medium' : 'badge-low';
            var charClass = chars > 280 ? 'char-danger' : chars > 250 ? 'char-warning' : '';
            
            var html = '<div class="card">';
            
            // Header
            html += '<div class="card-header">';
            html += '<div>';
            html += '<div class="meta"><i class="fab fa-github"></i> Generated ' + formatDate(entry.created_at) + '</div>';
            html += '<div class="meta">';
            html += '<a href="https://github.com/gbrandonwade/responsible-ai-agent/issues/' + entry.id + '" target="_blank" class="link">Issue #' + entry.id + '</a>';
            if (entry.research_context && entry.research_context.trending_topics) {
                html += ' • Topics: ' + entry.research_context.trending_topics.join(', ');
            }
            html += '</div>';
            html += '</div>';
            html += '<div class="badge ' + badgeClass + '"><i class="fas fa-star"></i> ' + score.toFixed(1) + '/10</div>';
            html += '</div>';
            
            // Content
            html += '<div class="content-preview">' + escapeHtml(content) + '</div>';
            
            // Character info
            html += '<div class="char-info">';
            html += '<span><strong>Voice Score:</strong> ' + voice.toFixed(1) + '/10</span>';
            html += '<span class="' + charClass + '">' + chars + '/280 characters</span>';
            html += '</div>';
            
            // Actions
            html += '<div class="actions">';
            if (chars <= 280) {
                html += '<button class="btn btn-success" onclick="postToTwitter(' + entry.id + ')">';
                html += '<i class="fas fa-paper-plane"></i> Post to Twitter</button>';
            } else {
                html += '<button class="btn btn-success" disabled><i class="fas fa-exclamation-triangle"></i> Too Long</button>';
            }
            html += '<button class="btn btn-primary" onclick="approveContent(' + entry.id + ')">';
            html += '<i class="fas fa-check"></i> Approve & Copy</button>';
            html += '<button class="btn btn-secondary" onclick="copyContent(' + entry.id + ')">';
            html += '<i class="fas fa-copy"></i> Copy</button>';
            html += '<button class="btn btn-danger" onclick="rejectContent(' + entry.id + ')">';
            html += '<i class="fas fa-times"></i> Reject</button>';
            html += '</div>';
            
            html += '</div>';
            return html;
        }

        function formatDate(dateString) {
            try {
                return new Date(dateString).toLocaleString();
            } catch (e) {
                return dateString;
            }
        }

        function escapeHtml(text) {
            var div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        }

        function updateStatus(message, type) {
            var statusEl = document.getElementById('statusBar');
            var iconClass = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle';
            statusEl.innerHTML = '<i class="fas fa-' + iconClass + '"></i><span>' + message + '</span>';
            statusEl.className = 'status' + (type === 'error' ? ' status-error' : '');
        }

        function updateDisplayedStats() {
            var stats = app.analytics;
            
            document.getElementById('lastUpdate').textContent = stats.last_generated ? 
                formatDate(stats.last_generated) : 'Never';
            document.getElementById('qualityAvg').textContent = (stats.average_quality_score || 0).toFixed(1) + '/10';
            document.getElementById('approvalRate').textContent = Math.round(stats.approval_rate || 0) + '%';
            
            document.getElementById('totalEntries').textContent = stats.total_entries || 0;
            document.getElementById('weeklyEntries').textContent = stats.recent_entries || 0;
            document.getElementById('approvalRate2').textContent = Math.round(stats.approval_rate || 0) + '%';
            document.getElementById('avgQuality').textContent = (stats.average_quality_score || 0).toFixed(1) + '/10';
        }

        // Action functions
        async function postToTwitter(entryId) {
            if (!confirm('Post this content to Twitter?')) return;
            
            var entry = findEntry(entryId);
            if (!entry || !entry.content_options[0]) {
                showToast('Entry not found', 'error');
                return;
            }
            
            var content = entry.content_options[0].content;
            
            try {
                showToast('Posting to Twitter...', 'success');
                
                var response = await fetch(window.location.origin + '/.netlify/functions/post-to-twitter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        content: content,
                        entryId: entryId,
                        githubIssueNumber: entryId
                    })
                });
                
                var result = await response.json();
                
                if (result.success) {
                    showToast('✅ Posted to Twitter!', 'success');
                    await updateEntryStatus(entryId, 'approved');
                    setTimeout(loadAllData, 1000);
                    if (result.tweet && result.tweet.url && confirm('Open tweet?')) {
                        window.open(result.tweet.url, '_blank');
                    }
                } else {
                    throw new Error(result.error || 'Post failed');
                }
                
            } catch (error) {
                console.error('Twitter error:', error);
                showToast('❌ Failed: ' + error.message, 'error');
            }
        }

        async function approveContent(entryId) {
            var entry = findEntry(entryId);
            if (!entry || !entry.content_options[0]) return;
            
            var content = entry.content_options[0].content;
            
            try {
                await copyToClipboard(content);
                await updateEntryStatus(entryId, 'approved');
                showToast('✅ Approved and copied!', 'success');
                setTimeout(loadAllData, 500);
            } catch (error) {
                showToast('❌ Failed to approve', 'error');
            }
        }

        async function copyContent(entryId) {
            var entry = findEntry(entryId);
            if (!entry || !entry.content_options[0]) return;
            
            var content = entry.content_options[0].content;
            
            try {
                await copyToClipboard(content);
                showToast('📋 Copied!', 'success');
            } catch (error) {
                showToast('❌ Copy failed', 'error');
            }
        }

        async function rejectContent(entryId) {
            var reason = prompt('Rejection reason (optional):');
            if (reason === null) return;
            
            try {
                await updateEntryStatus(entryId, 'rejected');
                showToast('❌ Rejected', 'error');
                setTimeout(loadAllData, 500);
            } catch (error) {
                showToast('❌ Failed to reject', 'error');
            }
        }

        async function copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
            } catch (error) {
                var textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        }

        async function updateEntryStatus(entryId, status) {
            var response = await fetch(window.location.origin + '/.netlify/functions/entry-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryId: entryId, status: status })
            });
            
            var result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Update failed');
            }
        }

        function findEntry(entryId) {
            return app.entries.find(function(e) { return e.id == entryId; });
        }

        function refreshData() {
            showToast('🔄 Refreshing...', 'success');
            loadAllData();
        }

        function openGitHub() {
            window.open('https://github.com/gbrandonwade/responsible-ai-agent/issues', '_blank');
        }

        function showToast(message, type) {
            var toast = document.getElementById('toastArea');
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
}

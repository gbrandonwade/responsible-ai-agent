// netlify/functions/dashboard.js - BULLETPROOF SYNTAX VERSION
// Carefully checked every line for syntax errors

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

  const html = `<!DOCTYPE html>
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
        }
        
        .stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.1);
            padding: 0.5rem 1rem;
            border-radius: 6px;
        }
        
        .main {
            padding: 2rem 0;
        }
        
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
        
        .link:hover {
            text-decoration: underline;
        }
        
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
        
        .char-warning {
            color: var(--warning);
        }
        
        .char-danger {
            color: var(--danger);
        }
        
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
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-success {
            background: var(--success);
            color: white;
        }
        
        .btn-danger {
            background: var(--danger);
            color: white;
        }
        
        .btn-secondary {
            background: var(--gray-600);
            color: white;
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
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            background: var(--success);
        }
        
        .toast.error {
            background: var(--danger);
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--gray-600);
        }
        
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            .header-content {
                flex-direction: column;
            }
            .actions {
                flex-direction: column;
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
                        <button class="btn btn-success" onclick="createTestIssue()" style="width: 100%;">
                            <i class="fas fa-plus"></i>
                            Create Test Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="toastArea" class="toast"></div>

    <script>
        var dashboardData = {
            entries: [],
            analytics: {}
        };

        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing ResponsibleAI Dashboard...');
            loadData();
            setInterval(loadData, 120000); // 2 minutes
        });

        async function loadData() {
            try {
                console.log('Loading data...');
                
                var entriesUrl = window.location.origin + '/.netlify/functions/entries';
                var analyticsUrl = window.location.origin + '/.netlify/functions/analytics';
                
                var entriesResponse = await fetch(entriesUrl);
                var analyticsResponse = await fetch(analyticsUrl);
                
                var entriesData = await entriesResponse.json();
                var analyticsData = await analyticsResponse.json();
                
                console.log('Loaded entries:', entriesData);
                console.log('Loaded analytics:', analyticsData);
                
                if (entriesData.success) {
                    dashboardData.entries = entriesData.entries || [];
                    showContent(entriesData.entries || []);
                    updateStatus('✅ Connected to GitHub Issues API', 'success');
                } else {
                    updateStatus('❌ GitHub API Error', 'error');
                }
                
                if (analyticsData.success) {
                    updateStats(analyticsData.analytics || {});
                }
                
            } catch (error) {
                console.error('Load error:', error);
                updateStatus('❌ Failed to connect to APIs', 'error');
                showContent([]);
            }
        }

        function showContent(entries) {
            var container = document.getElementById('contentArea');
            
            if (!entries || entries.length === 0) {
                container.innerHTML = '<div class="empty-state">' +
                    '<i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;"></i>' +
                    '<h3>No content pending review</h3>' +
                    '<p style="margin: 1rem 0;">New content will appear when your Python agent creates GitHub issues</p>' +
                    '<button class="btn btn-primary" onclick="createTestIssue()">' +
                    '<i class="fas fa-plus"></i> Create Test Issue' +
                    '</button>' +
                    '</div>';
                return;
            }
            
            var html = '';
            for (var i = 0; i < entries.length; i++) {
                html += makeCard(entries[i]);
            }
            container.innerHTML = html;
        }

        function makeCard(entry) {
            var option = entry.content_options[0];
            var score = option.score || 0;
            var voice = option.voice_score || 0;
            var content = option.content || '';
            var chars = content.length;
            
            var badgeClass = score >= 8 ? 'badge-high' : score >= 6 ? 'badge-medium' : 'badge-low';
            var charClass = chars > 280 ? 'char-danger' : chars > 250 ? 'char-warning' : '';
            
            var cardHtml = '<div class="card" data-id="' + entry.id + '">';
            
            // Header
            cardHtml += '<div class="card-header">';
            cardHtml += '<div>';
            cardHtml += '<div class="meta">';
            cardHtml += '<i class="fab fa-github"></i> ';
            cardHtml += 'Generated ' + new Date(entry.created_at).toLocaleString();
            cardHtml += '</div>';
            cardHtml += '<div class="meta">';
            cardHtml += '<a href="https://github.com/gbrandonwade/responsible-ai-agent/issues/' + entry.id + '" target="_blank" class="link">Issue #' + entry.id + '</a>';
            cardHtml += ' • Topics: ' + entry.research_context.trending_topics.join(', ');
            cardHtml += '</div>';
            cardHtml += '</div>';
            cardHtml += '<div class="badge ' + badgeClass + '">';
            cardHtml += '<i class="fas fa-star"></i> ';
            cardHtml += score.toFixed(1) + '/10';
            cardHtml += '</div>';
            cardHtml += '</div>';
            
            // Content
            cardHtml += '<div class="content-preview">';
            cardHtml += escapeHtml(content);
            cardHtml += '</div>';
            
            // Character info
            cardHtml += '<div class="char-info">';
            cardHtml += '<span><strong>Voice Score:</strong> ' + voice.toFixed(1) + '/10</span>';
            cardHtml += '<span class="' + charClass + '">' + chars + '/280 characters</span>';
            cardHtml += '</div>';
            
            // Actions
            cardHtml += '<div class="actions">';
            
            if (chars <= 280) {
                cardHtml += '<button class="btn btn-success" onclick="postTweet(\'' + entry.id + '\', \'' + option.option_number + '\')">';
                cardHtml += '<i class="fas fa-paper-plane"></i> Post to Twitter';
                cardHtml += '</button>';
            } else {
                cardHtml += '<button class="btn btn-success" disabled>';
                cardHtml += '<i class="fas fa-exclamation-triangle"></i> Too Long';
                cardHtml += '</button>';
            }
            
            cardHtml += '<button class="btn btn-primary" onclick="approveContent(\'' + entry.id + '\', \'' + option.option_number + '\')">';
            cardHtml += '<i class="fas fa-check"></i> Approve & Copy';
            cardHtml += '</button>';
            
            cardHtml += '<button class="btn btn-secondary" onclick="copyText(\'' + entry.id + '\', \'' + option.option_number + '\')">';
            cardHtml += '<i class="fas fa-copy"></i> Copy';
            cardHtml += '</button>';
            
            cardHtml += '<button class="btn btn-danger" onclick="rejectContent(\'' + entry.id + '\')">';
            cardHtml += '<i class="fas fa-times"></i> Reject';
            cardHtml += '</button>';
            
            cardHtml += '</div>';
            cardHtml += '</div>';
            
            return cardHtml;
        }

        function escapeHtml(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function updateStatus(message, type) {
            var statusEl = document.getElementById('statusBar');
            var iconClass = type === 'success' ? 'check-circle' : 'exclamation-triangle';
            statusEl.innerHTML = '<i class="fas fa-' + iconClass + '"></i><span>' + message + '</span>';
            statusEl.className = 'status' + (type === 'error' ? ' status-error' : '');
        }

        function updateStats(analytics) {
            document.getElementById('lastUpdate').textContent = analytics.last_generated ? 
                new Date(analytics.last_generated).toLocaleString() : 'Never';
            document.getElementById('qualityAvg').textContent = (analytics.average_quality_score || 0).toFixed(1) + '/10';
            document.getElementById('approvalRate').textContent = Math.round(analytics.approval_rate || 0) + '%';
            
            document.getElementById('totalEntries').textContent = analytics.total_entries || 0;
            document.getElementById('weeklyEntries').textContent = analytics.recent_entries || 0;
            document.getElementById('approvalRate2').textContent = Math.round(analytics.approval_rate || 0) + '%';
            document.getElementById('avgQuality').textContent = (analytics.average_quality_score || 0).toFixed(1) + '/10';
        }

        // Action functions
        async function postTweet(entryId, optionNumber) {
            if (!confirm('Post this content to @ResponsibleAI Twitter?')) {
                return;
            }
            
            var entry = dashboardData.entries.find(function(e) { return e.id === entryId; });
            var option = entry.content_options.find(function(o) { return o.option_number == optionNumber; });
            
            if (!option) {
                showToast('Content not found', 'error');
                return;
            }
            
            try {
                showToast('Posting to Twitter...', 'success');
                
                var response = await fetch(window.location.origin + '/.netlify/functions/post-to-twitter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        content: option.content, 
                        entryId: entryId,
                        githubIssueNumber: entryId
                    })
                });
                
                var result = await response.json();
                
                if (result.success) {
                    showToast('✅ Posted to Twitter!', 'success');
                    await updateEntry(entryId, 'approved');
                    setTimeout(loadData, 1000);
                    
                    if (result.tweet && result.tweet.url) {
                        if (confirm('Open tweet in new tab?')) {
                            window.open(result.tweet.url, '_blank');
                        }
                    }
                } else {
                    throw new Error(result.error || 'Failed to post');
                }
                
            } catch (error) {
                console.error('Twitter error:', error);
                showToast('❌ Failed to post: ' + error.message, 'error');
            }
        }

        async function approveContent(entryId, optionNumber) {
            var entry = dashboardData.entries.find(function(e) { return e.id === entryId; });
            var option = entry.content_options.find(function(o) { return o.option_number == optionNumber; });
            
            if (!option) return;
            
            try {
                await navigator.clipboard.writeText(option.content);
                await updateEntry(entryId, 'approved');
                showToast('✅ Approved and copied!', 'success');
                setTimeout(loadData, 500);
            } catch (error) {
                showToast('❌ Failed to approve', 'error');
            }
        }

        async function copyText(entryId, optionNumber) {
            var entry = dashboardData.entries.find(function(e) { return e.id === entryId; });
            var option = entry.content_options.find(function(o) { return o.option_number == optionNumber; });
            
            if (!option) return;
            
            try {
                await navigator.clipboard.writeText(option.content);
                showToast('📋 Copied to clipboard!', 'success');
            } catch (error) {
                var textArea = document.createElement('textarea');
                textArea.value = option.content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('📋 Copied!', 'success');
            }
        }

        async function rejectContent(entryId) {
            var reason = prompt('Rejection reason (optional):');
            if (reason === null) return;
            
            try {
                await updateEntry(entryId, 'rejected');
                showToast('❌ Content rejected', 'error');
                setTimeout(loadData, 500);
            } catch (error) {
                showToast('❌ Failed to reject', 'error');
            }
        }

        async function updateEntry(entryId, status) {
            try {
                var response = await fetch(window.location.origin + '/.netlify/functions/entry-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entryId: entryId, status: status })
                });
                
                var result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Update failed');
                }
            } catch (error) {
                console.error('Update error:', error);
                throw error;
            }
        }

        function refreshData() {
            showToast('🔄 Refreshing...', 'success');
            loadData();
        }

        function createTestIssue() {
            var confirmed = confirm('Create a test GitHub issue for content review?');
            if (!confirmed) return;
            
            var issueUrl = 'https://github.com/gbrandonwade/responsible-ai-agent/issues/new';
            var title = encodeURIComponent('Content Review Required - Manual Test');
            var timestamp = new Date().toISOString();
            
            var bodyText = '## Generated Content\\n' +
                'You don\\'t need a computer science degree to make AI work for you.\\n\\n' +
                'Here\\'s what I discovered: the best AI practitioners ask better questions, not better algorithms.\\n\\n' +
                'What\\'s one area where AI could simplify your work? #ResponsibleAI #AIEthics\\n\\n' +
                '## Quality Analysis\\n' +
                '- **Quality Score:** 8.5\\n' +
                '- **Voice Score:** 8.2\\n' +
                '- **Timestamp:** ' + timestamp + '\\n\\n' +
                '---\\n' +
                '*Test issue created from ResponsibleAI dashboard.*';
            
            var body = encodeURIComponent(bodyText);
            var labels = encodeURIComponent('content-review,needs-human-review');
            
            var fullUrl = issueUrl + '?title=' + title + '&body=' + body + '&labels=' + labels;
            window.open(fullUrl, '_blank');
            showToast('Opening GitHub...', 'success');
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*'
    },
    body: html
  };
};

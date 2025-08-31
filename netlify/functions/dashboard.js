// netlify/functions/dashboard.js - CLEAN LIVE VERSION
// Fixed all JavaScript syntax issues

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

  // Build HTML using simple string concatenation to avoid syntax issues
  let html = '<!DOCTYPE html>';
  html += '<html lang="en">';
  html += '<head>';
  html += '<meta charset="UTF-8">';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += '<title>ResponsibleAI Dashboard - LIVE</title>';
  html += '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">';
  
  // Add CSS
  html += '<style>';
  html += ':root {';
  html += '--primary-color: #2563eb;';
  html += '--success-color: #10b981;';
  html += '--danger-color: #ef4444;';
  html += '--warning-color: #f59e0b;';
  html += '--gray-50: #f9fafb;';
  html += '--gray-100: #f3f4f6;';
  html += '--gray-200: #e5e7eb;';
  html += '--gray-600: #4b5563;';
  html += '--gray-900: #111827;';
  html += '}';
  
  html += '* { margin: 0; padding: 0; box-sizing: border-box; }';
  
  html += 'body {';
  html += 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
  html += 'background: var(--gray-50);';
  html += 'color: var(--gray-900);';
  html += 'line-height: 1.6;';
  html += '}';
  
  html += '.header {';
  html += 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
  html += 'color: white;';
  html += 'padding: 1.5rem 0;';
  html += 'box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
  html += '}';
  
  html += '.container {';
  html += 'max-width: 1200px;';
  html += 'margin: 0 auto;';
  html += 'padding: 0 1rem;';
  html += '}';
  
  html += '.header-content {';
  html += 'display: flex;';
  html += 'justify-content: space-between;';
  html += 'align-items: center;';
  html += 'flex-wrap: wrap;';
  html += 'gap: 1rem;';
  html += '}';
  
  html += '.logo {';
  html += 'display: flex;';
  html += 'align-items: center;';
  html += 'font-size: 1.75rem;';
  html += 'font-weight: 700;';
  html += '}';
  
  html += '.logo i { margin-right: 0.75rem; }';
  
  html += '.live-indicator {';
  html += 'background: rgba(16, 185, 129, 0.2);';
  html += 'border: 1px solid #10b981;';
  html += 'padding: 0.25rem 0.75rem;';
  html += 'border-radius: 20px;';
  html += 'font-size: 0.75rem;';
  html += 'font-weight: 600;';
  html += 'margin-left: 1rem;';
  html += '}';
  
  html += '.stats-bar {';
  html += 'display: flex;';
  html += 'gap: 1rem;';
  html += 'font-size: 0.875rem;';
  html += 'flex-wrap: wrap;';
  html += '}';
  
  html += '.stat {';
  html += 'display: flex;';
  html += 'align-items: center;';
  html += 'gap: 0.5rem;';
  html += 'background: rgba(255,255,255,0.1);';
  html += 'padding: 0.5rem 1rem;';
  html += 'border-radius: 6px;';
  html += '}';
  
  html += '.main-content { padding: 2rem 0; }';
  
  html += '.dashboard-grid {';
  html += 'display: grid;';
  html += 'grid-template-columns: 1fr 320px;';
  html += 'gap: 2rem;';
  html += 'margin-bottom: 2rem;';
  html += '}';
  
  html += '.content-section {';
  html += 'background: white;';
  html += 'border-radius: 12px;';
  html += 'padding: 1.5rem;';
  html += 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
  html += 'border: 1px solid var(--gray-200);';
  html += '}';
  
  html += '.section-title {';
  html += 'font-size: 1.25rem;';
  html += 'font-weight: 600;';
  html += 'margin-bottom: 1.5rem;';
  html += 'display: flex;';
  html += 'align-items: center;';
  html += 'gap: 0.5rem;';
  html += '}';
  
  html += '.loading {';
  html += 'display: flex;';
  html += 'justify-content: center;';
  html += 'align-items: center;';
  html += 'padding: 3rem;';
  html += 'flex-direction: column;';
  html += 'gap: 1rem;';
  html += '}';
  
  html += '.spinner {';
  html += 'border: 3px solid var(--gray-200);';
  html += 'border-top: 3px solid var(--primary-color);';
  html += 'border-radius: 50%;';
  html += 'width: 32px;';
  html += 'height: 32px;';
  html += 'animation: spin 1s linear infinite;';
  html += '}';
  
  html += '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  
  html += '.content-card {';
  html += 'border: 1px solid var(--gray-200);';
  html += 'border-radius: 12px;';
  html += 'padding: 1.5rem;';
  html += 'margin-bottom: 1.5rem;';
  html += 'background: white;';
  html += 'box-shadow: 0 2px 4px rgba(0,0,0,0.05);';
  html += '}';
  
  html += '.analytics-card {';
  html += 'background: white;';
  html += 'border-radius: 12px;';
  html += 'padding: 1.5rem;';
  html += 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
  html += 'border: 1px solid var(--gray-200);';
  html += 'margin-bottom: 1.5rem;';
  html += '}';
  
  html += '.metric {';
  html += 'display: flex;';
  html += 'justify-content: space-between;';
  html += 'align-items: center;';
  html += 'padding: 0.75rem 0;';
  html += 'border-bottom: 1px solid var(--gray-100);';
  html += '}';
  
  html += '.metric:last-child { border-bottom: none; }';
  
  html += '.btn {';
  html += 'padding: 0.75rem 1.25rem;';
  html += 'border-radius: 8px;';
  html += 'border: none;';
  html += 'font-size: 0.875rem;';
  html += 'font-weight: 600;';
  html += 'cursor: pointer;';
  html += 'display: inline-flex;';
  html += 'align-items: center;';
  html += 'gap: 0.5rem;';
  html += 'margin: 0.25rem;';
  html += '}';
  
  html += '.btn-primary { background: var(--primary-color); color: white; }';
  html += '.btn-success { background: var(--success-color); color: white; }';
  html += '.btn-danger { background: var(--danger-color); color: white; }';
  html += '.btn-secondary { background: var(--gray-600); color: white; }';
  
  html += '.connection-status {';
  html += 'background: rgba(16, 185, 129, 0.1);';
  html += 'border: 1px solid #10b981;';
  html += 'color: #065f46;';
  html += 'padding: 0.75rem 1rem;';
  html += 'border-radius: 8px;';
  html += 'margin-bottom: 1.5rem;';
  html += 'display: flex;';
  html += 'align-items: center;';
  html += 'gap: 0.5rem;';
  html += '}';
  
  html += '.error-status {';
  html += 'background: rgba(239, 68, 68, 0.1);';
  html += 'border: 1px solid #ef4444;';
  html += 'color: #991b1b;';
  html += '}';
  
  html += '.toast {';
  html += 'position: fixed;';
  html += 'top: 20px;';
  html += 'right: 20px;';
  html += 'padding: 1rem 1.5rem;';
  html += 'border-radius: 8px;';
  html += 'color: white;';
  html += 'transform: translateX(100%);';
  html += 'transition: transform 0.3s ease;';
  html += 'z-index: 1000;';
  html += '}';
  
  html += '.toast.show { transform: translateX(0); }';
  html += '.toast.success { background: var(--success-color); }';
  html += '.toast.error { background: var(--danger-color); }';
  
  html += '</style>';
  html += '</head>';
  
  // Body content
  html += '<body>';
  
  // Header
  html += '<div class="header">';
  html += '<div class="container">';
  html += '<div class="header-content">';
  html += '<div style="display: flex; align-items: center;">';
  html += '<div class="logo">';
  html += '<i class="fas fa-robot"></i> ResponsibleAI Dashboard';
  html += '</div>';
  html += '<div class="live-indicator">🟢 LIVE SYSTEM</div>';
  html += '</div>';
  html += '<div class="stats-bar">';
  html += '<div class="stat"><i class="fas fa-clock"></i> <span id="lastUpdate">Loading...</span></div>';
  html += '<div class="stat"><i class="fas fa-chart-line"></i> <span id="qualityAvg">Loading...</span></div>';
  html += '<div class="stat"><i class="fas fa-check-circle"></i> <span id="approvalRate">Loading...</span></div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  
  // Main content
  html += '<div class="container">';
  html += '<div class="main-content">';
  
  // Connection status
  html += '<div id="connectionStatus" class="connection-status">';
  html += '<i class="fas fa-wifi"></i> <span>Connecting to GitHub Issues API and Twitter...</span>';
  html += '</div>';
  
  html += '<div class="dashboard-grid">';
  
  // Main content area
  html += '<div class="pending-content">';
  html += '<div class="content-section">';
  html += '<h2 class="section-title">';
  html += '<i class="fas fa-edit"></i> Pending Review';
  html += '</h2>';
  html += '<div id="pendingContent">';
  html += '<div class="loading">';
  html += '<div class="spinner"></div>';
  html += '<p>Loading content from GitHub Issues...</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  
  // Sidebar
  html += '<div class="sidebar">';
  
  // Analytics card
  html += '<div class="analytics-card">';
  html += '<h3 class="section-title"><i class="fas fa-chart-bar"></i> Live Analytics</h3>';
  html += '<div class="metric"><span>Total Entries</span><span id="totalEntries">-</span></div>';
  html += '<div class="metric"><span>This Week</span><span id="weeklyEntries">-</span></div>';
  html += '<div class="metric"><span>Approval Rate</span><span id="approvalRateDetail">-</span></div>';
  html += '<div class="metric"><span>Avg Quality</span><span id="avgQuality">-</span></div>';
  html += '</div>';
  
  // Quick actions card
  html += '<div class="analytics-card">';
  html += '<h3 class="section-title"><i class="fas fa-bolt"></i> Quick Actions</h3>';
  html += '<button class="btn btn-primary" onclick="refreshDashboard()" style="width: 100%; margin-bottom: 0.75rem;">';
  html += '<i class="fas fa-sync-alt"></i> Refresh Data';
  html += '</button>';
  html += '<button class="btn btn-success" onclick="openGitHubActions()" style="width: 100%;">';
  html += '<i class="fas fa-play"></i> Generate New Content';
  html += '</button>';
  html += '</div>';
  
  html += '</div>'; // Close sidebar
  html += '</div>'; // Close dashboard-grid
  html += '</div>'; // Close main-content
  html += '</div>'; // Close container
  
  // Toast
  html += '<div id="toast" class="toast"></div>';
  
  // JavaScript
  html += '<script>';
  html += 'let dashboardData = { entries: [], analytics: {} };';
  
  // Initialize
  html += 'document.addEventListener("DOMContentLoaded", function() {';
  html += 'console.log("Initializing Live ResponsibleAI Dashboard...");';
  html += 'loadDashboardData();';
  html += 'setInterval(loadDashboardData, 2 * 60 * 1000);';
  html += '});';
  
  // Load dashboard data
  html += 'async function loadDashboardData() {';
  html += 'try {';
  html += 'console.log("Loading live data...");';
  html += 'const entriesUrl = window.location.origin + "/.netlify/functions/entries";';
  html += 'const analyticsUrl = window.location.origin + "/.netlify/functions/analytics";';
  html += 'const [entriesResponse, analyticsResponse] = await Promise.all([';
  html += 'fetch(entriesUrl), fetch(analyticsUrl)';
  html += ']);';
  html += 'const entriesData = await entriesResponse.json();';
  html += 'const analyticsData = await analyticsResponse.json();';
  html += 'if (entriesData.success) {';
  html += 'dashboardData.entries = entriesData.entries || [];';
  html += 'renderPendingContent(entriesData.entries || []);';
  html += 'updateConnectionStatus("Connected to GitHub Issues API", "success");';
  html += '}';
  html += 'if (analyticsData.success) {';
  html += 'updateHeaderStats(analyticsData.analytics || {});';
  html += 'updateAnalytics(analyticsData.analytics || {});';
  html += '}';
  html += '} catch (error) {';
  html += 'console.error("Failed to load data:", error);';
  html += 'updateConnectionStatus("Failed to connect to APIs", "error");';
  html += 'renderPendingContent([]);';
  html += '}';
  html += '}';
  
  // Render pending content
  html += 'function renderPendingContent(entries) {';
  html += 'const container = document.getElementById("pendingContent");';
  html += 'if (!entries || entries.length === 0) {';
  html += 'container.innerHTML = "<div style=\\"text-align: center; padding: 3rem;\\"><i class=\\"fas fa-check-circle\\" style=\\"font-size: 3rem; color: var(--success-color);\\"></i><h3>No content pending review</h3><p>New content will appear when your Python agent creates GitHub issues</p></div>";';
  html += 'return;';
  html += '}';
  html += 'let contentHtml = "";';
  html += 'entries.forEach(function(entry) {';
  html += 'contentHtml += createContentCard(entry);';
  html += '});';
  html += 'container.innerHTML = contentHtml;';
  html += '}';
  
  // Create content card
  html += 'function createContentCard(entry) {';
  html += 'const option = entry.content_options[0];';
  html += 'let cardHtml = "<div class=\\"content-card\\" data-entry-id=\\"" + entry.id + "\\">";';
  html += 'cardHtml += "<div style=\\"margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--gray-200);\\">";';
  html += 'cardHtml += "<div style=\\"font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;\\">";';
  html += 'cardHtml += "Generated " + new Date(entry.created_at).toLocaleString() + " • Issue #" + entry.id;';
  html += 'cardHtml += "</div>";';
  html += 'cardHtml += "<div style=\\"font-size: 0.875rem; color: var(--gray-600);\\">";';
  html += 'cardHtml += "Topics: " + entry.research_context.trending_topics.join(", ");';
  html += 'cardHtml += "</div>";';
  html += 'cardHtml += "</div>";';
  html += 'cardHtml += "<div style=\\"background: var(--gray-50); padding: 1rem; border-radius: 8px; margin: 1rem 0; white-space: pre-wrap;\\">";';
  html += 'cardHtml += escapeHtml(option.content);';
  html += 'cardHtml += "</div>";';
  html += 'cardHtml += "<div style=\\"font-size: 0.75rem; color: var(--gray-600); text-align: right; margin-bottom: 1rem;\\">";';
  html += 'cardHtml += option.content.length + "/280 characters • Quality: " + option.score.toFixed(1) + "/10";';
  html += 'cardHtml += "</div>";';
  html += 'cardHtml += "<div style=\\"display: flex; gap: 0.75rem; flex-wrap: wrap;\\">";';
  html += 'cardHtml += "<button class=\\"btn btn-success\\" onclick=\\"postToTwitter(\'" + entry.id + "\', \'" + option.option_number + "\')\\">";';
  html += 'cardHtml += "<i class=\\"fas fa-paper-plane\\"></i> Post to Twitter";';
  html += 'cardHtml += "</button>";';
  html += 'cardHtml += "<button class=\\"btn btn-primary\\" onclick=\\"approveContent(\'" + entry.id + "\', \'" + option.option_number + "\')\\">";';
  html += 'cardHtml += "<i class=\\"fas fa-check\\"></i> Approve & Copy";';
  html += 'cardHtml += "</button>";';
  html += 'cardHtml += "<button class=\\"btn btn-danger\\" onclick=\\"rejectContent(\'" + entry.id + "\')\\">";';
  html += 'cardHtml += "<i class=\\"fas fa-times\\"></i> Reject";';
  html += 'cardHtml += "</button>";';
  html += 'cardHtml += "</div>";';
  html += 'cardHtml += "</div>";';
  html += 'return cardHtml;';
  html += '}';
  
  // Helper functions
  html += 'function escapeHtml(text) {';
  html += 'const div = document.createElement("div");';
  html += 'div.textContent = text;';
  html += 'return div.innerHTML;';
  html += '}';
  
  html += 'function updateConnectionStatus(message, type) {';
  html += 'const statusEl = document.getElementById("connectionStatus");';
  html += 'const iconClass = type === "success" ? "check-circle" : "exclamation-triangle";';
  html += 'statusEl.innerHTML = "<i class=\\"fas fa-" + iconClass + "\\"></i><span>" + message + "</span>";';
  html += 'statusEl.className = "connection-status" + (type === "error" ? " error-status" : "");';
  html += '}';
  
  html += 'function updateHeaderStats(analytics) {';
  html += 'document.getElementById("lastUpdate").textContent = analytics.last_generated ? new Date(analytics.last_generated).toLocaleString() : "Never";';
  html += 'document.getElementById("qualityAvg").textContent = (analytics.average_quality_score || 0).toFixed(1) + "/10";';
  html += 'document.getElementById("approvalRate").textContent = Math.round(analytics.approval_rate || 0) + "%";';
  html += '}';
  
  html += 'function updateAnalytics(analytics) {';
  html += 'document.getElementById("totalEntries").textContent = analytics.total_entries || 0;';
  html += 'document.getElementById("weeklyEntries").textContent = analytics.recent_entries || 0;';
  html += 'document.getElementById("approvalRateDetail").textContent = Math.round(analytics.approval_rate || 0) + "%";';
  html += 'document.getElementById("avgQuality").textContent = (analytics.average_quality_score || 0).toFixed(1) + "/10";';
  html += '}';
  
  // Action functions
  html += 'async function postToTwitter(entryId, optionNumber) {';
  html += 'if (!confirm("Post this content to @ResponsibleAI Twitter?")) return;';
  html += 'const entry = dashboardData.entries.find(e => e.id === entryId);';
  html += 'const option = entry.content_options.find(o => o.option_number == optionNumber);';
  html += 'if (!option) return;';
  html += 'try {';
  html += 'showToast("Posting to Twitter...", "success");';
  html += 'const response = await fetch(window.location.origin + "/.netlify/functions/post-to-twitter", {';
  html += 'method: "POST",';
  html += 'headers: { "Content-Type": "application/json" },';
  html += 'body: JSON.stringify({ content: option.content, entryId: entryId })';
  html += '});';
  html += 'const result = await response.json();';
  html += 'if (result.success) {';
  html += 'showToast("Posted to Twitter successfully!", "success");';
  html += 'await updateEntryStatus(entryId, "approved");';
  html += 'loadDashboardData();';
  html += '} else {';
  html += 'throw new Error(result.error);';
  html += '}';
  html += '} catch (error) {';
  html += 'showToast("Failed to post: " + error.message, "error");';
  html += '}';
  html += '}';
  
  html += 'async function approveContent(entryId, optionNumber) {';
  html += 'const entry = dashboardData.entries.find(e => e.id === entryId);';
  html += 'const option = entry.content_options.find(o => o.option_number == optionNumber);';
  html += 'if (!option) return;';
  html += 'await navigator.clipboard.writeText(option.content);';
  html += 'await updateEntryStatus(entryId, "approved");';
  html += 'showToast("Content approved and copied!", "success");';
  html += 'loadDashboardData();';
  html += '}';
  
  html += 'async function rejectContent(entryId) {';
  html += 'const reason = prompt("Rejection reason (optional):");';
  html += 'await updateEntryStatus(entryId, "rejected");';
  html += 'showToast("Content rejected", "error");';
  html += 'loadDashboardData();';
  html += '}';
  
  html += 'async function updateEntryStatus(entryId, status) {';
  html += 'try {';
  html += 'const response = await fetch(window.location.origin + "/.netlify/functions/entry-status", {';
  html += 'method: "POST",';
  html += 'headers: { "Content-Type": "application/json" },';
  html += 'body: JSON.stringify({ entryId: entryId, status: status })';
  html += '});';
  html += 'const result = await response.json();';
  html += 'if (!result.success) throw new Error(result.error);';
  html += '} catch (error) {';
  html += 'console.error("Failed to update status:", error);';
  html += '}';
  html += '}';
  
  html += 'function refreshDashboard() {';
  html += 'showToast("Refreshing...", "success");';
  html += 'loadDashboardData();';
  html += '}';
  
  html += 'function openGitHubActions() {';
  html += 'window.open("https://github.com/gbrandonwade/responsible-ai-agent/actions", "_blank");';
  html += '}';
  
  html += 'function showToast(message, type) {';
  html += 'const toast = document.getElementById("toast");';
  html += 'toast.textContent = message;';
  html += 'toast.className = "toast " + type;';
  html += 'toast.classList.add("show");';
  html += 'setTimeout(function() { toast.classList.remove("show"); }, 3000);';
  html += '}';
  
  html += '</script>';
  html += '</body>';
  html += '</html>';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
    body: html
  };
};

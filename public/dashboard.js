/**
 * SMS Dashboard Frontend Logic
 */

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Mark button as active
    event.target.classList.add('active');

    // Load data if needed
    if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'stats') {
        loadStats();
    }
}

// ============================================================================
// SEND SMS
// ============================================================================

function sendSingleSMS() {
    const to = document.getElementById('singleTo').value.trim();
    const from = document.getElementById('singleFrom').value.trim();
    const content = document.getElementById('singleContent').value.trim();

    // Validation
    if (!to || !from || !content) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    if (!to.match(/^\+\d{1,3}\d{4,14}$/)) {
        showStatus('Invalid phone number. Use E164 format: +233123456789', 'error');
        return;
    }

    if (from.length > 11 || !/^[a-zA-Z0-9]+$/.test(from)) {
        showStatus('Sender ID must be max 11 alphanumeric characters', 'error');
        return;
    }

    sendSMSRequest({
        to: to,
        from: from,
        content: content
    }, 'single');
}

function sendBulkSMS() {
    const recipientsText = document.getElementById('bulkRecipients').value.trim();
    const from = document.getElementById('bulkFrom').value.trim();
    const content = document.getElementById('bulkContent').value.trim();

    // Parse recipients
    const recipients = recipientsText
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

    // Validation
    if (recipients.length === 0) {
        showStatus('Please enter at least one recipient', 'error');
        return;
    }

    if (!from || !content) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    // Validate all recipients
    const invalidRecipients = recipients.filter(
        r => !r.match(/^\+\d{1,3}\d{4,14}$/)
    );

    if (invalidRecipients.length > 0) {
        showStatus(
            `Invalid phone numbers: ${invalidRecipients.join(', ')}`,
            'error'
        );
        return;
    }

    sendSMSRequest({
        recipients: recipients,
        from: from,
        content: content
    }, 'bulk');
}

async function sendSMSRequest(data, type) {
    const endpoint = type === 'bulk' ? '/api/sms/bulk' : '/api/sms/send';
    const button = event.target;
    
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatus(
                type === 'bulk' 
                    ? `✅ ${result.sent}/${result.total} messages sent successfully!`
                    : `✅ SMS sent successfully! (ID: ${result.messageId})`,
                'success'
            );

            // Clear forms
            if (type === 'single') {
                document.getElementById('singleContent').value = '';
                document.getElementById('singleTo').value = '';
                updateCharCount();
            } else {
                document.getElementById('bulkContent').value = '';
                document.getElementById('bulkRecipients').value = '';
                updateBulkCharCount();
            }

            // Reload history
            setTimeout(() => loadHistory(), 1000);
        } else {
            showStatus(`❌ Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Network error. Please try again.', 'error');
    } finally {
        button.disabled = false;
        button.textContent = type === 'bulk' ? 'Send to All Recipients' : 'Send SMS';
    }
}

// ============================================================================
// LOAD HISTORY
// ============================================================================

async function loadHistory() {
    try {
        const response = await fetch('/api/sms/history?limit=50');
        const result = await response.json();

        if (result.success && result.messages.length > 0) {
            const tbody = document.getElementById('historyBody');
            tbody.innerHTML = result.messages.map(msg => `
                <tr>
                    <td>${new Date(msg.timestamp).toLocaleString()}</td>
                    <td>${msg.to}</td>
                    <td>${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}</td>
                    <td>
                        <span class="status-badge status-${msg.status.toLowerCase()}">
                            ${msg.status}
                        </span>
                    </td>
                    <td>$${msg.rate?.toFixed(4) || '0.00'}</td>
                    <td>
                        <button class="btn-small" onclick="checkStatus('${msg.id}')">
                            Check
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('historyBody').innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        No messages sent yet
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showStatus('Failed to load history', 'error');
    }
}

// ============================================================================
// CHECK STATUS
// ============================================================================

async function checkStatus(messageId) {
    try {
        const response = await fetch(`/api/sms/status/${messageId}`);
        const result = await response.json();

        if (result.success) {
            const message = `
Status: ${result.status}
To: ${result.to}
Content: ${result.content}
Sent: ${new Date(result.sentTime).toLocaleString()}
${result.deliveredTime ? `Delivered: ${new Date(result.deliveredTime).toLocaleString()}` : ''}
Cost: $${result.cost?.toFixed(4) || '0.00'}
            `;
            alert(message);
        } else {
            showStatus('Could not retrieve status', 'error');
        }
    } catch (error) {
        console.error('Error checking status:', error);
        showStatus('Error checking status', 'error');
    }
}

// ============================================================================
// LOAD STATISTICS
// ============================================================================

async function loadStats() {
    try {
        const response = await fetch('/api/sms/stats');
        const result = await response.json();

        if (result.success) {
            document.getElementById('statTotal').textContent = result.total;
            document.getElementById('statSent').textContent = result.sent;
            document.getElementById('statDelivered').textContent = result.delivered;
            document.getElementById('statFailed').textContent = result.failed;
            document.getElementById('statRate').textContent = result.deliveryRate;
            document.getElementById('statCost').textContent = '$' + result.totalCost;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showStatus('Failed to load statistics', 'error');
    }
}

// ============================================================================
// STATUS MESSAGES
// ============================================================================

function showStatus(message, type = 'info') {
    const el = document.getElementById('statusMessage');
    el.textContent = message;
    el.className = `status-message show ${type}`;
    
    setTimeout(() => {
        el.classList.remove('show');
    }, 5000);
}

// ============================================================================
// CHARACTER COUNTER
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Single SMS character counter
    const singleContent = document.getElementById('singleContent');
    if (singleContent) {
        singleContent.addEventListener('input', updateCharCount);
    }

    // Bulk SMS character counter
    const bulkContent = document.getElementById('bulkContent');
    if (bulkContent) {
        bulkContent.addEventListener('input', updateBulkCharCount);
    }

    // Bulk recipients counter
    const bulkRecipients = document.getElementById('bulkRecipients');
    if (bulkRecipients) {
        bulkRecipients.addEventListener('input', updateRecipientCount);
    }

    // Load initial data
    loadHistory();
});

function updateCharCount() {
    const content = document.getElementById('singleContent').value;
    const charCount = document.getElementById('charCount');
    const smsCount = document.getElementById('smsCount');
    
    const length = content.length;
    charCount.textContent = length;
    
    // Calculate SMS count (160 chars per SMS)
    const count = Math.ceil(length / 160);
    smsCount.textContent = `(${count} SMS${count > 1 ? 's' : ''})`;
}

function updateBulkCharCount() {
    const content = document.getElementById('bulkContent').value;
    const charCount = document.getElementById('bulkCharCount');
    charCount.textContent = content.length;
}

function updateRecipientCount() {
    const recipients = document.getElementById('bulkRecipients').value
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);
    
    const count = document.getElementById('recipientCount');
    count.textContent = `${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`;
}

// ============================================================================
// AUTO-REFRESH
// ============================================================================

// Optional: Auto-refresh history every 30 seconds
// setInterval(() => {
//     if (document.getElementById('history').classList.contains('active')) {
//         loadHistory();
//     }
// }, 30000);

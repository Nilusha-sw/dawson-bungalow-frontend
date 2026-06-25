// ─── Configuration ────────────────────────────────────────────────────────────
const API_BASE = 'https://newdawson-production.up.railway.app';

// ─── Token helpers ────────────────────────────────────────────────────────────
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function isLoggedIn() {
    return !!getToken();
}

// ─── Fetch wrapper — automatically attaches JWT header ────────────────────────
async function apiFetch(path, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    // Token expired or invalid — force logout
    if (response.status === 401) {
        clearAuth();
        window.location.href = 'login.html';
        return;
    }

    const data = await response.json();

    if (!response.ok) {
        // Backend returns { "error": "..." }
        throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    return data;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

// Show an error message inside a page element
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
}

// Hide an error message
function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

// Show a success message
function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
}

// Disable / enable a submit button with loading text
function setLoading(buttonId, loading, loadingText = 'Please wait...', originalText = null) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        btn._originalText = btn.textContent;
        btn.textContent = loadingText;
    } else {
        btn.textContent = originalText || btn._originalText || 'Submit';
    }
}

// ─── Route guards ─────────────────────────────────────────────────────────────

// Call on pages that require login (profile, bookings)
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Call on login/register pages — redirect away if already logged in
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'profile.html';
    }
}
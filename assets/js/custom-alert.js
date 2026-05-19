// custom-alert.js - A global, eye-catching modal replacement for alert() and confirm()

(function() {
    // Inject styles for the custom alerts
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-alert-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .custom-alert-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        .custom-alert-box {
            background: var(--bg-white, #ffffff);
            width: 90%;
            max-width: 420px;
            border-radius: 16px;
            padding: 2.5rem 2rem;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .custom-alert-overlay.active .custom-alert-box {
            transform: scale(1);
        }
        .custom-alert-icon {
            width: 70px; height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
        }
        .custom-alert-icon.success {
            background-color: rgba(52, 118, 83, 0.1);
            color: var(--primary, #214f36);
        }
        .custom-alert-icon.error {
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
        }
        .custom-alert-icon.warning {
            background-color: rgba(255, 193, 7, 0.1);
            color: #ffc107;
        }
        .custom-alert-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-main, #2b2b2b);
            margin-bottom: 0.75rem;
            font-family: 'Outfit', sans-serif;
        }
        .custom-alert-message {
            font-size: 1rem;
            color: var(--text-light, #6b6b6b);
            margin-bottom: 2rem;
            line-height: 1.5;
        }
        .custom-alert-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        .custom-alert-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            flex: 1;
            transition: all 0.2s ease;
            font-family: inherit;
            font-size: 1rem;
        }
        .custom-alert-btn-primary {
            background-color: var(--primary, #214f36);
            color: white;
        }
        .custom-alert-btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        .custom-alert-btn-secondary {
            background-color: #f1f3f5;
            color: var(--text-main, #495057);
        }
        .custom-alert-btn-secondary:hover {
            background-color: #e9ecef;
        }
    `;
    document.head.appendChild(style);

    // Creates the DOM elements
    function createModalHTML() {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-box">
                <div class="custom-alert-icon" id="customAlertIcon"></div>
                <h2 class="custom-alert-title" id="customAlertTitle"></h2>
                <p class="custom-alert-message" id="customAlertMessage"></p>
                <div class="custom-alert-actions" id="customAlertActions"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    let modalElement = null;

    function getModal() {
        if (!modalElement) modalElement = createModalHTML();
        return modalElement;
    }

    window.showCustomAlert = function(title, message, type = 'error') {
        return new Promise((resolve) => {
            const modal = getModal();
            const iconEl = modal.querySelector('#customAlertIcon');
            const titleEl = modal.querySelector('#customAlertTitle');
            const messageEl = modal.querySelector('#customAlertMessage');
            const actionsEl = modal.querySelector('#customAlertActions');

            // Setup styling based on type
            iconEl.className = 'custom-alert-icon ' + type;
            if (type === 'success') {
                iconEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            } else if (type === 'warning') {
                iconEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            } else {
                iconEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            }

            titleEl.textContent = title;
            messageEl.textContent = message;

            actionsEl.innerHTML = '<button class="custom-alert-btn custom-alert-btn-primary" id="customAlertOkBtn">OK</button>';

            modal.classList.add('active');

            const okBtn = document.getElementById('customAlertOkBtn');
            okBtn.onclick = () => {
                modal.classList.remove('active');
                setTimeout(() => resolve(true), 300);
            };
        });
    };

    window.showCustomConfirm = function(title, message) {
        return new Promise((resolve) => {
            const modal = getModal();
            const iconEl = modal.querySelector('#customAlertIcon');
            const titleEl = modal.querySelector('#customAlertTitle');
            const messageEl = modal.querySelector('#customAlertMessage');
            const actionsEl = modal.querySelector('#customAlertActions');

            iconEl.className = 'custom-alert-icon warning';
            iconEl.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

            titleEl.textContent = title;
            messageEl.textContent = message;

            actionsEl.innerHTML = `
                <button class="custom-alert-btn custom-alert-btn-secondary" id="customConfirmCancelBtn">Cancel</button>
                <button class="custom-alert-btn custom-alert-btn-primary" id="customConfirmOkBtn">Confirm</button>
            `;

            modal.classList.add('active');

            const okBtn = document.getElementById('customConfirmOkBtn');
            const cancelBtn = document.getElementById('customConfirmCancelBtn');

            okBtn.onclick = () => {
                modal.classList.remove('active');
                setTimeout(() => resolve(true), 300);
            };

            cancelBtn.onclick = () => {
                modal.classList.remove('active');
                setTimeout(() => resolve(false), 300);
            };
        });
    };
})();

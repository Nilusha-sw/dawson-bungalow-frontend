const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
    (async () => {
        if (typeof window.showCustomAlert === 'function') {
            await window.showCustomAlert("Access Denied", "Admin access only.", "error");
        } else {
            alert("Access denied. Admin only.");
        }
        window.location.href = "login.html";
    })();
}

// ---------------------------
// AMENITY ICONS
// ---------------------------
const AMENITY_ICONS = {
    "WiFi": "📶 Free WiFi",
    "AC": "❄️ AC",
    "TV": "📺 TV",
    "Room Service": "🛎️ Room Service",
    "Hot Water": "♨️ Hot Water",
    "Balcony View": "🌅 Balcony View",
    "Work Desk": "💼 Work Desk",
    "Private Bathroom": "🚿 Private Bathroom"
};

const API_BASE = "https://dawsonbunglow-production-1022.up.railway.app";
const token = localStorage.getItem("token");

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem("token");

    // ❌ Block non-admin access
    if (!token) {
        (async () => {
            if (typeof window.showCustomAlert === 'function') {
                await window.showCustomAlert("Login Required", "Please login", "warning");
            } else {
                alert("Please login");
            }
            window.location.href = "login.html";
        })();
        return;
    }

    // ---------------------------
    // ADMIN PROFILE
    // ---------------------------
    function loadAdminProfile() {
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const name = storedUser.name || "Admin User";
        const email = storedUser.email || "—";
        const phone = storedUser.phone || "—";
        const role = storedUser.role || "Administrator";
        const initials = name.charAt(0).toUpperCase();

        // Profile display card
        const avatar = document.getElementById("admin-profile-avatar");
        if (avatar) avatar.textContent = initials;
        const dispName = document.getElementById("admin-display-name");
        if (dispName) dispName.textContent = name;
        const dispRole = document.getElementById("admin-display-role");
        if (dispRole) dispRole.textContent = role;
        const dispName2 = document.getElementById("admin-display-name-2");
        if (dispName2) dispName2.textContent = name;
        const dispEmail = document.getElementById("admin-display-email");
        if (dispEmail) dispEmail.textContent = email;
        const dispPhone = document.getElementById("admin-display-phone");
        if (dispPhone) dispPhone.textContent = phone !== "—" ? phone : "—";

        // Topbar welcome
        const topbarSpan = document.querySelector(".admin-topbar .admin-profile span");
        if (topbarSpan) topbarSpan.textContent = `Welcome, ${name.split(" ")[0]}`;
        const topbarImg = document.querySelector(".admin-topbar .profile-img");
        if (topbarImg) topbarImg.textContent = initials;

        // Pre-fill modal inputs
        const inp = (id) => document.getElementById(id);
        if (inp("admin-edit-name")) inp("admin-edit-name").value = storedUser.name || "";
        if (inp("admin-edit-email")) inp("admin-edit-email").value = storedUser.email || "";
        if (inp("admin-edit-phone")) inp("admin-edit-phone").value = storedUser.phone || "";

        // Clear password fields every time modal is re-opened
        if (inp("admin-edit-old-password")) inp("admin-edit-old-password").value = "";
        if (inp("admin-edit-new-password")) inp("admin-edit-new-password").value = "";
        if (inp("admin-edit-confirm-password")) inp("admin-edit-confirm-password").value = "";
    }

    loadAdminProfile();

    // --- Edit Profile Modal helpers ---
    const editProfileModal = document.getElementById("edit-profile-modal");

    function showProfileError(msg) {
        const el = document.getElementById("profile-edit-error");
        if (el) { el.textContent = msg; el.style.display = "block"; }
        const su = document.getElementById("profile-edit-success");
        if (su) su.style.display = "none";
    }

    function showProfileSuccess(msg) {
        const el = document.getElementById("profile-edit-success");
        if (el) { el.textContent = msg; el.style.display = "block"; }
        const er = document.getElementById("profile-edit-error");
        if (er) er.style.display = "none";
    }

    function clearProfileMessages() {
        const er = document.getElementById("profile-edit-error");
        const su = document.getElementById("profile-edit-success");
        if (er) er.style.display = "none";
        if (su) su.style.display = "none";
    }

    function openEditProfileModal() {
        loadAdminProfile();
        clearProfileMessages();
        editProfileModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeEditProfileModal() {
        editProfileModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    document.getElementById("open-edit-profile-btn")?.addEventListener("click", openEditProfileModal);
    document.getElementById("close-edit-profile-modal")?.addEventListener("click", closeEditProfileModal);
    document.getElementById("cancel-edit-profile-btn")?.addEventListener("click", closeEditProfileModal);
    editProfileModal?.addEventListener("click", (e) => {
        if (e.target === editProfileModal) closeEditProfileModal();
    });

    // Block letters in phone field via JS (belt-and-suspenders with HTML oninput)
    document.getElementById("admin-edit-phone")?.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9+\s\-()]/g, "");
    });

    // Block invalid characters in room number and room type fields
    document.getElementById("roomNumber")?.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });
    document.getElementById("type")?.addEventListener("input", function () {
        this.value = this.value.replace(/[^A-Za-z\s'\-]/g, "");
    });

    // --- Save Profile with Validation ---
    document.getElementById("admin-save-profile-btn")?.addEventListener("click", async function () {
        clearProfileMessages();

        const name = document.getElementById("admin-edit-name")?.value.trim();
        const email = document.getElementById("admin-edit-email")?.value.trim();
        const phone = document.getElementById("admin-edit-phone")?.value.trim();
        const oldPassword = document.getElementById("admin-edit-old-password")?.value;
        const newPassword = document.getElementById("admin-edit-new-password")?.value;
        const confirmPwd = document.getElementById("admin-edit-confirm-password")?.value;

        // --- Validation ---
        if (!name || name.length < 2) {
            await window.showCustomAlert("Validation Error", "Full name must be at least 2 characters.", "warning");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            await window.showCustomAlert("Validation Error", "Please enter a valid email address.", "warning");
            return;
        }

        if (phone) {
            const digitsOnly = phone.replace(/[\s\-()]/g, "");
            if (!/^\+?\d{10}$/.test(digitsOnly)) {
                await window.showCustomAlert("Validation Error", "Please enter a valid phone number (exactly 10 digits, numbers only).", "warning");
                return;
            }
        }

        const changingPassword = !!(oldPassword || newPassword || confirmPwd);
        if (changingPassword) {
            if (!oldPassword) {
                await window.showCustomAlert("Validation Error", "Please enter your current password to change it.", "warning");
                return;
            }
            if (!newPassword) {
                await window.showCustomAlert("Validation Error", "Please enter a new password.", "warning");
                return;
            }
            if (newPassword.length < 6) {
                await window.showCustomAlert("Validation Error", "New password must be at least 6 characters.", "warning");
                return;
            }
            if (newPassword === oldPassword) {
                await window.showCustomAlert("Validation Error", "New password must be different from the current password.", "warning");
                return;
            }
            if (newPassword !== confirmPwd) {
                await window.showCustomAlert("Validation Error", "New passwords do not match.", "warning");
                return;
            }
        }

        const saveBtn = document.getElementById("admin-save-profile-btn");
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Saving..."; }

        try {
            // ── STEP 1: Update name / email / phone via profile endpoint ──
            const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ name, email, phone })
            });

            const profileResult = await profileRes.json();

            if (!profileRes.ok) {
                await window.showCustomAlert("Update Failed", profileResult.error || "Could not update profile. Please try again.", "error");
                return;
            }

            // Persist to localStorage
            const storedUser = JSON.parse(localStorage.getItem("user")) || {};
            localStorage.setItem("user", JSON.stringify({
                ...storedUser,
                name: profileResult.name || name,
                email: profileResult.email || email,
                phone: profileResult.phone || phone
            }));

            // ── STEP 2: Change password via dedicated endpoint (verifies current password) ──
            if (changingPassword) {
                const pwdRes = await fetch(`${API_BASE}/api/auth/change-password`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({ currentPassword: oldPassword, newPassword })
                });

                const pwdResult = await pwdRes.json();

                if (!pwdRes.ok) {
                    // Profile was already saved — but password failed. Show the real backend error.
                    loadAdminProfile();
                    await window.showCustomAlert("Password Error", pwdResult.error || "Incorrect current password. Profile info was saved but password was NOT changed.", "error");
                    closeEditProfileModal();
                    return;
                }
            }

            // ── All done ──
            loadAdminProfile();
            showProfileSuccess(changingPassword ? "Profile and password updated!" : "Profile updated successfully!");
            setTimeout(() => closeEditProfileModal(), 1500);

        } catch (err) {
            if (changingPassword) {
                await window.showCustomAlert("Error", "Server unreachable. No changes were saved.", "error");
            } else {
                // No password change — save locally as fallback
                const storedUser = JSON.parse(localStorage.getItem("user")) || {};
                localStorage.setItem("user", JSON.stringify({ ...storedUser, name, email, phone }));
                loadAdminProfile();
                showProfileSuccess("Profile saved locally (server unavailable).");
                setTimeout(() => closeEditProfileModal(), 1500);
            }
        } finally {
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save Changes"; }
        }
    });



    // ---------------------------
    // TAB NAVIGATION
    // ---------------------------
    const tabs = document.querySelectorAll('.sidebar-menu li[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');

            // Load data for specific tabs
            const tabId = tab.dataset.tab;
            if (tabId === 'reviews-tab') {
                loadReviews();
            } else if (tabId === 'dashboard-tab') {
                loadDashboardStats();
            } else if (tabId === 'add-room-tab') {
                loadRooms();
            } else if (tabId === 'bookings-tab') {
                loadBookings();
            } else if (tabId === 'promotions-tab') {
                loadPromotions();
            }

            // Close any open modals
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';

            // Close mobile sidebar automatically on tab selection
            const adminSidebar = document.getElementById('sidebar');
            if (adminSidebar && adminSidebar.classList.contains('open')) {
                adminSidebar.classList.remove('open');
            }
        });
    });

    // ---------------------------
    // MOBILE SIDEBAR TOGGLE
    // ---------------------------
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const adminSidebar = document.getElementById('sidebar');

    if (openSidebarBtn && adminSidebar) {
        openSidebarBtn.addEventListener('click', () => {
            adminSidebar.classList.add('open');
        });
    }

    if (closeSidebarBtn && adminSidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            adminSidebar.classList.remove('open');
        });
    }

    // ---------------------------
    // BACK TO SITE AND LOGOUT ACTION
    // ---------------------------
    const backToSiteLink = document.querySelector('a[href="index.html"]');
    if (backToSiteLink) {
        backToSiteLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Close all modals
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
            // Navigate to index
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        });
    }

    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            let confirmed = false;
            if (typeof window.showCustomConfirm === 'function') {
                confirmed = await window.showCustomConfirm("Logout", "Are you sure you want to logout?");
            } else {
                confirmed = confirm("Are you sure you want to logout?");
            }

            if (!confirmed) return;

            // Close all modals
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (typeof window.showCustomAlert === 'function') {
                await window.showCustomAlert("Logged Out", "You have successfully logged out.", "success");
            }
            window.location.href = "login.html";
        });
    }

    // ---------------------------
    // ADD / EDIT ROOM MODAL LOGIC
    // ---------------------------
    let editingRoomId = null;
    const addRoomModal = document.getElementById('add-room-modal');
    const openAddRoomBtn = document.getElementById('open-add-room-modal');
    const closeAddRoomBtn = document.getElementById('close-add-room-modal');

    if (openAddRoomBtn && addRoomModal) {
        openAddRoomBtn.addEventListener('click', () => {
            editingRoomId = null;
            document.getElementById("add-room-form").reset();

            const modalHeader = document.querySelector('#add-room-modal .modal-header h2');
            const modalDesc = document.querySelector('#add-room-modal .modal-header p');
            const submitBtn = document.querySelector('#add-room-form button[type="submit"]');

            if (modalHeader) modalHeader.textContent = "Add New Room";
            if (modalDesc) modalDesc.textContent = "Enter the details below to add a new room to the bungalow.";
            if (submitBtn) submitBtn.textContent = "Save Room";

            addRoomModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });
    }

    if (closeAddRoomBtn && addRoomModal) {
        closeAddRoomBtn.addEventListener('click', () => {
            addRoomModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close modal on click outside
    if (addRoomModal) {
        addRoomModal.addEventListener('click', (e) => {
            if (e.target === addRoomModal) {
                addRoomModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }



    async function loadRooms() {
        try {
            const res = await fetch(`${API_BASE}/api/rooms/admin/all`, {
                headers: { Authorization: "Bearer " + token }
            });

            if (!res.ok) throw new Error("Failed to load rooms");

            const rooms = await res.json();
            window.allAdminRooms = rooms;

            // Dashboard count
            document.getElementById("total-rooms-count").textContent = rooms.length;

            const container = document.getElementById("admin-rooms-container");
            if (!container) return;

            container.innerHTML = "";

            rooms.forEach(room => {

                const images = room.images?.length
                    ? room.images
                    : ["assets/images/default.jpg"];

                const imagesHTML = images.map((img, i) => `
                <img src="${img}" class="room-slide ${i === 0 ? 'active' : ''}" alt="Room image">
            `).join("");

                const amenitiesHTML = (room.amenities || [])
                    .map(a => `<span>${AMENITY_ICONS[a] || "✨ " + a}</span>`)
                    .join("");

                // ── NEW: status badge ──────────────────────────────────────────
                const statusBadge = room.active
                    ? `<span style="
                    background: #d4edda; color: #155724;
                    padding: 3px 10px; border-radius: 20px;
                    font-size: 0.75rem; font-weight: 600;">
                    ● Active
                  </span>`
                    : `<span style="
                    background: #f8d7da; color: #721c24;
                    padding: 3px 10px; border-radius: 20px;
                    font-size: 0.75rem; font-weight: 600;">
                    ● Inactive
                  </span>`;

                // ── NEW: toggle button ─────────────────────────────────────────
                const toggleBtn = room.active
                    ? `<button class="btn-confirm"
                        onclick="toggleRoomStatus('${room.id || room._id}', this)"
                        style="background-color: #dc3545; color: white;">
                        Disable
                   </button>`
                    : `<button class="btn-confirm"
                        onclick="toggleRoomStatus('${room.id || room._id}', this)"
                        style="background-color: #28a745; color: white;">
                        Activate
                   </button>`;
                // ──────────────────────────────────────────────────────────────

                const card = `
                <div class="room-card" id="room-card-${room.id || room._id}">
                    <div class="room-img" style="position: relative; height: 220px; overflow: hidden;">

                        <!-- NEW: status badge overlaid on image -->
                        <div style="position: absolute; top: 10px; left: 10px; z-index: 3;">
                            ${statusBadge}
                        </div>

                        <div class="room-slider" style="position: relative; height: 100%;">
                            ${imagesHTML}
                            ${images.length > 1 ? `
                                <button class="slide-btn prev" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); z-index: 2; background: rgba(0,0,0,0.5); color: white; border: none; padding: 5px 8px; cursor: pointer; border-radius: 4px;">❮</button>
                                <button class="slide-btn next" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); z-index: 2; background: rgba(0,0,0,0.5); color: white; border: none; padding: 5px 8px; cursor: pointer; border-radius: 4px;">❯</button>
                            ` : ""}
                        </div>
                    </div>

                    <div class="room-info">
                        <h3>Room ${room.roomNumber} - ${room.type}</h3>

                        <div class="room-features">
                            <span>👤 Max: ${room.capacity}</span>
                            ${amenitiesHTML}
                        </div>

                        <p style="color: var(--text-light);">
                            ${room.description || "No description"}
                        </p> 

                        <div class="room-price">
                            <span>LKR ${room.pricePerNight}</span> 

                            <div style="display: flex; gap: 8px; align-items: center;">
                                <!-- Edit button (unchanged) -->
                                <button class="btn-confirm" 
                                    onclick="openEditRoom('${room.id || room._id}')"
                                    style="background-color: #007bff; color: white;">
                                    Edit
                                </button> 

                                <!-- NEW: Activate / Deactivate toggle -->
                                ${toggleBtn}
                            </div>
                        </div>
                    </div>
                </div>
            `;

                container.insertAdjacentHTML("beforeend", card);
            });

        } catch (err) {
            console.error(err);
        }
    }


    // ---------------------------
    // FETCH BOOKINGS
    // ---------------------------
    let allBookings = []; // Reference for filtering
    async function loadBookings() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/bookings/admin`, {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            });

            if (res.status === 403 || res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
                return;
            }

            const bookings = await res.json();
            allBookings = bookings;
            renderBookings(bookings);
            updateBookingStats(bookings);

        } catch (err) {
            console.error("Booking load error:", err.message);
        }
    }

    function renderBookings(bookings) {
        const tableBody = document.getElementById("bookings-table-body");
        const statusFilter = document.getElementById("booking-status-filter") ? document.getElementById("booking-status-filter").value : 'all';
        const searchQuery = document.getElementById("booking-search") ? document.getElementById("booking-search").value.toLowerCase() : '';

        tableBody.innerHTML = "";

        // Apply Filters (Status + Search)
        const filtered = bookings.filter(b => {
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const guestName = (b.userName || "").toString().toLowerCase();
            const phone = (b.phone || b.userPhone || b.contact || b.contactNumber || b.user?.phone || "").toString().toLowerCase();
            const room = (b.roomNumber || b.roomId || b.room || "").toString().toLowerCase();
            const checkIn = (b.checkInDate || b.checkIn || "").toString().toLowerCase();
            const checkOut = (b.checkOutDate || b.checkOut || "").toString().toLowerCase();
            const statusText = (b.status || "").toString().toLowerCase();
            const matchesSearch = [guestName, phone, room, checkIn, checkOut, statusText].some(field => field.includes(searchQuery));
            return matchesStatus && matchesSearch;
        });

        if (!filtered.length) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 3rem; color: var(--text-light);">No bookings found</td></tr>`;
            return;
        }

        filtered.forEach(b => {
            const initials = b.userName ? b.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "U";
            const phoneNumber = b.phone || b.userPhone || b.contact || b.contactNumber || b.user?.phone || "—";
            const checkIn = b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";
            const checkOut = b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";

            const specialReq = b.specialRequests || "—";
            const price = Number(b.totalPrice || 0).toLocaleString();
            
            const promoHtml = b.promoCode 
                ? `<br><small style="color: #28a745; font-weight: 600;">Promo: ${b.promoCode}</small>` 
                : '';

            const row = `
                <tr data-status="${b.status}">
                    <td data-label="Guest">
                        <div class="guest-info">
                            <div class="guest-avatar">${initials}</div>
                            <span>${b.userName || "Guest"}</span>
                        </div>
                    </td>
                    <td data-label="Phone">${phoneNumber}</td>
                    <td data-label="Room">${b.roomNumber || b.roomId}</td>
                    <td data-label="Guests">${b.numGuests || b.guests || "1"}</td>
                    <td data-label="Check In">${checkIn}</td>
                    <td data-label="Check Out">${checkOut}</td>
                    <td data-label="Special Requests">
                        <div style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${specialReq}">
                            ${specialReq}
                        </div>
                    </td>
                    <td data-label="Total Price">
                        LKR ${price}
                        ${promoHtml}
                    </td>
                    <td data-label="Status">
                        <span class="status-badge status-${b.status}">${b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    </td>
                    <td data-label="Actions">
                        <div class="status-actions">
                            ${b.status === "pending" ? `
                                <button class="btn-confirm" onclick="confirmBooking('${b.id}')">
                                    Confirm
                                </button>
                                <button class="btn-cancel" onclick="cancelBooking('${b.id}')">
                                    Cancel
                                </button>
                            ` : `<small style="color: var(--text-light); font-style: italic;">No actions</small>`}
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    function updateBookingStats(bookings) {
        if (!document.getElementById("total-bookings-count")) return;

        // Row 1
        document.getElementById("total-bookings-count").textContent = bookings.length;

        const totalRevenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
        document.getElementById("total-revenue").textContent = `LKR ${totalRevenue.toLocaleString()}`;

        // Row 2
        document.getElementById("pending-bookings-count").textContent = bookings.filter(b => b.status === 'pending').length;
        document.getElementById("confirmed-bookings-count").textContent = bookings.filter(b => b.status === 'confirmed').length;
        document.getElementById("cancelled-bookings-count").textContent = bookings.filter(b => b.status === 'cancelled').length;

        // Row 3
        const today = new Date().toISOString().split('T')[0];
        const checkins = bookings.filter(b => b.checkInDate?.split('T')[0] === today).length;
        const checkouts = bookings.filter(b => b.checkOutDate?.split('T')[0] === today).length;

        document.getElementById("checkins-today").textContent = checkins;
        document.getElementById("checkouts-today").textContent = checkouts;

        // Occupancy Rate (Confirmed bookings that cover today)
        const totalRooms = parseInt(document.getElementById("total-rooms-count").textContent) || 1;
        const activeBookings = bookings.filter(b => {
            if (b.status !== 'confirmed') return false;
            const start = b.checkInDate?.split('T')[0];
            const end = b.checkOutDate?.split('T')[0];
            return today >= start && today < end;
        }).length;

        const occupancy = Math.round((activeBookings / totalRooms) * 100);
        document.getElementById("occupancy-rate").textContent = `${occupancy}%`;

        // Update Visuals
        renderCalendar(bookings);
        updateChart(bookings);
        updateMonthlyRevenueChart(bookings);
        updateYearlyRevenueChart(bookings);
        updateDailyRevenueChart(bookings);
        updateRoomPerformanceChart(bookings);
    }

    // ---------------------------
    // VISUALIZATIONS (CALENDAR & CHART)
    // ---------------------------
    let currentCalDate = new Date();
    let bookingsChart = null;
    let monthlyRevenueChart = null;
    let yearlyRevenueChart = null;
    let dailyRevenueChart = null;
    let roomPerformanceChart = null;

    function renderCalendar(bookings) {
        const calendarGrid = document.getElementById("booking-calendar");
        const monthYearLabel = document.getElementById("currentMonthYear");
        if (!calendarGrid) return;

        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        monthYearLabel.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentCalDate);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(d => html += `<div class="cal-day-head">${d}</div>`);

        // Empty days
        for (let i = 0; i < firstDay; i++) html += `<div class="cal-day other-month"></div>`;

        // Actual days
        const todayStr = new Date().toISOString().split('T')[0];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr ? 'today' : '';
            const hasBooking = bookings.some(b => b.status === 'confirmed' && dateStr >= b.checkInDate?.split('T')[0] && dateStr < b.checkOutDate?.split('T')[0]);

            html += `
                <div class="cal-day ${isToday}">
                    ${day}
                    ${hasBooking ? '<div class="cal-booking-dot"></div>' : ''}
                </div>
            `;
        }
        calendarGrid.innerHTML = html;
    }


    function updateChart(bookings) {
        const ctx = document.getElementById('bookingsChart');
        if (!ctx) return;

        // Last 7 days data
        const labels = [];
        const dataValues = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

            const count = bookings.filter(b => b.createdAt?.split('T')[0] === dStr).length;
            dataValues.push(count);
        }

        if (bookingsChart) {
            bookingsChart.data.labels = labels;
            bookingsChart.data.datasets[0].data = dataValues;
            bookingsChart.update();
        } else {
            bookingsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'New Bookings',
                        data: dataValues,
                        borderColor: '#214f36',
                        backgroundColor: 'rgba(33, 79, 54, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#214f36'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { display: false } },
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                    }
                }
            });
        }
    }

    function updateDailyRevenueChart(bookings) {
        const ctx = document.getElementById("dailyRevenueChart");
        if (!ctx) return;

        const labels = [];
        const revenueData = [];

        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dateStr = date.toISOString().split('T')[0];

            labels.push(
                date.toLocaleDateString('en-US', { weekday: 'short' })
            );

            const dailyRevenue = bookings
                .filter(b => {
                    if (b.status !== 'confirmed') return false;

                    const bookingDate = new Date(b.createdAt || b.checkInDate)
                        .toISOString()
                        .split('T')[0];

                    return bookingDate === dateStr;
                })
                .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

            revenueData.push(dailyRevenue);
        }

        if (dailyRevenueChart) {
            dailyRevenueChart.data.labels = labels;
            dailyRevenueChart.data.datasets[0].data = revenueData;
            dailyRevenueChart.update();
        } else {
            dailyRevenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Revenue',
                        data: revenueData,
                        borderColor: '#0f766e',
                        backgroundColor: 'rgba(15, 118, 110, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#0f766e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#94a3b8',
                                callback: function (value) {
                                    return 'LKR ' + value.toLocaleString();
                                }
                            },
                            grid: {
                                display: false
                            }
                        },
                        x: {
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    function updateMonthlyRevenueChart(bookings) {
        const ctx = document.getElementById("monthlyRevenueChart");
        if (!ctx) return;

        const currentYear = new Date().getFullYear();

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const monthlyRevenue = new Array(12).fill(0);

        bookings.forEach(b => {
            if (b.status !== 'confirmed') return;

            const date = new Date(b.createdAt || b.checkInDate);

            // ✅ Only current year
            if (date.getFullYear() !== currentYear) return;

            const month = date.getMonth();

            monthlyRevenue[month] += Number(b.totalPrice) || 0;
        });

        if (monthlyRevenueChart) {
            monthlyRevenueChart.data.labels = monthNames;
            monthlyRevenueChart.data.datasets[0].data = monthlyRevenue;
            monthlyRevenueChart.update();
        } else {
            monthlyRevenueChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: monthNames,
                    datasets: [{
                        label: `Revenue ${currentYear} (LKR)`,
                        data: monthlyRevenue,
                        backgroundColor: '#214f36',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        },
                        x: {
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    function updateYearlyRevenueChart(bookings) {
        const ctx = document.getElementById("yearlyRevenueChart");
        if (!ctx) return;

        const yearlyData = {};

        bookings.forEach(b => {
            if (b.status !== 'confirmed') return;

            const date = new Date(b.createdAt || b.checkInDate);
            const year = date.getFullYear();

            yearlyData[year] = (yearlyData[year] || 0) + (Number(b.totalPrice) || 0);
        });

        const labels = Object.keys(yearlyData);
        const values = Object.values(yearlyData);

        if (yearlyRevenueChart) {
            yearlyRevenueChart.data.labels = labels;
            yearlyRevenueChart.data.datasets[0].data = values;
            yearlyRevenueChart.update();
        } else {
            yearlyRevenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Yearly Revenue',
                        data: values,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#16a34a'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        },
                        x: {
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    function updateRoomPerformanceChart(bookings) {

        const ctx = document.getElementById("roomPerformanceChart");
        if (!ctx) return;

        const roomStats = {};

        bookings.forEach(b => {

            if (b.status !== 'confirmed') return;

            // Change this field according to your DB
            const roomType = b.roomType || "Unknown";

            if (!roomStats[roomType]) {
                roomStats[roomType] = {
                    bookings: 0,
                    revenue: 0
                };
            }

            roomStats[roomType].bookings += 1;
            roomStats[roomType].revenue += Number(b.totalPrice) || 0;
        });

        const labels = Object.keys(roomStats);
        const bookingCounts = labels.map(r => roomStats[r].bookings);

        // Most booked
        const mostBooked = labels.reduce((a, b) =>
            roomStats[a].bookings > roomStats[b].bookings ? a : b
            , labels[0]);

        // Least booked
        const leastBooked = labels.reduce((a, b) =>
            roomStats[a].bookings < roomStats[b].bookings ? a : b
            , labels[0]);

        // Highest revenue
        const highestRevenue = labels.reduce((a, b) =>
            roomStats[a].revenue > roomStats[b].revenue ? a : b
            , labels[0]);

        document.getElementById("most-booked-room").textContent =
            `${mostBooked} (${roomStats[mostBooked].bookings} bookings)`;

        document.getElementById("least-booked-room").textContent =
            `${leastBooked} (${roomStats[leastBooked].bookings} bookings)`;

        document.getElementById("highest-revenue-room").textContent =
            `${highestRevenue} (LKR ${roomStats[highestRevenue].revenue.toLocaleString()})`;

        if (roomPerformanceChart) {

            roomPerformanceChart.data.labels = labels;
            roomPerformanceChart.data.datasets[0].data = bookingCounts;
            roomPerformanceChart.update();

        } else {

            roomPerformanceChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Bookings',
                        data: bookingCounts,
                        backgroundColor: '#214f36',
                        borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        },

                        y: {
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Calendar listeners
    document.getElementById("prevMonth")?.addEventListener("click", () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar(allBookings);
    });
    document.getElementById("nextMonth")?.addEventListener("click", () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar(allBookings);
    });

    const bFilterSelect = document.getElementById("booking-status-filter");
    if (bFilterSelect) {
        bFilterSelect.addEventListener('change', () => renderBookings(allBookings));
    }

    const bSearchInput = document.getElementById("booking-search");
    if (bSearchInput) {
        bSearchInput.addEventListener('input', () => renderBookings(allBookings));
    }

    // ---------------------------
    // FETCH CUSTOMERS
    // ---------------------------
    let allCustomers = [];
    async function loadCustomers() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/admin/users`, {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            });

            if (res.ok) {
                const customers = await res.json();
                allCustomers = customers;
                renderCustomers(customers);
            }
        } catch (err) {
            console.error("Customer load error:", err);
        }
    }

    function renderCustomers(customers) {
        const tableBody = document.getElementById("customers-table-body");
        const searchQuery = document.getElementById("customer-search") ? document.getElementById("customer-search").value.toLowerCase() : '';

        if (!tableBody) return;
        tableBody.innerHTML = "";

        const filtered = customers.filter(c =>
            (c.name || "").toLowerCase().includes(searchQuery) ||
            (c.email || "").toLowerCase().includes(searchQuery) ||
            (c.phone || "").toString().toLowerCase().includes(searchQuery)
        );

        if (!filtered.length) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 3rem; color: var(--text-light);">No customers found</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            const initials = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "U";
            const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A";

            const row = `
                <tr>
                    <td data-label="Name">
                        <div class="guest-info">
                            <div class="guest-avatar" style="background-color: var(--secondary);">${initials}</div>
                            <span>${c.name || "Guest User"}</span>
                        </div>
                    </td>
                    <td data-label="Email">${c.email}</td>
                    <td data-label="Phone">${c.phone || "—"}</td>
                    <td data-label="Registered">${regDate}</td>
                    <td data-label="Bookings">${c.bookingCount || 0}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    const cSearchInput = document.getElementById("customer-search");
    if (cSearchInput) {
        cSearchInput.addEventListener('input', () => renderCustomers(allCustomers));
    }

    const defaultReviews = [
        {
            name: "Emily Chen",
            rating: 5,
            text: "Absolutely stunning property! The Mountain View Suite was breathtaking, and the staff couldn't have been more helpful. Will definitely return.",
            date: "April 2, 2026"
        },
        {
            name: "Mark Johnson",
            rating: 4,
            text: "Very peaceful and quiet. The garden access room was lovely. The only minor issue was the WiFi being a bit slow in the evenings, but overall a great stay.",
            date: "March 28, 2026"
        },
        {
            name: "Sarah Williams",
            rating: 5,
            text: "The perfect escape from the city. The food was incredible, the rooms were spotless, and the surrounding nature trails were perfect for morning walks.",
            date: "March 15, 2026"
        }
    ];

    // ---------------------------
    // FETCH REVIEWS FROM API
    // ---------------------------
    async function loadReviews() {
        const container = document.getElementById("admin-reviews-container");

        if (!container) return;

        // Show loading state
        container.innerHTML = '<p>Loading reviews...</p>';

        try {
            const response = await fetch(`${API_BASE}/api/reviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load reviews');
            }

            const reviews = await response.json();

            if (reviews.length === 0) {
                container.innerHTML = '<p>No reviews yet.</p>';
                return;
            }

            let html = '';
            // Sort reviews by date descending (newest first)
            const sortedReviews = reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            sortedReviews.forEach((review) => {
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= review.rating) {
                        starsHtml += '★';
                    } else {
                        starsHtml += '☆';
                    }
                }

                const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                html += `
                    <div class="admin-review-card">
                        <div class="admin-review-header">
                            <div class="admin-reviewer-info">
                                <h4>${escapeHtml(review.name)}</h4>
                                <span class="admin-review-date">${reviewDate}</span>
                            </div>
                            <div class="admin-review-stars">${starsHtml}</div>
                            <button onclick="deleteReview('${review.id}')" class="admin-delete-btn">Delete</button>
                        </div>
                        <p class="admin-review-text">${escapeHtml(review.comment)}</p>
                    </div>
                `;
            });

            container.innerHTML = html;

        } catch (error) {
            console.error('Load reviews error:', error);
            container.innerHTML = '<p style="color: var(--error);">Failed to load reviews. Please try again.</p>';
        }
    }

    // ---------------------------
    // IMAGE STATE
    // ---------------------------
    let selectedImages = [];   // new images
    let existingImages = [];   // images from backend

    const imageInput = document.getElementById("images");
    const previewContainer = document.getElementById("image-preview-container");

    // Handle new image selection
    imageInput?.addEventListener("change", function () {
        selectedImages = Array.from(this.files);
        renderImagePreviews();
    });

    // ---------------------------
    // PREVIEW RENDER
    // ---------------------------
    function renderImagePreviews() {
        if (!previewContainer) return;

        previewContainer.innerHTML = "";

        // 🔹 Existing Images
        existingImages.forEach((img, index) => {
            const div = document.createElement("div");
            div.style.position = "relative";
            div.style.width = "100px";

            div.innerHTML = `
            <img src="${img}" 
                style="width:100%; height:80px; object-fit:cover; border-radius:6px;">
            
            <div style="text-align:center; font-size:12px; margin-top:4px;">
                #${index + 1}
            </div>
            

            <!-- Remove Existing -->
            <button onclick="removeExistingImage(${index})"
                style="
                    position:absolute;
                    bottom:2px;
                    right:2px;
                    cursor:pointer;
                ">
                ❌
            </button>
        `;

            previewContainer.appendChild(div);
        });

        // 🔹 New Images
        selectedImages.forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const div = document.createElement("div");
                div.style.position = "relative";
                div.style.width = "100px";

                div.innerHTML = `
                <img src="${e.target.result}" 
                    style="width:100%; height:80px; object-fit:cover; border-radius:6px;">
                
                <div style="text-align:center; font-size:12px; margin-top:4px;">
                    #${index + 1}
                </div>

                <!-- Move Up -->
                <button onclick="moveImage(${index}, -1)"
                    style="
                        position:absolute;
                        top:2px;
                        left:2px;
                        cursor:pointer;
                    ">
                    ⬆️
                </button>

                <!-- Move Down -->
                <button onclick="moveImage(${index}, 1)"
                    style="
                        position:absolute;
                        top:2px;
                        right:2px;
                        cursor:pointer;
                    ">
                    ⬇️
                </button>

                <!-- Remove -->
                <button onclick="removeImage(${index})"
                    style="
                        position:absolute;
                        bottom:2px;
                        right:2px;
                        cursor:pointer;
                    ">
                    ❌
                </button>
            `;

                previewContainer.appendChild(div);
            };

            reader.readAsDataURL(file);
        });
    }


    // ---------------------------
    // REMOVE FUNCTIONS
    // ---------------------------
    window.removeExistingImage = function (index) {
        existingImages.splice(index, 1);
        renderImagePreviews();
    };

    window.removeImage = function (index) {
        selectedImages.splice(index, 1);
        renderImagePreviews();
    };

    window.moveImage = function (index, direction) {
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= selectedImages.length) return;

        const temp = selectedImages[index];
        selectedImages[index] = selectedImages[newIndex];
        selectedImages[newIndex] = temp;

        renderImagePreviews();
    };

    // ---------------------------
    // ADD OR UPDATE ROOM
    // ---------------------------
    window.openEditRoom = function (id) {
        editingRoomId = id;
        const room = window.allAdminRooms.find(r => r.id === id || r._id === id);
        if (!room) return;

        // Populate fields
        document.getElementById("roomNumber").value = room.roomNumber || '';
        document.getElementById("type").value = room.type || '';
        document.getElementById("pricePerNight").value = room.pricePerNight || '';
        document.getElementById("capacity").value = room.capacity || '';
        document.getElementById("description").value = room.description || '';

        // ✅ Load existing images
        existingImages = room.images || [];
        selectedImages = [];

        // Clear file input
        document.getElementById("images").value = '';

        renderImagePreviews();

        // Checkboxes
        document.querySelectorAll('#amenities-container input[type="checkbox"]').forEach(cb => {
            cb.checked = (room.amenities || []).includes(cb.value);
        });

        // Update modal texts
        const modalHeader = document.querySelector('#add-room-modal .modal-header h2');
        const modalDesc = document.querySelector('#add-room-modal .modal-header p');
        const submitBtn = document.querySelector('#add-room-form button[type="submit"]');

        if (modalHeader) modalHeader.textContent = "Edit Room";
        if (modalDesc) modalDesc.textContent = "Update the details below to modify the room.";
        if (submitBtn) submitBtn.textContent = "Update Room";

        const addRoomModal = document.getElementById('add-room-modal');
        if (addRoomModal) {
            addRoomModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const addRoomForm = document.getElementById("add-room-form");

    // ---------------------------
    // VALIDATION
    // ---------------------------
    function validateRoomForm(data, newFiles, existingFiles) {
        if (!data.roomNumber || !/^[0-9]+$/.test(data.roomNumber)) {
            return "Room Number is required and must contain digits only.";
        }

        if (!data.type || !/^[A-Za-z0-9\s'\/\-]+$/.test(data.type)) {
            return "Room Type contains invalid characters.";
        }

        if (!data.pricePerNight || Number.isNaN(data.pricePerNight) || data.pricePerNight <= 0) {
            return "Please enter a valid Price Per Night.";
        }

        if (!data.capacity || Number.isNaN(data.capacity) || data.capacity < 1 || data.capacity > 10) {
            return "Capacity must be between 1 and 10.";
        }

        if (!data.description || data.description.trim().length < 10) {
            return "Description must be at least 10 characters.";
        }

        if ((!newFiles || newFiles.length === 0) && existingFiles.length === 0) {
            return "At least one image is required.";
        }

        for (let file of newFiles) {
            if (!file.type.startsWith('image/')) {
                return "Only image files are allowed.";
            }
            if (file.size > 5 * 1024 * 1024) {
                return "Each image must be less than 5MB.";
            }
        }

        return null;
    }

    // ---------------------------
    // SUBMIT FORM
    // ---------------------------
    addRoomForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const amenities = [];
        document.querySelectorAll('#amenities-container input:checked')
            .forEach(cb => amenities.push(cb.value));

        const roomData = {
            roomNumber: document.getElementById("roomNumber").value.trim(),
            type: document.getElementById("type").value.trim(),
            pricePerNight: parseFloat(document.getElementById("pricePerNight").value),
            capacity: parseInt(document.getElementById("capacity").value, 10),
            description: document.getElementById("description").value.trim(),
            amenities: amenities
        };

        const validationError = validateRoomForm(roomData, selectedImages, existingImages);
        if (validationError) {
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Validation Error", validationError, "warning");
            } else {
                alert(validationError);
            }
            return;
        }

        const submitBtn = addRoomForm.querySelector('button[type="submit"]');
        // ✅ Disable button and show loading text
        submitBtn.disabled = true;
        submitBtn.textContent = editingRoomId ? "Updating... Please wait" : "Uploading... Please wait";

        try {
            const url = editingRoomId
                ? `${API_BASE}/api/rooms/admin/${editingRoomId}`
                : `${API_BASE}/api/rooms/admin`;

            const method = editingRoomId ? "PUT" : "POST";

            const formData = new FormData();
            formData.append('roomNumber', roomData.roomNumber);
            formData.append('type', roomData.type);
            formData.append('pricePerNight', roomData.pricePerNight.toString());
            formData.append('capacity', roomData.capacity.toString());
            formData.append('description', roomData.description);
            formData.append('amenities', JSON.stringify(roomData.amenities));

            // ✅ Send existing images (remaining ones)
            formData.append('existingImages', JSON.stringify(existingImages));

            // ✅ Send new images
            selectedImages.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: "Bearer " + token
                },
                body: formData
            });

            if (response.status === 413) {
                throw new Error("File size too large. Please upload images under 5MB.");
            }

            let result;
            try {
                result = await response.json();
            } catch (e) {
                if (!response.ok) throw new Error("Please upload images under 5MB.");
                throw new Error("Invalid server response.");
            }

            if (!response.ok) throw new Error(result?.error || "Operation failed");

            showToast(editingRoomId ? "Room updated successfully!" : "Room added successfully!", "success");

            addRoomForm.reset();
            selectedImages = [];
            existingImages = [];
            renderImagePreviews();
            editingRoomId = null;

            const addRoomModal = document.getElementById('add-room-modal');
            if (addRoomModal) {
                addRoomModal.classList.remove('active');
                document.body.style.overflow = '';
            }

            loadRooms();

        } catch (err) {
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Error", err.message, "error");
            } else {
                alert(err.message);
            }
        } finally {
            // ✅ Restore button state
            submitBtn.disabled = false;
            submitBtn.textContent = editingRoomId ? "Update Room" : "Add Room";
        }
    });




    // ---------------------------
    // CONFIRM BOOKING
    // ---------------------------
    window.confirmBooking = async function (id) {
        let confirmed = false;
        if (typeof window.showCustomConfirm === 'function') {
            confirmed = await window.showCustomConfirm("Confirm Booking", "Are you sure you want to confirm this booking?");
        } else {
            confirmed = confirm("Confirm this booking?");
        }
        if (!confirmed) return;

        try {
            await fetch(`${API_BASE}/api/bookings/admin/${id}/confirm`, {
                method: "PATCH",
                headers: { Authorization: "Bearer " + token }
            });

            showToast("Booking confirmed", "success");
            loadBookings();

        } catch (err) {
            console.error(err);
        }
    };

    // ---------------------------
    // CANCEL BOOKING
    // ---------------------------
    window.cancelBooking = async function (id) {
        let confirmed = false;
        if (typeof window.showCustomConfirm === 'function') {
            confirmed = await window.showCustomConfirm("Cancel Booking", "Are you sure you want to cancel this booking?");
        } else {
            confirmed = confirm("Cancel this booking?");
        }
        if (!confirmed) return;

        try {
            await fetch(`${API_BASE}/api/bookings/admin/${id}/cancel`, {
                method: "PATCH",
                headers: { Authorization: "Bearer " + token }
            });

            showToast("Booking cancelled", "error");
            loadBookings();

        } catch (err) {
            console.error(err);
        }
    };

    // ---------------------------
    // DELETE REVIEW
    // ---------------------------
    window.deleteReview = async function (id) {
        console.log('Admin delete review called with id:', id);

        let confirmed = false;
        if (typeof window.showCustomConfirm === 'function') {
            confirmed = await window.showCustomConfirm("Delete Review", "Are you sure you want to delete this review?");
        } else {
            confirmed = confirm('Are you sure you want to delete this review?');
        }

        if (confirmed) {
            try {
                console.log('Making admin DELETE request to:', `${API_BASE}/api/reviews/${id}`);

                const response = await fetch(`${API_BASE}/api/reviews/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Admin delete response status:', response.status);

                if (response.ok) {
                    showToast("Review deleted successfully", "success");
                    loadReviews(); // Reload reviews from server
                } else {
                    const errorText = await response.text();
                    console.error('Admin delete failed with response:', errorText);
                    showToast(`Failed to delete review: ${response.status}`, "error");
                }
            } catch (error) {
                console.error('Admin delete error:', error);
                showToast("Failed to delete review. Please try again.", "error");
            }
        }
    };

    // ---------------------------
    // LOAD DASHBOARD STATS
    // ---------------------------
    async function loadDashboardStats() {
        try {
            // Load review stats
            const reviewStatsResponse = await fetch(`${API_BASE}/api/reviews/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (reviewStatsResponse.ok) {
                const reviewStats = await reviewStatsResponse.json();
                document.getElementById('total-reviews-count').textContent = reviewStats.totalReviews || 0;
                document.getElementById('average-rating').textContent = (reviewStats.averageRating || 0).toFixed(1);

                // Calculate recent reviews (last 30 days)
                const reviewsResponse = await fetch(`${API_BASE}/api/reviews`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (reviewsResponse.ok) {
                    const reviews = await reviewsResponse.json();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    const recentReviews = reviews.filter(review =>
                        new Date(review.createdAt) >= thirtyDaysAgo
                    );

                    document.getElementById('recent-reviews-count').textContent = recentReviews.length;
                }
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    // ---------------------------
    // UPGRADED TOAST
    // ---------------------------
    function showToast(msg, type = 'success') {
        const toast = document.getElementById("toast");
        if (!toast) return;

        // Set icon based on type
        let icon = 'bx-check-circle';
        if (type === 'error') icon = 'bx-error-circle';
        if (type === 'warning') icon = 'bx-info-circle';

        toast.innerHTML = `
            <div class="toast-content">
                <i class='bx ${icon} toast-icon'></i>
                <div class="toast-message">
                    <span class="toast-text">${msg}</span>
                </div>
            </div>
            <div class="toast-progress active"></div>
        `;

        // Reset classes
        toast.className = 'toast show';
        toast.classList.add(type);

        // Auto hide
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // ---------------------------
    // PROMOTIONS TAB LOGIC
    // ---------------------------
    const addPromotionModal = document.getElementById('add-promotion-modal');
    const openAddPromoBtn = document.getElementById('open-add-promotion-modal');
    const closeAddPromoBtn = document.getElementById('close-add-promotion-modal');

    if (openAddPromoBtn) {
        openAddPromoBtn.addEventListener('click', () => {
            document.getElementById("add-promotion-form").reset();
            document.getElementById("promo-image-preview").innerHTML = '';
            addPromotionModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeAddPromoBtn) {
        closeAddPromoBtn.addEventListener('click', () => {
            addPromotionModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Image preview for promotion
    document.getElementById('promoImage')?.addEventListener('change', function (e) {
        const previewContainer = document.getElementById('promo-image-preview');
        previewContainer.innerHTML = '';
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewContainer.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; border-radius: 4px;">`;
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    async function loadPromotions() {
        const container = document.getElementById("admin-promotions-container");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/promotions`, {
                headers: { "Authorization": "Bearer " + token }  // ← ADD THIS
            });
            if (!res.ok) throw new Error("Failed to load promotions");

            const promotions = await res.json();
            container.innerHTML = "";

            if (!promotions.length) {
                container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No active promotions found.</div>`;
                return;
            }

            promotions.forEach(promo => {
                const statusBadge = promo.active
                    ? `<span style="background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">● Active</span>`
                    : `<span style="background: #f8d7da; color: #721c24; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">● Inactive</span>`;

                const toggleBtn = promo.active
                    ? `<button class="btn-confirm" onclick="togglePromotionStatus('${promo.id || promo._id}', false)" style="background-color: #ffc107; color: #000;">Deactivate</button>`
                    : `<button class="btn-confirm" onclick="togglePromotionStatus('${promo.id || promo._id}', true)" style="background-color: #28a745; color: white;">Activate</button>`;

                const card = `
                    <div class="room-card">
                        <div class="room-img" style="position: relative; height: 180px;">
                            <div style="position: absolute; top: 10px; left: 10px; z-index: 3;">
                                ${statusBadge}
                            </div>
                            <img 
    src="${promo.bannerImageId 
        ? `${API_BASE}/api/promotions/${promo.id || promo._id}/banner`
        : 'assets/images/default.jpg'}"
    style="width: 100%; height: 100%; object-fit: cover;"
>
                        </div>
                        <div class="room-info">
                            <h3>${promo.title}</h3>
                            <p style="color: var(--primary); font-weight: bold;">Code: ${promo.promoCode}</p>
                            <p style="color: var(--text-light); font-size: 0.9rem; margin: 10px 0;">${promo.description}</p>
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 15px;">
                                <span><strong>Discount:</strong> ${promo.discountPercentage}%</span>
                                <span><strong>Expires:</strong> ${new Date(promo.expiryDate).toLocaleDateString()}</span>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                ${toggleBtn}
                                <button class="btn-confirm" onclick="deletePromotion('${promo.id || promo._id}')" style="background-color: #dc3545; color: white;">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML("beforeend", card);
            });
        } catch (err) {
            console.error(err);
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading promotions.</div>`;
        }
    }

    // Assign to window to make available to inline onclick
    window.loadPromotions = loadPromotions;

    window.togglePromotionStatus = async function (id) {
        try {
            const res = await fetch(`${API_BASE}/api/promotions/${id}/toggle`, {
                method: "PATCH",
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Failed to update status");
            loadPromotions();
            window.showCustomAlert?.("Success", "Promotion status updated.", "success");
        } catch (err) {
            console.error(err);
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Error", "Error updating promotion status.", "error");
            } else {
                alert("Error updating promotion status.");
            }
        }
    };

    window.deletePromotion = async function (id) {
        const confirmed = await window.showCustomConfirm("Delete Promotion", "Are you sure you want to delete this promotion?");
        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE}/api/promotions/${id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });

            if (!res.ok) throw new Error("Failed to delete");
            loadPromotions();
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Success", "Promotion deleted.", "success");
            }
        } catch (err) {
            console.error(err);
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Error", "Error deleting promotion.", "error");
            } else {
                alert("Error deleting promotion.");
            }
        }
    };

    document.getElementById('add-promotion-form')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', document.getElementById('promoTitle').value);
        formData.append('promoCode', document.getElementById('promoCode').value);
        formData.append('description', document.getElementById('promoDescription').value);
        formData.append('discountPercentage', document.getElementById('promoDiscount').value);
        formData.append('expiryDate', document.getElementById('promoExpiry').value);
        formData.append('isActive', document.getElementById('promoActive').checked);

        const fileInput = document.getElementById('promoImage');
        if (fileInput.files.length > 0) {
            formData.append('image', fileInput.files[0]);
        }

        const btn = document.getElementById('save-promotion-btn');
        btn.disabled = true;
        btn.textContent = "Saving...";

        try {
            const res = await fetch(`${API_BASE}/api/promotions`, {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData // No Content-Type header so browser sets multipart/form-data with boundary
            });

            if (res.status === 413) {
                throw new Error("File size too large. Please upload an image under 5MB.");
            }

            let result;
            try {
                result = await res.json();
            } catch (e) {
                if (!res.ok) throw new Error("Please upload an image under 5MB.");
                throw new Error("Invalid server response.");
            }

            if (!res.ok) throw new Error(result?.error || "Failed to add promotion");

            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Success", "Promotion added successfully!", "success");
            }
            addPromotionModal.classList.remove('active');
            document.body.style.overflow = '';
            loadPromotions();

        } catch (err) {
            console.error(err);
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Error", "Error adding promotion: " + err.message, "error");
            } else {
                alert("Error adding promotion: " + err.message);
            }
        } finally {
            btn.disabled = false;
            btn.textContent = "Save Promotion";
        }
    });


    // 🔥 IMAGE SLIDER LOGIC FOR ADMIN
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("next")) {
            const slider = e.target.closest(".room-slider");
            if (!slider) return;
            const slides = slider.querySelectorAll(".room-slide");
            if (slides.length <= 1) return;
            let index = [...slides].findIndex(s => s.classList.contains("active"));

            slides[index].classList.remove("active");
            index = (index + 1) % slides.length;
            slides[index].classList.add("active");
        }

        if (e.target.classList.contains("prev")) {
            const slider = e.target.closest(".room-slider");
            if (!slider) return;
            const slides = slider.querySelectorAll(".room-slide");
            if (slides.length <= 1) return;
            let index = [...slides].findIndex(s => s.classList.contains("active"));

            slides[index].classList.remove("active");
            index = (index - 1 + slides.length) % slides.length;
            slides[index].classList.add("active");
        }
    });

    // ---------------------------
    // INITIAL LOAD
    // ---------------------------
    loadDashboardStats();
    loadRooms();
    loadBookings();
    loadCustomers();
    loadReviews();
});


// ── TOGGLE ROOM ACTIVE / INACTIVE ─────────────────────────────────────────────
async function toggleRoomStatus(roomId, btnEl) {
    const originalText = btnEl.textContent;
    btnEl.disabled = true;
    btnEl.textContent = "Updating...";

    try {
        const res = await fetch(`${API_BASE}/api/rooms/admin/${roomId}/toggle-status`, {
            method: "PATCH",
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) throw new Error("Failed to update room status");

        const updatedRoom = await res.json();

        // ── Update the badge on the card without a full reload ────────────
        const card = document.getElementById(`room-card-${roomId}`);
        if (card) {
            // Update badge
            const badgeEl = card.querySelector('.room-img > div span');
            if (badgeEl) {
                if (updatedRoom.active) {
                    badgeEl.textContent = "● Active";
                    badgeEl.style.background = "#d4edda";
                    badgeEl.style.color = "#155724";
                } else {
                    badgeEl.textContent = "● Inactive";
                    badgeEl.style.background = "#f8d7da";
                    badgeEl.style.color = "#721c24";
                }
            }

            // Update toggle button
            if (updatedRoom.active) {
                btnEl.textContent = "Disable";
                btnEl.style.backgroundColor = "#dc3545";
            } else {
                btnEl.textContent = "Activate";
                btnEl.style.backgroundColor = "#28a745";
            }
        }

    } catch (err) {
        console.error(err);
        alert("Could not update room status. Please try again.");
        btnEl.textContent = originalText; // restore on failure
    } finally {
        btnEl.disabled = false;
    }
}
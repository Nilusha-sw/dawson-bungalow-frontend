const API_BASE = "https://dawsonbunglow-production-1022.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    
    // Populate user profile details
    document.getElementById("greeting-name").textContent = `Welcome, ${userData.name.split(' ')[0]}`;
    document.getElementById("profile-name").textContent = userData.name;
    document.getElementById("profile-email").textContent = userData.email;
    document.getElementById("profile-phone").textContent = userData.phone;
    document.getElementById("profile-password").textContent = userData.password;
    
    // Set the Avatar initals
    const avatarEl = document.getElementById("profile-avatar");
    const initials = userData.name.split(" ").map(n => n[0]).join("").toUpperCase();
    avatarEl.textContent = initials;

    // Populate Bookings
    const bookingsContainer = document.getElementById("user-bookings-container");
    
    if (userBookings.length === 0) {
        bookingsContainer.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 2rem 0;">You have no bookings yet.</p>`;
    } else {
        let bookingsHTML = "";
        
        userBookings.forEach(booking => {
            const statusClass = booking.status.toLowerCase() === "completed" || booking.status.toLowerCase() === "cancelled" ? "past" : "active";
            const price = Number(booking.totalPrice || 0).toLocaleString();
            const promoBadge = booking.promoCode
                ? `<span style="background: #e8f5e9; color: #276749; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-left: 8px;">Promo: ${booking.promoCode}</span>`
                : '';
            
            bookingsHTML += `
                <div class="booking-item">
                    <div class="booking-img-wrapper">
                        <img src="${booking.imageUrl}" alt="${booking.roomName}" class="booking-img">
                    </div>
                    <div class="booking-details">
                        <div class="booking-header">
                            <h3>${booking.roomName}</h3>
                            <span class="booking-status ${statusClass}">${booking.status}</span>
                        </div>
                        <div class="booking-info-grid">
                            <div class="info-col">
                                <p>Booking ID</p>
                                <strong>${booking.id}</strong>
                            </div>
                            <div class="info-col">
                                <p>Guests</p>
                                <strong>${booking.guests} ${booking.guests > 1 ? 'Adults' : 'Adult'}</strong>
                            </div>
                            <div class="info-col">
                                <p>Check In</p>
                                <strong>${booking.checkIn}</strong>
                            </div>
                            <div class="info-col">
                                <p>Check Out</p>
                                <strong>${booking.checkOut}</strong>
                            </div>
                        </div>
                        <div class="booking-price" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                            <span>Total Price</span>
                            <span>LKR ${price}${promoBadge}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        bookingsContainer.innerHTML = bookingsHTML;
    }
});

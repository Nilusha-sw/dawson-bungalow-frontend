// main.js (FINAL VERSION WITH SLIDER + BACKEND)

document.addEventListener('DOMContentLoaded', () => {

    const API_BASE = "https://dawson-bungalow-api-latest.onrender.com";

    // ---------------------------
    // NAVBAR ACTIVE STATE
    // ---------------------------
    const currentPath = window.location.pathname;

    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPath = link.getAttribute('href');

        if (currentPath.includes(linkPath) && linkPath !== '/' && linkPath !== 'index.html') {
            link.classList.add('active');
        } else if (
            (currentPath.endsWith('/') || currentPath.endsWith('index.html')) &&
            (linkPath === '/' || linkPath === 'index.html')
        ) {
            link.classList.add('active');
        }
    });

    // ---------------------------
    // NAVBAR AUTH STATE UPDATE
    // ---------------------------
    const siteToken = localStorage.getItem("token");
    const userObjStr = localStorage.getItem("user");
    const userObj = userObjStr ? JSON.parse(userObjStr) : null;

    if (siteToken) {
        // If logged in, update all .nav-actions containers not on profile to show "My Profile" and "Log Out"
        if (!window.location.pathname.includes('profile.html')) {
            document.querySelectorAll('.nav-actions').forEach(container => {
                const destLink = (userObj && userObj.role === 'admin') ? 'admin.html' : 'profile.html';
                const destText = (userObj && userObj.role === 'admin') ? 'Admin Panel' : 'My Profile';

                container.innerHTML = `
                    <a href="${destLink}" class="btn btn-primary" style="padding: 0.5rem 1rem;">${destText}</a>
                    <button class="btn btn-outline auth-global-logout-btn" style="padding: 0.5rem 1rem;">Log Out</button>
                `;
            });
        }
    }

    // 🔥 Sync Mobile Sidebar (Admin Style)
    const navLinksContainer = document.querySelector('.nav-links');
    if (navLinksContainer) {
        // Add icons to Desktop/Mobile links
        const linkIcons = {
            'Home': 'bx-home',
            'Rooms': 'bx-bed',
            'About Us': 'bx-info-circle',
            'Reviews': 'bx-star',
            'Contact Us': 'bx-envelope'
        };

        navLinksContainer.querySelectorAll('li a').forEach(link => {
            const text = link.textContent.trim();
            if (linkIcons[text] && !link.querySelector('i')) {
                link.innerHTML = `<i class='bx ${linkIcons[text]}'></i> ${text}`;
            }
        });

        // Add Mobile-only actions container
        let mobileActionsContainer = navLinksContainer.querySelector('.mobile-only-actions');
        if (!mobileActionsContainer) {
            mobileActionsContainer = document.createElement('div');
            mobileActionsContainer.className = 'mobile-only-actions';
            navLinksContainer.appendChild(mobileActionsContainer);
        }

        // Add Mobile Sidebar Header
        let mobileHeader = navLinksContainer.querySelector('.mobile-sidebar-header');
        if (!mobileHeader) {
            mobileHeader = document.createElement('div');
            mobileHeader.className = 'mobile-sidebar-header';
            mobileHeader.innerHTML = `
                <h2>Dawson<span>Bungalow</span></h2>
                <button class="mobile-close-btn"><i class='bx bx-x'></i></button>
            `;
            navLinksContainer.insertBefore(mobileHeader, navLinksContainer.firstChild);
        }

        if (siteToken) {
            const destLink = (userObj && userObj.role === 'admin') ? 'admin.html' : 'profile.html';
            const destText = (userObj && userObj.role === 'admin') ? 'Admin Panel' : 'My Profile';
            mobileActionsContainer.innerHTML = `
                <li style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 1rem;"><a href="${destLink}"><i class='bx bxs-user-badge'></i> ${destText}</a></li>
                <li><a href="#" class="auth-global-logout-btn" style="color: #ff6b6b;"><i class='bx bx-log-out'></i> Log Out</a></li>
            `;
        } else {
            mobileActionsContainer.innerHTML = `
                <li style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 1rem;"><a href="login.html"><i class='bx bx-log-in'></i> Log In</a></li>
                <li><a href="register.html"><i class='bx bx-user-plus'></i> Register</a></li>
            `;
        }
    }

    // Global logout delegation
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('auth-global-logout-btn')) {
            e.preventDefault();

            let confirmed = false;
            if (typeof window.showCustomConfirm === 'function') {
                confirmed = await window.showCustomConfirm("Log Out", "Are you sure you want to log out?");
            } else {
                confirmed = confirm("Are you sure you want to log out?");
            }

            if (!confirmed) return;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window.showCustomAlert === 'function') {
                await window.showCustomAlert("Logged Out", "You have successfully logged out.", "success");
            }
            window.location.href = 'index.html';
        }
    });

    // ---------------------------
    // AMENITIES ICON MAP
    // ---------------------------
    const AMENITY_ICONS = {
        "WiFi": "📶 Free WiFi",
        "Free WiFi": "📶 Free WiFi",
        "AC": "❄️ Air Conditioning",
        "Air Conditioning": "❄️ Air Conditioning",
        "TV": "📺 Flat TV",
        "Flat-screen TV": "📺 Flat TV",
        "Room Service": "🛎️ Room Service",
        "Hot Water": "♨️ Hot Water",
        "Balcony View": "🌅 Balcony View",
        "Work Desk": "💼 Work Desk",
        "Private Bathroom": "🚿 Private Bathroom",
        "King Bed": "🛏️ King Bed",
        "Queen Bed": "🛏️ Queen Bed",
        "Single Bed": "🛏️ Single Bed"
    };

    // ---------------------------
    // MOBILE MENU SIDE DRAWER (ADMIN STYLE)
    // ---------------------------
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navActionsContainer = document.querySelector('.nav-actions');

    // Create backdrop for side drawer
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);
    }

    const toggleMenu = () => {
        mobileBtn?.classList.toggle('active');
        navLinksContainer?.classList.toggle('active');
        backdrop.classList.toggle('active');
        // Prevent background scrolling when menu is open
        document.body.style.overflow = navLinksContainer?.classList.contains('active') ? 'hidden' : '';
    };

    mobileBtn?.addEventListener('click', toggleMenu);
    backdrop?.addEventListener('click', toggleMenu);

    const closeBtn = document.querySelector('.mobile-close-btn');
    closeBtn?.addEventListener('click', toggleMenu);

    // Auto-close menu when clicking links
    navLinksContainer?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // ---------------------------
    // HERO SLIDER
    // ---------------------------
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');

    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlide = index;
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        };

        const startAutoSlide = () => {
            slideInterval = setInterval(nextSlide, 5000);
        };

        const stopAutoSlide = () => {
            clearInterval(slideInterval);
        };

        // Start automatic slideshow
        startAutoSlide();

        // Add event listeners for arrows
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }
    }

    // ---------------------------
    // GUESTHOUSE SLIDER (manual — dots + counter)
    // ---------------------------
    const ghSlideshow = document.getElementById('ghSlideshow');
    if (ghSlideshow) {
        const guesthouseSlides = ghSlideshow.querySelectorAll('.guesthouse-slide');
        const guesthousePrevBtn = ghSlideshow.querySelector('.guesthouse-prev');
        const guesthouseNextBtn = ghSlideshow.querySelector('.guesthouse-next');
        const ghCounter = document.getElementById('ghCounter');
        const ghDotsContainer = document.getElementById('ghDots');
        const ghDots = ghDotsContainer ? ghDotsContainer.querySelectorAll('.gh-dot') : [];

        if (guesthouseSlides.length > 0) {
            let ghCurrent = 0;

            const showGhSlide = (index) => {
                guesthouseSlides.forEach(s => s.classList.remove('active'));
                guesthouseSlides[index].classList.add('active');

                if (ghCounter) ghCounter.textContent = `${index + 1} / ${guesthouseSlides.length}`;

                ghDots.forEach(d => d.classList.remove('active'));
                if (ghDots[index]) ghDots[index].classList.add('active');

                ghCurrent = index;
            };

            const ghNext = () => showGhSlide((ghCurrent + 1) % guesthouseSlides.length);
            const ghPrev = () => showGhSlide((ghCurrent - 1 + guesthouseSlides.length) % guesthouseSlides.length);

            guesthouseNextBtn?.addEventListener('click', ghNext);
            guesthousePrevBtn?.addEventListener('click', ghPrev);

            ghDots.forEach((dot, i) => {
                dot.addEventListener('click', () => showGhSlide(i));
            });

            // Init
            showGhSlide(0);
        }
    }

    // ---------------------------
// CHECK AVAILABILITY (INDEX PAGE)
// ---------------------------
const availSearchBtn = document.getElementById("avail-search-btn");
if (availSearchBtn) {

    // Set today as min date for check-in
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("avail-checkin").min = today;
    document.getElementById("avail-checkout").min = today;

    // Auto-update checkout min when checkin changes
    document.getElementById("avail-checkin").addEventListener("change", function () {
        document.getElementById("avail-checkout").min = this.value;
        if (document.getElementById("avail-checkout").value <= this.value) {
            document.getElementById("avail-checkout").value = "";
        }
    });

    availSearchBtn.addEventListener("click", async () => {
        const checkIn  = document.getElementById("avail-checkin").value;
        const checkOut = document.getElementById("avail-checkout").value;
        const guests   = document.getElementById("avail-guests").value;

        // Validate
        if (!checkIn || !checkOut) {
            await window.showCustomAlert("Search Failed", "Please select both check-in and check-out dates.",  "error");
            return;
        }
        if (checkIn >= checkOut) {
            await window.showCustomAlert("Search Failed", "Check-out date must be after check-in date.",  "error");
            return;
        }
        if (!guests || guests < 1) {
            await window.showCustomAlert("Search Failed", "Please enter at least 1 guest.",  "error");
            return;
        }

        // Loading state
        availSearchBtn.disabled = true;
        availSearchBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Searching...";

        try {
            const params = new URLSearchParams({ checkIn, checkOut, guests });
            const res = await fetch(`${API_BASE}/api/rooms?${params}`);
            if (!res.ok) throw new Error("Failed to fetch rooms");

            const rooms = await res.json();
            const availableRooms = rooms.filter(r => r.available === true);

            // Show results section
            const resultsSection = document.getElementById("availability-section");
            const grid = document.getElementById("avail-rooms-grid");
            const summary = document.getElementById("avail-summary");
            const viewAllLink = document.getElementById("avail-view-all-link");

            resultsSection.style.display = "block";
            grid.innerHTML = "";

            // Update "View All" link to carry the dates
            viewAllLink.href = `rooms.html?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

            if (availableRooms.length === 0) {
                summary.textContent = "No rooms available for the selected dates. Try different dates.";
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-light);">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">😔</div>
                        <p>No rooms available for those dates.</p>
                    </div>`;
            } else {
                const nights = Math.ceil(
                    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                );
                summary.textContent = `${availableRooms.length} room${availableRooms.length > 1 ? "s" : ""} available for ${nights} night${nights > 1 ? "s" : ""} (${checkIn} → ${checkOut})`;

                availableRooms.forEach(room => {
                    const image = room.images?.[0] || "assets/images/default.jpg";
                    const nights = Math.ceil(
                        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                    );

                    grid.insertAdjacentHTML("beforeend", `
                        <div style="
                            background: white; border-radius: 12px;
                            overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                            transition: transform 0.2s;">
                            <div style="height: 180px; overflow: hidden;">
                                <img src="${image}" alt="${room.type}"
                                    style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div style="padding: 1.2rem;">
                                <h3 style="margin: 0 0 0.3rem; color: var(--primary); font-size: 1.05rem;">
                                    Room ${room.roomNumber} - ${room.type}
                                </h3>
                                <p style="color: var(--text-light); font-size: 0.85rem; margin: 0 0 0.8rem;">
                                    <i class='bx bxs-user'></i> Max ${room.capacity} guests
                                </p>
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                                    <div>
                                        <div style="font-weight: 700; color: var(--primary);">
                                            LKR ${Number(room.pricePerNight).toLocaleString()} <small style="font-weight: 400; color: var(--text-light);">/ night</small>
                                        </div>
                                        <div style="font-size: 0.8rem; color: var(--text-light);">
                                            Total: LKR ${Number(room.pricePerNight * nights).toLocaleString()}
                                        </div>
                                    </div>
                                    <a href="rooms.html?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}"
                                        class="btn btn-primary"
                                        style="padding: 0.5rem 1.1rem; font-size: 0.9rem;">
                                        Book Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    `);
                });
            }

            // Scroll to results smoothly
            resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

        } catch (err) {
            console.error("Availability check error:", err);
            await window.showCustomAlert("Error", "Could not check availability. Please make sure the server is running.",  "error");
        } finally {
            availSearchBtn.disabled = false;
            availSearchBtn.innerHTML = "<i class='bx bx-search'></i> Search Rooms";
        }
    });
}

    // ---------------------------
    // LOAD ROOMS FROM BACKEND
    // ---------------------------
    let selectedRoomId = null;

    async function loadRooms() {
        const container = document.getElementById("rooms-container");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/rooms`);
            if (!res.ok) throw new Error("Failed to fetch rooms");

            const rooms = await res.json();
            container.innerHTML = "";

            if (!rooms.length) {
                container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-light);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏡</div>
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">No Rooms Available</h3>
                    <p>Please check back soon or contact us directly.</p>
                </div>`;
                return;
            }

            rooms.forEach(room => {

                const images = room.images?.length
                    ? room.images
                    : ["assets/images/default.jpg"];

                // CREATE SLIDER IMAGES
                const imagesHTML = images.map((img, index) => `
                <img src="${img}" 
                     class="room-slide ${index === 0 ? 'active' : ''}"
                     alt="${room.type} room image">
            `).join("");

                // AMENITIES
                const amenitiesHTML = (room.amenities || [])
                    .map(a => {
                        const label = AMENITY_ICONS[a] || `✨ ${a}`;
                        return `<span class="amenity-item">${label}</span>`;
                    })
                    .join("");

                // ── Availability: only relevant when user searched with dates ──
                // room.available is null  → no dates selected, show Book Now normally
                // room.available is true  → dates selected, room is free
                // room.available is false → dates selected, room is already booked
                const isUnavailable = room.available === false;

                const unavailableOverlay = isUnavailable ? `
                <div style="
                    position: absolute; inset: 0; z-index: 4;
                    background: rgba(0,0,0,0.45);
                    display: flex; align-items: center; justify-content: center;">
                    <span style="
                        background: #dc3545; color: #fff;
                        padding: 6px 18px; border-radius: 20px;
                        font-size: 0.85rem; font-weight: 700;
                        letter-spacing: 0.5px;">
                        Already Booked
                    </span>
                </div>` : "";

                const bookBtn = isUnavailable
                    ? `<button class="btn btn-primary btn-book"
                        disabled
                        style="opacity: 0.5; cursor: not-allowed;">
                        Unavailable
                   </button>`
                    : `<button class="btn btn-primary btn-book"
                        data-room-id="${room.id}"
                        data-room-name="Room ${room.roomNumber} - ${room.type}"
                        data-room-image="${images[0]}"
                        data-room-price="${room.pricePerNight}">
                        Book Now
                   </button>`;

                const card = `
                <div class="room-card">
                    <div class="room-img" style="position: relative;">

                        ${unavailableOverlay}

                        <div class="room-slider">
                            ${imagesHTML}
                            ${images.length > 1 ? `
                                <button class="slide-btn prev" aria-label="Previous image">&#10094;</button>
                                <button class="slide-btn next" aria-label="Next image">&#10095;</button>
                            ` : ""}
                        </div>
                    </div>

                    <div class="room-info">
                        <h3>Room ${room.roomNumber} - ${room.type}</h3>

                        <div style="font-weight: 500; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                            <i class='bx bxs-user'></i> Max: ${room.capacity} Guests
                        </div>
                        <div class="room-features">
                            ${amenitiesHTML}
                        </div>

                        <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1.2rem; line-height: 1.6;">
                            ${room.description || "A comfortable and relaxing stay awaits you."}
                        </p>

                        <div class="room-price">
                            <span>LKR ${Number(room.pricePerNight).toLocaleString()} <small>/ night</small></span>
                            ${bookBtn}
                        </div>
                    </div>
                </div>
            `;

                container.insertAdjacentHTML("beforeend", card);
            });

        } catch (err) {
            console.error("Room loading error:", err);
            container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-light);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Could Not Load Rooms</h3>
                <p>Make sure the server is running, then <a href="rooms.html" style="color: var(--primary); font-weight: 600;">refresh the page</a>.</p>
            </div>`;
        }
    }

    loadRooms();

    // ---------------------------
    // LOAD ACTIVE PROMOTIONS
    // ---------------------------
    async function loadActivePromotions() {
        const section = document.getElementById("promotions-section");
        const slideshow = document.getElementById("promoSlideshow");
        const dotsContainer = document.getElementById("promo-dots");

        const ribbon = document.getElementById("promotions-ribbon");
        const ribbonContent = document.getElementById("promotions-ribbon-content");

        if (!section && !slideshow && !ribbon) return;

        try {
            const res = await fetch(`${API_BASE}/api/promotions/active`);
            if (!res.ok) throw new Error("Failed to fetch promotions");

            const promotions = await res.json();

            if (!promotions || promotions.length === 0) {
                if (section) section.style.display = 'none';
                if (ribbon) ribbon.style.display = 'none';
                return;
            }

            // Assign globally so the booking modal can access it
            window.activePromotionsList = promotions;

            // --- Handle Slideshow (index.html) ---
            if (section && slideshow) {
                section.style.display = 'block';

                // Remove any existing slides to avoid duplicates if re-loaded
                slideshow.querySelectorAll('.guesthouse-slide').forEach(s => s.remove());
                if (dotsContainer) dotsContainer.innerHTML = '';

                let slidesHTML = '';
                let dotsHTML = '';

                promotions.forEach((promo, index) => {
                    const imageUrl = promo.bannerImageId
                        ? `${API_BASE}/api/promotions/${promo.id || promo._id}/banner`
                        : 'assets/images/default.jpg';

                    slidesHTML += `<img src="${imageUrl}" class="guesthouse-slide ${index === 0 ? 'active' : ''}" alt="${promo.title}">`;
                    if (dotsContainer) {
                        dotsHTML += `<span class="gh-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
                    }
                });

                // Insert slides right before the overlay
                const overlay = document.getElementById("promo-overlay");
                if (overlay) {
                    overlay.insertAdjacentHTML('beforebegin', slidesHTML);
                } else {
                    slideshow.insertAdjacentHTML("afterbegin", slidesHTML);
                }

                if (dotsContainer) dotsContainer.innerHTML = dotsHTML;

                updatePromoOverlay(0);
                initPromoSlider();
            }

            // --- Handle Ribbon (rooms.html) ---
            if (ribbon && ribbonContent) {
                ribbon.style.display = 'block';
                // Show the first active promotion on the ribbon
                const topPromo = promotions[0];
                ribbonContent.innerHTML = `🎉 <strong>${topPromo.title}</strong> - ${topPromo.discountPercentage}% OFF! Use code <strong style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; letter-spacing: 1px;">${topPromo.promoCode}</strong> Valid until ${new Date(topPromo.expiryDate).toLocaleDateString()}`;

                document.getElementById("close-promotions-ribbon")?.addEventListener("click", () => {
                    ribbon.style.display = 'none';
                });
            }

        } catch (err) {
            console.error("Promotions loading error:", err);
            if (section) section.style.display = 'none';
            if (ribbon) ribbon.style.display = 'none';
        }
    }



    function updatePromoOverlay(index) {
        if (!window.activePromotionsList) return;
        const promo = window.activePromotionsList[index];
        if (!promo) return;

        const overlay = document.getElementById("promo-overlay");
        if (!overlay) return;

        overlay.innerHTML = `
    <div style="
        background: rgba(33, 79, 54, 0.9);
        padding: 4px 10px;
        border-radius: 16px;
        color: white;
        font-weight: bold;
        font-size: 0.75rem;
        margin-bottom: 10px;
        display: inline-block;
    ">
        ${promo.discountPercentage}% OFF
    </div>

    <h3 style="
        color: white;
        font-size: clamp(1.2rem, 4vw, 1.8rem);
        margin-bottom: 8px;
        line-height: 1.3;
    ">
        ${promo.title}
    </h3>

    <p style="
        color: white;
        margin-bottom: 12px;
        font-size: clamp(0.82rem, 2.8vw, 1rem);
        max-width: 100%;
        background: rgba(0,0,0,0.3);
        padding: 8px 12px;
        border-radius: 8px;
        backdrop-filter: blur(5px);
        line-height: 1.5;
    ">
        ${promo.description}
    </p>

    <div style="
        display: flex;
        gap: 10px;
        align-items: flex-start;
        flex-wrap: wrap;
    ">

        <div style="
            background: rgba(33, 79, 54, 0.9);
            padding: 4px 10px;
            border-radius: 16px;
            color: white;
            font-weight: bold;
            font-size: 0.75rem;
            display: inline-block;
        ">
            <span style="
                font-size: 0.7rem;
                color: rgba(255,255,255,0.8);
                text-transform: uppercase;
            ">
                code:
            </span>

            <strong style="
                color: white;
                font-size: 0.8rem;
                letter-spacing: 1px;
                margin-left: 5px;
            ">
                ${promo.promoCode}
            </strong>
        </div>

        <span style="
            background: rgba(33, 79, 54, 0.9);
            padding: 4px 10px;
            border-radius: 16px;
            color: white;
            font-weight: bold;
            font-size: 0.75rem;
            display: inline-block;
        ">
            Valid until: ${new Date(promo.expiryDate).toLocaleDateString()}
        </span>

    </div>
`;
    }

    function initPromoSlider() {
        const slideshow = document.getElementById("promoSlideshow");
        if (!slideshow) return;

        const slides = slideshow.querySelectorAll('.guesthouse-slide');
        const dotsContainer = document.getElementById("promo-dots");
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.gh-dot') : [];
        const prevBtn = document.getElementById('promo-prev');
        const nextBtn = document.getElementById('promo-next');
        let currentIdx = 0;
        let slideInterval;

        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        }

        // Show controls if there are multiple slides
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
        if (dotsContainer) dotsContainer.style.display = 'flex';

        function goToSlide(index) {
            slides[currentIdx].classList.remove('active');
            if (dots[currentIdx]) dots[currentIdx].classList.remove('active');

            currentIdx = index;

            slides[currentIdx].classList.add('active');
            if (dots[currentIdx]) dots[currentIdx].classList.add('active');

            updatePromoOverlay(currentIdx);
        }

        function nextSlide() {
            let nextIdx = (currentIdx + 1) % slides.length;
            goToSlide(nextIdx);
        }

        function prevSlide() {
            let prevIdx = (currentIdx - 1 + slides.length) % slides.length;
            goToSlide(prevIdx);
        }

        if (nextBtn) nextBtn.onclick = () => { nextSlide(); resetInterval(); };
        if (prevBtn) prevBtn.onclick = () => { prevSlide(); resetInterval(); };

        dots.forEach(dot => {
            dot.onclick = function () {
                const idx = parseInt(this.getAttribute('data-index'));
                goToSlide(idx);
                resetInterval();
            };
        });

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000); // 5 second autoplay
        }

        resetInterval();
    }

    loadActivePromotions();

    // ---------------------------
    // IMAGE SLIDER LOGIC
    // ---------------------------
    document.addEventListener("click", (e) => {

        if (e.target.classList.contains("next")) {
            const slider = e.target.closest(".room-slider");
            const slides = slider.querySelectorAll(".room-slide");

            let index = [...slides].findIndex(s => s.classList.contains("active"));

            slides[index].classList.remove("active");
            index = (index + 1) % slides.length;
            slides[index].classList.add("active");
        }

        if (e.target.classList.contains("prev")) {
            const slider = e.target.closest(".room-slider");
            const slides = slider.querySelectorAll(".room-slide");

            let index = [...slides].findIndex(s => s.classList.contains("active"));

            slides[index].classList.remove("active");
            index = (index - 1 + slides.length) % slides.length;
            slides[index].classList.add("active");
        }
    });

    // ---------------------------
    // BOOKING MODAL
    // ---------------------------
    const bookingModal = document.getElementById('bookingModal');
    const bookingForm = document.getElementById('bookingForm');

    // Set min date for check-in to today
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkInDate');
    const checkOutInput = document.getElementById('checkOutDate');

    if (checkInInput) checkInInput.min = today;

    // Update check-out min when check-in changes
    checkInInput?.addEventListener('change', () => {
        const checkInDate = new Date(checkInInput.value);
        if (checkInDate) {
            const nextDay = new Date(checkInDate);
            nextDay.setDate(checkInDate.getDate() + 1);
            checkOutInput.min = nextDay.toISOString().split('T')[0];
            // Clear check-out if it's now invalid
            if (checkOutInput.value && new Date(checkOutInput.value) <= checkInDate) {
                checkOutInput.value = '';
            }
        }
        calculateTotalPrice();
    });

    checkOutInput?.addEventListener('change', () => {
        calculateTotalPrice();
    });

    let selectedRoomPrice = 0;
    let appliedPromo = null;

    // Calculate total price
    function calculateTotalPrice() {
        const checkIn = document.getElementById("checkInDate")?.value;
        const checkOut = document.getElementById("checkOutDate")?.value;
        const rateDisplay = document.getElementById("rateDisplay");
        const nightsDisplay = document.getElementById("nightsDisplay");
        const discountRow = document.getElementById("discountRow");
        const discountPercentDisplay = document.getElementById("discountPercentDisplay");
        const discountAmountDisplay = document.getElementById("discountAmountDisplay");
        const totalPriceDisplay = document.getElementById("totalPriceDisplay");

        let nights = 0;
        if (checkIn && checkOut) {
            const inDate = new Date(checkIn);
            const outDate = new Date(checkOut);
            const diffTime = outDate - inDate;
            nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Prevent negative or zero nights if dates are invalid
        if (nights <= 0) nights = 0;

        if (rateDisplay) rateDisplay.textContent = `LKR ${Number(selectedRoomPrice).toLocaleString()} / night`;
        if (nightsDisplay) nightsDisplay.textContent = nights;

        let total = selectedRoomPrice * nights;
        let discountAmount = 0;

        if (appliedPromo && nights > 0) {
            discountAmount = (total * appliedPromo.discountPercentage) / 100;
            total -= discountAmount;

            if (discountRow) {
                discountRow.style.display = "flex";
                if (discountPercentDisplay) discountPercentDisplay.textContent = appliedPromo.discountPercentage;
                if (discountAmountDisplay) discountAmountDisplay.textContent = `- LKR ${discountAmount.toLocaleString()}`;
            }
        } else {
            if (discountRow) discountRow.style.display = "none";
        }

        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = `LKR ${total.toLocaleString()}`;
        }

        return total;
    }

    const applyPromoBtn = document.getElementById("applyPromoBtn");
    applyPromoBtn?.addEventListener("click", () => {
        const promoInput = document.getElementById("promoCode");
        const promoMessage = document.getElementById("promoMessage");
        const code = promoInput?.value.trim().toUpperCase();

        if (!code) {
            if (promoMessage) {
                promoMessage.textContent = "Please enter a promo code.";
                promoMessage.style.color = "#dc3545";
            }
            appliedPromo = null;
            calculateTotalPrice();
            return;
        }

        // Search in activePromotionsList
        const validPromo = window.activePromotionsList?.find(p => p.promoCode.toUpperCase() === code);

        if (validPromo) {
            appliedPromo = validPromo;
            if (promoMessage) {
                promoMessage.textContent = `Promo code applied! ${validPromo.discountPercentage}% off.`;
                promoMessage.style.color = "#28a745";
            }
        } else {
            appliedPromo = null;
            if (promoMessage) {
                promoMessage.textContent = "Invalid or expired promo code.";
                promoMessage.style.color = "#dc3545";
            }
        }

        calculateTotalPrice();
    });

    document.addEventListener("click", (e) => {

        const btn = e.target.closest(".btn-book");
        if (!btn) return;

        selectedRoomId = btn.dataset.roomId;
        selectedRoomPrice = parseFloat(btn.dataset.roomPrice) || 0;

        document.getElementById("bookingRoom").value = btn.dataset.roomName;
        document.getElementById("bookingRoomImage").src = btn.dataset.roomImage;

        // Reset promo code and recalculate
        appliedPromo = null;
        const promoInput = document.getElementById("promoCode");
        const promoMessage = document.getElementById("promoMessage");
        if (promoInput) promoInput.value = "";
        if (promoMessage) promoMessage.textContent = "";
        calculateTotalPrice();

        bookingModal?.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    // CLOSE MODAL
    function closeModal() {
        bookingModal?.classList.remove("active");
        document.body.style.overflow = "";
        bookingForm?.reset();
    }

    // ---------------------------
    // CHECK AVAILABILITY LOGIC
    // ---------------------------
    const checkAvailBtn = document.getElementById('check-availability-btn');
    if (checkAvailBtn) {
        checkAvailBtn.addEventListener('click', async () => {
            const checkIn = document.getElementById('check-in')?.value;
            const checkOut = document.getElementById('check-out')?.value;
            const guestsStr = document.getElementById('guests')?.value;
            const guests = guestsStr ? parseInt(guestsStr) : 1;

            if (!checkIn || !checkOut) {
                if (typeof window.showCustomAlert === 'function') {
                    await window.showCustomAlert("Missing Dates", "Please select both Check-In and Check-Out dates.", "warning");
                } else {
                    alert("Please select both Check-In and Check-Out dates.");
                }
                return;
            }

            if (new Date(checkIn) >= new Date(checkOut)) {
                if (typeof window.showCustomAlert === 'function') {
                    await window.showCustomAlert("Invalid Dates", "Check-Out date must be after Check-In date.", "warning");
                } else {
                    alert("Check-Out date must be after Check-In date.");
                }
                return;
            }

            try {
                // Temporary logic using existing API to verify rooms have enough capacity
                // You can update this endpoint to your specific '/api/bookings/available' logic later!
                const res = await fetch(`${API_BASE}/api/rooms`);
                if (!res.ok) throw new Error("Could not connect to the booking system.");

                const rooms = await res.json();
                const availableRooms = rooms.filter(r => r.capacity >= guests);

                if (availableRooms.length > 0) {
                    if (typeof window.showCustomAlert === 'function') {
                        await window.showCustomAlert("Availability Confirmed!", `Great news! We have ${availableRooms.length} room(s) available that can accommodate ${guests} guest(s). Proceed to the Rooms page to book.`, "success");
                    } else {
                        alert("Rooms are available!");
                    }
                } else {
                    if (typeof window.showCustomAlert === 'function') {
                        await window.showCustomAlert("Currently Unavailable", "We're sorry, we don't have available rooms for that capacity.", "error");
                    } else {
                        alert("No rooms available.");
                    }
                }
            } catch (err) {
                if (typeof window.showCustomAlert === 'function') {
                    await window.showCustomAlert("Connection Error", err.message, "error");
                } else {
                    alert(err.message);
                }
            }
        });
    }

    document.querySelector(".modal-close")?.addEventListener("click", closeModal);

    bookingModal?.addEventListener("click", (e) => {
        if (e.target === bookingModal) closeModal();
    });

    // SUCCESS MODAL LOGIC
    const successModal = document.getElementById('successModal');
    document.getElementById('closeSuccessBtn')?.addEventListener("click", () => {
        successModal?.classList.remove("active");
    });

    // ---------------------------
    // BOOKING API
    // ---------------------------
    bookingForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            await window.showCustomAlert("Login Required", "Please login first", "warning");
            window.location.href = "login.html";
            return;
        }

        if (!selectedRoomId) {
            await window.showCustomAlert("Missing Parameter", "No room selected", "warning");
            return;
        }

        const checkInDate = document.getElementById("checkInDate").value;
        const checkOutDate = document.getElementById("checkOutDate").value;
        const guests = parseInt(document.getElementById("guests").value);

        // Validation
        if (!checkInDate) {
            await window.showCustomAlert("Validation Error", "Please select a check-in date.", "warning");
            return;
        }

        if (!checkOutDate) {
            await window.showCustomAlert("Validation Error", "Please select a check-out date.", "warning");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (checkInDate < today) {
            await window.showCustomAlert("Validation Error", "Check-in date cannot be in the past.", "warning");
            return;
        }

        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            await window.showCustomAlert("Validation Error", "Check-out date must be after check-in date.", "warning");
            return;
        }

        if (!guests || guests < 1 || guests > 10) {
            await window.showCustomAlert("Validation Error", "Please select a valid number of guests (1-10).", "warning");
            return;
        }

        const data = {
            roomId: selectedRoomId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests: guests,
            specialRequests: document.getElementById("specialRequests").value,
            promoCode: appliedPromo ? appliedPromo.promoCode : null,
            totalPrice: calculateTotalPrice()
        };

        try {
            const res = await fetch(`${API_BASE}/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Booking failed");

            // Successful Booking!
            closeModal();
            successModal?.classList.add("active");

        } catch (err) {
            await window.showCustomAlert("Error", err.message, "error");
        }
    });

    // ---------------------------
    // BACK TO TOP BUTTON
    // ---------------------------
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Smooth scroll to top
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
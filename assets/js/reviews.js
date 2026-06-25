document.addEventListener('DOMContentLoaded', () => {
    // API Configuration
    const API_BASE_URL = 'https://newdawson-production.up.railway.app/api/reviews'; 

    let reviews = [];
    let isLoading = false;

    const reviewsContainer = document.getElementById('reviews-container');
    const addReviewForm = document.getElementById('add-review-form');
    const stars = document.querySelectorAll('.star-rating-input .star');
    const ratingInput = document.getElementById('review-rating');

    
    function isAdmin() {
        const user = JSON.parse(localStorage.getItem('user'));
        const isAdminUser = user && user.role === 'admin';
        console.log('isAdmin check:', isAdminUser, 'user:', user);
        return isAdminUser;
    }

    
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', function () {
            const val = parseInt(this.getAttribute('data-value'));
            highlightStars(val);
        });

        star.addEventListener('mouseout', function () {
            highlightStars(currentRating);
        });

        star.addEventListener('click', function () {
            currentRating = parseInt(this.getAttribute('data-value'));
            ratingInput.value = currentRating;
            highlightStars(currentRating);
        });
    });

    function highlightStars(val) {
        stars.forEach(star => {
            const starVal = parseInt(star.getAttribute('data-value'));
            if (starVal <= val) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    
    async function renderReviews() {
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">No reviews yet. Be the first to leave one!</p>';
            document.getElementById('avg-score').textContent = "0.0";
            document.getElementById('total-reviews').textContent = "(0 reviews)";
            return;
        }

        let html = '';
        let totalScore = 0;

        
        const displayReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        displayReviews.forEach((review) => {
            console.log('Rendering review:', review);
            
            totalScore += parseInt(review.rating);

            
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHtml += '★';
                } else {
                    starsHtml += '☆';
                }
            }

            const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

            
            const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            
            const deleteButton = isAdmin() ? `<button class="delete-review-btn" data-id="${review.id}" title="Delete Review">🗑️</button>` : '';

            html += `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="reviewer-info">
                            <div class="reviewer-avatar">${initials}</div>
                            <div class="reviewer-details">
                                <h4>${review.name}</h4>
                                <span class="review-date">${reviewDate}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div class="review-stars">${starsHtml}</div>
                            ${deleteButton}
                        </div>
                    </div>
                    <p class="review-text">${escapeHtml(review.comment)}</p>
                </div>
            `;
        });

        reviewsContainer.innerHTML = html;

        // Update aggregates
        const avg = (totalScore / reviews.length).toFixed(1);
        document.getElementById('avg-score').textContent = avg;
        document.getElementById('total-reviews').textContent = `(${reviews.length} reviews)`;

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-review-btn').forEach(btn => {
            console.log('Attaching event listener to delete button with id:', btn.getAttribute('data-id'));
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                console.log('Delete button clicked, id:', id);
                deleteReview(id);
            });
        });
    }

    // Delete review function
    async function deleteReview(id) {
        console.log('Delete review called with id:', id);
        
        let confirmed = false;
        if (typeof window.showCustomConfirm === 'function') {
            confirmed = await window.showCustomConfirm("Delete Review", "Are you sure you want to delete this review?");
        } else {
            confirmed = confirm('Are you sure you want to delete this review?');
        }

        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                console.log('Making DELETE request to:', `${API_BASE_URL}/${id}`);
                console.log('Headers:', headers);

                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'DELETE',
                    headers: headers
                });

                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);

                if (response.ok) {
                    if (typeof window.showCustomAlert === 'function') {
                        window.showCustomAlert("Success", "Review deleted successfully.", "success");
                    } else {
                        alert('Review deleted successfully.');
                    }
                    loadReviews(); // Reload reviews from server
                } else {
                    const errorText = await response.text();
                    console.error('Delete failed with response:', errorText);
                    throw new Error(`Failed to delete review: ${response.status} ${errorText}`);
                }
            } catch (error) {
                console.error('Delete error:', error);
                if (typeof window.showCustomAlert === 'function') {
                    window.showCustomAlert("Error", `Failed to delete review: ${error.message}`, "error");
                } else {
                    alert(`Failed to delete review: ${error.message}`);
                }
            }
        }
    }

    // Input sanitization for reviewer name
    const reviewerNameInput = document.getElementById('reviewer-name');
    reviewerNameInput?.addEventListener('input', function () {
        this.value = this.value.replace(/[^A-Za-z\s'\-]/g, '');
    });

    // Form submission
    addReviewForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (currentRating === 0) {
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Missing Rating", "Please select a star rating.", "warning");
            } else {
                alert('Please select a star rating.');
            }
            return;
        }

        const name = reviewerNameInput.value.trim();
        const comment = document.getElementById('review-text').value.trim();

        // Validation
        const nameRegex = /^[A-Za-z\s'\-]{2,100}$/;
        if (!name || !nameRegex.test(name)) {
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Validation Error", "Please enter a valid name with only letters, spaces, apostrophes, or hyphens.", "warning");
            } else {
                alert('Please enter a valid name.');
            }
            return;
        }

        if (!comment || comment.length < 10 || comment.length > 1000) {
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Validation Error", "Review must be between 10 and 1000 characters.", "warning");
            } else {
                alert('Review must be between 10 and 1000 characters.');
            }
            return;
        }

        // Submit to API
        try {
            const button = addReviewForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = 'Submitting...';

            const reviewData = {
                name: name,
                rating: currentRating,
                comment: comment
            };

            const token = localStorage.getItem("token"); // get saved token

const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ✅ ADD THIS LINE
    },
    body: JSON.stringify(reviewData)
});

            if (response.ok) {
                // Reset Form
                addReviewForm.reset();
                currentRating = 0;
                ratingInput.value = 0;
                highlightStars(0);

                // Show thank you message
                if (typeof window.showCustomAlert === 'function') {
                    window.showCustomAlert(
                        "Thank You!",
                        "Thank you for staying with us and sharing your valuable feedback. We're delighted to have hosted you and hope your stay was relaxing and enjoyable.",
                        "success"
                    );
                } else {
                    alert('Thank you! Your review has been submitted successfully.');
                }

                // Reload reviews from server
                await loadReviews();

                // Scroll to top of reviews list
                document.querySelector('.reviews-list-container').scrollIntoView({ behavior: 'smooth' });
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Submit error:', error);
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert("Error", `Failed to submit review: ${error.message}`, "error");
            } else {
                alert(`Failed to submit review: ${error.message}`);
            }
        } finally {
            const button = addReviewForm.querySelector('button[type="submit"]');
            button.disabled = false;
            button.textContent = 'Submit Review';
        }
    });

    // Initial render
    loadReviews();

    // Load reviews from API
    async function loadReviews() {
        console.log('Loading reviews from API...');
        try {
            isLoading = true;
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(API_BASE_URL, {
                headers: headers
            });
            console.log('Load reviews response status:', response.status);
            
            if (response.ok) {
                reviews = await response.json();
                console.log('Loaded reviews:', reviews);
                renderReviews();
            } else {
                throw new Error('Failed to load reviews');
            }
        } catch (error) {
            console.error('Load error:', error);
            reviewsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">Unable to load reviews. Please try again later.</p>';
        } finally {
            isLoading = false;
        }
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

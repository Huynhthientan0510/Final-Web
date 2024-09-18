// Toggle Dark Mode
document.getElementById('darkModeToggle').addEventListener('click', function () {
	document.body.classList.toggle('dark-mode');
	if (document.body.classList.contains('dark-mode')) {
		this.textContent = 'Light Mode';
	} else {
		this.textContent = 'Dark Mode';
	}
});

// Check login status (You can adjust this if you have session management in PHP)
function checkLoginStatus() {
	return localStorage.getItem("isLoggedIn") === "true";
}

// Function to handle Add to Cart and Buy Now actions
function handleAction(action, courseId, courseName) {
	if (checkLoginStatus()) {
		if (action === "add_to_cart") {
			// Call the function to handle Add to Cart
			handleAddToCart(courseId, courseName);
		} else if (action === "buy_now") {
			// Redirect to purchase page
			window.location.href = "purchase.html?course=" + courseId;
		}
	} else {
		// User is not logged in, redirect to login page
		sessionStorage.setItem("redirect_url", window.location.href);  // Store the current URL
		sessionStorage.setItem("action", action);
		sessionStorage.setItem("course_id", courseId);  // Store the course ID for later use
		sessionStorage.setItem("course_name", courseName);  // Store the course name
		window.location.href = "../login.html";  // Redirect to login page
	}
}

// Event listener for Add to Cart and Buy Now buttons
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.add-to-cart-btn').forEach(button => {
		button.addEventListener('click', () => {
			const courseId = button.getAttribute('data-course-id');
			const courseName = button.closest('.card-body').querySelector('.card-title').textContent;
			const coursePrice = button.getAttribute('data-course-price');
			handleAction("add_to_cart", courseId, courseName, coursePrice);
		});
	});

	document.querySelectorAll('.subscribe-btn').forEach(button => {
		button.addEventListener('click', () => {
			const courseId = button.getAttribute('data-course-id');
			const courseName = button.closest('.card-body').querySelector('.card-title').textContent;
			handleAction("buy_now", courseId, courseName);
		});
	});
});

// Handle Add to Cart logic with AJAX
// Handle Add to Cart logic with AJAX
function handleAddToCart(courseId, courseName, coursePrice) {
	const xhr = new XMLHttpRequest();
	xhr.open("POST", "add_to_cart.php", true); // PHP file to handle cart addition
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onload = function () {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			if (response.success) {
				Swal.fire({
					icon: 'success',
					title: 'Course Added',
					text: 'Course has been added to your cart!',
					timer: 3000,
					showConfirmButton: false
				});
			} else if (response.duplicate) {
				// Duplicate course message
				Swal.fire({
					icon: 'warning',
					title: 'Duplicate Course',
					text: 'This course is already in your cart!',
					timer: 3000,
					showConfirmButton: false
				});
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: response.message || 'Failed to add the course to your cart.',
					timer: 3000,
					showConfirmButton: false
				});
			}
		} else {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'An error occurred while adding the course to your cart.',
				timer: 3000,
				showConfirmButton: false
			});
		}
	};

	// Send courseId, courseName, and coursePrice to PHP
	xhr.send(`course_id=${courseId}&course_name=${encodeURIComponent(courseName)}&course_price=${coursePrice}`);
}

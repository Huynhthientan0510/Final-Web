<?php
session_start();
include '../includes/db.php';  // Include your database connection

// Check if the user is logged in
if (!isset($_SESSION['isLoggedIn']) || $_SESSION['isLoggedIn'] !== true) {
	echo json_encode(['success' => false, 'message' => 'User not logged in']);
	exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$userId = $_SESSION['user_id'];
	$username = $_SESSION['username'];
	$courseId = $_POST['course_id'];
	$courseName = $_POST['course_name'];
	$coursePrice = $_POST['course_price'];

if (!isset($coursePrice) || empty($coursePrice)) {
	echo json_encode(['success' => false, 'message' => 'Course price is missing']);
	exit();
}

// Debugging: Print the received course price
error_log("Received course price: " . $coursePrice);

	// Check if the course is already in the cart
	$checkQuery = "SELECT * FROM cart WHERE user_id = ? AND course_id = ?";
	$checkStmt = mysqli_prepare($conn, $checkQuery);
	mysqli_stmt_bind_param($checkStmt, "ii", $userId, $courseId);
	mysqli_stmt_execute($checkStmt);
	$checkResult = mysqli_stmt_get_result($checkStmt);

	if (mysqli_num_rows($checkResult) > 0) {
		// Course is already in the cart
		echo json_encode(['success' => false, 'message' => 'Duplicate course', 'duplicate' => true]);
	} else {
		// Prepare an SQL query to insert the course into the Cart table
		$query = "INSERT INTO cart (user_id, course_id, course_name, username, price) VALUES (?, ?, ?, ?, ?)";
		$stmt = mysqli_prepare($conn, $query);
		if ($stmt) {
			mysqli_stmt_bind_param($stmt, "iissd", $userId, $courseId, $courseName, $username, $coursePrice);  // Added price
			mysqli_stmt_execute($stmt);
			if (mysqli_stmt_affected_rows($stmt) > 0) {
				echo json_encode(['success' => true, 'message' => 'Course added to cart']);
			} else {
				echo json_encode(['success' => false, 'message' => 'Failed to add course to cart']);
			}
			mysqli_stmt_close($stmt);
		} else {
			echo json_encode(['success' => false, 'message' => 'Database query error']);
		}
	}

	mysqli_stmt_close($checkStmt);
} else {
	echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

mysqli_close($conn);

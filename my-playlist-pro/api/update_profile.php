<?php
require 'db.php';
require_once __DIR__ . '/classes/User.php';
session_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }
try {
    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    if (!$username) { http_response_code(400); echo json_encode(['error' => 'Username required']); exit; }
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['error' => 'Invalid email']); exit; }
    $user = new User($pdo);
    $user->updateProfile($user_id, $username, $email);
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

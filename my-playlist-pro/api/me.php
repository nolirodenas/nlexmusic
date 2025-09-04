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
    $user = new User($pdo);
    $u = $user->getById($user_id);
    if (!$u) { http_response_code(404); echo json_encode(['error' => 'User not found']); exit; }
    echo json_encode($u);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

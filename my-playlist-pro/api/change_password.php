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
    $current = $data['current'] ?? '';
    $new = $data['new'] ?? '';
    if (!$current || !$new) { http_response_code(400); echo json_encode(['error' => 'Missing fields']); exit; }

    $user = new User($pdo);
    if (!$user->verifyPassword($user_id, $current)) { http_response_code(403); echo json_encode(['error' => 'Current password incorrect']); exit; }
    $user->setPassword($user_id, $new);
    echo json_encode(['success' => true]);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}

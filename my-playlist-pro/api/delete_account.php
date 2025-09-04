<?php
session_start();
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/classes/User.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }
$userId = $_SESSION['user_id'];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true) ?: [];
if (isset($input['confirm']) && $input['confirm'] !== true && $input['confirm'] !== 'true') { http_response_code(400); echo json_encode(['error' => 'Confirmation required']); exit; }

try {
    $user = new User($pdo);
    $ok = $user->deleteAccount($userId);
    if (!$ok) { http_response_code(500); echo json_encode(['error' => 'Failed to delete account']); exit; }

    // destroy session and cookie
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'], $params['secure'], $params['httponly']
        );
    }
    session_destroy();

    echo json_encode(['ok' => true]);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete account']);
    exit;
}

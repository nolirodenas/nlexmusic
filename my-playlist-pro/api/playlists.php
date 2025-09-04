<?php
require 'db.php';
require_once __DIR__ . '/classes/Playlist.php';
session_start();

ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}
try {
    $user_id = $_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];
    $playlist = new Playlist($pdo);

    
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    if ($method === 'GET') {
        $rows = $playlist->getAll($user_id);
        echo json_encode($rows);
        exit;
    }

    if ($method === 'POST') {
        $name = trim($input['name'] ?? '');
        $desc = trim($input['description'] ?? '');
        $spotify = trim($input['spotify_url'] ?? '') ?: null;
        if (!$name) { http_response_code(400); echo json_encode(['error' => 'Name required']); exit; }
        $id = $playlist->create($user_id, $name, $desc, $spotify);
        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    }

    if ($method === 'PUT') {
        $id = (int)($input['id'] ?? 0);
        $ok = $playlist->update($user_id, $id, $input);
        echo json_encode(['success' => (bool)$ok]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        $ok = $playlist->delete($user_id, $id);
        echo json_encode(['success' => (bool)$ok]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    // Return JSON error without exposing stack traces; log as needed
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}

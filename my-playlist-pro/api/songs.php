<?php
require 'db.php';
require_once __DIR__ . '/classes/Song.php';
session_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }

try {
    $user_id = $_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];
    $song = new Song($pdo);

    if ($method === 'GET') {
        $playlist_id = (int)($_GET['playlist_id'] ?? 0);
        echo json_encode($song->getByPlaylist($playlist_id));
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    if ($method === 'POST') {
        // If multipart, PHP will populate $_POST and $_FILES
        $isMultipart = !empty($_FILES) || !empty($_POST);
        $playlist_id = $isMultipart ? (int)($_POST['playlist_id'] ?? 0) : (int)($data['playlist_id'] ?? 0);
        $title = $isMultipart ? trim($_POST['title'] ?? '') : trim($data['title'] ?? '');
        $artist = $isMultipart ? trim($_POST['artist'] ?? '') : trim($data['artist'] ?? '');
        $album = $isMultipart ? trim($_POST['album'] ?? '') : trim($data['album'] ?? '');
        if (!$title) { http_response_code(400); echo json_encode(['error' => 'Title required']); exit; }
        $owner = $song->playlistOwner($playlist_id);
        if ($owner === null) { http_response_code(404); echo json_encode(['error' => 'Playlist not found']); exit; }
        if ($owner !== $user_id) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit; }

        $file_url = null;
        if (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../public/uploads';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $orig = basename($_FILES['file']['name']);
            $ext = pathinfo($orig, PATHINFO_EXTENSION);
            $safe = bin2hex(random_bytes(8)) . ($ext ? '.' . preg_replace('/[^a-z0-9]+/i', '', $ext) : '');
            $dest = $uploadDir . '/' . $safe;
            if (move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
                // build web-accessible URL (relative to project root)
                $file_url = '/Music%20Playlist%20App/my-playlist-pro/public/uploads/' . $safe;
            }
        }

        // attempt create, but auto-add `file_url` column if DB missing it
        try {
            $id = $song->create($playlist_id, $title, $artist, $album, $file_url);
        } catch (PDOException $ex) {
            $msg = $ex->getMessage();
            // detect missing column error (SQLSTATE 42S22 / 1054)
            if (stripos($msg, 'Unknown column') !== false || stripos($msg, '42S22') !== false || stripos($msg, '1054') !== false) {
                // try to add the column and retry once
                $alterSql = "ALTER TABLE songs ADD COLUMN IF NOT EXISTS file_url VARCHAR(255) NULL";
                try {
                    $pdo->exec($alterSql);
                } catch (Throwable $e2) {
                    // log and rethrow original
                    @file_put_contents(__DIR__ . '/.error.log', '['.date('c').'] Failed to add file_url column: '. $e2->getMessage() ."\n", FILE_APPEND);
                    throw $ex;
                }

                // retry create
                $id = $song->create($playlist_id, $title, $artist, $album, $file_url);
            } else {
                throw $ex;
            }
        }
        echo json_encode(['success' => true, 'id' => $id, 'file_url' => $file_url]); exit;
    }

    if ($method === 'PUT') {
        $id = (int)($data['id'] ?? 0);
        $ok = $song->update($id, $data);
        echo json_encode(['success' => (bool)$ok]); exit;
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        $ok = $song->delete($id);
        echo json_encode(['success' => (bool)$ok]); exit;
    }
} catch (Throwable $e) {
    // log detailed error for debugging
    $logFile = __DIR__ . '/.error.log';
    $msg = '[' . date('c') . '] ' . (string)$e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
    @file_put_contents($logFile, $msg, FILE_APPEND);
    http_response_code(500);
    // return a friendly error plus detail to help debugging in local dev
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
    exit;
}

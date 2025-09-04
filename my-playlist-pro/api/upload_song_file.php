<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_POST['playlist_id']) || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing playlist_id or file']);
    exit;
}

$playlist_id = intval($_POST['playlist_id']);
$file = $_FILES['file'];

$allowed = ['mp3' => 'audio/mpeg', 'wav' => 'audio/wav'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!isset($allowed[$ext]) || $file['type'] !== $allowed[$ext]) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

$uploadDir = __DIR__ . '/../public/uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
$filename = uniqid() . "." . $ext;
$target = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move file']);
    exit;
}

// Insert song record
$title = $_POST['title'] ?? $file['name'];
$artist = $_POST['artist'] ?? '';
$album = $_POST['album'] ?? '';
$url = "/uploads/$filename";
$stmt = $pdo->prepare('INSERT INTO songs (playlist_id, title, artist, album, url) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$playlist_id, $title, $artist, $album, $url]);

$song_id = $pdo->lastInsertId();
echo json_encode(['success' => true, 'id' => $song_id, 'url' => $url]);

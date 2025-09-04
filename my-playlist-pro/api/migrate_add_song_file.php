<?php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
try {
    $check = $pdo->prepare("SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'songs' AND COLUMN_NAME = 'file_url'");
    $check->execute();
    $row = $check->fetch(PDO::FETCH_ASSOC);
    $added = false;
    if (empty($row) || (int)$row['cnt'] === 0) {
        $pdo->exec("ALTER TABLE songs ADD COLUMN file_url VARCHAR(255) DEFAULT NULL");
        $added = true;
    }
    echo json_encode(['ok' => true, 'column_added' => $added]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

<?php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
try {
   
    $check = $pdo->prepare("SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'playlists' AND COLUMN_NAME = 'favorite'");
    $check->execute();
    $row = $check->fetch(PDO::FETCH_ASSOC);
    $added = false;
    if (empty($row) || (int)$row['cnt'] === 0) {
    
        $pdo->exec("ALTER TABLE playlists ADD COLUMN favorite TINYINT(1) NOT NULL DEFAULT 0");
        $added = true;
    }

    $idx = $pdo->prepare("SELECT COUNT(*) AS cnt FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'playlists' AND INDEX_NAME = 'idx_playlists_favorite'");
    $idx->execute();
    $irow = $idx->fetch(PDO::FETCH_ASSOC);
    $indexCreated = false;
    if (empty($irow) || (int)$irow['cnt'] === 0) {
        $pdo->exec("CREATE INDEX idx_playlists_favorite ON playlists (favorite)");
        $indexCreated = true;
    }

    echo json_encode(['ok' => true, 'column_added' => $added, 'index_created' => $indexCreated]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

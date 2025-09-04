<?php
class Playlist {
    private $pdo;
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getAll(int $user_id): array {
        try {
            $stmt = $this->pdo->prepare('SELECT id, user_id, name, description, COALESCE(favorite,0) AS favorite, COALESCE(spotify_url, NULL) AS spotify_url FROM playlists WHERE user_id = ?');
            $stmt->execute([$user_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // fallback simple columns
            $stmt = $this->pdo->prepare('SELECT id, user_id, name, description FROM playlists WHERE user_id = ?');
            $stmt->execute([$user_id]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$r) { $r['favorite'] = 0; $r['spotify_url'] = null; } unset($r);
            return $rows;
        }
    }

    public function create(int $user_id, string $name, string $description = '', ?string $spotify = null): int {
        $stmt = $this->pdo->prepare('INSERT INTO playlists (user_id, name, description, spotify_url) VALUES (?, ?, ?, ?)');
        $stmt->execute([$user_id, $name, $description, $spotify]);
        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $user_id, int $id, array $data): bool {
        if (isset($data['favorite'])) {
            $fav = $data['favorite'] ? 1 : 0;
            $stmt = $this->pdo->prepare('UPDATE playlists SET favorite = ? WHERE id = ? AND user_id = ?');
            return $stmt->execute([$fav, $id, $user_id]);
        }
        if (isset($data['spotify_url'])) {
            $s = trim($data['spotify_url']) ?: null;
            $stmt = $this->pdo->prepare('UPDATE playlists SET spotify_url = ? WHERE id = ? AND user_id = ?');
            return $stmt->execute([$s, $id, $user_id]);
        }
        $name = trim($data['name'] ?? '');
        $desc = trim($data['description'] ?? '');
        $stmt = $this->pdo->prepare('UPDATE playlists SET name = ?, description = ? WHERE id = ? AND user_id = ?');
        return $stmt->execute([$name, $desc, $id, $user_id]);
    }

    public function delete(int $user_id, int $id): bool {
        $stmt = $this->pdo->prepare('DELETE FROM playlists WHERE id = ? AND user_id = ?');
        return $stmt->execute([$id, $user_id]);
    }
}

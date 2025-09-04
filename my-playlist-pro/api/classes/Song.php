<?php
class Song {
    private $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function getByPlaylist(int $playlist_id): array {
        // Always return a 'url' property for the frontend audio player
        $stmt = $this->pdo->prepare('SELECT id, playlist_id, title, artist, album, COALESCE(file_url, url, NULL) AS url FROM songs WHERE playlist_id = ?');
        $stmt->execute([$playlist_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(int $playlist_id, string $title, string $artist = '', string $album = '', ?string $file_url = null): int {
        $stmt = $this->pdo->prepare('INSERT INTO songs (playlist_id, title, artist, album, file_url) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$playlist_id, $title, $artist, $album, $file_url]);
        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $title = trim($data['title'] ?? '');
        $artist = trim($data['artist'] ?? '');
        $album = trim($data['album'] ?? '');
        $stmt = $this->pdo->prepare('UPDATE songs SET title = ?, artist = ?, album = ? WHERE id = ?');
        return $stmt->execute([$title, $artist, $album, $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare('DELETE FROM songs WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function playlistOwner(int $playlist_id): ?int {
        $stmt = $this->pdo->prepare('SELECT user_id FROM playlists WHERE id = ?');
        $stmt->execute([$playlist_id]);
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        return $r ? (int)$r['user_id'] : null;
    }
}

<?php
class User {
    private $pdo;
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $u = $stmt->fetch(PDO::FETCH_ASSOC);
        return $u ?: null;
    }

    public function updateProfile(int $id, string $username, ?string $email): bool {
        $stmt = $this->pdo->prepare('UPDATE users SET username = ?, email = ? WHERE id = ?');
        return $stmt->execute([$username, $email, $id]);
    }

    public function verifyPassword(int $id, string $password): bool {
        $stmt = $this->pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $u = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$u) return false;
        return password_verify($password, $u['password_hash']);
    }

    public function setPassword(int $id, string $password): bool {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        return $stmt->execute([$hash, $id]);
    }

    public function deleteAccount(int $id): bool {
        try {
            $this->pdo->beginTransaction();
        
            $delSongs = $this->pdo->prepare('DELETE s FROM songs s JOIN playlists p ON s.playlist_id = p.id WHERE p.user_id = ?');
            $delSongs->execute([$id]);
       
            $delPlaylists = $this->pdo->prepare('DELETE FROM playlists WHERE user_id = ?');
            $delPlaylists->execute([$id]);
           
            $delUser = $this->pdo->prepare('DELETE FROM users WHERE id = ?');
            $delUser->execute([$id]);
            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            return false;
        }
    }
}

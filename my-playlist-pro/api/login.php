<?php
require 'db.php';
session_start();

// If visited directly in a browser, redirect to the server login page
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Location: /Music%20Playlist%20App/my-playlist-pro/pages/login.php');
    exit;
}
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isJson = stripos($contentType, 'application/json') !== false;
if ($isJson) { ini_set('display_errors', '0'); error_reporting(E_ALL); header('Content-Type: application/json'); }

if ($isJson) {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim($data['email'] ?? '');
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
} else {
    $email = trim($_POST['email'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
}

// If the client posted a single identifier (the login form uses 'email' field for email or username),
// treat a value without '@' as a username so users can login with either.
if (!$isJson) {
    if (!$username && $email && strpos($email, '@') === false) {
        $username = $email;
        $email = '';
    }
}

// Basic validation
$errors = [];
if (!$email && !$username) $errors[] = 'Email or username required';
if (!$password) $errors[] = 'Password required';
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email';

if ($errors) {
    if ($isJson) {
        http_response_code(400);
        echo json_encode(['error' => implode('; ', $errors)]);
        exit;
    } else {
        header('Location: /Music%20Playlist%20App/my-playlist-pro/pages/login.php?error=' . urlencode(implode('; ', $errors)));
        exit;
    }
}

try {
    if ($email) {
        $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
    } else {
        $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
    }
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && password_verify($password, $user['password_hash'])) {
        // Prevent session fixation
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        if ($isJson) {
            echo json_encode(['success' => true, 'username' => $user['username']]);
            exit;
        } else {
            header('Location: /Music%20Playlist%20App/my-playlist-pro/pages/dashboard.php');
            exit;
        }
    } else {
        if ($isJson) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit;
        } else {
            header('Location: /Music%20Playlist%20App/my-playlist-pro/pages/login.php?error=' . urlencode('Invalid credentials'));
            exit;
        }
    }
} catch (PDOException $e) {
    if ($isJson) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    } else {
        header('Location: /Music%20Playlist%20App/my-playlist-pro/pages/login.php?error=' . urlencode('Server error'));
    }
    exit;
}

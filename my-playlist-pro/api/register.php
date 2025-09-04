<?php
require 'db.php';
session_start();

function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

$isPost = $_SERVER['REQUEST_METHOD'] === 'POST';
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isJson = stripos($contentType, 'application/json') !== false;

if (!$isPost) {
    // Show HTML form. If errors/inputs passed via query string show them.
    $error = $_GET['error'] ?? '';
    $usernameVal = $_GET['username'] ?? '';
    $emailVal = $_GET['email'] ?? '';
    $registered = isset($_GET['registered']);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Register — Music Playlist</title><script src="https://cdn.tailwindcss.com"></script><style>@keyframes fadeInRight{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}@keyframes fadeInLeft{from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);}}</style></head><body class="min-h-screen bg-gradient-to-br from-black via-violet-900 to-teal-700 flex items-center justify-center">
    <div class="w-full max-w-3xl bg-black/80 rounded-2xl shadow-2xl p-0 border border-violet-700 flex flex-col md:flex-row overflow-hidden">
        <div class="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-violet-900/80 to-teal-800/80 p-10 w-1/2 animate-[fadeInLeft_1s_ease]">
            <img src="/Music%20Playlist%20App/my-playlist-pro/public/logo.svg" alt="logo" class="w-20 h-20 mb-6 drop-shadow-xl">
            <h2 class="text-3xl font-extrabold text-violet-200 mb-2 tracking-tight text-center">Welcome!</h2>
            <p class="text-base text-gray-300 text-center">Create your free account and start building your music playlists.</p>
            <svg class="mt-8 w-32 h-32 text-teal-400 animate-spin-slow" fill="none" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" stroke-dasharray="62 38"/></svg>
        </div>
        <div class="flex-1 flex flex-col justify-center p-8 animate-[fadeInRight_1s_ease]">
            <div class="flex flex-col items-center mb-6 md:mb-4">
                <div class="md:hidden mb-4"><img src="/Music%20Playlist%20App/my-playlist-pro/public/logo.svg" alt="logo" class="w-14 h-14"></div>
                <h1 class="text-3xl font-extrabold text-violet-200 mb-1 tracking-tight">Create Account</h1>
                <p class="text-sm text-gray-400">Sign up to start your music journey</p>
            </div>';

    if ($registered) {
        echo '<div class="max-w-xl mx-auto mb-4 text-center text-sm text-green-300">Registration successful. You can now log in.</div>';
    }
    if ($error) {
        echo '<div class="max-w-xl mx-auto mb-4 text-center text-sm text-red-400">' . e($error) . '</div>';
    }

    echo '<form method="post" class="space-y-5" novalidate>
                <div>
                    <label class="block text-sm text-gray-300 font-medium">Username</label>
                    <input name="username" value="' . e($usernameVal) . '" pattern="[A-Za-z0-9_]{3,20}" minlength="3" maxlength="20" required class="w-full mt-1 px-4 py-2 rounded-lg bg-black/40 border border-violet-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-600 text-white text-base transition">
                    <p class="text-xs text-gray-400 mt-1">3-20 chars; letters, numbers, underscore</p>
                </div>
                <div>
                    <label class="block text-sm text-gray-300 font-medium">Email</label>
                    <input name="email" type="email" value="' . e($emailVal) . '" required class="w-full mt-1 px-4 py-2 rounded-lg bg-black/40 border border-violet-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-600 text-white text-base transition">
                </div>
                <div>
                    <label class="block text-sm text-gray-300 font-medium">Password</label>
                    <input name="password" type="password" minlength="8" required class="w-full mt-1 px-4 py-2 rounded-lg bg-black/40 border border-violet-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-600 text-white text-base transition">
                    <p class="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                    <label class="block text-sm text-gray-300 font-medium">Confirm Password</label>
                    <input name="confirm_password" type="password" minlength="8" required class="w-full mt-1 px-4 py-2 rounded-lg bg-black/40 border border-violet-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-600 text-white text-base transition">
                </div>
                <div class="flex items-center justify-between mt-6">
                    <button type="submit" class="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-400 hover:to-violet-500 text-white font-semibold shadow transition">Register</button>
                    <a href="/my-playlist-pro/" class="text-sm text-teal-400 hover:underline">Back to app</a>
                </div>
            </form>
            <p class="mt-6 text-xs text-gray-400 text-center">Already have an account? <a href="/Music%20Playlist%20App/my-playlist-pro/api/login.php" class="text-teal-300 hover:underline">Login</a></p>
            <p class="mt-4 text-xs text-gray-500 text-center">API: POST to <span class="font-mono">/api/register.php</span> with JSON {username,email,password}</p>
        </div>
    </div></body></html>';
    exit;
}

// POST handling (JSON or form)
if ($isJson) {
    header('Content-Type: application/json; charset=utf-8');
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
} else {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? null;
    if ($confirm === null || $confirm === '') {
        $err = 'Please confirm password';
        if ($isJson) { http_response_code(400); echo json_encode(['error'=>$err]); exit; }
        header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode($err) . '&username=' . urlencode($username) . '&email=' . urlencode($email));
        exit;
    }
    if ($password !== $confirm) {
        $err = 'Passwords do not match';
        if ($isJson) { http_response_code(400); echo json_encode(['error'=>$err]); exit; }
        header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode($err) . '&username=' . urlencode($username) . '&email=' . urlencode($email));
        exit;
    }
}

// Server-side validation
if ($username === '' || $email === '' || $password === '') {
    if ($isJson) { http_response_code(400); echo json_encode(['error'=>'All fields required']); exit; }
    header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode('All fields required') . '&username=' . urlencode($username) . '&email=' . urlencode($email));
    exit;
}
if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username)) {
    if ($isJson) { http_response_code(400); echo json_encode(['error'=>'Invalid username']); exit; }
    header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode('Invalid username (3-20 letters/numbers/underscore)') . '&email=' . urlencode($email));
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if ($isJson) { http_response_code(400); echo json_encode(['error'=>'Invalid email']); exit; }
    header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode('Invalid email') . '&username=' . urlencode($username));
    exit;
}
if (strlen($password) < 8) {
    if ($isJson) { http_response_code(400); echo json_encode(['error'=>'Password too short']); exit; }
    header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode('Password must be at least 8 characters') . '&username=' . urlencode($username) . '&email=' . urlencode($email));
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
    $stmt->execute([$username, $email]);
    $exists = $stmt->fetchColumn();
    if ($exists) {
        if ($isJson) { http_response_code(409); echo json_encode(['error'=>'User already exists']); exit; }
        header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode('User already exists') . '&username=' . urlencode($username) . '&email=' . urlencode($email));
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $ins->execute([$username, $email, $hash, 'user']);
    $userId = $pdo->lastInsertId();

    if ($isJson) {
        $_SESSION['user_id'] = $userId;
        echo json_encode(['success'=>true, 'id'=>$userId, 'username'=>$username]);
        exit;
    } else {
        header('Location: /Music%20Playlist%20App/my-playlist-pro/api/login.php?registered=1');
        exit;
    }
} catch (PDOException $e) {
    if ($isJson) {
        http_response_code(500);
        echo json_encode(['error'=>'Server error']);
        exit;
    }
    header('Location: /Music%20Playlist%20App/my-playlist-pro/api/register.php?error=' . urlencode('Server error'));
    exit;
}

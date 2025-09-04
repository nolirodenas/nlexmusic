<?php

$host = 'localhost';
$db   = 'music_playlist';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';


$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
     PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
     PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
     PDO::ATTR_EMULATE_PREPARES   => false,
];

// Development-friendly DB connection: provide a useful JSON error and log details locally.
try {
     if (!extension_loaded('pdo')) {
          http_response_code(500);
          echo json_encode(['error' => 'PDO extension not available']);
          exit;
     }
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
     // write a small log to api/.db_error.log (local dev only)
     $log = __DIR__ . '/.db_error.log';
     $msg = date('c') . ' - DB connection error: ' . $e->getMessage() . PHP_EOL;
     @file_put_contents($log, $msg, FILE_APPEND);

     http_response_code(500);
     // Return a helpful error to the browser for debugging; remove detail in production.
     echo json_encode([
          'error' => 'Database connection failed',
          'detail' => $e->getMessage(),
          'hint' => 'Check MySQL server, credentials in api/db.php, and that pdo_mysql is enabled.'
     ]);
     exit;
}
 
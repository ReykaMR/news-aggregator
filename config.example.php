<?php
/**
 * Config Example untuk NewsHub
 * 
 * Salin file ini menjadi "config.php"
 * lalu ganti your_actual_api_key_here dengan API Key Anda dari NewsAPI.org
 */

define('NEWS_API_KEY', 'your_actual_api_key_here'); // Ganti dengan API key asli

define('DEBUG_MODE', true); // Mode debug (true = aktif, false = nonaktif)

$allowed_origins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:8080',
    'https://yourdomain.com' // Ganti dengan domain anda
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Default ke localhost untuk development
    header('Access-Control-Allow-Origin: http://localhost');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
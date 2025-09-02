<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

if (!defined('NEWS_API_KEY') || empty(NEWS_API_KEY) || NEWS_API_KEY === 'your_actual_api_key_here') {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server configuration error: API key not set',
        'hint' => 'Please set up your NewsAPI key in config.php'
    ]);
    exit;
}

$BASE = 'https://newsapi.org/v2';

$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : 'top-headlines';
$allowed_endpoints = ['top-headlines', 'everything', 'sources'];
if (!in_array($endpoint, $allowed_endpoints)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid endpoint',
        'allowed_endpoints' => $allowed_endpoints
    ]);
    exit;
}

$whitelist = [
    'q',
    'country',
    'category',
    'sources',
    'page',
    'pageSize',
    'language',
    'domains',
    'excludeDomains',
    'from',
    'to',
    'sortBy',
    'searchIn'
];

$params = [];
foreach ($_GET as $key => $value) {
    if (in_array($key, $whitelist) && !empty($value)) {
        $sanitized_value = filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);

        switch ($key) {
            case 'page':
            case 'pageSize':
                if (!is_numeric($sanitized_value) || $sanitized_value < 1) {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => "Invalid value for $key: must be a positive number"
                    ]);
                    exit;
                }
                if ($key === 'pageSize' && $sanitized_value > 50) {
                    $sanitized_value = 50;
                }
                break;

            case 'language':
                if (!preg_match('/^[a-z]{2}$/', $sanitized_value)) {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => "Invalid language code: must be 2 letters"
                    ]);
                    exit;
                }
                break;

            case 'from':
            case 'to':
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $sanitized_value)) {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => "Invalid date format for $key: must be YYYY-MM-DD"
                    ]);
                    exit;
                }
                break;
        }

        $params[$key] = $sanitized_value;
    }
}

$params['apiKey'] = NEWS_API_KEY;

$query_string = http_build_query($params);
$url = $BASE . '/' . $endpoint . '?' . $query_string;

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'User-Agent: NewsAggregator/1.0'
    ],
    CURLOPT_TIMEOUT => 15,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    error_log("NewsAPI cURL Error: " . $error);
    http_response_code(502);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unable to connect to news service',
        'debug' => (defined('DEBUG_MODE') && DEBUG_MODE) ? $error : null
    ]);
    exit;
}

if ($http_code >= 400) {
    $response_data = json_decode($response, true);
    $message = isset($response_data['message']) ? $response_data['message'] : 'Unknown error';

    error_log("NewsAPI Error ($http_code): " . $message);

    http_response_code($http_code);
    echo json_encode([
        'status' => 'error',
        'message' => 'News service error: ' . $message,
        'code' => $http_code
    ]);
    exit;
}

http_response_code($http_code);
echo $response;
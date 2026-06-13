<?php
require_once 'origins.php';

header('Content-Type: application/json');

$file = $_GET['file'] ?? '';

// Security: strip path traversal, allow only m3u/m3u8
$file = basename($file);

if (!preg_match('/\.m3u8?$/i', $file)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit;
}

$path = __DIR__ . '/localFolder/IP_TV_08062026/' . $file;

if (!file_exists($path)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'File not found: ' . $file]);
    exit;
}

if (unlink($path)) {
    echo json_encode(['success' => true, 'message' => $file . ' deleted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete file']);
}
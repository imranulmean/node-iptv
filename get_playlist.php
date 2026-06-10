<?php
require_once 'origins.php';
 
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
    echo json_encode(['success' => false, 'message' => 'File not found']);
    exit;
}
 
header('Content-Type: audio/x-mpegurl');
header('Access-Control-Allow-Origin: *');
readfile($path);
<?php

// $allowedOrigins = [
//     'https://livetv.sysnolodge.com.au'
//     'http://localhost:5173'
// ];

// if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins, true)) {
//     header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
// }

header('Access-Control-Allow-Origin: * ' );
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
 
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}
 
if (!isset($_FILES['files']) || $_FILES['files']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error.']);
    exit;
}
 
$file     = $_FILES['files'];
$origName = basename($file['name']);
$ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
 
if (!in_array($ext, ['m3u', 'm3u8'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Only .m3u or .m3u8 files are allowed.']);
    exit;
}
 
// Sanitize filename — keep only alphanumerics, dots, dashes, underscores
$safeName = preg_replace('/[^a-zA-Z0-9.\-_]/', '_', $origName);
 
// Save directory — relative to this PHP file (both live in public_html)
$saveDir = __DIR__ . '/localFolder/IP_TV_08062026/';
 
if (!is_dir($saveDir)) {
    mkdir($saveDir, 0755, true);
}
 
$destPath = $saveDir . $safeName;
 
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file on server.']);
    exit;
}
 
echo json_encode([
    'success'  => true,
    'message'  => 'File saved successfully.',
    'filename' => $safeName,
    'path'     => 'localFolder/IP_TV_08062026/' . $safeName,
]);
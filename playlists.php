<?php

require_once 'origins.php';

$folder = __DIR__ . '/localFolder/IP_TV_08062026';
$publicPath = '/localFolder/IP_TV_08062026/';

if (!is_dir($folder)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Playlist directory not found.'
    ]);
    exit;
}

$playlists = [];

foreach (scandir($folder) as $file) {

    if ($file === '.' || $file === '..') {
        continue;
    }

    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (!in_array($extension, ['m3u', 'm3u8'])) {
        continue;
    }

    $playlists[] = [
        'label' => pathinfo($file, PATHINFO_FILENAME),
        // 'file'  => $publicPath . rawurlencode($file)
        'file'  => rawurlencode($file)
    ];
}

usort($playlists, function ($a, $b) {
    return strcasecmp($a['label'], $b['label']);
});

echo json_encode([
    'success' => true,
    'playlists' => $playlists
], JSON_UNESCAPED_SLASHES);
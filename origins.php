<?php
    header("Content-Type: application/json");
    
    $allowedOrigins = [
        "http://localhost:5173", 
        "https://livetv.sysnolodge.com.au"
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    
    // 1. Check if Origin is allowed
    $isAllowedOrigin = in_array($origin, $allowedOrigins);
    
    // 2. Check if the request is coming from your main site (for same-origin calls)
    $isFromMySite = (strpos($referer, 'https://livetv.sysnolodge.com.au') !== false);
    
    if ($isAllowedOrigin || $isFromMySite) {
        
        // Only set the header if $origin isn't empty (to avoid browser console errors)
        if ($origin) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");

    } else {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied'
        ]);
        exit;      
    }
?>
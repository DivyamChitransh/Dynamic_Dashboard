<?php
declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

if (preg_match('#^/uploads/([^/]+)$#', $uri, $matches)) {
    $file = __DIR__ . '/uploads/' . basename($matches[1]);
    if (is_file($file)) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        header('Content-Type: ' . ($finfo->file($file) ?: 'application/octet-stream'));
        header('Access-Control-Allow-Origin: *');
        readfile($file);
        exit;
    }
}

if (preg_match('#^/api/(.+\.php)$#', $uri, $matches)) {
    $script = __DIR__ . '/api/' . basename($matches[1]);
    if (is_file($script)) {
        require $script;
        exit;
    }
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'error' => 'Not found']);

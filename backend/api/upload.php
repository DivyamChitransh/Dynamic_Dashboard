<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

corsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

try {
    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        jsonError('No file uploaded');
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonError('Upload failed with error code ' . $file['error']);
    }

    if ($file['size'] > MAX_UPLOAD_BYTES) {
        jsonError('File exceeds maximum size of 5 MB');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']) ?: '';

    if (!in_array($mimeType, ALLOWED_MIME_TYPES, true)) {
        jsonError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
    }

    $dashboardId = (int) ($_POST['dashboard_id'] ?? appConfig('app.default_dashboard_id', 1));

    ensureUploadDir();

    $extension = match ($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        default => 'bin',
    };

    $filename = sprintf('img_%s_%s.%s', date('YmdHis'), bin2hex(random_bytes(4)), $extension);
    $destination = UPLOAD_DIR . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        jsonError('Failed to save uploaded file', 500);
    }

    $pdo = getDbConnection();

    $dashCheck = $pdo->prepare('SELECT id FROM dashboards WHERE id = ?');
    $dashCheck->execute([$dashboardId]);
    if (!$dashCheck->fetch()) {
        $pdo->prepare('INSERT INTO dashboards (id, name) VALUES (?, ?)')->execute([$dashboardId, 'Untitled Dashboard']);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO uploaded_images (dashboard_id, filename, original_name, mime_type, file_size)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $dashboardId,
        $filename,
        basename((string) $file['name']),
        $mimeType,
        (int) $file['size'],
    ]);

    jsonResponse([
        'success' => true,
        'data' => [
            'id' => (int) $pdo->lastInsertId(),
            'filename' => $filename,
            'url' => UPLOAD_URL . '/' . $filename,
            'original_name' => basename((string) $file['name']),
            'mime_type' => $mimeType,
            'size' => (int) $file['size'],
        ],
    ]);
} catch (Throwable $e) {
    $message = appConfig('app.debug') ? $e->getMessage() : 'Internal server error';
    jsonError($message, 500);
}

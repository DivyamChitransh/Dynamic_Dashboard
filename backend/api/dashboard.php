<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

corsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    match ($method) {
        'GET' => handleGet($pdo),
        'POST' => handleSave($pdo),
        'DELETE' => handleDelete($pdo),
        default => jsonError('Method not allowed', 405),
    };
} catch (Throwable $e) {
    $message = appConfig('app.debug') ? $e->getMessage() : 'Internal server error';
    jsonError($message, 500);
}

function handleGet(PDO $pdo): void
{
    $id = (int) ($_GET['id'] ?? appConfig('app.default_dashboard_id', 1));
    if ($id <= 0) {
        jsonError('Invalid dashboard id');
    }

    $stmt = $pdo->prepare('SELECT id, name, description, created_at, updated_at FROM dashboards WHERE id = ?');
    $stmt->execute([$id]);
    $dashboard = $stmt->fetch();

    if (!$dashboard) {
        jsonError('Dashboard not found', 404);
    }

    $sectionsStmt = $pdo->prepare(
        'SELECT id, title, pos_x, pos_y, width, height, z_index, sort_order
         FROM dashboard_sections
         WHERE dashboard_id = ?
         ORDER BY sort_order ASC, id ASC'
    );
    $sectionsStmt->execute([$id]);
    $sections = $sectionsStmt->fetchAll();

    $elementsStmt = $pdo->prepare(
        'SELECT id, section_id, element_type, pos_x, pos_y, width, height, z_index, content
         FROM dashboard_elements
         WHERE section_id = ?
         ORDER BY z_index ASC, id ASC'
    );

    foreach ($sections as &$section) {
        $section['id'] = (int) $section['id'];
        $section['pos_x'] = (float) $section['pos_x'];
        $section['pos_y'] = (float) $section['pos_y'];
        $section['width'] = (float) $section['width'];
        $section['height'] = (float) $section['height'];
        $section['z_index'] = (int) $section['z_index'];
        $section['sort_order'] = (int) $section['sort_order'];

        $elementsStmt->execute([$section['id']]);
        $elements = $elementsStmt->fetchAll();

        foreach ($elements as &$element) {
            $element['id'] = (int) $element['id'];
            $element['section_id'] = (int) $element['section_id'];
            $element['pos_x'] = (float) $element['pos_x'];
            $element['pos_y'] = (float) $element['pos_y'];
            $element['width'] = (float) $element['width'];
            $element['height'] = (float) $element['height'];
            $element['z_index'] = (int) $element['z_index'];
            $element['content'] = json_decode($element['content'], true) ?? [];
        }
        unset($element);

        $section['elements'] = $elements;
    }
    unset($section);

    jsonResponse([
        'success' => true,
        'data' => [
            'dashboard' => $dashboard,
            'sections' => $sections,
        ],
    ]);
}

function handleSave(PDO $pdo): void
{
    $payload = readJsonBody();

    $dashboardId = (int) ($payload['dashboard_id'] ?? appConfig('app.default_dashboard_id', 1));
    $name = trim((string) ($payload['name'] ?? 'Untitled Dashboard'));
    $sections = $payload['sections'] ?? [];

    if (!is_array($sections)) {
        jsonError('Sections must be an array');
    }

    $pdo->beginTransaction();

    try {
        $existsStmt = $pdo->prepare('SELECT id FROM dashboards WHERE id = ?');
        $existsStmt->execute([$dashboardId]);
        if (!$existsStmt->fetch()) {
            $insertDash = $pdo->prepare('INSERT INTO dashboards (id, name) VALUES (?, ?)');
            $insertDash->execute([$dashboardId, $name]);
        } else {
            $updateDash = $pdo->prepare('UPDATE dashboards SET name = ? WHERE id = ?');
            $updateDash->execute([$name, $dashboardId]);
        }

        $pdo->prepare('DELETE FROM dashboard_sections WHERE dashboard_id = ?')->execute([$dashboardId]);

        $insertSection = $pdo->prepare(
            'INSERT INTO dashboard_sections
             (dashboard_id, title, pos_x, pos_y, width, height, z_index, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $insertElement = $pdo->prepare(
            'INSERT INTO dashboard_elements
             (section_id, element_type, pos_x, pos_y, width, height, z_index, content)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $sortOrder = 0;
        foreach ($sections as $section) {
            $sortOrder++;
            $insertSection->execute([
                $dashboardId,
                trim((string) ($section['title'] ?? 'Section')),
                (float) ($section['pos_x'] ?? 0),
                (float) ($section['pos_y'] ?? 0),
                (float) ($section['width'] ?? 400),
                (float) ($section['height'] ?? 300),
                (int) ($section['z_index'] ?? 0),
                (int) ($section['sort_order'] ?? $sortOrder),
            ]);

            $sectionId = (int) $pdo->lastInsertId();
            $elements = $section['elements'] ?? [];

            if (!is_array($elements)) {
                continue;
            }

            foreach ($elements as $element) {
                $type = (string) ($element['element_type'] ?? 'text');
                $allowed = ['text', 'image', 'bar_chart', 'line_chart'];
                if (!in_array($type, $allowed, true)) {
                    continue;
                }

                $content = $element['content'] ?? [];
                if (!is_array($content)) {
                    $content = [];
                }

                $insertElement->execute([
                    $sectionId,
                    $type,
                    (float) ($element['pos_x'] ?? 10),
                    (float) ($element['pos_y'] ?? 10),
                    (float) ($element['width'] ?? 200),
                    (float) ($element['height'] ?? 150),
                    (int) ($element['z_index'] ?? 0),
                    json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ]);
            }
        }

        $pdo->commit();

        jsonResponse([
            'success' => true,
            'message' => 'Dashboard saved successfully',
            'dashboard_id' => $dashboardId,
        ]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handleDelete(PDO $pdo): void
{
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonError('Invalid dashboard id');
    }

    $stmt = $pdo->prepare('DELETE FROM dashboards WHERE id = ?');
    $stmt->execute([$id]);

    jsonResponse([
        'success' => true,
        'message' => 'Dashboard deleted',
        'deleted' => $stmt->rowCount() > 0,
    ]);
}

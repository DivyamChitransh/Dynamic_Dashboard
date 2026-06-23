CREATE DATABASE IF NOT EXISTS dashboard_builder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dashboard_builder;

CREATE TABLE IF NOT EXISTS dashboards (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL DEFAULT 'Untitled Dashboard',
    description TEXT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dashboards_updated (updated_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dashboard_sections (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dashboard_id  INT UNSIGNED NOT NULL,
    title         VARCHAR(255) NOT NULL DEFAULT 'Section',
    pos_x         DECIMAL(10,2) NOT NULL DEFAULT 0,
    pos_y         DECIMAL(10,2) NOT NULL DEFAULT 0,
    width         DECIMAL(10,2) NOT NULL DEFAULT 400,
    height        DECIMAL(10,2) NOT NULL DEFAULT 300,
    z_index       INT NOT NULL DEFAULT 0,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sections_dashboard
        FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
        ON DELETE CASCADE,
    INDEX idx_sections_dashboard (dashboard_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dashboard_elements (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_id    INT UNSIGNED NOT NULL,
    element_type  ENUM('text', 'image', 'bar_chart', 'line_chart') NOT NULL,
    pos_x         DECIMAL(10,2) NOT NULL DEFAULT 10,
    pos_y         DECIMAL(10,2) NOT NULL DEFAULT 10,
    width         DECIMAL(10,2) NOT NULL DEFAULT 200,
    height        DECIMAL(10,2) NOT NULL DEFAULT 150,
    z_index       INT NOT NULL DEFAULT 0,
    content       JSON NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_elements_section
        FOREIGN KEY (section_id) REFERENCES dashboard_sections(id)
        ON DELETE CASCADE,
    INDEX idx_elements_section (section_id),
    INDEX idx_elements_type (element_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS uploaded_images (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dashboard_id  INT UNSIGNED NOT NULL,
    filename      VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    file_size     INT UNSIGNED NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_images_dashboard
        FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
        ON DELETE CASCADE,
    INDEX idx_images_dashboard (dashboard_id)
) ENGINE=InnoDB;


INSERT INTO dashboards (id, name, description) VALUES
(1, 'Sales Overview', 'Sample dashboard');

INSERT INTO dashboard_sections (id, dashboard_id, title, pos_x, pos_y, width, height, z_index, sort_order) VALUES
(1, 1, 'Header Section',   20,  20,  1160, 120, 1, 1),
(2, 1, 'Analytics Panel',  20,  160, 760,  420, 2, 2),
(3, 1, 'Side Panel',       800, 160, 380,  420, 3, 3);

INSERT INTO dashboard_elements (section_id, element_type, pos_x, pos_y, width, height, z_index, content) VALUES
(1, 'text', 20, 20, 500, 80, 1,
 '{"html":"<h2>Sales Dashboard</h2><p>Welcome to Sales Analytics Dashboard</p>","fontSize":18,"fontWeight":"normal","fontStyle":"normal","fill":"#1e293b"}'),

(2, 'bar_chart', 20, 20, 340, 360, 1,
 '{"title":"Monthly Revenue","labels":["Jan","Feb","Mar","Apr","May","Jun"],"datasets":[{"label":"Revenue ($K)","data":[42,58,45,72,68,85],"backgroundColor":"#3b82f6"}]}'),

(2, 'line_chart', 380, 20, 340, 360, 2,
 '{"title":"User Growth","labels":["Jan","Feb","Mar","Apr","May","Jun"],"datasets":[{"label":"Active Users","data":[1200,1900,1600,2400,2800,3200],"borderColor":"#10b981","backgroundColor":"rgba(16,185,129,0.1)","fill":true}]}'),

(3, 'text', 20, 20, 340, 100, 1,
 '{"html":"<p><strong>Quick Stats</strong></p><p><em>Last updated: Today</em></p>","fontSize":14,"fontWeight":"normal","fontStyle":"normal","fill":"#334155"}'),

(3, 'text', 20, 140, 340, 240, 2,
 '{"html":"<p>Total Orders: <strong>1,284</strong></p><p>Conversion Rate: <strong>3.8%</strong></p><p>Avg. Order Value: <strong>$67.50</strong></p>","fontSize":16,"fontWeight":"normal","fontStyle":"normal","fill":"#475569"}');

<?php
/**
 * KCC Online Store - WordPress Subfolder & SPA Entry Fallback
 * Host this file alongside index.html inside public_html/shop or custom WordPress directory.
 */
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
    exit;
} else {
    echo "<h1>KCC Online Store</h1><p>index.html not found. Please upload the compiled 'dist' files.</p>";
}
?>

<?php
/**
 * Plugin Name: KCC Online Store for kcconline.shop
 * Plugin URI: https://kcconline.shop
 * Description: Connects and embeds the KCC Online Store directly on kcconline.shop, replacing the 404 page.
 * Version: 1.0.0
 * Author: KCC Online Store
 */

if (!defined('ABSPATH')) exit;

// Register shortcode [kcc_store]
function kcc_store_embed_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '100vh',
    ), $atts, 'kcc_store');

    $app_url = 'https://ais-pre-3pbo2tysnrihvn7i4j7pap-18868251111.asia-southeast1.run.app';

    return '<div className="kcc-store-wrapper" style="width:100%; min-height:100vh; overflow:hidden;">' .
           '<iframe src="' . esc_url($app_url) . '" width="100%" height="900" style="border:none; width:100%; min-height:100vh; display:block; border-radius:12px;" allow="geolocation; camera; microphone; payment"></iframe>' .
           '</div>';
}
add_shortcode('kcc_store', 'kcc_store_embed_shortcode');

// Optional: Override 404 / empty homepage automatically on kcconline.shop
function kcc_store_override_homepage($template) {
    if (is_404() || is_front_page()) {
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo('charset'); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>KCC Online Store - Wholesale & Retail</title>
            <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0f172a; }
                iframe { width: 100%; height: 100vh; border: none; display: block; }
            </style>
        </head>
        <body>
            <iframe src="https://ais-pre-3pbo2tysnrihvn7i4j7pap-18868251111.asia-southeast1.run.app" allow="geolocation; camera; microphone; payment"></iframe>
        </body>
        </html>
        <?php
        exit;
    }
    return $template;
}
add_filter('template_include', 'kcc_store_override_homepage');

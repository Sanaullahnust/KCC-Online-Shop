<?php
/**
 * Theme functions and definitions
 */

function kcc_wholesale_enqueue_scripts() {
    $theme_version = wp_get_theme()->get( 'Version' );
    $theme_dir_url = get_template_directory_uri();
    
    // Enqueue the main style.css (mostly for WordPress recognition, but good practice)
    wp_enqueue_style( 'kcc-wholesale-style', get_stylesheet_uri(), array(), $theme_version );

    // Dynamically Enqueue Vite built assets from dist/assets
    $dist_path = get_template_directory() . '/dist/assets/';
    if ( is_dir( $dist_path ) ) {
        $files = scandir( $dist_path );
        foreach ( $files as $file ) {
            // Enqueue generated CSS files
            if ( preg_match( '/\.css$/i', $file ) ) {
                wp_enqueue_style( 
                    'kcc-wholesale-app-style-' . md5($file), 
                    $theme_dir_url . '/dist/assets/' . $file, 
                    array(), 
                    $theme_version 
                );
            }
            // Enqueue generated JS files
            if ( preg_match( '/\.js$/i', $file ) ) {
                wp_enqueue_script( 
                    'kcc-wholesale-app-script-' . md5($file), 
                    $theme_dir_url . '/dist/assets/' . $file, 
                    array(), 
                    $theme_version, 
                    true 
                );
                
                // If it's a module, WordPress doesn't support type="module" natively in wp_enqueue_script
                // We'll add a filter to add type="module" below
            }
        }
    }
}
add_action( 'wp_enqueue_scripts', 'kcc_wholesale_enqueue_scripts' );

// Add type="module" to our enqueued JS files since React/Vite outputs modules
function kcc_wholesale_add_type_attribute($tag, $handle, $src) {
    if ( strpos($handle, 'kcc-wholesale-app-script-') !== false ) {
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>' . "\n";
    }
    return $tag;
}
add_filter('script_loader_tag', 'kcc_wholesale_add_type_attribute', 10, 3);

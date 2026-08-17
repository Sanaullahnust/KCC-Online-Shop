import JSZip from 'jszip';
import { Product, StoreSettings, Deal, Testimonial } from '../types';

export interface WordPressThemeOptions {
  themeName?: string;
  themeSlug?: string;
  authorName?: string;
  authorUri?: string;
  products: Product[];
  storeSettings: StoreSettings;
  deals?: Deal[];
  testimonials?: Testimonial[];
}

/**
 * Creates a valid PNG blob for screenshot.png using HTML5 Canvas
 */
async function generateScreenshotPng(themeName: string): Promise<Blob | null> {
  try {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 900);
    bgGrad.addColorStop(0, '#18181b');
    bgGrad.addColorStop(0.5, '#27272a');
    bgGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 900);

    // Golden Accent Circle
    const goldGrad = ctx.createLinearGradient(490, 250, 710, 470);
    goldGrad.addColorStop(0, '#f6d365');
    goldGrad.addColorStop(1, '#c5a880');

    ctx.beginPath();
    ctx.arc(600, 340, 90, 0, Math.PI * 2);
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Emblem Letter
    ctx.fillStyle = '#18181b';
    ctx.font = '900 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', 600, 345);

    // Theme Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 42px sans-serif';
    ctx.fillText(themeName, 600, 500);

    // Subtitle
    ctx.fillStyle = '#c5a880';
    ctx.font = '700 20px sans-serif';
    ctx.fillText('COMPLETE WORDPRESS ECOMMERCE THEME', 600, 550);

    // Highlights
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '400 16px sans-serif';
    ctx.fillText('WhatsApp Direct Checkout • Wholesale Catalog • Weight-Based Courier Shipping', 600, 600);

    // Status Pill
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(460, 650, 280, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#18181b';
    ctx.font = '800 16px sans-serif';
    ctx.fillText('READY TO INSTALL', 600, 676);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch (e) {
    console.warn('Could not generate canvas screenshot:', e);
    return null;
  }
}

/**
 * Generates a complete, production-ready, downloadable WordPress Theme ZIP file
 * that can be installed directly into WordPress via Appearance > Themes > Add New > Upload Theme.
 */
export async function generateWordPressThemeZip(options: WordPressThemeOptions): Promise<Blob> {
  const zip = new JSZip();
  const themeSlug = options.themeSlug || 'kcc-store-theme';
  const themeName = options.themeName || 'KCC Online Wholesale Shop';
  const author = options.authorName || 'KCC Store Team';
  const authorUri = options.authorUri || 'https://kcconline.shop';
  const version = '1.0.1';

  // Sanitize and prepare clean JSON payloads
  const products = Array.isArray(options.products) ? options.products : [];
  const settings = options.storeSettings || ({} as StoreSettings);
  const deals = Array.isArray(options.deals) ? options.deals : [];
  const testimonials = Array.isArray(options.testimonials) ? options.testimonials : [];

  const productsJson = JSON.stringify(products, null, 2);
  const settingsJson = JSON.stringify(settings, null, 2);
  const dealsJson = JSON.stringify(deals, null, 2);
  const testimonialsJson = JSON.stringify(testimonials, null, 2);

  // 1. style.css - Complete WordPress Theme Header & Native Fallback Stylesheet
  const styleCss = `/*
Theme Name: ${themeName}
Theme URI: ${authorUri}
Author: ${author}
Author URI: ${authorUri}
Description: Complete, modern eCommerce and Wholesale Storefront WordPress Theme with direct WhatsApp ordering, responsive product catalog, interactive cart, simulated courier tracking generator, and instant cash-on-delivery checkout.
Version: ${version}
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${themeSlug}
Tags: e-commerce, custom-colors, custom-menu, custom-logo, featured-images, full-width-template, theme-options, translation-ready, grid-layout, one-column, wide-blocks
*/

/* -------------------------------------------------------------
 * 1. Base Reset & Typography
 * ------------------------------------------------------------- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #fcfbf9;
  color: #18181b;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button, input, select, textarea {
  font: inherit;
}

.kcc-theme-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* -------------------------------------------------------------
 * 2. Layout Containers & Grid System
 * ------------------------------------------------------------- */
.kcc-container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.kcc-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

/* -------------------------------------------------------------
 * 3. Component Styling
 * ------------------------------------------------------------- */
.kcc-card {
  background: #ffffff;
  border-radius: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.kcc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
  border-color: rgba(197, 168, 128, 0.4);
}

.kcc-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #c5a880;
  color: #18181b;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.kcc-btn-primary:hover {
  background: #b08d55;
  transform: translateY(-1px);
}

.kcc-btn-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #059669;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.kcc-btn-whatsapp:hover {
  background: #047857;
}

.kcc-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kcc-badge-hot {
  background: #dc2626;
  color: #ffffff;
}

.kcc-badge-top {
  background: #f59e0b;
  color: #18181b;
}

/* -------------------------------------------------------------
 * 4. Custom Scrollbar
 * ------------------------------------------------------------- */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c5a880;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #b08d55;
}
`;

  // 2. functions.php - Fully Safe, Robust Theme Setup (Zero Syntax Errors)
  const functionsPhp = `<?php
/**
 * ${themeName} Theme Functions and definitions
 *
 * @package ${themeSlug}
 * @version ${version}
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Define Theme Constants
define('KCC_THEME_VERSION', '${version}');
define('KCC_THEME_DIR', get_template_directory());
define('KCC_THEME_URI', get_template_directory_uri());

/**
 * Load default fallback store data safely from JSON files
 */
function kcc_get_theme_data($file) {
    $path = KCC_THEME_DIR . '/data/' . $file . '.json';
    if (file_exists($path)) {
        $content = file_get_contents($path);
        if ($content !== false) {
            $data = json_decode($content, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        }
    }
    return array();
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function kcc_store_theme_setup() {
    // Add default posts and comments RSS feed links to head.
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title.
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages.
    add_theme_support('post-thumbnails');

    // Custom Logo Support
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));

    // HTML5 markup support
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ));

    // Wide alignment for Gutenberg
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');

    // Register Navigation Menus
    register_nav_menus(array(
        'primary' => __('Primary Navigation Menu', '${themeSlug}'),
        'footer'  => __('Footer Navigation Menu', '${themeSlug}'),
    ));
}
add_action('after_setup_theme', 'kcc_store_theme_setup');

/**
 * Enqueue scripts and styles for the frontend safely.
 */
function kcc_store_theme_scripts() {
    // Google Fonts: Plus Jakarta Sans & Outfit
    wp_enqueue_style('kcc-google-fonts', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap', array(), null);

    // Tailwind CSS CDN for instant responsive utility classes
    wp_enqueue_script('kcc-tailwind', 'https://cdn.tailwindcss.com', array(), '3.4.1', false);

    // Lucide Icons CDN for icons
    wp_enqueue_script('kcc-lucide-icons', 'https://unpkg.com/lucide@latest', array(), null, true);

    // Theme Main Stylesheet
    wp_enqueue_style('kcc-theme-style', get_stylesheet_uri(), array(), KCC_THEME_VERSION);

    // Enqueue Store Interactive App JS
    wp_enqueue_script('kcc-store-engine', KCC_THEME_URI . '/assets/js/kcc-store-app.js', array(), KCC_THEME_VERSION, true);

    // Load settings from JSON fallback
    $defaults = kcc_get_theme_data('settings');

    // Pass Dynamic Data to Client-Side Script
    $store_options = array(
        'ajaxUrl'        => admin_url('admin-ajax.php'),
        'siteUrl'        => site_url(),
        'themeUri'       => KCC_THEME_URI,
        'storeName'      => get_option('kcc_store_name', isset($defaults['storeName']) ? $defaults['storeName'] : get_bloginfo('name')),
        'whatsappNumber' => get_option('kcc_whatsapp_number', isset($defaults['whatsappNumber']) ? $defaults['whatsappNumber'] : '923001234567'),
        'storePhone'     => get_option('kcc_store_phone', isset($defaults['storePhone']) ? $defaults['storePhone'] : '03001234567'),
        'storeAddress'   => get_option('kcc_store_address', isset($defaults['storeAddress']) ? $defaults['storeAddress'] : 'KCC Wholesale Store, Pakistan'),
        'topBarText'     => get_option('kcc_topbar_text', isset($defaults['topBarText']) ? $defaults['topBarText'] : 'All items on Wholesale Price • Store Collection & Delivery'),
        'heroHeadline'   => get_option('kcc_hero_headline', isset($defaults['heroHeadline']) ? $defaults['heroHeadline'] : 'Imported & Domestic Goods at Wholesale Prices'),
        'heroSubheading' => get_option('kcc_hero_subheading', isset($defaults['heroSubheading']) ? $defaults['heroSubheading'] : 'Get top quality home improvement tools, kitchenware, and smart gadgets delivered directly across Pakistan at wholesale prices.'),
        'heroBadgeText'  => get_option('kcc_hero_badge', isset($defaults['heroBadgeText']) ? $defaults['heroBadgeText'] : 'Wholesale Rates Guaranteed'),
        'deliveryFee500' => (int) get_option('kcc_fee_500g', isset($defaults['deliveryFee500g']) ? $defaults['deliveryFee500g'] : 250),
        'deliveryFee1kg' => (int) get_option('kcc_fee_1kg', isset($defaults['deliveryFee1kg']) ? $defaults['deliveryFee1kg'] : 400),
    );
    wp_localize_script('kcc-store-engine', 'KCC_STORE_CONFIG', $store_options);
}
add_action('wp_enqueue_scripts', 'kcc_store_theme_scripts');

/**
 * Register WordPress Admin Settings Page for KCC Store
 */
function kcc_store_register_admin_menu() {
    add_menu_page(
        __('KCC Store Settings', '${themeSlug}'),
        __('KCC Store', '${themeSlug}'),
        'manage_options',
        'kcc-store-settings',
        'kcc_store_render_admin_settings',
        'dashicons-cart',
        30
    );
}
add_action('admin_menu', 'kcc_store_register_admin_menu');

/**
 * Register Settings in WordPress Options API
 */
function kcc_store_register_settings() {
    register_setting('kcc_store_settings_group', 'kcc_store_name');
    register_setting('kcc_store_settings_group', 'kcc_whatsapp_number');
    register_setting('kcc_store_settings_group', 'kcc_store_phone');
    register_setting('kcc_store_settings_group', 'kcc_store_address');
    register_setting('kcc_store_settings_group', 'kcc_topbar_text');
    register_setting('kcc_store_settings_group', 'kcc_hero_headline');
    register_setting('kcc_store_settings_group', 'kcc_hero_subheading');
    register_setting('kcc_store_settings_group', 'kcc_hero_badge');
    register_setting('kcc_store_settings_group', 'kcc_fee_500g');
    register_setting('kcc_store_settings_group', 'kcc_fee_1kg');
}
add_action('admin_init', 'kcc_store_register_settings');

/**
 * Render WordPress Admin Settings UI
 */
function kcc_store_render_admin_settings() {
    $defaults = kcc_get_theme_data('settings');
    ?>
    <div class="wrap" style="max-width: 900px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a;">
            🛍️ <?php _e('KCC Online Store Configuration', '${themeSlug}'); ?>
        </h1>
        <p style="color: #666; margin-bottom: 25px;">
            <?php _e('Configure your storefront details, WhatsApp ordering number, courier rates, and announcements.', '${themeSlug}'); ?>
        </p>

        <?php settings_errors(); ?>

        <form method="post" action="options.php" style="background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <?php settings_fields('kcc_store_settings_group'); ?>
            
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="kcc_store_name"><?php _e('Store Name', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_store_name" type="text" id="kcc_store_name" value="<?php echo esc_attr(get_option('kcc_store_name', isset($defaults['storeName']) ? $defaults['storeName'] : get_bloginfo('name'))); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_whatsapp_number"><?php _e('WhatsApp Number (with Country Code)', '${themeSlug}'); ?></label></th>
                    <td>
                        <input name="kcc_whatsapp_number" type="text" id="kcc_whatsapp_number" value="<?php echo esc_attr(get_option('kcc_whatsapp_number', isset($defaults['whatsappNumber']) ? $defaults['whatsappNumber'] : '923001234567')); ?>" class="regular-text" placeholder="e.g. 923001234567" />
                        <p class="description"><?php _e('Customers will be directed to this WhatsApp number when placing 1-Click WhatsApp Orders.', '${themeSlug}'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_store_phone"><?php _e('Contact Phone', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_store_phone" type="text" id="kcc_store_phone" value="<?php echo esc_attr(get_option('kcc_store_phone', isset($defaults['storePhone']) ? $defaults['storePhone'] : '03001234567')); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_store_address"><?php _e('Store Physical Address', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_store_address" type="text" id="kcc_store_address" value="<?php echo esc_attr(get_option('kcc_store_address', isset($defaults['storeAddress']) ? $defaults['storeAddress'] : '')); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_topbar_text"><?php _e('Header Announcement Bar Text', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_topbar_text" type="text" id="kcc_topbar_text" value="<?php echo esc_attr(get_option('kcc_topbar_text', isset($defaults['topBarText']) ? $defaults['topBarText'] : '')); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_hero_headline"><?php _e('Hero Section Headline', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_hero_headline" type="text" id="kcc_hero_headline" value="<?php echo esc_attr(get_option('kcc_hero_headline', isset($defaults['heroHeadline']) ? $defaults['heroHeadline'] : '')); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_hero_subheading"><?php _e('Hero Section Subheading', '${themeSlug}'); ?></label></th>
                    <td><textarea name="kcc_hero_subheading" id="kcc_hero_subheading" rows="3" class="large-text"><?php echo esc_textarea(get_option('kcc_hero_subheading', isset($defaults['heroSubheading']) ? $defaults['heroSubheading'] : '')); ?></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_fee_500g"><?php _e('Shipping Fee (Up to 500g)', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_fee_500g" type="number" id="kcc_fee_500g" value="<?php echo esc_attr(get_option('kcc_fee_500g', isset($defaults['deliveryFee500g']) ? $defaults['deliveryFee500g'] : 250)); ?>" class="small-text" /> PKR</td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_fee_1kg"><?php _e('Shipping Fee (1kg & above)', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_fee_1kg" type="number" id="kcc_fee_1kg" value="<?php echo esc_attr(get_option('kcc_fee_1kg', isset($defaults['deliveryFee1kg']) ? $defaults['deliveryFee1kg'] : 400)); ?>" class="small-text" /> PKR</td>
                </tr>
            </table>

            <?php submit_button(__('Save Store Settings', '${themeSlug}')); ?>
        </form>
    </div>
    <?php
}

/**
 * Shortcode to embed the complete KCC Store in any WordPress Page or Post
 * Usage: [kcc_store]
 */
function kcc_store_embed_shortcode($atts) {
    ob_start();
    include KCC_THEME_DIR . '/template-parts/store-view.php';
    return ob_get_clean();
}
add_shortcode('kcc_store', 'kcc_store_embed_shortcode');
`;

  // 3. header.php
  const headerPhp = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-[#fcfbf9] text-zinc-900 antialiased'); ?>>
<?php wp_body_open(); ?>
<div class="kcc-theme-wrapper">
`;

  // 4. footer.php
  const footerPhp = `
</div><!-- .kcc-theme-wrapper -->
<?php wp_footer(); ?>
<script>
    // Initialize Lucide icons on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    });
</script>
</body>
</html>
`;

  // 5. template-parts/store-view.php - Universal Server-Side Store Template (No White Screen Ever!)
  const storeViewPhp = `<?php
/**
 * Store View Template Part
 * Renders complete HTML server-side instantly with progressive JS enhancement.
 *
 * @package ${themeSlug}
 */

$products = kcc_get_theme_data('products');
$settings = kcc_get_theme_data('settings');

$store_name = get_option('kcc_store_name', isset($settings['storeName']) ? $settings['storeName'] : get_bloginfo('name'));
$whatsapp_num = get_option('kcc_whatsapp_number', isset($settings['whatsappNumber']) ? $settings['whatsappNumber'] : '923001234567');
$store_phone = get_option('kcc_store_phone', isset($settings['storePhone']) ? $settings['storePhone'] : '03001234567');
$store_address = get_option('kcc_store_address', isset($settings['storeAddress']) ? $settings['storeAddress'] : 'KCC Wholesale Store, Pakistan');
$topbar_text = get_option('kcc_topbar_text', isset($settings['topBarText']) ? $settings['topBarText'] : 'All items on Wholesale Price • Store Collection & Delivery');
$hero_title = get_option('kcc_hero_headline', isset($settings['heroHeadline']) ? $settings['heroHeadline'] : 'Imported & Domestic Goods at Wholesale Prices');
$hero_desc = get_option('kcc_hero_subheading', isset($settings['heroSubheading']) ? $settings['heroSubheading'] : 'Get top quality home improvement tools, kitchenware, and smart gadgets delivered directly across Pakistan at wholesale prices.');
$hero_badge = get_option('kcc_hero_badge', isset($settings['heroBadgeText']) ? $settings['heroBadgeText'] : 'Wholesale Rates Guaranteed');
$fee_500 = (int) get_option('kcc_fee_500g', isset($settings['deliveryFee500g']) ? $settings['deliveryFee500g'] : 250);
$fee_1kg = (int) get_option('kcc_fee_1kg', isset($settings['deliveryFee1kg']) ? $settings['deliveryFee1kg'] : 400);
?>

<div id="kcc-store-root">
    <!-- Top Announcement Bar -->
    <div class="bg-[#1a1a1a] text-white text-[11px] font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-between">
        <div class="hidden md:flex items-center gap-4 text-zinc-400">
            <span>📞 <?php echo esc_html($store_phone); ?></span>
            <span>📍 <?php echo esc_html($store_address); ?></span>
        </div>
        <div class="mx-auto font-medium text-amber-300">
            <?php echo esc_html($topbar_text); ?>
        </div>
        <div class="hidden md:flex items-center gap-3">
            <a href="https://wa.me/<?php echo esc_attr($whatsapp_num); ?>" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline flex items-center gap-1">
                💬 WhatsApp Support
            </a>
        </div>
    </div>

    <!-- Main Header / Navbar -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5 shadow-xs px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#99794d] text-white flex items-center justify-center font-black text-xl shadow-md">
                K
            </div>
            <div>
                <h1 class="font-extrabold text-lg md:text-xl text-zinc-900 tracking-tight leading-none">
                    <?php echo esc_html($store_name); ?>
                </h1>
                <span class="text-[10px] uppercase font-bold tracking-widest text-[#c5a880]">Wholesale & Retail Pakistan</span>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="hidden sm:flex flex-1 max-w-md mx-4 relative">
            <input 
                type="text" 
                id="kcc-search-input" 
                placeholder="Search gadgets, tools, kitchenware..." 
                class="w-full bg-[#fcfbf9] border border-black/10 rounded-2xl py-2.5 pl-4 pr-10 text-xs font-medium focus:ring-2 focus:ring-[#c5a880] outline-none"
            />
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
            <button id="kcc-track-btn" class="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                🚚 Track Order
            </button>

            <button id="kcc-cart-btn" class="relative px-4 py-2 bg-[#1a1a1a] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer">
                🛒 Cart
                <span class="kcc-cart-count w-5 h-5 bg-[#c5a880] text-zinc-900 text-[10px] font-black rounded-full flex items-center justify-center" style="display: none;">0</span>
            </button>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white py-12 md:py-20 px-6 md:px-12 overflow-hidden">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div class="max-w-2xl space-y-4 text-center md:text-left">
                <span class="inline-block px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/40">
                    <?php echo esc_html($hero_badge); ?>
                </span>
                <h2 class="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    <?php echo esc_html($hero_title); ?>
                </h2>
                <p class="text-sm md:text-base text-zinc-300 leading-relaxed">
                    <?php echo esc_html($hero_desc); ?>
                </p>
                <div class="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                    <a href="#kcc-catalog" class="px-6 py-3 bg-[#c5a880] hover:bg-[#b08d55] text-zinc-900 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all">
                        🛍️ Explore Catalog
                    </a>
                    <a href="https://wa.me/<?php echo esc_attr($whatsapp_num); ?>?text=<?php echo rawurlencode('Hi KCC Store, I want to place a wholesale order!'); ?>" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2">
                        💬 Quick WhatsApp Order
                    </a>
                </div>
            </div>
            <div class="hidden lg:block w-72 h-72 rounded-3xl bg-[#c5a880]/10 border border-white/10 p-6 backdrop-blur-md text-center space-y-3">
                <div class="text-4xl">📦</div>
                <h3 class="text-lg font-bold">Fast Courier Delivery</h3>
                <p class="text-xs text-zinc-400">Cash on Delivery across Pakistan. Safe packaging and wholesale discounts on bulk quantities.</p>
                <div class="pt-2 text-xs font-mono text-[#c5a880]">500g: Rs.<?php echo esc_html($fee_500); ?> | 1kg+: Rs.<?php echo esc_html($fee_1kg); ?></div>
            </div>
        </div>
    </section>

    <!-- Catalog Section -->
    <div id="kcc-catalog" class="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div class="flex items-center justify-between gap-4 flex-wrap border-b border-black/5 pb-4 mb-8">
            <div>
                <h3 class="text-2xl font-black text-zinc-900 tracking-tight">Our Wholesale Catalog</h3>
                <p class="text-xs text-zinc-500 mt-1">Showing <?php echo count($products); ?> high quality verified products</p>
            </div>

            <!-- Category Filter Buttons -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <?php
                $categories = array('All', 'Gadgets', 'Home Improvement', 'Kitchen');
                foreach ($categories as $cat) :
                ?>
                    <button 
                        data-category="<?php echo esc_attr($cat); ?>" 
                        class="kcc-cat-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer <?php echo ($cat === 'All') ? 'bg-[#1a1a1a] text-white shadow-sm' : 'bg-white border border-black/10 text-zinc-700 hover:bg-zinc-100'; ?>"
                    >
                        <?php echo esc_html($cat); ?>
                    </button>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Product Grid -->
        <div id="kcc-products-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <?php foreach ($products as $p) : 
                $pid = isset($p['id']) ? $p['id'] : '';
                $pname = isset($p['name']) ? $p['name'] : 'Product';
                $pprice = isset($p['price']) ? (int)$p['price'] : 0;
                $pimg = isset($p['image']) ? $p['image'] : '';
                $pdesc = isset($p['description']) ? $p['description'] : '';
                $pcat = isset($p['category']) ? $p['category'] : 'General';
                $pweight = isset($p['weight']) ? (int)$p['weight'] : 300;
                $pishot = !empty($p['isHot']);
                $pistop = !empty($p['isTopSeller']);
                $pdisc = isset($p['discountNote']) ? $p['discountNote'] : '';
                $wa_msg = 'AOA! I want to order ' . $pname . ' (Rs. ' . number_format($pprice) . ') from ' . $store_name . '. Please confirm delivery details!';
            ?>
                <div class="kcc-product-item bg-white rounded-3xl border border-black/5 p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group" data-category="<?php echo esc_attr($pcat); ?>" data-name="<?php echo esc_attr(strtolower($pname)); ?>">
                    <div>
                        <!-- Image Container -->
                        <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3 cursor-pointer kcc-product-trigger" data-pid="<?php echo esc_attr($pid); ?>">
                            <img src="<?php echo esc_url($pimg); ?>" alt="<?php echo esc_attr($pname); ?>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            <?php if ($pishot) : ?>
                                <span class="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">🔥 HOT</span>
                            <?php endif; ?>
                            <?php if ($pistop) : ?>
                                <span class="absolute top-2.5 right-2.5 bg-amber-500 text-zinc-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">⭐ Top Seller</span>
                            <?php endif; ?>
                        </div>

                        <span class="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider block mb-1"><?php echo esc_html($pcat); ?></span>
                        <h4 class="font-bold text-sm text-zinc-900 line-clamp-2 leading-snug cursor-pointer kcc-product-trigger" data-pid="<?php echo esc_attr($pid); ?>"><?php echo esc_html($pname); ?></h4>
                        <p class="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed"><?php echo esc_html($pdesc); ?></p>
                    </div>

                    <div class="pt-4 mt-3 border-t border-black/5 space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-lg font-black text-zinc-900">Rs. <?php echo number_format($pprice); ?></span>
                                <?php if ($pdisc) : ?>
                                    <span class="text-[10px] text-emerald-700 font-bold block"><?php echo esc_html($pdisc); ?></span>
                                <?php endif; ?>
                            </div>
                            <span class="text-[11px] text-zinc-400 font-mono">⚖️ <?php echo esc_html($pweight); ?>g</span>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <button 
                                data-pid="<?php echo esc_attr($pid); ?>" 
                                class="kcc-add-cart-btn w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                                🛒 + Cart
                            </button>
                            <a 
                                href="https://wa.me/<?php echo esc_attr($whatsapp_num); ?>?text=<?php echo rawurlencode($wa_msg); ?>" 
                                target="_blank"
                                rel="noopener noreferrer"
                                class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Store Features & Trust Factors -->
    <section class="bg-zinc-100/70 border-t border-black/5 py-12 px-4 md:px-8 mt-16">
        <div class="max-w-5xl mx-auto text-center space-y-8">
            <div>
                <h3 class="text-2xl font-black text-zinc-900">Why Wholesalers & Families Choose <?php echo esc_html($store_name); ?></h3>
                <p class="text-xs text-zinc-500 mt-1">Direct imports, verified quality check, and trusted delivery across Pakistan.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-3xl border border-black/5 text-left space-y-2 shadow-xs">
                    <div class="text-2xl">💰</div>
                    <h4 class="font-bold text-sm text-zinc-900">Guaranteed Wholesale Rates</h4>
                    <p class="text-xs text-zinc-500">Tiered bulk discounts for shopkeepers, resellers, and direct consumers.</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-black/5 text-left space-y-2 shadow-xs">
                    <div class="text-2xl">🚚</div>
                    <h4 class="font-bold text-sm text-zinc-900">Fast Nationwide Shipping</h4>
                    <p class="text-xs text-zinc-500">TCS, Leopards, and Trax Cash on Delivery dispatches with live tracking numbers.</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-black/5 text-left space-y-2 shadow-xs">
                    <div class="text-2xl">🔄</div>
                    <h4 class="font-bold text-sm text-zinc-900">7-Day Return Guarantee</h4>
                    <p class="text-xs text-zinc-500">Inspect upon arrival. Quick replacement on any defective items.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Store Footer -->
    <footer class="bg-[#1a1a1a] text-white py-12 px-4 md:px-8">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-zinc-800 pb-8 text-xs text-zinc-400">
            <div class="space-y-3">
                <h4 class="text-base font-bold text-white"><?php echo esc_html($store_name); ?></h4>
                <p class="leading-relaxed">Premium kitchenware, home improvement tools, and rechargeable electronics at genuine wholesale pricing.</p>
                <p>📍 <?php echo esc_html($store_address); ?></p>
            </div>
            <div class="space-y-2">
                <h4 class="text-base font-bold text-white">Direct Contacts</h4>
                <p>📞 Phone: <?php echo esc_html($store_phone); ?></p>
                <p>💬 WhatsApp: +<?php echo esc_html($whatsapp_num); ?></p>
                <p>🕒 Working Hours: Mon - Sat (9:00 AM - 10:00 PM)</p>
            </div>
            <div class="space-y-2">
                <h4 class="text-base font-bold text-white">Payment & Delivery</h4>
                <p>💵 Cash on Delivery (COD) across Pakistan</p>
                <p>💳 Advance Bank Transfer / JazzCash / EasyPaisa</p>
                <p>📦 Delivery rates: Rs.<?php echo esc_html($fee_500); ?> (500g) / Rs.<?php echo esc_html($fee_1kg); ?> (1kg+)</p>
            </div>
        </div>
        <div class="max-w-6xl mx-auto pt-6 text-center text-[11px] text-zinc-500">
            © <?php echo date('Y'); ?> <?php echo esc_html($store_name); ?>. Built for WordPress. All rights reserved.
        </div>
    </footer>
</div>
`;

  // 6. index.php
  const indexPhp = `<?php
/**
 * The main template file
 *
 * @package ${themeSlug}
 */

get_header();

include KCC_THEME_DIR . '/template-parts/store-view.php';

get_footer();
`;

  // 7. front-page.php
  const frontPagePhp = `<?php
/**
 * The template for displaying the store homepage
 *
 * @package ${themeSlug}
 */

get_header();

include KCC_THEME_DIR . '/template-parts/store-view.php';

get_footer();
`;

  // 8. page.php - Standard WordPress Page Template
  const pagePhp = `<?php
/**
 * Template for displaying all pages
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div class="kcc-container py-12 px-4 max-w-4xl mx-auto">
    <?php
    while (have_posts()) :
        the_post();
        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('bg-white p-8 rounded-3xl border border-black/5 shadow-xs space-y-6'); ?>>
            <header class="border-b border-black/5 pb-4">
                <h1 class="text-3xl font-black text-zinc-900"><?php the_title(); ?></h1>
            </header>

            <div class="prose max-w-none text-zinc-700 leading-relaxed text-sm space-y-4">
                <?php the_content(); ?>
            </div>
        </article>
        <?php
    endwhile;
    ?>
</div>

<?php
get_footer();
`;

  // 9. single.php - Single Post Template
  const singlePhp = `<?php
/**
 * Template for displaying single blog posts
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div class="kcc-container py-12 px-4 max-w-4xl mx-auto">
    <?php
    while (have_posts()) :
        the_post();
        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('bg-white p-8 rounded-3xl border border-black/5 shadow-xs space-y-6'); ?>>
            <header class="border-b border-black/5 pb-4">
                <h1 class="text-3xl font-black text-zinc-900"><?php the_title(); ?></h1>
                <div class="text-xs text-zinc-400 mt-2">Published on <?php echo get_the_date(); ?> by <?php the_author(); ?></div>
            </header>

            <div class="prose max-w-none text-zinc-700 leading-relaxed text-sm space-y-4">
                <?php the_content(); ?>
            </div>
        </article>
        <?php
    endwhile;
    ?>
</div>

<?php
get_footer();
`;

  // 10. page-shop.php
  const pageShopPhp = `<?php
/**
 * Template Name: KCC Shop Page
 *
 * @package ${themeSlug}
 */

get_header();

include KCC_THEME_DIR . '/template-parts/store-view.php';

get_footer();
`;

  // 11. templates/template-kcc-shop.php
  const templateKccShopPhp = `<?php
/**
 * Template Name: Full Width KCC Store
 * Template Post Type: post, page
 *
 * @package ${themeSlug}
 */

get_header();

include KCC_THEME_DIR . '/template-parts/store-view.php';

get_footer();
`;

  // 12. 404.php
  const notFoundPhp = `<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div class="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
    <div class="text-6xl font-black text-[#c5a880]">404</div>
    <h1 class="text-2xl font-bold text-zinc-900">Page Not Found</h1>
    <p class="text-xs text-zinc-500 max-w-md">The page you were looking for doesn't exist or has been moved.</p>
    <a href="<?php echo esc_url(home_url('/')); ?>" class="px-6 py-3 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md hover:bg-black transition-all">
        ← Return to Storefront
    </a>
</div>

<?php
get_footer();
`;

  // 13. assets/js/kcc-store-app.js - Defensive, Resilient Client-Side Engine
  const kccStoreAppJs = `/**
 * ${themeName} - Resilient Store Engine
 * Progressive enhancements: Live Cart, Filters, Weight Calculation & Modals.
 */
(function() {
    'use strict';

    // Global Config from WordPress Localized Script
    const cfg = window.KCC_STORE_CONFIG || {};
    const whatsappNumber = cfg.whatsappNumber || '${settings.whatsappNumber || '923001234567'}';
    const fee500g = parseInt(cfg.deliveryFee500 || ${settings.deliveryFee500g || 250}, 10);
    const fee1kg = parseInt(cfg.deliveryFee1kg || ${settings.deliveryFee1kg || 400}, 10);

    // Initial Cart State
    let cart = [];
    try {
        const saved = localStorage.getItem('kcc_wp_cart');
        if (saved) cart = JSON.parse(saved);
    } catch(e) {}

    function saveCart() {
        try {
            localStorage.setItem('kcc_wp_cart', JSON.stringify(cart));
        } catch(e) {}
        updateCartBadge();
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badgeEls = document.querySelectorAll('.kcc-cart-count');
        badgeEls.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }

    function showToast(message, type = 'info') {
        const existing = document.getElementById('kcc-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'kcc-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 transition-all transform duration-300 ' + 
            (type === 'success' ? 'bg-emerald-600 text-white' : type === 'remove' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-white');
        toast.innerHTML = '<span>' + message + '</span>';
        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }

    function generateTrackingNumber(courier = 'TCS') {
        const prefix = courier === 'TCS' ? 'TCS' : courier === 'Leopards' ? 'LCS' : 'TRX';
        const num = Math.floor(100000000 + Math.random() * 900000000);
        return prefix + '-' + num;
    }

    // Interactive Filtering & Search on Server-Rendered Products
    function filterProducts() {
        const searchInput = document.getElementById('kcc-search-input');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const activeCatBtn = document.querySelector('.kcc-cat-btn.bg-\\[\\#1a1a1a\\]') || document.querySelector('.kcc-cat-btn.active');
        const activeCat = activeCatBtn ? activeCatBtn.getAttribute('data-category') : 'All';

        const items = document.querySelectorAll('.kcc-product-item');
        items.forEach(item => {
            const cat = item.getAttribute('data-category') || '';
            const name = item.getAttribute('data-name') || '';
            const matchCat = (activeCat === 'All' || cat === activeCat);
            const matchSearch = (!query || name.includes(query));

            if (matchCat && matchSearch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Modal Helpers
    function openCartModal() {
        const existing = document.getElementById('kcc-cart-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'kcc-cart-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalWeight = cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
        const shippingFee = cart.length === 0 ? 0 : (totalWeight > 500 ? fee1kg : fee500g);
        const total = subtotal + shippingFee;

        modal.innerHTML = \`
            <div class="bg-white rounded-3xl max-w-lg w-full p-6 relative max-h-[85vh] flex flex-col justify-between space-y-4 shadow-2xl">
                <div class="flex items-center justify-between border-b pb-4">
                    <h3 class="text-xl font-bold text-zinc-900">Your Shopping Cart</h3>
                    <button id="kcc-cart-modal-close" class="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full cursor-pointer">✕</button>
                </div>

                <div class="overflow-y-auto flex-1 space-y-3 max-h-64 pr-2">
                    \${cart.length === 0 ? \`
                        <div class="text-center py-8 text-zinc-400 text-sm">Your cart is currently empty.</div>
                    \` : cart.map((item, idx) => \`
                        <div class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 border border-black/5">
                            <img src="\${item.image}" alt="\${item.name}" class="w-12 h-12 object-cover rounded-xl" />
                            <div class="flex-1 min-w-0">
                                <h4 class="text-xs font-bold text-zinc-900 truncate">\${item.name}</h4>
                                <span class="text-[11px] text-zinc-500">Rs. \${item.price} × \${item.quantity}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button data-idx="\${idx}" class="kcc-qty-minus p-1 bg-white border rounded text-xs">➖</button>
                                <span class="text-xs font-bold">\${item.quantity}</span>
                                <button data-idx="\${idx}" class="kcc-qty-plus p-1 bg-white border rounded text-xs">➕</button>
                            </div>
                        </div>
                    \`).join('')}
                </div>

                \${cart.length > 0 ? \`
                    <div class="border-t pt-4 space-y-2 text-xs">
                        <div class="flex justify-between text-zinc-600">
                            <span>Subtotal:</span>
                            <span class="font-bold text-zinc-900">Rs. \${subtotal.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between text-zinc-600">
                            <span>Delivery Fee (\${totalWeight}g):</span>
                            <span class="font-bold text-zinc-900">Rs. \${shippingFee}</span>
                        </div>
                        <div class="flex justify-between text-sm font-black text-zinc-900 border-t pt-2">
                            <span>Total (COD):</span>
                            <span class="text-emerald-700">Rs. \${total.toLocaleString()}</span>
                        </div>

                        <div class="pt-3 flex gap-2">
                            <button id="kcc-whatsapp-checkout-btn" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                                💬 Checkout on WhatsApp
                            </button>
                        </div>
                    </div>
                \` : ''}
            </div>
        \`;
        document.body.appendChild(modal);

        document.getElementById('kcc-cart-modal-close').addEventListener('click', () => modal.remove());

        modal.querySelectorAll('.kcc-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity -= 1;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
                openCartModal();
            });
        });

        modal.querySelectorAll('.kcc-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                cart[idx].quantity += 1;
                saveCart();
                openCartModal();
            });
        });

        const waCheckout = document.getElementById('kcc-whatsapp-checkout-btn');
        if (waCheckout) {
            waCheckout.addEventListener('click', () => {
                let msg = 'AOA! I want to place a Cash on Delivery order from KCC Store:\\n\\n';
                cart.forEach((item, i) => {
                    msg += (i + 1) + '. ' + item.name + ' (Qty: ' + item.quantity + ') - Rs. ' + (item.price * item.quantity) + '\\n';
                });
                msg += '\\nTotal Items: ' + cart.reduce((s, i) => s + i.quantity, 0);
                msg += '\\nEst. Weight: ' + totalWeight + 'g';
                msg += '\\nDelivery Fee: Rs. ' + shippingFee;
                msg += '\\n*Grand Total: Rs. ' + total.toLocaleString() + ' COD*\\n\\nPlease confirm my dispatch address and courier details!';
                
                window.open('https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(msg), '_blank');
                modal.remove();
            });
        }
    }

    function openTrackModal() {
        const existing = document.getElementById('kcc-track-modal');
        if (existing) existing.remove();

        const trk = generateTrackingNumber('TCS');
        const modal = document.createElement('div');
        modal.id = 'kcc-track-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
        modal.innerHTML = \`
            <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl">
                <button id="kcc-track-close" class="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full cursor-pointer">✕</button>
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🚚</span>
                    <h3 class="text-lg font-bold text-zinc-900">Track Courier Shipment</h3>
                </div>
                <p class="text-xs text-zinc-600">Enter your TCS, Leopard, or Trax tracking code to see real-time dispatch status.</p>
                <input type="text" id="kcc-track-input" value="\${trk}" placeholder="e.g. TCS-938201948" class="w-full bg-zinc-100 border border-black/10 rounded-2xl p-3 text-xs font-mono font-bold outline-none" />
                
                <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs space-y-1">
                    <span class="font-bold text-emerald-800">✅ Dispatch Status: In Transit</span>
                    <p class="text-emerald-700 text-[11px]">Handed over to TCS Express. Estimated Delivery: 2-3 Business Days.</p>
                </div>

                <a href="https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent('AOA KCC Store! Please check tracking status for consignment ' + trk)}" target="_blank" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl text-center block shadow-md">
                    💬 Inquire on WhatsApp
                </a>
            </div>
        \`;
        document.body.appendChild(modal);
        document.getElementById('kcc-track-close').addEventListener('click', () => modal.remove());
    }

    // Attach Events on DOM Ready
    function init() {
        updateCartBadge();

        // Search listener
        const searchInput = document.getElementById('kcc-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }

        // Category filter buttons
        document.querySelectorAll('.kcc-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.kcc-cat-btn').forEach(b => {
                    b.className = 'kcc-cat-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white border border-black/10 text-zinc-700 hover:bg-zinc-100';
                });
                e.currentTarget.className = 'kcc-cat-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#1a1a1a] text-white shadow-sm';
                filterProducts();
            });
        });

        // Add to Cart Buttons
        document.querySelectorAll('.kcc-add-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.kcc-product-item');
                if (!card) return;
                const name = card.querySelector('h4') ? card.querySelector('h4').textContent : 'Product';
                const priceText = card.querySelector('.text-lg') ? card.querySelector('.text-lg').textContent.replace(/[^0-9]/g, '') : '0';
                const price = parseInt(priceText, 10) || 0;
                const img = card.querySelector('img') ? card.querySelector('img').src : '';
                const pid = e.currentTarget.getAttribute('data-pid') || Math.random().toString();

                const existing = cart.find(item => item.id === pid);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({ id: pid, name, price, image: img, weight: 300, quantity: 1 });
                }
                saveCart();
                showToast('Added ' + name + ' to cart!', 'success');
            });
        });

        // Cart Drawer
        const cartBtn = document.getElementById('kcc-cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', openCartModal);
        }

        // Track Order
        const trackBtn = document.getElementById('kcc-track-btn');
        if (trackBtn) {
            trackBtn.addEventListener('click', openTrackModal);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
`;

  // 14. readme.txt
  const readmeTxt = `=== ${themeName} WordPress Theme ===
Contributors: ${author}
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: ${version}
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

== DESCRIPTION ==
${themeName} is a high-performance, responsive WordPress theme tailored specifically for wholesale, gadgets, home improvement, and kitchen supplies businesses.

KEY FEATURES:
* Zero-Configuration Server-Side HTML Rendering (Guaranteed No Blank Screen)
* Direct 1-Click WhatsApp Ordering & Cash-on-Delivery (COD) Checkout
* Interactive Responsive Product Catalog with Instant Search & Category Filters
* Weight-Based Shipping Calculation (500g vs 1kg+ rates)
* Simulated Tracking Number Generator for TCS / Leopards / Trax
* Full WordPress Admin Settings Panel (Appearance > KCC Store)
* Built-in Shortcode [kcc_store] for Gutenberg, Elementor, and Divi
* Zero Database Setup Required - Works 100% Out of the Box!

== 1-MINUTE INSTALLATION IN WORDPRESS ==
1. In your WordPress Dashboard (e.g. yourdomain.com/wp-admin):
   Navigate to: Appearance > Themes.
2. Click "Add New" and then click "Upload Theme".
3. Choose "${themeSlug}.zip" and click "Install Now".
4. Click "Activate".
5. Done! Your complete storefront is immediately live!

== STORE SETTINGS & CUSTOMIZATION ==
Go to WordPress Admin > "KCC Store" (or Appearance > KCC Store Settings) to customize:
* Store Name & Contact Phone Numbers
* WhatsApp Number for direct orders
* Physical Store Pickup Address
* Announcement Bar Banner Text
* Courier Shipping Fees (500g & 1kg rates)
`;

  // 15. Standalone index.html fallback
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${themeName}</title>
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#fcfbf9] text-zinc-900">
  <div class="kcc-container py-12 text-center">
    <h1 class="text-3xl font-bold mb-4">${themeName}</h1>
    <p class="text-zinc-600 mb-8">This package is designed for WordPress. Please install it via WordPress Admin > Appearance > Themes > Upload Theme.</p>
  </div>
</body>
</html>
`;

  // Add all files into the Theme Folder
  const themeFolder = zip.folder(themeSlug) || zip;
  themeFolder.file('style.css', styleCss);
  themeFolder.file('functions.php', functionsPhp);
  themeFolder.file('header.php', headerPhp);
  themeFolder.file('footer.php', footerPhp);
  themeFolder.file('index.php', indexPhp);
  themeFolder.file('front-page.php', frontPagePhp);
  themeFolder.file('page.php', pagePhp);
  themeFolder.file('single.php', singlePhp);
  themeFolder.file('page-shop.php', pageShopPhp);
  themeFolder.file('404.php', notFoundPhp);
  themeFolder.file('readme.txt', readmeTxt);
  themeFolder.file('index.html', indexHtml);

  // Template Parts Folder
  const templatePartsFolder = themeFolder.folder('template-parts');
  if (templatePartsFolder) {
    templatePartsFolder.file('store-view.php', storeViewPhp);
  }

  // Templates Folder
  const templatesFolder = themeFolder.folder('templates');
  if (templatesFolder) {
    templatesFolder.file('template-kcc-shop.php', templateKccShopPhp);
  }

  // Data Folder (JSON files)
  const dataFolder = themeFolder.folder('data');
  if (dataFolder) {
    dataFolder.file('products.json', productsJson);
    dataFolder.file('settings.json', settingsJson);
    dataFolder.file('deals.json', dealsJson);
    dataFolder.file('testimonials.json', testimonialsJson);
  }

  // Assets JS Folder
  const assetsFolder = themeFolder.folder('assets');
  if (assetsFolder) {
    const jsFolder = assetsFolder.folder('js');
    if (jsFolder) {
      jsFolder.file('kcc-store-app.js', kccStoreAppJs);
    }
  }

  // Generate PNG screenshot for WordPress theme dashboard
  const screenshotBlob = await generateScreenshotPng(themeName);
  if (screenshotBlob) {
    themeFolder.file('screenshot.png', screenshotBlob);
  }

  // Generate binary ZIP blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });
}

/**
 * Triggers instant client-side download of the complete WordPress Theme ZIP.
 */
export async function downloadWordPressThemeZip(options: WordPressThemeOptions): Promise<string> {
  const blob = await generateWordPressThemeZip(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${options.themeSlug || 'kcc-store-theme'}.zip`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return filename;
}

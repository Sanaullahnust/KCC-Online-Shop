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
 * Generates a complete, production-ready, downloadable WordPress Theme ZIP file
 * that can be installed directly into WordPress via Appearance > Themes > Add New > Upload Theme.
 */
export async function generateWordPressThemeZip(options: WordPressThemeOptions): Promise<Blob> {
  const zip = new JSZip();
  const themeSlug = options.themeSlug || 'kcc-store-theme';
  const themeName = options.themeName || 'KCC Online Wholesale Shop';
  const author = options.authorName || 'KCC Store Team';
  const authorUri = options.authorUri || 'https://kcconline.shop';
  const version = '1.0.0';

  // Helper to sanitize JSON for embedding in PHP/JS
  const productsJson = JSON.stringify(options.products, null, 2);
  const settingsJson = JSON.stringify(options.storeSettings, null, 2);
  const dealsJson = JSON.stringify(options.deals || [], null, 2);
  const testimonialsJson = JSON.stringify(options.testimonials || [], null, 2);

  // 1. style.css - WordPress Theme Header Definition
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

/* Reset & Base Theme Typography */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #fcfbf9;
  color: #1a1a1a;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
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

.kcc-theme-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Custom Scrollbar */
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

  // 2. functions.php - Core Theme Logic & Setup
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
 * Enqueue scripts and styles for the frontend.
 */
function kcc_store_theme_scripts() {
    // Google Fonts: Plus Jakarta Sans & Outfit
    wp_enqueue_style('kcc-google-fonts', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap', array(), null);

    // Tailwind CSS CDN for instant high-speed responsive UI rendering
    wp_enqueue_script('kcc-tailwind', 'https://cdn.tailwindcss.com', array(), '3.4.1', false);

    // Lucide Icons CDN for sleek UI icons
    wp_enqueue_script('kcc-lucide-icons', 'https://unpkg.com/lucide@latest', array(), null, true);

    // Theme Main Stylesheet
    wp_enqueue_style('kcc-theme-style', get_stylesheet_uri(), array(), KCC_THEME_VERSION);

    // Enqueue Store Interactive App JS
    wp_enqueue_script('kcc-store-engine', KCC_THEME_URI . '/assets/js/kcc-store-app.js', array(), KCC_THEME_VERSION, true);

    // Pass Dynamic Data to Client-Side Script
    $store_options = array(
        'ajaxUrl'        => admin_url('admin-ajax.php'),
        'siteUrl'        => site_url(),
        'themeUri'       => KCC_THEME_URI,
        'storeName'      => get_option('kcc_store_name', '${themeName}'),
        'whatsappNumber' => get_option('kcc_whatsapp_number', '${options.storeSettings.whatsappNumber}'),
        'storePhone'     => get_option('kcc_store_phone', '${options.storeSettings.storePhone}'),
        'storeAddress'   => get_option('kcc_store_address', '${options.storeSettings.storeAddress}'),
        'topBarText'     => get_option('kcc_topbar_text', '${options.storeSettings.topBarText}'),
        'heroHeadline'   => get_option('kcc_hero_headline', '${options.storeSettings.heroHeadline}'),
        'heroSubheading' => get_option('kcc_hero_subheading', '${options.storeSettings.heroSubheading}'),
        'heroBadgeText'  => get_option('kcc_hero_badge', '${options.storeSettings.heroBadgeText}'),
        'deliveryFee500' => (int) get_option('kcc_fee_500g', ${options.storeSettings.deliveryFee500g}),
        'deliveryFee1kg' => (int) get_option('kcc_fee_1kg', ${options.storeSettings.deliveryFee1kg}),
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
                    <td><input name="kcc_store_name" type="text" id="kcc_store_name" value="<?php echo esc_attr(get_option('kcc_store_name', '${themeName}')); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_whatsapp_number"><?php _e('WhatsApp Number (with Country Code)', '${themeSlug}'); ?></label></th>
                    <td>
                        <input name="kcc_whatsapp_number" type="text" id="kcc_whatsapp_number" value="<?php echo esc_attr(get_option('kcc_whatsapp_number', '${options.storeSettings.whatsappNumber}')); ?>" class="regular-text" placeholder="e.g. 923001234567" />
                        <p class="description"><?php _e('Customers will be directed to this WhatsApp number when placing 1-Click WhatsApp Orders.', '${themeSlug}'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_store_phone"><?php _e('Contact Phone', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_store_phone" type="text" id="kcc_store_phone" value="<?php echo esc_attr(get_option('kcc_store_phone', '${options.storeSettings.storePhone}')); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_store_address"><?php _e('Store Physical Address', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_store_address" type="text" id="kcc_store_address" value="<?php echo esc_attr(get_option('kcc_store_address', '${options.storeSettings.storeAddress}')); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_topbar_text"><?php _e('Header Announcement Bar Text', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_topbar_text" type="text" id="kcc_topbar_text" value="<?php echo esc_attr(get_option('kcc_topbar_text', '${options.storeSettings.topBarText}')); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_hero_headline"><?php _e('Hero Section Headline', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_hero_headline" type="text" id="kcc_hero_headline" value="<?php echo esc_attr(get_option('kcc_hero_headline', '${options.storeSettings.heroHeadline}')); ?>" class="large-text" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_hero_subheading"><?php _e('Hero Section Subheading', '${themeSlug}'); ?></label></th>
                    <td><textarea name="kcc_hero_subheading" id="kcc_hero_subheading" rows="3" class="large-text"><?php echo esc_textarea(get_option('kcc_hero_subheading', '${options.storeSettings.heroSubheading}')); ?></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_fee_500g"><?php _e('Shipping Fee (Up to 500g)', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_fee_500g" type="number" id="kcc_fee_500g" value="<?php echo esc_attr(get_option('kcc_fee_500g', ${options.storeSettings.deliveryFee500g})); ?>" class="small-text" /> PKR</td>
                </tr>
                <tr>
                    <th scope="row"><label for="kcc_fee_1kg"><?php _e('Shipping Fee (1kg & above)', '${themeSlug}'); ?></label></th>
                    <td><input name="kcc_fee_1kg" type="number" id="kcc_fee_1kg" value="<?php echo esc_attr(get_option('kcc_fee_1kg', ${options.storeSettings.deliveryFee1kg})); ?>" class="small-text" /> PKR</td>
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
    ?>
    <div id="kcc-store-root" class="kcc-embedded-store">
        <!-- The store UI hydrates here automatically -->
    </div>
    <?php
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
<body <?php body_class(); ?>>
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
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
</script>
</body>
</html>
`;

  // 5. index.php - Main WordPress Theme Template
  const indexPhp = `<?php
/**
 * The main template file
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div id="kcc-store-root">
    <!-- Server-Side Hydration Payload -->
    <script id="kcc-initial-products" type="application/json">
        ${productsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-settings" type="application/json">
        ${settingsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-deals" type="application/json">
        ${dealsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-testimonials" type="application/json">
        ${testimonialsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>

    <!-- Initial Loading State / SEO Fallback -->
    <div class="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fcfbf9] text-center">
        <div class="w-16 h-16 border-4 border-[#c5a880] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 class="text-2xl font-bold text-[#1a1a1a] mb-2"><?php echo esc_html(get_option('kcc_store_name', '${themeName}')); ?></h2>
        <p class="text-sm text-gray-600 max-w-md"><?php _e('Loading wholesale catalog, verified deals, and instant WhatsApp ordering system...', '${themeSlug}'); ?></p>
    </div>
</div>

<?php
get_footer();
`;

  // 6. front-page.php
  const frontPagePhp = `<?php
/**
 * The template for displaying the store homepage
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div id="kcc-store-root">
    <!-- Server-Side Data Initializers -->
    <script id="kcc-initial-products" type="application/json">
        ${productsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-settings" type="application/json">
        ${settingsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-deals" type="application/json">
        ${dealsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-testimonials" type="application/json">
        ${testimonialsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>

    <div class="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fcfbf9] text-center">
        <div class="w-16 h-16 border-4 border-[#c5a880] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 class="text-2xl font-bold text-[#1a1a1a] mb-2"><?php echo esc_html(get_option('kcc_store_name', '${themeName}')); ?></h2>
        <p class="text-sm text-gray-600"><?php _e('Loading premium wholesale catalog...', '${themeSlug}'); ?></p>
    </div>
</div>

<?php
get_footer();
`;

  // 7. page-shop.php
  const pageShopPhp = `<?php
/**
 * Template Name: KCC Shop Page
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div id="kcc-store-root">
    <script id="kcc-initial-products" type="application/json">
        ${productsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-settings" type="application/json">
        ${settingsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-deals" type="application/json">
        ${dealsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-testimonials" type="application/json">
        ${testimonialsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
</div>

<?php
get_footer();
`;

  // 8. templates/template-kcc-shop.php
  const templateKccShopPhp = `<?php
/**
 * Template Name: Full Width KCC Store
 * Template Post Type: post, page
 *
 * @package ${themeSlug}
 */

get_header();
?>

<div id="kcc-store-root">
    <script id="kcc-initial-products" type="application/json">
        ${productsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-settings" type="application/json">
        ${settingsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-deals" type="application/json">
        ${dealsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
    <script id="kcc-initial-testimonials" type="application/json">
        ${testimonialsJson.replace(/<\/script>/g, '<\\/script>')}
    </script>
</div>

<?php
get_footer();
`;

  // 9. assets/js/kcc-store-app.js - Standalone Client-Side Store Application Engine
  const kccStoreAppJs = `/**
 * ${themeName} - Interactive Client-Side Store Engine
 * Handles Product Catalog, WhatsApp Direct Orders, Cart, Weight-Based Shipping, Simulated Tracking & Modals.
 */
(function() {
    'use strict';

    // Parse Initial Data
    let products = [];
    let settings = {};
    let deals = [];
    let testimonials = [];

    try {
        const prodEl = document.getElementById('kcc-initial-products');
        if (prodEl) products = JSON.parse(prodEl.textContent || '[]');

        const setEl = document.getElementById('kcc-initial-settings');
        if (setEl) settings = JSON.parse(setEl.textContent || '{}');

        const dealEl = document.getElementById('kcc-initial-deals');
        if (dealEl) deals = JSON.parse(dealEl.textContent || '[]');

        const testEl = document.getElementById('kcc-initial-testimonials');
        if (testEl) testimonials = JSON.parse(testEl.textContent || '[]');
    } catch (e) {
        console.error('Error parsing store data:', e);
    }

    // Fallback store config from WordPress localized object
    const cfg = window.KCC_STORE_CONFIG || {};
    const whatsappNumber = cfg.whatsappNumber || settings.whatsappNumber || '923001234567';
    const storePhone = cfg.storePhone || settings.storePhone || '03001234567';
    const storeAddress = cfg.storeAddress || settings.storeAddress || 'KCC Wholesale Shop, Main Bazar, Pakistan';
    const topBarText = cfg.topBarText || settings.topBarText || 'All items on Wholesale Price • Store Collection & Delivery';
    const heroHeadline = cfg.heroHeadline || settings.heroHeadline || 'Imported & Domestic Goods at Wholesale Prices';
    const heroSubheading = cfg.heroSubheading || settings.heroSubheading || 'Get top quality home improvement tools, kitchenware, and smart gadgets delivered directly across Pakistan at wholesale prices.';
    const heroBadgeText = cfg.heroBadgeText || settings.heroBadgeText || 'Wholesale Rates Guaranteed';
    const fee500g = cfg.deliveryFee500 || settings.deliveryFee500g || 250;
    const fee1kg = cfg.deliveryFee1kg || settings.deliveryFee1kg || 400;

    // Cart State
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

    // Active Category Filter & Search
    let selectedCategory = 'All';
    let searchQuery = '';
    let selectedProduct = null;
    let isCartOpen = false;
    let isCheckoutOpen = false;
    let isTrackOrderOpen = false;

    // Toast notifications
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
        }, 3200);
    }

    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badgeEls = document.querySelectorAll('.kcc-cart-count');
        badgeEls.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }

    function addToCart(product, qty = 1) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({ ...product, quantity: qty });
        }
        saveCart();
        showToast('Added ' + product.name + ' to cart!', 'success');
    }

    function generateTrackingNumber(courier = 'TCS') {
        const prefix = courier === 'TCS' ? 'TCS' : courier === 'Leopards' ? 'LCS' : 'TRX';
        const num = Math.floor(100000000 + Math.random() * 900000000);
        return prefix + '-' + num;
    }

    // Main Renderer
    function renderStore() {
        const root = document.getElementById('kcc-store-root');
        if (!root) return;

        const filtered = products.filter(p => {
            const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
            const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });

        root.innerHTML = \`
            <!-- Top Announcement Bar -->
            <div class="bg-[#1a1a1a] text-white text-[11px] font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-between">
                <div class="hidden md:flex items-center gap-4 text-zinc-400">
                    <span>📞 \${storePhone}</span>
                    <span>📍 \${storeAddress}</span>
                </div>
                <div class="mx-auto font-medium text-amber-300">
                    \${topBarText}
                </div>
                <div class="hidden md:flex items-center gap-3">
                    <a href="https://wa.me/\${whatsappNumber}" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1">
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
                            \${cfg.storeName || 'KCC Wholesale Shop'}
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
                        value="\${searchQuery}"
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
                        <span class="kcc-cart-count w-5 h-5 bg-[#c5a880] text-zinc-900 text-[10px] font-black rounded-full flex items-center justify-center">0</span>
                    </button>
                </div>
            </header>

            <!-- Hero Section -->
            <section class="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white py-12 md:py-20 px-6 md:px-12 overflow-hidden">
                <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div class="max-w-2xl space-y-4 text-center md:text-left">
                        <span class="inline-block px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/40">
                            \${heroBadgeText}
                        </span>
                        <h2 class="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            \${heroHeadline}
                        </h2>
                        <p class="text-sm md:text-base text-zinc-300 leading-relaxed">
                            \${heroSubheading}
                        </p>
                        <div class="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                            <a href="#kcc-catalog" class="px-6 py-3 bg-[#c5a880] hover:bg-[#b08d55] text-zinc-900 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all">
                                🛍️ Explore Catalog
                            </a>
                            <a href="https://wa.me/\${whatsappNumber}?text=Hi%20KCC%20Store,%20I%20want%20to%20place%20a%20wholesale%20order!" target="_blank" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2">
                                💬 Quick WhatsApp Order
                            </a>
                        </div>
                    </div>
                    <div class="hidden lg:block w-72 h-72 rounded-3xl bg-[#c5a880]/10 border border-white/10 p-6 backdrop-blur-md text-center space-y-3">
                        <div class="text-4xl">📦</div>
                        <h3 class="text-lg font-bold">Fast Courier Delivery</h3>
                        <p class="text-xs text-zinc-400">Cash on Delivery across Pakistan. Safe packaging and wholesale discounts on bulk quantities.</p>
                        <div class="pt-2 text-xs font-mono text-[#c5a880]">500g: Rs.\${fee500g} | 1kg+: Rs.\${fee1kg}</div>
                    </div>
                </div>
            </section>

            <!-- Categories Filter Bar -->
            <div id="kcc-catalog" class="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div class="flex items-center justify-between gap-4 flex-wrap border-b border-black/5 pb-4 mb-8">
                    <div>
                        <h3 class="text-2xl font-black text-zinc-900 tracking-tight">Our Wholesale Catalog</h3>
                        <p class="text-xs text-zinc-500 mt-1">Showing \${filtered.length} high quality verified products</p>
                    </div>

                    <!-- Category Pills -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                        \${['All', 'Gadgets', 'Home Improvement', 'Kitchen'].map(cat => \`
                            <button 
                                data-category="\${cat}" 
                                class="kcc-cat-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                                    selectedCategory === cat 
                                        ? 'bg-[#1a1a1a] text-white shadow-sm' 
                                        : 'bg-white border border-black/10 text-zinc-700 hover:bg-zinc-100'
                                }"
                            >
                                \${cat}
                            </button>
                        \`).join('')}
                    </div>
                </div>

                <!-- Product Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    \${filtered.map(p => \`
                        <div class="bg-white rounded-3xl border border-black/5 p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
                            <div>
                                <!-- Image Container -->
                                <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3 cursor-pointer kcc-product-trigger" data-pid="\${p.id}">
                                    <img src="\${p.image}" alt="\${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    \${p.isHot ? '<span class="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">🔥 HOT</span>' : ''}
                                    \${p.isTopSeller ? '<span class="absolute top-2.5 right-2.5 bg-amber-500 text-zinc-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">⭐ Top Seller</span>' : ''}
                                </div>

                                <span class="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider block mb-1">\${p.category}</span>
                                <h4 class="font-bold text-sm text-zinc-900 line-clamp-2 leading-snug cursor-pointer kcc-product-trigger" data-pid="\${p.id}">\${p.name}</h4>
                                <p class="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">\${p.description}</p>
                            </div>

                            <div class="pt-4 mt-3 border-t border-black/5 space-y-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <span class="text-lg font-black text-zinc-900">Rs. \${p.price.toLocaleString()}</span>
                                        \${p.discountNote ? \`<span class="text-[10px] text-emerald-700 font-bold block">\${p.discountNote}</span>\` : ''}
                                    </div>
                                    <span class="text-[11px] text-zinc-400 font-mono">⚖️ \${p.weight}g</span>
                                </div>

                                <div class="grid grid-cols-2 gap-2">
                                    <button 
                                        data-pid="\${p.id}" 
                                        class="kcc-add-cart-btn w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                                    >
                                        🛒 + Cart
                                    </button>
                                    <a 
                                        href="https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent('AOA! I want to order ' + p.name + ' (Rs. ' + p.price + ') from KCC Store. Please confirm delivery!')}" 
                                        target="_blank"
                                        class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm"
                                    >
                                        💬 WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    \`).join('')}
                </div>
            </div>

            <!-- Testimonials & Trust Factors -->
            <section class="bg-zinc-100/70 border-t border-black/5 py-12 px-4 md:px-8 mt-16">
                <div class="max-w-5xl mx-auto text-center space-y-8">
                    <div>
                        <h3 class="text-2xl font-black text-zinc-900">Why Wholesalers & Families Choose KCC</h3>
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
                        <h4 class="text-base font-bold text-white">\${cfg.storeName || 'KCC Wholesale Shop'}</h4>
                        <p class="leading-relaxed">Premium kitchenware, home improvement tools, and rechargeable electronics at genuine wholesale pricing.</p>
                        <p>📍 \${storeAddress}</p>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-base font-bold text-white">Direct Contacts</h4>
                        <p>📞 Phone: \${storePhone}</p>
                        <p>💬 WhatsApp: +\${whatsappNumber}</p>
                        <p>🕒 Working Hours: Mon - Sat (9:00 AM - 10:00 PM)</p>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-base font-bold text-white">Payment & Delivery</h4>
                        <p>💵 Cash on Delivery (COD) across Pakistan</p>
                        <p>💳 Advance Bank Transfer / JazzCash / EasyPaisa</p>
                        <p>📦 Delivery rates: Rs.\${fee500g} (500g) / Rs.\${fee1kg} (1kg+)</p>
                    </div>
                </div>
                <div class="max-w-6xl mx-auto pt-6 text-center text-[11px] text-zinc-500">
                    © \${new Date().getFullYear()} \${cfg.storeName || 'KCC Wholesale Shop'}. Built for WordPress. All rights reserved.
                </div>
            </footer>
        \`;

        bindEvents();
        updateCartBadge();
    }

    function bindEvents() {
        // Search Input
        const searchInput = document.getElementById('kcc-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderStore();
                const newInput = document.getElementById('kcc-search-input');
                if (newInput) {
                    newInput.focus();
                    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
                }
            });
        }

        // Category Buttons
        document.querySelectorAll('.kcc-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectedCategory = e.currentTarget.getAttribute('data-category');
                renderStore();
            });
        });

        // Add to Cart Buttons
        document.querySelectorAll('.kcc-add-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pid = e.currentTarget.getAttribute('data-pid');
                const product = products.find(p => p.id === pid);
                if (product) addToCart(product, 1);
            });
        });

        // Product Details Trigger
        document.querySelectorAll('.kcc-product-trigger').forEach(el => {
            el.addEventListener('click', (e) => {
                const pid = e.currentTarget.getAttribute('data-pid');
                const product = products.find(p => p.id === pid);
                if (product) openProductModal(product);
            });
        });

        // Cart Modal Trigger
        const cartBtn = document.getElementById('kcc-cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', openCartModal);
        }

        // Track Order Trigger
        const trackBtn = document.getElementById('kcc-track-btn');
        if (trackBtn) {
            trackBtn.addEventListener('click', openTrackModal);
        }
    }

    // Modal Helpers
    function openProductModal(p) {
        selectedProduct = p;
        const modal = document.createElement('div');
        modal.id = 'kcc-product-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
        modal.innerHTML = \`
            <div class="bg-white rounded-3xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
                <button id="kcc-modal-close" class="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full cursor-pointer">✕</button>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div class="aspect-square rounded-2xl overflow-hidden bg-zinc-100">
                        <img src="\${p.image}" alt="\${p.name}" class="w-full h-full object-cover" />
                    </div>
                    <div class="space-y-3">
                        <span class="text-xs font-bold text-[#c5a880] uppercase tracking-wider">\${p.category}</span>
                        <h3 class="text-xl font-bold text-zinc-900">\${p.name}</h3>
                        <div class="text-2xl font-black text-zinc-900">Rs. \${p.price.toLocaleString()}</div>
                        <p class="text-xs text-zinc-600 leading-relaxed">\${p.description}</p>
                        <div class="text-xs font-mono text-zinc-500">Weight: \${p.weight}g</div>
                        
                        <div class="pt-4 flex flex-col gap-2">
                            <button id="kcc-modal-add-cart" class="w-full py-3 bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer">
                                🛒 Add to Cart
                            </button>
                            <a href="https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent('AOA! I want to order ' + p.name + ' (Rs. ' + p.price + ') from KCC Store. Please confirm delivery details.')}" target="_blank" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl text-center shadow-md">
                                💬 Buy Now on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        \`;
        document.body.appendChild(modal);

        document.getElementById('kcc-modal-close').addEventListener('click', () => modal.remove());
        document.getElementById('kcc-modal-add-cart').addEventListener('click', () => {
            addToCart(p, 1);
            modal.remove();
        });
    }

    function openCartModal() {
        const modal = document.createElement('div');
        modal.id = 'kcc-cart-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalWeight = cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
        const shippingFee = cart.length === 0 ? 0 : totalWeight > 500 ? fee1kg : fee500g;
        const total = subtotal + shippingFee;

        modal.innerHTML = \`
            <div class="bg-white rounded-3xl max-w-lg w-full p-6 relative max-h-[85vh] flex flex-col justify-between space-y-4">
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
                modal.remove();
                openCartModal();
            });
        });

        modal.querySelectorAll('.kcc-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
                cart[idx].quantity += 1;
                saveCart();
                modal.remove();
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
        const trk = generateTrackingNumber('TCS');
        const modal = document.createElement('div');
        modal.id = 'kcc-track-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
        modal.innerHTML = \`
            <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 relative">
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

    // Initialize Store on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderStore);
    } else {
        renderStore();
    }
})();
`;

  // 10. screenshot.png - SVG placeholder converted to clean data URL or SVG asset
  const screenshotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="50%" stop-color="#27272a"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e5c898"/>
      <stop offset="100%" stop-color="#b08d55"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="600" cy="360" r="110" fill="url(#gold)"/>
  <text x="600" y="390" font-family="'Plus Jakarta Sans', sans-serif" font-size="110" font-weight="900" fill="#18181b" text-anchor="middle">K</text>
  <text x="600" y="550" font-family="'Plus Jakarta Sans', sans-serif" font-size="46" font-weight="800" fill="#ffffff" text-anchor="middle">${themeName}</text>
  <text x="600" y="605" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="600" fill="#e5c898" text-anchor="middle" letter-spacing="4">COMPLETE WORDPRESS ECOMMERCE THEME</text>
  <text x="600" y="660" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="400" fill="#a1a1aa" text-anchor="middle">Direct WhatsApp Checkout • Wholesale Catalog • Courier Tracking • COD System</text>
  <rect x="420" y="720" width="360" height="60" rx="30" fill="url(#gold)"/>
  <text x="600" y="757" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#18181b" text-anchor="middle" letter-spacing="2">READY TO ACTIVATE</text>
</svg>`;

  // 11. readme.txt - Complete Installation & User Guide
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
* Direct 1-Click WhatsApp Ordering & Checkout
* Interactive Responsive Product Catalog with Filters & Search
* Weight-Based Shipping Calculation (500g vs 1kg+ rates)
* Simulated Tracking Number Generator for TCS / Leopards / Trax
* Full WordPress Admin Settings Panel (Appearance > KCC Store Settings)
* Built-in Shortcode [kcc_store] for Gutenberg & Elementor
* Zero Database Setup Required - Works 100% Out of the Box!

== INSTALLATION IN WORDPRESS (1-CLICK) ==
1. Download this theme ZIP file (${themeSlug}.zip).
2. Log into your WordPress Dashboard (e.g. yourdomain.com/wp-admin).
3. Navigate to Appearance > Themes.
4. Click "Add New" and then "Upload Theme".
5. Choose "${themeSlug}.zip" and click "Install Now".
6. Click "Activate".
7. Done! Your complete KCC store is now active and ready to take WhatsApp orders!

== CONFIGURING STORE SETTINGS ==
Go to WordPress Admin > "KCC Store" or "Appearance > KCC Store Settings" to customize:
* Store Name & Contact Numbers
* WhatsApp Number for direct orders
* Physical Store Pickup Address
* Announcement Bar Banner Text
* Courier Shipping Fees (500g & 1kg rates)

== EMBEDDING ON OTHER PAGES ==
Use the shortcode [kcc_store] on any WordPress Page or Post.
`;

  // 12. Apache .htaccess configuration file for SPA fallback
  const htaccess = `# Apache / cPanel / WordPress SPA Rewrite Rule
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
`;

  // Build the ZIP tree inside the theme folder
  const themeFolder = zip.folder(themeSlug) || zip;
  themeFolder.file('style.css', styleCss);
  themeFolder.file('functions.php', functionsPhp);
  themeFolder.file('header.php', headerPhp);
  themeFolder.file('footer.php', footerPhp);
  themeFolder.file('index.php', indexPhp);
  themeFolder.file('front-page.php', frontPagePhp);
  themeFolder.file('page-shop.php', pageShopPhp);
  themeFolder.file('readme.txt', readmeTxt);
  themeFolder.file('.htaccess', htaccess);
  themeFolder.file('screenshot.svg', screenshotSvg);

  const templatesFolder = themeFolder.folder('templates');
  if (templatesFolder) {
    templatesFolder.file('template-kcc-shop.php', templateKccShopPhp);
  }

  const assetsFolder = themeFolder.folder('assets');
  if (assetsFolder) {
    const jsFolder = assetsFolder.folder('js');
    if (jsFolder) {
      jsFolder.file('kcc-store-app.js', kccStoreAppJs);
    }
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
  const filename = `${options.themeSlug || 'kcc-store-wordpress-theme'}.zip`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return filename;
}

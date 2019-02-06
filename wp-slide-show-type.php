<?php
/*
Plugin Name: WP Slide Show Custom
Plugin URI: 
Description: WP Slide Show Description
Version: 1.0
Author: Adeel Nazar
Author URI: http://www.kodeforest.com
License: 
Text-Domain: wp-slide-show
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}	
/**
* Important Core Functions
*/

define('WPSLIDE_SHOW_PATH', plugin_dir_url( __FILE__ ) );

class wpss_meta_panel{
			
	function __construct(){
		
		// send the hook to create the admin menu
		add_action('admin_menu', array(&$this, 'register_main_themeoption'));
		
	}
	
	// create the admin menu
	function register_main_themeoption(){
		
		// add the hook to create admin option
		$page = add_theme_page('Custom Theme Option', 'Theme Option', 'edit_theme_options', 'custom-themeoption', array($this,'create_themeoption'), '', 82); 

		// include the script to admin option
		add_action('admin_print_scripts-' . $page,array($this,'register_admin_option_script'));
		
	}
	
	// Register Scripts and Style
	function register_admin_option_script(){
		if(function_exists( 'wp_enqueue_media' )){
			wp_enqueue_media();
		}		
		wp_enqueue_script('gallery-selection', WPSLIDE_SHOW_PATH . 'gallery.js');
		wp_enqueue_style('gallery-selection', WPSLIDE_SHOW_PATH . 'gallery.css');
	}
	
	// Create Theme Options
	function create_themeoption(){
		$slider = get_option('slider');
		$slider_data = theme_stripslashes($slider);
		
		echo '
		
		<form method="POST" id="admin-form">
			<h3>Custom Theme Option</h3>
			<div class="media-gallery-slider">
				<textarea id="image-slider" name="slider" data-slug="slider" class="input-hidden upload-box-hidden" data-overlay="false" data-caption="false">'.esc_attr($slider_data).'</textarea>';
				echo '
			</div>
			<script>
			jQuery(document).ready(function($){
				// Gallery script
				$("#image-slider").xpressCreateGallerySelection();
			});	
			</script>
			<input type="hidden" value="' . wp_create_nonce('theme-create-nonce') . '" name="security" />
			<div class="clearfix clear"></div>
			<input class="submit-form" type="submit" value="Submit Now">
		</form>
		<div class="clearfix clear"></div>
		<h4>Copy Below Code and paste in post or page.</h4>
		[myslideshow][/myslideshow]';
		
		// We need to verify the nonce.
		if(isset($_POST['slider']) && $_POST['slider'] <> ''){
			$nonce = $_POST['security'];
			if ( ! wp_verify_nonce( $nonce, 'theme-create-nonce' ) ) {
				// This nonce is not valid.
				die( 'Security check' ); 
			} else {
				// The nonce was valid.
				// Do stuff here.
				update_option('slider',$_POST['slider']);
			}
		}
		
	}
	
}

if(is_admin()){
	$wpss_meta_panel = new wpss_meta_panel();
}

// Strip Down slashes	
function theme_stripslashes($data){
	$data = is_array($data) ? array_map('stripslashes_deep', $data) : stripslashes($data);
	return $data;
}

// Slide Show Shortcode
// My Slide Show Shortcode
add_shortcode( 'myslideshow', 'slide_show_shortcode' );
function slide_show_shortcode( $atts, $content = null ) {
	extract( shortcode_atts( array(        
		'title' => '',
		'size' => '',
		'margin_bottom' => ''
	), $atts ) );
	$slider = get_option('slider');
	$slider_data = theme_stripslashes($slider);
	$settings['title'] = $title;
	$settings['slider'] = $slider_data;
	$settings['margin-bottom'] = $margin_bottom;
	$output = slide_show_shortcode_item($settings);
	return $output;
}

//Print Shortcode On frontend
function slide_show_shortcode_item( $settings = array() ){
	$slider_data = $settings['slider'];
	if( is_array($slider_data) ){
		$slide_order = $slider_data[0];
		$slide_data = $slider_data[1];
	}else{
		$slider_option = json_decode($slider_data, true);
		$slide_order = $slider_option[0];
		$slide_data = $slider_option[1];			
	}
	
	$slides = array();
	$slide_order = empty($slide_order)? array(): $slide_order;
	foreach($slide_order as $slide){
		$slides[$slide] = $slide_data[$slide];
	}
	
	$ret = '<div class="main-slider">
		<ul class="bxslider">';
		$slides = empty($slides)? array(): $slides;
		foreach($slides as $slide_id => $slide){
			$alt_text = get_post_meta($slide_id , '_wp_attachment_image_alt', true);	
			$image_src = wp_get_attachment_image_src($slide_id, 'full');	
			if( empty($image_src) ) return '';
			$ret .= '<li><img src="'.esc_url($image_src[0]).'" alt="'.esc_attr($alt_text).'" /></li>';
		}
		$ret .= '	
		</ul>
	</div>';
	
	return $ret;
	
}

//Add Scripts in Theme
if(!is_admin()){
	add_action('wp_enqueue_scripts','register_frontend_script');
}
// Register Scripts and Style
function register_frontend_script(){
	
	wp_enqueue_script('bxslider', WPSLIDE_SHOW_PATH . 'bxslider/bxslider.min.js');
	wp_enqueue_style('bxslider', WPSLIDE_SHOW_PATH . 'bxslider/bxslider.css');
	wp_enqueue_script('custom', WPSLIDE_SHOW_PATH . 'custom.js');
}

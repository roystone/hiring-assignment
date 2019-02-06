jQuery(document).ready(function($){
	"use strict";
	
	// Bxslider Extension Slider
	if($('.bxslider').length){
		$('.bxslider').bxSlider({
			mode: 'fade',
			captions: true,
			slideWidth: 600
		});
	}
});
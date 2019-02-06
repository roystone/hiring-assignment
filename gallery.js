(function($){
	
	// use textarea to create slider selection
	$.fn.xpressCreateGallerySelection = function(){

		var textarea = $(this);
		var slider_wrapper = $('<div class="slider-wrapper"></div>');
		
		var add_button = $('<div class="add-more-images">Add Images</div>');
		add_button.click(function(){
			xpressSelectSliderImage(textarea);
		});
		
		var container = $('<div class="slider-container"></div>');		
		container.sortable({
			revert: 100,
			opacity: 0.8,
			tolerance: "pointer",
			helper: 'clone',
			stop: function(event, ui){
				xpressUpdateSliderOrder(textarea);
			}
		});
			
		// add the silder item before the textarea
		textarea.parent().prepend(slider_wrapper);	
		slider_wrapper.append( $('<div class="add-image-wrapper" ></div>').append(add_button) ).append(container);
		xpressCreateSliderSlide(textarea);
	}
	
	// update the slider order when takes an action
	function xpressUpdateSliderOrder(textarea){
		var slider_data = (textarea.val().length > 0)? $.parseJSON(textarea.val()): [];
		var slide_order = [];
		var slides = (slider_data[1])? slider_data[1]: {};
		var container = textarea.siblings('.slider-wrapper').children('.slider-container');
		
		var slide = {};
		container.children().each(function(){
			slide_order.push(parseInt($(this).attr('data-id')));
		});
		textarea.val(JSON.stringify([slide_order, slides]));
	}	
	
	// add new slides to container
	function xpressCreateSliderSlide(textarea){
		var slider_data = (textarea.val().length > 0)? $.parseJSON(textarea.val()): [];
		var slide_order = (slider_data[0])? slider_data[0]: [];
		var slides = (slider_data[1])? slider_data[1]: {};
		var container = textarea.siblings('.slider-wrapper').children('.slider-container');
		
		container.children().remove();
		for (var i=0; i<slide_order.length; i++){ 
			var slide = $('<div class="slide-wrapper" data-id="' + slide_order[i] + '" ></div>');
			
			slide.append( $('<img />')
					.attr('src', slides[slide_order[i]].thumbnail)
					.attr('width', slides[slide_order[i]].width)
					.attr('height', slides[slide_order[i]].height)
			);
			
			var remove = $('<div class="delete-slide"></div>');
			remove.click(function(){
				var remove_button = $(this);				
				remove_button.parent('.slide-wrapper').slideUp(function(){
					$(this).remove();
					xpressUpdateSliderOrder(textarea);
				});					
				return false;
			});
			slide.append(remove);
			
			container.append(slide);
		}	
	}
	
	// clicking add more image button
	function xpressSelectSliderImage(textarea){
		var slider_data = (textarea.val().length > 0)? $.parseJSON(textarea.val()): [];
		var slide_order = (slider_data[0])? slider_data[0]: [];
		var slides = (slider_data[1])? slider_data[1]: {};

		var custom_uploader = wp.media({
			title: 'Select Slider Images',
			button: { text: 'Add Images' },
			library : { type : 'image' },
			multiple: 'add'
		});
		custom_uploader.on('open',function() {
			var selection = custom_uploader.state().get('selection');
			for (var i=0; i<slide_order.length; i++){ 
				attachment = wp.media.attachment(slide_order[i]);
				attachment.fetch();
				selection.add( attachment ? [attachment] : [] );
			}
		});	
		custom_uploader.on('select', function() {
			var attachment = custom_uploader.state().get('selection').toJSON();

			for (var i=0; i<attachment.length; i++){ 
			
				// add new image if it isn't exists
				if( $.inArray(attachment[i].id, slide_order) < 0 ){
					slide_order.push(attachment[i].id);
					slides[attachment[i].id] = {};
			
				}
				
				// add the slider data to slide array
				if( attachment[i].sizes.thumbnail ){
					slides[attachment[i].id].thumbnail = attachment[i].sizes.thumbnail.url;
					slides[attachment[i].id].width = attachment[i].sizes.thumbnail.width;
					slides[attachment[i].id].height = attachment[i].sizes.thumbnail.height;
				}else{
					slides[attachment[i].id].thumbnail = attachment[i].sizes.full.url;
					slides[attachment[i].id].width = attachment[i].sizes.full.width;
					slides[attachment[i].id].height = attachment[i].sizes.full.height;	
				}
			}
			textarea.val(JSON.stringify([slide_order, slides]));
			xpressCreateSliderSlide(textarea);
		});		
		custom_uploader.open();	
	}
	
	//Delete Images on Refresh
	function xpressCloseSliderOption(editbox, textarea, image_id, overlay){
		var slider_data = $.parseJSON(textarea.val());
		var slide_order = slider_data[0];
		var slides = slider_data[1];
		
		// save the data
		editbox.find('[name]').each(function(){
			if( $(this).attr('type') == 'checkbox' ){
				if( $(this).attr('checked') ){
					slides[image_id][$(this).attr('name')] = 'enable';
				}else{
					slides[image_id][$(this).attr('name')] = 'disable';
				}			
			}else{
				slides[image_id][$(this).attr('name')] = $(this).val();
			}
		});
		textarea.val(JSON.stringify([slide_order, slides]));
		
		// close edit box
		editbox.fadeOut(150, function(){
			editbox.remove();
		});
		
		if(overlay){ $('body').removeClass('disable-scroll'); }	
	}
	

})(jQuery);
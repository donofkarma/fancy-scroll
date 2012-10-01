/**
* Fancy Scroll - parallax effect plugin
*
* @version	0.5
* @author	Jasal Vadgama - http://blacklabelcreative.com/
* @require	jquery 1.7.1+
* @license	MIT
**/

(function($){
	$.fn.fancyScroll = function(settings) {
		// SETTINGS
		var config = {
			sectionClass:		'section',
			spriteClass:		'sprite',
			object3DClass:		'object3D'
		},
		// PRIVATE VARS
		vars = {
			_window:			$(window),
			windowHeight:		$(window).height(),
			didScroll:			false
		};

		if (settings) $.extend(config, settings);

		function init() {
			// cache data for sprites
			$('.' + config.spriteClass).each(function() {
				var // position of the element
					pos = $(this).offset(),
					// calculate the animation range
					// number of pixels to move per pixel scrolled
					animationRange = parseInt($(this).data('end'), 10) - parseInt($(this).data('start'), 10),
					// horizontal frame rate
					xFrameRate = 0,
					// total number or pixels to move horizontally
					xDistance = pos.left;

				// find the horizontal frame rate
				if ($(this).data('left')) {
					if (xDistance < 1) {
						xDistance = xDistance * -1;
					}

					xFrameRate = (xDistance + parseInt($(this).data('left'), 10)) / animationRange;
				} else {
					xFrameRate = 0;
				}

				// set the object data
				// these are new ones which need to be calculated from the settings
				$(this).data({
					// start positions
					leftStart: pos.left,
					// frame rates
					xFrameRate: xFrameRate
				});
			});

			// cache data for 3d objects
			$('.' + config.object3DClass).each(function() {
				// set the object data
				// these are new ones which need to be calculated from the settings
				$(this).data({
					// no of frames in the animation
					frames: $(this).find('img').length
				});
			});

			// set a timer to check for a fired scroll - performance issue
			// see http://ejohn.org/blog/learning-from-twitter/ for more info
			setInterval(function() {
				// make sure there's a scroll to check against
				if (!vars.didScroll) {
					return;
				}

				// reset the scroll boolean
				vars.didScroll = false;

				// For each element that has a data-type of background
				$('.' + config.sectionClass).each(function() {
					var $self = $(this),
						offsetCoords = $self.offset(),
						topOffset = offsetCoords.top;

					if ((vars._window.scrollTop() + vars.windowHeight) > topOffset && (topOffset + $self.height()) > vars._window.scrollTop()) {
						// Scroll the background at var speed
						// the yPos is a negative value because we're scrolling it UP!
						var yPos = -(vars._window.scrollTop() / $self.data('speed')),
							coords = '50% 50%',
							// amount of the section that's hidden from the top
							// - added as the calculation is done a few times
							sectionHiddenTop = vars._window.scrollTop() - topOffset;

						// see if the background needs to move
						if ($self.data('type') === 'background') {
							// If this element has a Y offset then add it on
							if ($self.data('yoffset')) {
								yPos += $self.data('yoffset');
							}

							// Put together our final background position
							coords = '50% ' + yPos + 'px';

							// Move the background
							$self.css('background-position', coords);
						}

						// handle sprites
						$('.' + config.spriteClass, $self).each(function() {
							var // chache the sprite
								$sprite = $(this),
								xPos = 0;

							if (sectionHiddenTop > $sprite.data('start') && sectionHiddenTop < $sprite.data('end')) {
								// calulate how many pixels the form the start point
								// the sprite should be
								xPos = (sectionHiddenTop - $sprite.data('start')) * $sprite.data('xFrameRate');
								// add the result to the start point
								xPos = $sprite.data('leftStart') + xPos;
								// position the sprite
								$sprite.css({
									left: xPos
								});
							} else if (sectionHiddenTop > $sprite.data('end')) {
								// if the user scrolls passed the end
								// set the sprite to be at the end position
								$sprite.css({
									left: $sprite.data('leftEnd')
								});
							} else if (sectionHiddenTop < $sprite.data('start')) {
								// if the user scrolls back up
								// set the sprite to be at the end position
								$sprite.css({
									left: $sprite.data('leftStart')
								});
							}
						});

						// handle 3d objects
						$('.' + config.object3DClass, $self).each(function () {
							var // cache the object
								$3dobject = $(this),
								// get an array of all the images in the section
								$imageList = $3dobject.find('img'),
								// calculate the animation range
								animationRange = $3dobject.data('end') - $3dobject.data('start'),
								// calculate the frame rate
								frameRate = animationRange / $3dobject.data('frames'),
								itemToShow = 0;

							if (sectionHiddenTop > $3dobject.data('start') && sectionHiddenTop < $3dobject.data('end')) {
								// top of section has passed the top of the window enough to trigger the animation
								$3dobject.css({
									position: 'fixed',
									top: -$3dobject.data('start')
								});

								// calculate the item to show
								// the number of pixels that has passed in the animation range / number of pixels per frame
								itemToShow = Math.floor((sectionHiddenTop - $3dobject.data('start')) / frameRate);

								// remove 'active' from the item to hide and ad to the item to show
								// hide/show actually handled in css
								$imageList.filter('.active').removeClass('active');
								$($imageList[itemToShow]).addClass('active');
							} else if (sectionHiddenTop > $3dobject.data('end')) {
								// if the user scrolls passed the end
								// show the last image in the list
								$imageList.filter('.active').removeClass('active');
								$($imageList[$imageList.length - 1]).addClass('active');
							} else if (sectionHiddenTop < $3dobject.data('start')) {
								// if the user scrolls back up, reset the position to the start point
								$3dobject.css({
									position: 'relative',
									top: 0
								});

								// show the first image in the list
								$imageList.filter('.active').removeClass('active');
								$($imageList[0]).addClass('active');
							}
						});
					}
				});
			}, 50);

			// add the scroll event listener
			vars._window.scroll(function() {
				vars.didScroll = true;
			});
		}

		// start the parallax effects
		init(this);
	};
})(jQuery);
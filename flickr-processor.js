// Author: Rachel Dale
// Content script for Flickr Wordpress extension.
// Loaded onto the browser's current tab if that tab is a Flickr photo page.
// Retrieves information about the current photo to pass back to extension.

/**
 * Gets the photo details from the current page.
 * @return {Object} photoDetails The photo details containing:
 *  - title: The image's title
 *  - url: The URL of this Flickr photo page
 *  - imageSrc: The URL of the image in the 640 size
 *  - horizontal: True if image is a horizontal orientation
 */
var getPhotoDetails = function() {
	// TODO: This currently only works with a size of 640px.
	// Consider making configurable later.
	var INDEX_OF_640_LINK = 2;

	var title = document.getElementsByClassName('photo-title')[0].innerHTML;
	 
	var imageSrc = document.getElementsByClassName('sizes')[0]
			.children[INDEX_OF_640_LINK] // 640 option
			.children[0] // <a> element
			.href;

	// Check whether image is horizontal or vertical.
	var image = document.getElementsByClassName('main-photo')[0];
	var horizontal = image.width >= image.height;

	return {
		title: title,
		url: window.location.toString(),
		imageSrc: imageSrc,
		horizontal: horizontal
	};
};

// Listen for requests from the extension.
// Upon request, get photo details and respond.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse(getPhotoDetails());
});

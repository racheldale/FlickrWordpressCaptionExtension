// Author: Rachel Dale
// Javascript for popup of Flicr Wordpress extension.
// Used when the extension is clicked.


// Main entrypoint into extension.
document.addEventListener('DOMContentLoaded', function() {
  // Check if this is a valid flickr page.
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    var isFlickrPage = tabs[0].url.match('^.*://www.flickr.com/photos');
    toggleGenerate(isFlickrPage); 

    // Set click handler for generate button (this can't be done directly in the markup).
    if (isFlickrPage) {
      document.getElementById('generate').addEventListener('click', generate); 
    }
  });
});

/**
 * When user clicks the "Generate" button,
 * 1) Load content script onto the current Flickr tab
 * 2) Send the Flickr tab a message
 * 3) Process response from Flickr tab's content script.
 * @param {Event} e The click event. Ignored.
 */
function generate(e) {
  // Load the script into this tab.
  chrome.tabs.executeScript(null, {file: "flickr-processor.js"});

  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {type:"clicks" },
      function(response) {
        if (response) {
          onPhotoInfoReceived(response);
        }
      }
    );
  });
}


/**
 * Callback when photo information received from Flickr page.
 * Generates caption text, displays in extension popup. and selects that text.
 * @param {Object} photoInfo The photo information received fr
 */
var onPhotoInfoReceived = function(photoInfo) {
  // Create wordpress compatible snippet.
  var widthOrHeight = photoInfo.horizontal ? 'width' : 'height';
  var caption = '[caption align="aligncenter" ' + widthOrHeight + '="640"]' +
    '<a href="' + photoInfo.url + '">' +
      '<img class=" " title="' + photoInfo.title + '" src="' + photoInfo.imageSrc +
          '" alt="" ' + widthOrHeight + '="640"/>' +
    '</a>' + photoInfo.title + '[/caption]';

  // Display in the UI.
  document.getElementById('outer-result').removeAttribute('hidden');
  var result = document.getElementById('result');
  result.innerHTML = encodeHTML(caption);

  // Clear any selected text and select text the just-added result.
  var selection = window.getSelection();        
  var range = document.createRange();
  range.selectNodeContents(result);
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * @param {boolean} showGenerate True to show the "generate" section for when
 *    this is a Flickr page, False to hide that content and show the info message
 *    instead.
 */
var toggleGenerate = function(showGenerate) {
  var generateMain = document.getElementById('generate-content');
  var message = document.getElementById('invalid-msg');

  if (showGenerate) {
    generateMain.removeAttribute('hidden');
    message.setAttribute('hidden', '');
  } else {
    generateMain.setAttribute('hidden', '');
    message.removeAttribute('hidden');
  }
};

/**
 * Simple HTML encoder.
 * @param {string} stringToEncode
 * @return {string} The encoded string.
 */
var encodeHTML = function(stringToEncode) {
  return stringToEncode.replace(/&/g, '&amp;')
      .replace(/\</g, '&lt;')
      .replace(/\>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
};

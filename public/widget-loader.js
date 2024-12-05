(function (w, d, s, id) {
  console.log('🔄 Initializing chat widget loader');

  if (d.getElementById(id)) return;

  // Create container for widget
  var container = d.createElement('div');
  container.id = 'appraisily-chat-widget-container';
  d.body.appendChild(container);
  console.log('📦 Created widget container:', container.id);

  var js, fjs = d.getElementsByTagName(s)[0];
  js = d.createElement(s);
  js.id = id;
  js.async = true;
  js.src = window.location.origin + '/assets/widget.js';
  console.log('🔗 Loading widget from:', js.src);
  
  if (fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  }

  js.onload = function() {
    console.log('✅ Widget script loaded');
    if (w.AppraisilyChatWidget) {
      console.log('🚀 Initializing widget');
      w.AppraisilyChatWidget.init({
        position: 'bottom-right',
        primaryColor: '#007bff',
        containerId: 'appraisily-chat-widget-container'
      });
    } else {
      console.error('❌ Widget object not found on window');
    }
  };

  js.onerror = function(error) {
    console.error('❌ Failed to load widget script:', error);
  };
}(window, document, 'script', 'appraisily-chat-widget'));
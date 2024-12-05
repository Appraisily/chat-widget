(function (w, d, s, id) {
  if (d.getElementById(id)) return;

  // Create container for widget
  var container = d.createElement('div');
  container.id = 'appraisily-chat-widget-container';
  d.body.appendChild(container);

  var js, fjs = d.getElementsByTagName(s)[0];
  js = d.createElement(s);
  js.id = id;
  js.async = true;
  js.src = 'https://frolicking-macaron-54f908.netlify.app/assets/widget.iife.js';
  
  if (fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  }

  js.onload = function() {
    if (w.AppraisilyChatWidget) {
      w.AppraisilyChatWidget.init({
        position: 'bottom-right',
        primaryColor: '#007bff',
        containerId: 'appraisily-chat-widget-container'
      });
    }
  };
}(window, document, 'script', 'appraisily-chat-widget'));
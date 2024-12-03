(function (w, d, s, id) {
  if (d.getElementById(id)) return;

  var js, fjs = d.getElementsByTagName(s)[0];
  js = d.createElement(s);
  js.id = id;
  js.async = true;
  js.src = 'https://frolicking-macaron-54f908.netlify.app/widget.js';
  
  if (fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  }

  js.onload = function() {
    if (w.AppraisilyChatWidget) {
      w.AppraisilyChatWidget.init({
        position: 'bottom-right',
        primaryColor: '#007bff'
      });
    }
  };
}(window, document, 'script', 'appraisily-chat-widget'));
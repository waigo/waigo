var Pages = {
  cron: require('./pages/cron/index'),  
  emails: require('./pages/emails/index'),
  models: require('./pages/models/index'),
  routes: require('./pages/routes/index'),
};


var rootElem = document.getElementById('react-root');

if (rootElem) {
  var desiredPage = rootElem.dataset.page;

  if (desiredPage) {
    Pages[desiredPage].init(rootElem);
  }
}



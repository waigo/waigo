var Pages = {
  Cron: require('./pages/cron'),  
  Emails: require('./pages/emails'),
  Models: require('./pages/models'),
  Routes: require('./pages/routes'),
};


var rootElem = document.getElementById('react-root'),
  desiredPage = rootElem.dataset('page');


Pages[desiredPage].init(rootElem);


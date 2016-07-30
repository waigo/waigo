# Internal events

Different parts of your app back-end need to communicate with each other at 
times. Specifically, you may need to implement a publish-subscribe model whereby 
certain parts of your app are triggered by other parts. The [`App` object](../app_configuration/Appobject.md) is an [EventEmitter](https://nodejs.org/dist/latest-v4.x/docs/api/events.html#events_class_eventemitter) 
instance, and can be used to facilitate the sort of message passing we require.

For instance, let's say we have a notification system whereby we can notify 
site admins with a message. We want to be able to trigger a notification from 
any other part of our app at any time. 

Let's use the events system to first setup the internal notification endpoint:

```javascript
// file: <project folder>/src/support/startup/notification.js

module.exports = function*(App) {
  App.on('notify', function(msg) {
    App.logger.info(`Notify admins: ${msg}`);
    // Do notification here...
  });
};
```

In any of our controllers, forms or other back-end code we would now be able to 
send a notification quite simply:

```javascript
// file: <project folder>/src/controllers/someController.js

exports.main = function*() {
  this.App.emit('notify', 'this is a message');  
};
```

The benefit of such an approch over calling a notifications API directly is that 
we have de-coupled the notification code from the other parts of the app, meaning 
it's easier for us to change the notifications implementation without it 
affecting the code which actually triggers notifications.

An additional benefit is that automated testing is easier. If we wish to test 
that a notifiation is being triggered we can simply _listen_ to the `notify` event 
in our test code and verify that it gets called with the right parameters.





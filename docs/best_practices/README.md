# Best practices

Some best practices to adhere to when developing your Waigo app.

## Don't store global data inside the Node process

Waigo is designed to be scalable, meaning that you should be able to run multiple instances of your app on the same or different machines and achieve scalability, without causing problems for users.

A key requirement for the above is that you don't store any global or app-level data within the running process. This is because **you might not be able to control app instance serves which request.** A user may get served by instance 1 for a request, and then later get served by instance 2 for another request, depending on your load-balancing algorithm, etc. 

Thus it is important that any user-related data gets stored in a place where its accessible by all app instances. For example, if you need to store user session data put it into the database. And if you're using a database like RethinkDB then it will be easy to auto-notify every other app instance when the database gets updated.

The rule of thumb is: **Place all user data in a place where it's accessible by an instance of your app running on another machine.**

## Don't create unnecessary middleware plugins

The Waigo middleware system is very flexible and allows you to re-use existing middleware for Koa without much extra boilerplate code. 

Make full use of this, and avoid the temptation to create a full-on plugin (and thus NPM module) which just wraps an existing Koa middleware plugin. 

Unless of your course your module adds some significant logic that is worth re-using through a plugin.

By using the original Koa plugin as much as possible it will be easier to keep up-to-date with improvments to it without having to also update your wrapper plugin.

# Motivation

Back-end web Node.js frameworks can usually be split into two types:

* Light-weight middleware - [Express](http://expressjs.com/), [Koa](http://koajs.com/), etc
* Heavy-weight stack - [Meteor](http://meteor.com), [LoopBack](https://loopback.io/), etc

The former give you the basic building blocks of a web app, leaving you to build the higher layers yourself. These may include database access, user authentication, emailing systems, etc. These "boiler-plate" items are common to most web apps you would want to build.

Frameworks of the latter type usually come with the above boilerplate items already provided. This allows you to start building your specific application sooner. The downside is that such framework are opinionated about how you structure your app, causing you to sometimes hit a framework-imposed limit.

**Waigo** and frameworks of it's ilk attempt to bridge this disparity by providing you with the common boiler-plate building blocks of a web application out of the box, while still allowing you to structure your app as you see fit. 

The unique property Waigo brings to the table is that just about every bit of functionality in the core framework can be *cleanly* extended or overridden within your app.

Furthermore, what you build for one web app can easily be shared and re-used for another web app in the form a plugin (NPM module).

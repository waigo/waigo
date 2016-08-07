# Reactive updates

One of the main reasons for choosing RethinkDB as the default database for Waigo is that it supports _reactive_ updates. It is possible to run a query and then subscribe to the database to be notified whenever the result data for that query changes.

Thus it is possible for one instance of your application to create or an update entry within your database, causing another instance of your application to immediately be notified of this and thus able to take appropriate action.

Combined with a reactive front-end UI you can build a fully end-to-end (i.e. between two clients) reactive application with ease.

Let's consider a simple chat application. When one user enters a message we want to enter it into the database and instantly notify any other users who are in the chatroom so that they too see it.


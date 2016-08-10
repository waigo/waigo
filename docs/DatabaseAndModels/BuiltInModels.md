# Built-in models

Waigo provides a few built-in models (under `src/models`) to enable to you quickly get started building a fully-fledged application.

* `Acl` - Represents an entry in the Access-Control-List (ACL) table. The ACL provides an easy way for you to control access to any resource within your application based on user or role assigned to user.
* `User` - Represents a registered user, along with their authentication data (passwords, OAuth), profile info as well as their assigned roles.
* `Activity` - Represents an activity log entry. This is a simpler version of the [Activity Streams](http://activitystrea.ms/) format.
* `Cron` - Represents a Cron job and its run history. You will likely never need to use this model directly yourself.

All of the above models are of course optional, and you can extend/override them with your own. But if you do so remember to update the other parts of Waigo which depends upon them.
# How models work

Models are the `M` in the `MVC (Model-View-Controller)` paradigm. They are the interface between the database layer and the rest of your application. Instead of reading and writing raw data from/to the database from the various parts of your application, it makes sense to hide the raw data within model objects, for the following benefits:

*  *Controlled access* - you can control how data gets updated in your database by ensuring that creative and destructive operations are only executed from within the model.
*  *Encapsulation and reduced coupling* - you can hide the raw underlying data structure and provide convenient accessor methods for use by other parts of your application. You could even change the underlying database in future without the reset of your app code being affected.

## Loading models

In Waigo all defined models are loaded by the `models` startup step and made accessible via `App.models`. This step scans the `src/models` path (in your application, the Waigo framework and any plugins) and loads all the files within, assuming each one represents a different model.

The startup step takes each model's definition and constructs a `Thinodium.Model` (see [https://github.com/hiddentao/thinodium](Thinodium)) to represent it. The final object is accessible at `App.models.ModelName`, where `ModelName` is the capitalized version of the model's file name. Thus, if your model is defined in `src/models/user.js` then it will accessible at `App.models.User`.

This startup step assumes that the `database` startup step has already run and setup the default database connection (`App.db`).

## Data encapsulation

Let's say we have a database table/collection called `Users` and we have a `User` model which represents this table within our application. This is how we might add a new user:

```javascript
// file: <project folder>/src/controllers/user.js

exports.add = function*() {
  yield this.App.models.User.add('username@test.com', 'password');
};
```

Internally, the model may actually write JSON data to the database, or make a HTTP call to a remote datasource. It doesn't matter since the `add()` method that it exposes is all the rest of the application needs to know about and use.

## Rendering for views

Another benefit of using Model objects is that they can also control how the underlying data is rendered into views. The [view objects](../view_objects/) chapter has more information on this.


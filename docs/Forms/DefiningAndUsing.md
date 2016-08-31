# Defining and using forms

Forms are defined in the `<project folder>/src/forms` path. For example, in the Waigo framework code you will see the following forms:

```shell
<waigo framework>/src/forms
	login.js
	register.js
	forgotPassword.js
	resetPassword.js
```

The filename for a form is its unique id; The file contents specify the form's input fields and post-validation hooks. Let's take a look at a simplified version of the [default login form](https://github.com/waigo/waigo/blob/master/src/forms/login.js):

```js
"use strict";

module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address / Username',
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
    },
    {
      // where to take take user once logged-in
      name: 'postLoginUrl',
      type: 'hidden',
    },
  ],
  method: 'POST',
};
```

The above form has three fields named `email`, `password` and `postLoginUrl`. Three field types - `text`, `password`, `hidden` - are used. The `email` and `password` fields are mandatory.

The `method` key specifies the HTTP method used for submitting form. Technically speaking, when processing a form Waigo does not actually check to see if the incoming HTTP method matches this, so this key is really  only necessary if you intend to use it in your app.

Actually Waigo lets you add any keys you want to the form configuration object, thus allowing you to store arbitrary configuration data within your form specification.

## Initialising and rendering

Here is how you would render the above form:

```js
// file <project folder>/src/controllers/index.js

exports.getLoginForm = function*() {
  // create an instance of the form
  let form = yield this.form.create('login', {
    context: this
  });
  
  form.fields.postLoginUrl.value = this.request.query.page || '/';

  
  // render form to output
  yield this.render('index', {
    form: form
  });
};
```
*Note: `this.form` is a convenient accessor within controller methods. In non-controller code you can access the form interface using `App.form`.*

The above controller method will first attempt to load a form definition under the `login` name - internally this calls `waigo.load('forms/login')` - and create an instance of it. 

In our user login flow, we want to redirect the user to the login page from any other page, but then want them to return to that page once login is successful - hence why we set `postLoginUrl` based on a query parameter.

Finally the method will render the form to output. If we're using the [JSON output format](../RenderingOutput/JsonOutput.md) then it will look something like this:

```js
{
    "form": {
        "method": "POST",
        "id": "login",
        "fields": {
            "email": {
                "name": "email",
                "type": "text",
                "label": "Email address / Username",
                "required": true,
            },
            "password": {
                "name": "password",
                "type": "password",
                "label": "Password",
                "required": true,
            },
            "postLoginUrl": {
                "name": "postLoginUrl",
                "type": "hidden",
                "value": "/"
            },
            "__csrf": {
                "name": "__csrf",
                "label": "CSRF",
                "type": "hidden",
                "required": true,
                "value": "VyvughpJ-_iBznBk1kxlj4l_TnKqUA8Phg4Y"
            }
        },
        "order": ["email", "password", "postLoginUrl", "__csrf"]
    }
}
```

*Note: The additional `__csrf` field shown above is the CSRF-prevention field (see below) and is automatically generated and added to forms when they're initialised.*

The above output specifies the form fields, their types and even the field order (same as is defined in the form configuration shown earlier) as well as the form HTTP method.

The benefit of outputting the full form specification to the client is that the client could then dynamically construct a form UI to display to the user based on the field types and field order. This is more useful on sites with large numbers of forms which may need to be dynamically configured. If you only have one or two forms with few fields it's probably quicker to simply hard-code the client-side interface.

## Processing submissions

Once our form has been submitted the following controller method will process the submission:

```js
// file: <project folder>/src/controllers/index.js
...
exports.submitLoginForm = function*() {
  let form = yield this.form.create('login', {
    context: this
  });

  try {
    // process request body
    yield form.process();
    // all ok, so let's redirect to page
    yield this.redirect(form.fields.postLoginUrl.value || '/');
  } catch (err) {
    // if not a form validation error then show in logger
    if (!(err instanceof this.form.FormValidationError)) {
      this.logger.error(err.stack);
    }
    // return error to client
    yield this.render('user/login', {
      error: err,
      form: form,
    }, {
      status: 400
    });
  };  
};
```

The `form.process()` method will extract the submitted values from `this.request.body`, run any [sanitation](Sanitizer.md) and [validation](Validators.md) logic and process any [post-validation hooks](PostValidationHooks.md) configured. If an error gets thrown at any point then it will get caught as shown and handled appropriately. 

In the above method, once processing is complete we redirect the URL to the `postLoginUrl` if set. 

## Form errors

If form submission processing fails then a `FormValidationError` gets thrown. This error typically contains per-field error messages so that the client UI can show the user exactly which field was erroneous.

Here is example JSON output of such an error:

```js
{
  "error": {
    "type": "FormValidationError",
    "msg": "Please correct the errors in the form.",
    "details": {
        "password": ["Must be set"],
    },
  }
}
```

*Note: A `stack` key containing the error stack trace will also get sent to the client if the `app.config.errorHandler.showStack` flag is `true`.*

In the above error example it seems the `password` field was not set when the form was submitted. 


## Appendix: Notes on Cross-Site Request Forgery attacks

A [CSRF (Cross-Site Request Forgery)](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)) attack occurs when a form on a website gets submitted from another website different to the form's original. For example, if you have a sign up form on your website at *http://a.com* and I setup a form on *http://b.com* which has its `action` attribute set to *http://a.com* then any data entered into that form will get sent to *http://a.com*.

To prevent this a CSRF-prevention value can be calculated when a form is requested from a server. The server sends this value to the client during page load and keeps hold of this value internally. It then expects the value to be submitted alongside the other form fields whenever a submission is made by the client. Thus it's impossible for the form to be submitted from another website, since prior to every submission a CSRF value must first be obtained from the server.

In Waigo CSRF-prevention is automatically added to every form as long as the [csrf middleware](https://github.com/waigo/waigo/blob/master/src/support/middleware/csrf.js) is enabled, which it is by default.
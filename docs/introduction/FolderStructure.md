# Folder structure

Every Waigo app has the same basic folder structure:

```
<project>        # the root project folder
  /package.json  # app's package.json
  /public        # front-end built assets
  /src           # also known as the "app" folder
```

The app folder (`<project>/src`) contains all the source code and rendering templates for the Waigo application. The structure usually looks like the following:

```
/cli             # command-line interface command definitions
  /data          # internal data for CLI commands
/config          # app configuration
/controllers     # route handling controllers
/emails          # email templates
  /_layout       # layout template for all emails
/forms           # forms
/frontend        # front-end source assets
/models          # database models
/routes          # route configuration
/support         # framework support and utilities
  /cronTasks     # CRON jobs
  /db            # database adapters
  /forms         # form and field helpers
    /fields      # field types (text, select, etc)
    /sanitizers  # field value sanitizers
    /valdators   # field value validators
  /mailer        # emailing support
    /engines     # email engines
  /middleware    # middleware for Koa
  /notifications # notification mechanisms (Slack, etc)
  /oauth         # OAuth support
    /providers   # specific OAuth handlers (reddit, etc)
  /outputFormats # view rendering (html, json, etc)
  /session       # user session support
    /store       # session store adapters
  /shutdown      # app shutdown steps
  /startup       # app startup steps
/views           # general view templates
```

The remainder of this guide will go through every item shown above. You will have a good understanding of how all these parts come together to make a Waigo app work. You will also come to learn how easy it is to exclude, customize or override almost any of part for your specific app.

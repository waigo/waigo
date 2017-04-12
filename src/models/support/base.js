/**
 * @file
 * Base class for business models
 */

class BaseModel {
  /**
   * @constructor
   * @param  {Application} App The Waigo app.
   * @param  {Object} logger The logger.
   */
  constructor (App, logger) {
    this.App = App
    this.logger = logger
  }

  /**
   * Initialise this model.
   *
   * This is where underlying database models should be initialised, if
   * necessary.
   */
  *init () {
    /* Override in subclasses */
  }

  /**
   * Destroy this model.
   *
   * Shutdown any resources associated with this model, including database
   * models.
   */
  *destroy () {
    /* Override in subclasses */
  }
}

module.exports = BaseModel

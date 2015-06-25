module.exports = {
  setStateIfMounted: function(state) {
    if (this.isMounted()) {
      this.setState(state);
    }
  }
};

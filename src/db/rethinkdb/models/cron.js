exports.schema = {
  id: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
  lastRun: {
    type: {
      when: {
        type: Date,
        required: true,
      },
      by: {
        type: String,
        required: true,
      },
    },
    required: false,
  }
}

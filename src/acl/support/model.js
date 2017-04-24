export const schema = {
  schema: {
    resource: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['role', 'user'],
    },
    entity: {
      type: String,
      required: true,
    }
  }
}

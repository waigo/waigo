const UserSchema = {
  // unique id (if null then by the system)
  id: {
    type: String,
    required: false,
  },
  // friendly display name
  displayName: {
    type: String,
    required: true,
  }
}


// Based on https://tools.ietf.org/html/draft-snell-activitystreams-09
exports.schema = {
  // what
  verb: {
    type: String,
    required: true,
  },
  // when
  published: {
    type: Date,
    required: true,
  },
  // who
  actor: {
    type: UserSchema,
    required: true,
  },
  // additional details
  details: {
    type: Object,
    adminViewOptions: {
      hide: true,
    },
  },
}


exports.indexes = [
  {
    name: 'verb',
  },
  {
    name: 'published',
  },
  {
    name: 'actor',
    def: function (doc) {
      return doc('actor')('id')
    },
  },
]


exports.modelMethods = {
  exists: function *(verb, details) {
    const qry = {
      verb
    }

    if (details) {
      qry.details = details
    }

    return !!(this.wrapRaw(yield this.rawQry().filter(qry).run()).length)
  }
}

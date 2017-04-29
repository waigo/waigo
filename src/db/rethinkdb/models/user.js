const waigo = global.waigo,
  _ = waigo._


const ProfileSchema = {
  displayName: { type: String, required: true },
}


const EmailSchema = {
  email: { type: String, required: true },
  verified: { type: Boolean },
}


const AuthSchema = {
  type: { type: String, required: true },
  token: { type: String, required: true },
  data: { type: Object },
}



exports.schema = {
  username: {
    type: String,
    required: true,
  },
  profile: {
    type: ProfileSchema,
    required: true,
  },
  emails: {
    type: [EmailSchema],
    required: true,
    adminViewOptions: {
      viewSubKey: 'email'
    },
  },
  auth: {
    type: [AuthSchema],
    required: true,
    adminViewOptions: {
      viewSubKey: 'type'
    },
  },
  roles: {
    type: [String],
    required: false,
  },
  created: {
    type: Date,
    required: true,
  },
  lastLogin: {
    type: Date,
    required: false,
  },
}



exports.indexes = [
  {
    name: 'username',
  },
  {
    name: 'email',
    def: function (doc) {
      return doc('emails')('email')
    },
    options: {
      multi: true,
    },
  },
  {
    name: 'roles',
    options: {
      multi: true,
    },
  },
]



exports.modelMethods = {
  /**
   * Get user by username.
   * @return {User}
   */
  getByUsername: function *(username) {
    const ret = yield this.rawQry().filter(function (user) {
      return user('username').eq(username)
    }).run()

    return this.wrapRaw(_.get(ret, '0'))
  },
  /**
   * Get user by email address.
   * @return {User}
   */
  getByEmail: function *(email) {
    const r = this.db

    const ret = yield this.rawQry().filter(
      r.row('emails').contains(function (e) {
        return e('email').eq(email)
      })
    ).run()

    return this.wrapRaw(_.get(ret, '0'))
  },
  /**
   * Get user by email address or username.
   * @return {User}
   */
  getByEmailOrUsername: function *(str) {
    const ret = yield this.rawQry().filter(function (user) {
      return user('emails')('email')(0).eq(str).or(user('username').eq(str))
    }).run()

    return this.wrapRaw(_.get(ret, '0'))
  },
  /**
   * Get user by email address or username.
   * @return {User}
   */
  findWithIds: function *(ids) {
    let qry = this.rawQry()

    qry = qry.getAll.apply(qry, ids.concat([{index: 'id'}]))

    return this.wrapRaw(yield qry.run())
  },
  /**
   * Get whether any admin users exist.
   * @return {Number}
   */
  haveAdminUsers: function *() {
    const count = yield this.rawQry().count(function (user) {
      return user('roles').contains('admin')
    }).run()

    return count > 0
  },
  getUsersCreatedSince: function *(date) {
    const ret = yield this.rawQry().filter(function (doc) {
      return doc('created').ge(date)
    }).run()

    return this.wrapRaw(ret)
  },
}

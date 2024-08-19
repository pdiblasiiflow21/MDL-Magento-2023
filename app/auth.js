module.exports.authGuard = function (req, res, next) {
  if (req.session.loggedIn) {
    return next()
  } else {
    const err = new Error('Not authorized!')
    err.status = 403
    return res.redirect('/login')
  }
}

module.exports.notificationsGuard = function (req, res, next) {
  // Restricted to lyracons IP
  // if (LyraconsIP) {
  return next()
  // } else {
  //     let err = new Error('Not authorized!')
  //     err.status = 403
  //     return next(err)
  // }
}

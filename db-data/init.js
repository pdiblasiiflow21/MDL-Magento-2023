let newDb = db.getSiblingDB('iflowdb') // eslint-disable-line
newDb.createUser(
  {
    user: 'iflowdbuser',
    pwd: 'iflowdbpass',
    roles: [{ role: 'readWrite', db: 'iflowdb' }]
  }
)
newDb = db.getSiblingDB('iflowdbtesting') // eslint-disable-line
newDb.createUser(
  {
    user: 'iflowdbuser',
    pwd: 'iflowdbpass',
    roles: [{ role: 'readWrite', db: 'iflowdbtesting' }]
  }
)

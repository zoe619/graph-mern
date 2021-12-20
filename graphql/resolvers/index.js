const authResolver = require('./auth');
const bookingResolver = require('./booking');
const eventResolver = require('./events');

const resolvers = {
    ...authResolver,
    ...bookingResolver,
    ...eventResolver
}

module.exports = resolvers;
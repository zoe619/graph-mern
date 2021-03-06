const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const buildSchema = require('./graphql/schemas/index');
const resolvers = require('./graphql/resolvers/index');
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
    schema: buildSchema,
    rootValue: resolvers,
    graphiql: true
}))

mongoose.connect(`
mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}
@cluster0.hsoin.mongodb.net/${process.env.MONGO_DB}?
retryWrites=true&w=majority`)
    .then(() => {
        app.listen(5000);
        console.log('server started')
    }).catch(err => {
        console.log(err)
    })
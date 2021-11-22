const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const Event = require('./models/events');
const User = require('./models/users');

const events = [];


app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`

       type Event{
           _id: ID!
           title: String!
           description: String!
           price: Float!
           date: String!
           creator: User!
       }

       type User{
           _id: ID!
           email: String!
           password: String
           createdEvents: [Event!]
       }

       input UserInput{
           email: String!
           password: String!
       }

       input EventInput{
           title: String!
           description: String!
           price: String!
           date: String!
       }
       type RootQuery {
           events: [Event!]!
       }
       type RootMutation{
           createEvent(eventInput: EventInput):Event
           createUser(userInput:UserInput):User
       }
       schema {
           query: RootQuery
           mutation: RootMutation
       }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .populate('creator')
                .then(events => {
                    return events.map(event => {
                        return {...event._doc };
                    });
                })
                .catch(err => {
                    throw err
                })
        },
        createEvent: (args) => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '61957b1d937e9923841d3fe6'
            })
            let createdEvent;
            return event.
            save().
            then(result => {
                    createdEvent = {...result._doc };
                    return User.findById('61957b1d937e9923841d3fe6');

                }).then(user => {
                    if (!user) {
                        throw new Error('User not found')
                    }
                    user.createdEvents.push(event)
                    return user.save()

                }).then(result => {
                    console.log(result);
                    return createdEvent;
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });

        },
        eventsUser: () => {
            return User.find()
                .then(users => {
                    return users.map(user => {
                        return {...user._doc };
                    })
                })
        },
        createUser: (args) => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                    if (user) {
                        throw new Error('User exists already')
                    }
                    return bcrypt.hash(args.userInput.password, 12);
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    })
                    return user.save();
                }).then(result => {
                    return {...result._doc, password: null };
                })
                .catch(err => {
                    throw err;
                })

        }
    },
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
const Event = require('../../models/events');
const User = require('../../models/users');
const bcrypt = require('bcryptjs');

const event = async eventIds => {
    try {
        const event = await Event.find({ _id: { $in: eventIds } })
        events.map(event => {
            return {
                ...event._doc,
                id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        })
    } catch (err) {
        throw err
    }
}
const user = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                _id: user.id,
                createdEvents: event.bind(this, user._doc.createdEvents)
            }
        })
        .catch(err => {
            throw err;
        })
}

module.exports = {
    events: () => {
        return Event.find()
            .then(events => {
                return events.map(event => {
                    return {
                        ...event._doc,
                        _id: event.id,
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    };
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
                createdEvent = {
                    ...result._doc,
                    _id: result._doc.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, result._doc.creator)
                };
                return User.findById('61957b1d937e9923841d3fe6');

            }).then(user => {
                if (!user) {
                    throw new Error('User not found')
                }
                user.createdEvents.push(event)
                return user.save()

            }).then(result => {

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

}
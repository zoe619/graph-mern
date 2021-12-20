const Booking = require('../../models/bookings');
const { user, singleEvent } = require('./merge');
const Event = require('../../models/events');

module.exports = {
    bookings: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('UnAuthorized User');
        }
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                }
            });
        } catch (err) {
            throw err
        }
    },
    bookEvent: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('UnAuthorized User');
        }
        const fetchedEvent = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: req.userId,
            event: fetchedEvent
        })
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result._id,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    },
    cancelBooking: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('UnAuthorized User');
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {
                ...booking.event._doc,
                _id: booking.event.id,
                creator: user.bind(this, booking.event._doc.creator)
            }
            await Booking.deleteOne({ _id: args.bookingId })
            return event;
        } catch (err) {
            throw err
        }
    }

}
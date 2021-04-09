const mongoose = require('mongoose')


mongoose.connect(process.env.MONGOOSE_CONNECT_KEY, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = require("../core/db");
const Machine = db.model("Machine", new db.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    //Status can have the following values: "active", "inactive"
    status: {
        type: String,
        required: true
    },
    apiKey:{
        type: String,
        required: true
    },
    sessionCode: {
        type: String,
        required: false
    },
    expiresAt: {
        type: Date,
        required: false
    },
    user: {
        type: db.Schema.Types.ObjectId,
        ref: "User"
    }
}));
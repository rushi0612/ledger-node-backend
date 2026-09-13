const mongoose = required("mongoose")

const accountScema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Type.ObjectId,
        ref:"user",
        required : [true, "Account must belong to a user" ],
        index: true
    },
    status :{
        enum:{
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status must be either ACTIVE, FROZEN or CLOSED"
        }
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    }
}, {
   timestamps: true   
})

accountSchema.index({ user: 1, currency: 1 });

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
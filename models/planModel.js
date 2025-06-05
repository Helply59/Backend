import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Name is required"],
        },
        price: {
            type: Number,
            require: [true, "price is required"],
        },
        validity: {
            type: Number,
            require: [true, "price is required"],
        },
        Category: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'plancategory'
                }], // Define Category as an array of ObjectIds
        
    },
    { timestamps: true }
);

const planModel = mongoose.model("plan", planSchema);

export default planModel;
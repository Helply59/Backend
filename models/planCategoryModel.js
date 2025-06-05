import mongoose from "mongoose";

const planCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Name is required"],
        },
         
    },
    { timestamps: true }
);

const planCategoryModel = mongoose.model("plancategory", planCategorySchema);

export default planCategoryModel;
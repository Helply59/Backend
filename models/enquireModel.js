import mongoose from "mongoose";

const enquireSchema = mongoose.Schema({
  fullname: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  qty: {
    type: Number,
  },
  service: {
    type: String,
  },
  type: {
    type: Number,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  },
  requirement : {
    type: String,
  },
},
  { timestamps: true }
);

const enquireModel = mongoose.model('enquire', enquireSchema);

export default enquireModel;
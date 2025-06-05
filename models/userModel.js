import mongoose from "mongoose";
import bcrypt from "bcrypt";
 
const userSchema = mongoose.Schema({
  username: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "phone is required"],
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null values to be considered unique
  },
  password: {
    type: String,
  },
  type: {
    type: Number,
  },
  token: {
    type: String,
  },
  pincode: {
    type: String,
  },
  state: {
    type: String,
  }, statename: {
    type: String,
  }, city: {
    type: String,
  },
  address: {
    type: String,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  status: {
    type: String,
    default: 1
  },
  verified: {
    type: Number,
    default: 0
  },
   wallet: {
    type: Number,
    default: 0
  },
  profile: {
    type: String,
    default: "",
  },
  profile: {
    type: String,
    default: "",
  },

  about: {
    type: String,
    default: "",
  },
  Doc1: {
    type: String,
    default: "",
  },
  Doc2: {
    type: String,
    default: "",
  },
  Doc3: {
    type: String,
    default: "",
  },
  department: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the User model for the sender
  }],
  pHealthHistory: {
    type: String,
    default: "",
  },
  cHealthStatus: {
    type: String,
    default: "",
  },
  aadharno: {
    type: String,
  },
  DOB: {
    type: Date,
  },
 coverage: {
  type: [String],
    default: [],
  },
  longitude: {
    type: String,
  },
  latitude: {
    type: String,
  },
},
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

// Check if data exists, if not, create a new document with default values
const checkOrCreateDefaultData = async () => {
  try {
    const result = await userModel.findOne({ type: 0 });
    if (!result) {
      const hashedPassword = await bcrypt.hash("admin@987", 10);
      const admin = new userModel({
        username: "Administrator",
        email: "admin@gmail.com",
        phone: "9876543210",
        password: hashedPassword,
        token: hashedPassword,
        type: "0",
      });
      await admin.save();
      console.log("Admin created successfully.");
    }
  } catch (error) {
    console.error("Error checking or creating admin:", error);
  }
};

checkOrCreateDefaultData();

export default userModel;
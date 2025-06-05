import mongoose from "mongoose";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";
import categoryModel from "../models/categoryModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import attributeModel from "../models/attributeModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import homeModel from "../models/homeModel.js";
import homeLayoutModel from "../models/homeLayoutModel.js";
import ratingModel from "../models/ratingModel.js";
import wishlistModel from "../models/wishlistModel.js";
import compareModel from "../models/compareModel.js";
import zonesModel from "../models/zonesModel.js";
import promoModel from "../models/promoModel.js";
import taxModel from "../models/taxModel.js";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { createServer } from "http";
import querystring from "querystring";
import https from "https";
import CryptoJS from "crypto-js"; // Import the crypto module
import axios from "axios";
import { cpSync } from "fs";
import enquireModel from "../models/enquireModel.js";
import planModel from "../models/planModel.js";
import planCategoryModel from "../models/planCategoryModel.js";
import buyPlanModel from "../models/buyPlanModel.js";
import departmentsModel from "../models/departmentsModel.js";
import { type } from "os";
import paymentModel from "../models/paymentModel.js";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { exec } from "child_process";
import util from "util";
import crypto from "crypto";  // Ensure you require the crypto module if you haven't

const execPromise = util.promisify(exec);

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder where uploaded images will be saved
    cb(null, "public/uploads/new");
  },
  filename: function (req, file, cb) {
    // Define the filename for the uploaded image
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });


// Function to pad the plaintext
function pkcs5_pad(text, blocksize) {
  const padding = blocksize - (text.length % blocksize);
  for (let i = 0; i < padding; i++) {
    text += String.fromCharCode(padding);
  }
  return text;
}

// Function to encrypt plaintext
function encrypt(plainText, key) {
  // Convert key to MD5 and then to binary
  const secretKey = CryptoJS.enc.Hex.parse(
    CryptoJS.MD5(key).toString(CryptoJS.enc.Hex)
  );
  // Initialize the initialization vector
  const initVector = CryptoJS.enc.Utf8.parse(
    Array(16)
      .fill(0)
      .map((_, i) => String.fromCharCode(i))
      .join("")
  );
  // Pad the plaintext
  const plainPad = pkcs5_pad(plainText, 16);
  // Encrypt using AES-128 in CBC mode
  const encryptedText = CryptoJS.AES.encrypt(plainPad, secretKey, {
    iv: initVector,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
  });
  // Convert the ciphertext to hexadecimal
  return encryptedText.ciphertext.toString(CryptoJS.enc.Hex);
}

// Function to decrypt ciphertext
function decrypt(encryptedText, key) {
  // Convert key to MD5 and then to binary
  const secretKey = CryptoJS.enc.Hex.parse(
    CryptoJS.MD5(key).toString(CryptoJS.enc.Hex)
  );
  // Initialize the initialization vector
  const initVector = CryptoJS.enc.Utf8.parse(
    Array(16)
      .fill(0)
      .map((_, i) => String.fromCharCode(i))
      .join("")
  );
  // Convert the encryptedText from hexadecimal to binary
  const encryptedData = CryptoJS.enc.Hex.parse(encryptedText);
  // Decrypt using AES-128 in CBC mode
  const decryptedText = CryptoJS.AES.decrypt(
    { ciphertext: encryptedData },
    secretKey,
    { iv: initVector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
  );
  // Remove PKCS#5 padding
  return decryptedText
    .toString(CryptoJS.enc.Utf8)
    .replace(/[\x00-\x1F\x80-\xFF]+$/g, "");
}

function decryptURL(encryptedText, key) {
  const keyHex = CryptoJS.enc.Hex.parse(md5(key));
  const initVector = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
  const encryptedHex = CryptoJS.enc.Hex.parse(encryptedText);
  const decryptedText = CryptoJS.AES.decrypt(
    { ciphertext: encryptedHex },
    keyHex,
    { iv: initVector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
  );
  return decryptedText.toString(CryptoJS.enc.Utf8);
}

const secretKey = process.env.SECRET_KEY;

// export const SignupUser = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Validation
//     if (!username || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please fill all fields',
//       });
//     }

//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(401).json({
//         success: false,
//         message: 'User Already Exists',
//       });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = new userModel({ username, email, password: hashedPassword });
//     const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
//     user.token = token; // Update the user's token field with the generated token
//     await user.save();

//     // Generate JWT token

//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       user,
//       token,
//     });
//   } catch (error) {
//     console.error('Error on signup:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error on signup',
//       error: error.message,
//     });
//   }
// }

export const SignupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new userModel({ username, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    user.token = token; // Update the user's token field with the generated token
    user.type = 2; // Update the user's token field with the generated token

    await user.save();

    // Generate JWT token

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const postman = async (req, res) => {
  const order_id = req.params.id; // Extracting order ID from params
  const merchantJsonData = {
    order_no: order_id,
  };
  const accessCode = process.env.ACCESS_CODE;
  const workingKey = process.env.WORKING_KEY;
  const merchantData = JSON.stringify(merchantJsonData);
  const encryptedData = encrypt(merchantData, workingKey);

  try {
    const response = await axios.post(
      `https://apitest.ccavenue.com/apis/servlet/DoWebTrans?enc_request=${encryptedData}&access_code=${accessCode}&request_type=JSON&response_type=JSON&command=orderStatusTracker&version=1.2`
    );

    const encResponse = response.data.split("&")[1].split("=")[1];

    const finalstatus = encResponse.replace(/\s/g, "").toString();
    console.log("`" + finalstatus + "`");
    const newStatus = await decrypt(finalstatus, workingKey);

    // Clean the string from unwanted characters
    const cleanedData = cleanDataString(newStatus);

    // Construct an object from the cleaned data string
    const newData = constructObjectFromDataString(cleanedData);

    let paymentStatus;
    let OrderStatus;

    if (newData.order_status === "Awaited") {
      paymentStatus = 2;
      OrderStatus = "1";
    }
    if (newData.order_status === "Shipped") {
      paymentStatus = 1;
      OrderStatus = "1";
    }
    if (
      newData.order_status === "Aborted" ||
      newData.order_status === undefined
    ) {
      paymentStatus = 0;
      OrderStatus = "0";
    }
    if (newData.order_status === "Initiated") {
      paymentStatus = 0;
      OrderStatus = "0";
    }

    console.log(paymentStatus, OrderStatus);

    let updateFields = {
      payment: paymentStatus,
      status: OrderStatus,
    };

    await orderModel.findOneAndUpdate(
      { orderId: req.params.id }, // Find by orderId
      updateFields,
      { new: true } // To return the updated document
    );

    res.status(200).json({
      success: true,
      message: "Response received successfully",
      data: newData, // Sending the JSON data back to the client
      key: workingKey,
    });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while processing the request",
      error: error.message, // Sending the error message back to the client
    });
  }
};

function cleanDataString(dataString) {
  // Remove backslashes and other unwanted characters
  return dataString.replace(/\\/g, "").replace(/\u000F/g, "");
}

function constructObjectFromDataString(dataString) {
  const pairs = dataString.split('","').map((pair) => pair.split('":"'));
  const dataObject = {};
  for (const [key, value] of pairs) {
    dataObject[key] = value;
  }
  return dataObject;
}

export const Userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "email is not registerd",
        user,
      });
    }
    // password check

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        user,
      });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });

    return res.status(200).send({
      success: true,
      message: "login sucesssfully",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      sucesss: false,
      error,
    });
  }
};


export const SignupUserType = async (req, res) => {
  try {
    const {
      type,
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      coverage
    } = req.body;


    // const {
    //   profile,

    //   AadhaarFront,
    //   AadhaarBack,
    // } = req.files;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate the auto-increment ID
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId;

    if (lastUser) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastUserId = parseInt(lastUser.userId || 1);
      userId = lastUserId + 1;
    } else {
      userId = 1;
    }

    const newUser = new userModel({
      type,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      coverage,
      userId,
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup ${error}`,
      success: false,
      error,
    });
  }
};



export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, pincode, country, address, token } = req.body;
    console.log(phone, pincode, country, address, token);
    const user = await userModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).json({
      message: "user Updated!",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating user: ${error}`,
      success: false,
      error,
    });
  }
};

 
export const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).lean();
    if (!blogs) {
      return res.status(200).send({
        message: "NO Blogs Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Blogs List ",
      BlogCount: blogs.length,
      success: true,
      blogs,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Blogs ${error}`,
      success: false,
      error,
    });
  }
};

export const createBlogController = async (req, res) => {
  try {
    const { title, description, image, user } = req.body;
    //validation
    if (!title || !description || !image || !user) {
      return res.status(400).send({
        success: false,
        message: "Please Provide ALl Fields",
      });
    }
    const exisitingUser = await userModel.findById(user);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "unable to find user",
      });
    }

    const newBlog = new blogModel({ title, description, image, user });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({ session });
    exisitingUser.blogs.push(newBlog);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newBlog.save();
    return res.status(201).send({
      success: true,
      message: "Blog Created!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting blog",
      error,
    });
  }
};

export const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const blog = await blogModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).json({
      message: "Blog Updated!",
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Blog: ${error}`,
      success: false,
      error,
    });
  }
};

export const getBlogIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findOne({slug:id});
    if (!blog) {
      return res.status(200).send({
        message: "Blog Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Blog!",
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Blog: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      // .findOneAndDelete(req.params.id)
      .findByIdAndDelete(req.params.id)
      .populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
    return res.status(200).send({
      success: true,
      message: "Blog Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};
export const userBlogsController = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate("blogs");
    if (!userBlog) {
      return res.status(200).send({
        message: "Blog Not Found By user",
        success: false,
      });
    }
    return res.status(200).json({
      message: " user Blog!",
      success: true,
      userBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};


export const userTokenController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findOne({ token: id });

    if (!user) {
      return res.status(200).send({
        message: "Token expire",
        success: false,
      });
    }
    return res.status(200).send({
      message: "token Found",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Token Not Authorise",
      error,
    });
  }
};

export const CreateChatController = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    if (chat) return res.status(200).json(chat);
    const newChat = new chatModel({
      members: [firstId, secondId],
    });
    const response = await newChat.save();
    res.status(200).send({
      message: "Chat Added",
      success: true,
      response,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Chat Not Upload",
      error,
    });
  }
};

export const findUserschatController = async (req, res) => {
  const userId = req.params.id;

  try {
    const chats = await chatModel.find({
      members: { $in: [userId] },
    });
    return res.status(200).send({
      message: "Chat Added",
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "User chat Not Found",
      error,
    });
  }
};

export const findchatController = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chats = await chatModel.find({
      members: { $all: [firstId, secondId] },
    });
    res.status(200).send({
      message: "Chat Added",
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "User chat Not Found",
      error,
    });
  }
};

export const UsergetAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find(
      { status: "true" },
      "_id title slug"
    );

    if (!categories) {
      return res.status(200).send({
        message: "NO Category Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Category List ",
      catCount: categories.length,
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while All Categories ${error}`,
      success: false,
      error,
    });
  }
};

export const UsergetAllProducts = async (req, res) => {
  try {
    const products = await productModel.find(
      { status: "true" },
      "_id title slug"
    );

    if (!products) {
      return res.status(200).send({
        message: "NO products Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All products List ",
      proCount: products.length,
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while All products ${error}`,
      success: false,
      error,
    });
  }
};

export const UsergetAllHomeProducts = async (req, res) => {
  try {
    const products = await productModel.find(
      {},
      "_id title pImage regularPrice salePrice stock slug variant_products variations images"
    );

    if (!products) {
      return res.status(200).send({
        message: "NO products Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All products List ",
      proCount: products.length,
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while All products ${error}`,
      success: false,
      error,
    });
  }
};

export const getAllAttributeUser = async (req, res) => {
  try {
    const Attribute = await attributeModel.find({});
    if (!Attribute) {
      return res.status(200).send({
        message: "NO Attribute Found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Attribute List ",
      AttributeCount: Attribute.length,
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting attribute ${error}`,
      success: false,
      error,
    });
  }
};

export const getProductIdUser = async (req, res) => {
  try {
    const { id } = req.params;
    const Product = await productModel.findById(id);
    if (!Product) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};

// get home data

export const getHomeData = async (req, res) => {
  try {
    const homeData = await homeModel.findOne();

    if (!homeData) {
      return res.status(200).send({
        message: "Home Settings Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Found home settings!",
      success: true,
      homeData,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting home settings: ${error}`,
      success: false,
      error,
    });
  }
};

// get home layout data

export const getHomeLayoutData = async (req, res) => {
  try {
    const homeLayout = await homeLayoutModel.findOne();

    if (!homeLayout) {
      return res.status(200).send({
        message: "Home Layout Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Found home Layout Data!",
      success: true,
      homeLayout,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting home Layout: ${error}`,
      success: false,
      error,
    });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const { items, status, mode, details, totalAmount, userId } = req.body;
    //validation
    if (!status || !mode || !details || !totalAmount) {
      return res.status(400).send({
        success: false,
        message: "Please Provide ALl Fields",
      });
    }
    const exisitingUser = await userModel.findById(userId);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "unable to find user",
      });
    }

    const newOrder = new orderModel({
      items,
      status,
      mode,
      details,
      totalAmount,
    });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newOrder.save({ session });
    exisitingUser.orders.push(newOrder);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newOrder.save();
    return res.status(201).send({
      success: true,
      message: "Order Sucessfully!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting Order",
      error,
    });
  }
};

export const updateUserAndCreateOrderController = async (req, res) => {
  let session;
  let transactionInProgress = false;

  const { id } = req.params;
  const {
    username,
    email,
    state,
    phone,
    address,
    pincode,
    details,
    discount,
    items,
    mode,
    payment,
    primary,
    shipping,
    status,
    totalAmount,
    userId,
    verified,
  } = req.body;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    transactionInProgress = true;

    // Update user
    const user = await userModel.findByIdAndUpdate(
      id,
      { username, email, pincode, address, state, verified },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create order for the updated user
    if (!status || !mode || !details || !totalAmount || !userId || !payment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields for the order",
      });
    }

    // Calculate the auto-increment ID

    // Calculate the auto-increment ID
    const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
    let order_id;

    if (lastOrder) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastOrderId = parseInt(lastOrder.orderId);
      order_id = lastOrderId + 1;
    } else {
      order_id = 1;
    }

    // Create new order
    const newOrder = new orderModel({
      details,
      discount,
      items,
      mode,
      payment: 0,
      primary,
      shipping,
      status,
      totalAmount,
      userId,
      orderId: order_id,
    });

    await newOrder.save({ session });

    // Update user's orders
    user.orders.push(newOrder);
    await user.save({ session });

    // Update stock quantity for each product in the order
    for (const item of items) {
      const product = await productModel.findById(item.id);
      if (product) {
        product.stock -= item.quantity; // Decrement stock by the quantity ordered
        await product.save({ session });
      }
    }

    // Commit transaction
    await session.commitTransaction();
    transactionInProgress = false;

    if (mode === "COD") {
      // Send order confirmation email
      await sendOrderConfirmationEmail(email, username, userId, newOrder);
      const norder_id = newOrder.orderId;

      // block
      //  await sendOrderOTP(phone, norder_id);

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        newOrder,
        user,
        Amount: totalAmount,
        online: false,
      });
    } else {
      const tid = Math.floor(Math.random() * 1000000); // Generating random transaction ID
      const order_id = newOrder.orderId; // Generating order ID
      const accessCode = process.env.ACCESS_CODE;
      const merchant_id = process.env.MERCHANT_ID;
      const WORKING_KEY = process.env.WORKING_KEY;
      const redirect_url = process.env.REDIRECT_URL;
      const cancel_url = process.env.CANCEL_URL;

      return res.status(201).json({
        success: true,
        online: true,
        tid,
        order_id,
        accessCode,
        merchant_id,
        WORKING_KEY,
        cancel_url,
        redirect_url,
      });
    }
  } catch (error) {
    if (transactionInProgress) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }
    console.error("Error:", error);
    return res.status(400).json({
      success: false,
      message: "Error while creating order",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const PaymentRequest = async (req, res) => {
  try {
    const tid = Math.floor(Math.random() * 1000000); // Generating random transaction ID
    const order_id = Math.floor(Math.random() * 1000000); // Generating random order ID
    const accessCode = process.env.ACCESS_CODE;
    const merchant_id = process.env.MERCHANT_ID;
    const WORKING_KEY = process.env.WORKING_KEY;
    const redirect_url = process.env.REDIRECT_URL;
    const cancel_url = process.env.CANCEL_URL;
    // Send the data as JSON response
    res.json({
      tid,
      order_id,
      accessCode,
      merchant_id,
      WORKING_KEY,
      cancel_url,
      redirect_url,
    });
  } catch (error) {
    console.error("Error generating payment data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const PaymentResponse = async (req, res) => {
  console.log("req.body.encResp", req.body.encResp);
  const decryptdata = decrypt(req.body.encResp, process.env.WORKING_KEY);
  console.log("decryptdata", decryptdata);

  // Split the decrypted data into key-value pairs
  const keyValuePairs = decryptdata.split("&");

  // Create an object to store the key-value pairs
  const data = {};
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    data[key] = value;
  });

  // Extract order_id and order_status
  const orderId = data["order_id"];
  const orderStatus = data["order_status"];
  const orderAmt = Math.floor(data["amount"]);

  console.log("Order ID:", orderId);
  console.log("Order Status:", orderStatus);

  const order = await orderModel.findOne({ orderId }).populate("userId");

  const ordertotal = order.totalAmount;

  console.log("fetch data", data);
  console.log("fetch amt", orderAmt);
  console.log("order amt", ordertotal);

  if (!order) {
    console.log("order not found");
  } else {
    const user = order.userId[0]; // Assuming there's only one user associated with the order

    // Accessing user ID, username, and email
    const userId = user._id; // User ID
    const username = user.username;
    const email = user.email;
    const phone = user.phone;

    if (orderStatus === "Success" && orderAmt === ordertotal) {
      // Update payment details
      order.payment = 1;
      order.status = "1";
      // // Send order confirmation email
      await sendOrderConfirmationEmail(email, username, userId, order);

      // block
      console.log(otp);
      //   await sendOrderOTP(phone, order._id);
    } else {
      // Update payment details
      order.payment = 0;
      order.status = "0";
    }

    // Save the order details
    await order.save();
  }

  if (orderStatus === "Success") {
    // Redirect after saving data
    res.redirect(process.env.COMPLETE_STATUS);
  } else {
    res.redirect(process.env.CANCEL_STATUS);
  }
};

async function sendOrderConfirmationEmail(email, username, userId, newOrder) {
  try {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      },
    });

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: email, // Update with your email address
      cc: process.env.MAIL_FROM_ADDRESS,
      subject: "www.cayroshop.com Order Confirmation",

      //   html: `

      //   <div class="bg-light w-100 h-100" style="background-color:#f8f9fa!important;width: 90%;font-family:sans-serif;padding:20px;border-radius:10px;padding: 100px 0px;margin: auto;">
      //   <div class="modal d-block" style="
      //      width: 500px;
      //      background: white;
      //      padding: 20px;
      //      margin: auto;
      //      border: 2px solid #8080802e;
      //      border-radius: 10px;
      //  ">
      //    <div class="modal-dialog">
      //      <div class="modal-content" style="
      //      text-align: center;
      //  ">
      //        <div class="modal-header">
      //  <h1 style="color:black;"> cayroshop <h1>
      //        </div>
      //        <div class="modal-body text-center">
      //          <h5 style="
      //      margin: 0px;
      //      margin-top: 14px;
      //      font-size: 20px;color:black;
      //  "> Order Id : #${newOrder.orderId} </h5>
      //         <p style="color:black;" >Hey ${username},</p>
      //        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#47ca00" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      //         <h2 style="color:black;"> Your Order Is Confirmed! </h2>

      //         <p style="color:black;" > We'll send you a shipping confirmation email
      //  as soon as your order ships. </p>
      //        </div>
      //        <div class="modal-footer">

      //        <a href="https://cayroshop.com/account/order/${userId}/${newOrder._id}"  style="
      //      background: green;
      //      color: white;
      //      padding: 10px;
      //      display: block;
      //      margin: auto;
      //      border-radius: 6px;
      //      text-decoration: none;
      //  "> Track Order</a>
      //        </div>
      //      </div>
      //    </div>
      //  </div> </div>
      //   `

      html: `  <table style="margin:50px auto 10px;background-color:white;border: 2px solid #858585;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);     font-family: sans-serif; border-top: solid 10px #ff8800;">
    <thead>
      <tr> 
      <th style="text-align:left;"> 
      <img width="200" src="https://backend-9mwl.onrender.com/uploads/new/image-1712823999415.png" />
 </th>
        <th style="text-align:right;font-weight:400;"> ${new Date(
        newOrder.createdAt
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="height:35px;"></td>
      </tr>
      <tr>
        <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
          <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b style="color:green;font-weight:normal;margin:0">Placed</b></p>
          <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${newOrder.orderId
        }</p>
          <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${newOrder.totalAmount
        }</p>
          <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Payment Mode</span> ${newOrder.mode
        }</p>
        </td>
      </tr>
      <tr>
        <td style="height:35px;"></td>
      </tr>
      <tr>
        <td  style="width:50%;padding:20px;vertical-align:top">
          <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px">Name</span> ${newOrder.details[0].username
        } </p>
          <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Email</span>  ${newOrder.details[0].email
        }  </p>
      
          
        </td>
        <td style="width:50%;padding:20px;vertical-align:top">
            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Phone</span> +91-${newOrder.details[0].phone
        }</p>
          <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Address</span> ${newOrder.details[0].address
        } </p>
           
          
        </td>
      </tr>
      
      <tr>
<td colspan="2" > 

<table class="table table-borderless" style="border-collapse: collapse; width: 100%;">
    <tbody>
    <tr>
        <td  style="padding: 10px;font-weight:bold;">Items</td>
        <td   style="padding: 10px;font-weight:bold;">GST</td>

        <td   style="padding: 10px;font-weight:bold;">Quantity</td>
             <td  style="padding: 10px;text-align:right;font-weight:bold;">Price</td>
      </tr>

      ${newOrder.items
          .map(
            (Pro) => `
        <tr>
          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;" >
            <div className="d-flex mb-2">
              <div className="flex-shrink-0">
                <img
                  src="${Pro.image}"
                  alt=""
                  width="35"
                  className="img-fluid"
                />
              </div>
              <div className="flex-lg-grow-1 ms-3">
                <h6 className="small mb-0">
                  <a href="https://cayroshop.com/product/${Pro.id}" style="font-size:10px;">
                    ${Pro.title}  
                  </a>
                </h6>

              </div>
            </div>
          </td>
          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;"> ${Pro.gst}% </td>

          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;"> ${Pro.quantity} </td>

          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;" >₹ ${Pro.price}</td>
        </tr>
        `
          )
          .join("")}

    </tbody>
    <tfoot>
        <tr>
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">Subtotal</td>
            <td  colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${newOrder.items.reduce(
            (total, item) => total + item.quantity * item.price,
            0
          ) -
        Math.floor(
          newOrder.items.reduce((acc, item) => {
            const itemPrice = item.quantity * item.price;
            const itemGST = (itemPrice * item.gst) / 100;
            return acc + itemGST;
          }, 0)
        )
        }</td>
        </tr>

       
      
        <tr>
        <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">GST </td>
        <td colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${Math.floor(
          newOrder.items.reduce((acc, item) => {
            const itemPrice = item.quantity * item.price;
            const itemGST = (itemPrice * item.gst) / 100;
            return acc + itemGST;
          }, 0)
        )}</td>
    </tr>

        <tr>
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">Shipping</td>
            <td colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${newOrder.shipping
        }</td>
        </tr>
        <tr>
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">Discount</td>
            <td colspan="2"  class="text-danger text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6; text-align: right;">
           - ${newOrder.items.reduce(
          (total, item) => total + item.quantity * item.price,
          0
        ) -
          Math.abs(newOrder.discount) ===
          0
          ? "0"
          : Math.abs(newOrder.discount)
        }
          </td>
        </tr>
        <tr class="fw-bold">
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">TOTAL</td>
            <td colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${newOrder.totalAmount
        }</td>
        </tr>
    </tfoot>
</table>
</td>

      </tr>
    </tbody>
    <tfooter>
      <tr>
        <td colspan="2" style="font-size:14px;padding:50px 15px 0 15px;">
        
        
          <strong style="display:block;margin:0 0 10px 0;">Regards</strong> 
          
          <address><strong class="mb-2"> CAYRO ENTERPRISES </strong><br>
          <b title="Phone" class="mb-2">Web:</b>www.cayroshop.com <br></address>
         
        </td>
      </tr>
    </tfooter>
  </table> `,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Transfer-Encoding": "quoted-printable",
      },
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

export const EmailVerify = async (req, res) => {
  const { email } = req.body;

  // Generate a random OTP
  const OTP = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit numeric OTP

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD, // Update with your email password
    },
  });

  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: email, // Update with your email address
    subject: "OTP Verification cayroshop.com",
    text: `OTP: ${OTP}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      // If email sending is successful, return a success response
      res.status(201).json({
        success: true,
        message: "Email sent successfully",
        OTP: OTP, // Include OTP in the response if needed
      });
    }
  });
};

export const HomeSendEnquire_old = async (req, res) => {
  const { fullname, email, phone, service, QTY, userId,
    userEmail } = req.body;

  try {
    // Save data to the database
    const newEnquire = new enquireModel({
      fullname,
      email,
      phone,
      service,
      QTY,
      userId,
      userEmail,
    });

    await newEnquire.save();



      

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      },
    });

    const recipients = userEmail
      ? `${userEmail}, ${process.env.MAIL_TO_ADDRESS}`
      : process.env.MAIL_TO_ADDRESS;

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: recipients, // Update with your email address
      subject: "New Enquire Form Submission",
      text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nQTY:${QTY}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Failed to send email");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Email sent successfully");
      }
    });
  } catch (error) {
    console.error("Error in send data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



// export const HomeSendEnquire = async (req, res) => {

  
//     // Calculate the auto-increment ID
//     const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
//     let order_id;

//     if (lastOrder) {
//       // Convert lastOrder.orderId to a number before adding 1
//       const lastOrderId = parseInt(lastOrder.orderId);
//       order_id = lastOrderId + 1;
//     } else {
//       order_id = 1;
//     }


//   const {
//     fullname,
//     email,
//     phone,
//     service,
//     pincode,
//     state,
//     statename,
//     address,
//     city,
//     bookingDate,
//     bookingTime,
//     requirement,
//     category, 
//     longitude,
//     latitude,
//   } = req.body;
 
//  if(!longitude && !latitude ){
//     console.log(longitude,latitude)
//     res.status(500).send("longitude and latitude is required");
//  }
 
//   try {
//     // Save data to the database
//     const newEnquire = new orderModel({
//       fullname,
//       email,
//       phone,
//       service,
//       pincode,
//       state,
//       statename,
//       address,
//       city,
//       bookingDate,
//       bookingTime,
//       requirement,
//       type:1,
//       orderId:order_id,
//       longitude,
//       latitude,
//       category: Array.isArray(category) ? category[0] : category  // Convert array to string
//     });

//     await newEnquire.save();

        
// //        // Create the notification data object with dynamic values
// // const notificationData = {
// //   mobile: "918100188188",  // Replace with dynamic value if needed
// //   templateid: "1193466729031008", // Template ID
// //   overridebot: "yes", // Optional: Set to "yes" or "no"
// //   template: {
// //     components: [
// //       {
// //         type: "body",
// //         parameters: [
// //           { type: "text", text: fullname || "NA" },  
// //           { type: "text", text: phone || "NA" },  
// //           { type: "text", text: email || "NA" }, 
// //           { type: "text", text: service || "NA" }, 
// //           { type: "text", text: QTY || "NA" }  
// //         ]
// //       }
// //     ]
// //   }
// // };
  
// //    const WHATSAPP =   await axios.post(process.env.WHATSAPPAPI, notificationData, {
// //         headers: {
// //           "API-KEY": process.env.WHATSAPPKEY,
// //           "Content-Type": "application/json"
// //         }
// //       });
// //       console.log('WHATSAPP',WHATSAPP)

//     // Configure nodemailer transporter
//     // const transporter = nodemailer.createTransport({
//     //   // SMTP configuration
//     //   host: process.env.MAIL_HOST, // Update with your SMTP host
//     //   port: process.env.MAIL_PORT, // Update with your SMTP port
//     //   secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
//     //   auth: {
//     //     user: process.env.MAIL_USERNAME, // Update with your email address
//     //     pass: process.env.MAIL_PASSWORD, // Update with your email password
//     //   },
//     // });

//     // // Conditional recipient list
//     // const recipients = userEmail
//     //   ? `${userEmail}, ${process.env.MAIL_TO_ADDRESS}`
//     //   : process.env.MAIL_TO_ADDRESS;

//     // // Email message
//     // const mailOptions = {
//     //   from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
//     //   to: recipients, // Update with your email address
//     //   subject: "New Enquire Form Submission",
//     //   text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nQTY:${QTY}`,
//     // };

//     // Send email
//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error(error);
//     //     res.status(500).send("Failed to send email");
//     //   } else {
//     //     console.log("Email sent: " + info.response);
//     //     res.status(200).send("Email sent successfully");
//     //   }
//     // });

//     res.status(200).send("Email sent successfully");


//   } catch (error) {
//     console.error("Error in send data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

export const HomeSendEnquire = async (req, res) => {
  
  // Calculate the auto-increment ID
  const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
  let order_id;

  if (lastOrder) {
    const lastOrderId = parseInt(lastOrder.orderId);
    order_id = lastOrderId + 1;
  } else {
    order_id = 1;
  }

  const {
    fullname,
    email,
    phone,
    service,
    pincode,
    state,
    statename,
    address,
    city,
    bookingDate,
    bookingTime,
    requirement,
    category, 
    longitude,
    latitude,
    agentId
  } = req.body;

 
  try {
    // Save data to the database
    const newEnquire = new orderModel({
      fullname,
      email,
      phone,
      service,
      pincode,
      state,
      statename,
      address,
      city,
      bookingDate,
      bookingTime,
      requirement,
      type: 1,
      orderId: order_id,
      longitude,
      latitude,
      agentId,
      category: Array.isArray(category) ? category[0] : category, // Convert array to string
    });

    console.log('req.body',req.body)
    await newEnquire.save();

    // Send the success response once everything is processed
    res.status(200).send("Enquiry submitted successfully");

  } catch (error) {
    console.error("Error in send data:", error);
    // Handle error and send response only once
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const HomeReferralEnquire = async (req, res) => {
  
  // Calculate the auto-increment ID
  const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
  let order_id;

  if (lastOrder) {
    const lastOrderId = parseInt(lastOrder.orderId);
    order_id = lastOrderId + 1;
  } else {
    order_id = 1;
  }

  const {
    fullname,
    email,
    phone,
    service,
    pincode,
    state,
    statename,
    address,
    city,
    bookingDate,
    bookingTime,
    requirement,
    category, 
    longitude,
    latitude,
    Referral,agentId,referralId
  } = req.body;

 if(!Referral){
    return res.status(400).json({
      success: false,
      message: "Referral id required",
    });
 }

  try {
    // Save data to the database
    const newEnquire = new orderModel({
      fullname,
      email,
      phone,
      service,
      pincode,
      state,
      statename,
      address,
      city,
      type: 1,
      orderId: order_id,
      longitude,
      latitude,
      Referral:referralId,
      agentId,
      lead:0,
      category: Array.isArray(category) ? category[0] : category, // Convert array to string
    });

    await newEnquire.save();

    // Send the success response once everything is processed
    res.status(200).send("Enquiry submitted successfully");

  } catch (error) {
    console.error("Error in send data:", error);
    // Handle error and send response only once
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const HomeSendEnquireCatgeory = async (req, res) => {
  const {
    fullname,
    email,
    phone,
    service,
    requirement,
    userId,
    userEmail,
  } = req.body;

  console.log(userId, userEmail);

  try {

    // Check if phone number already exists
    const existingPhone = await userModel.findOne({ phone });
    if (existingPhone) {
      // Just save the enquiry, do not create user
      const newEnquire = new enquireModel({
        fullname,
        email,
        phone,
        service,
        requirement,
        userId,
        userEmail,
      });

      await newEnquire.save();

      return res.status(200).json({
        success: true,
        message: "Enquiry sent successfully. User already exists by phone.",
      });
    }

        // Check if email already exists
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
    
    // If both email and phone are new, create new user and save enquiry
    const user = new userModel({
      username: fullname,
      email,
      phone,
      type:2
    });

    await user.save();

    const newEnquire = new enquireModel({
      fullname,
      email,
      phone,
      service,
      requirement,
      userId,
      userEmail,
    });

    await newEnquire.save();

    return res.status(200).json({
      success: true,
      message: "Enquiry sent and user created successfully",
      user,
    });

  } catch (error) {
    console.error("Error in sending data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const contactSendEnquire = async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD, // Update with your email password
    },
  });

  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: process.env.MAIL_TO_ADDRESS, // Update with your email address
    subject: "New Contact Us Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
};

export const updateUserAndCreateOrderController_old = async (req, res) => {
  let session;
  let transactionInProgress = false;
  const { id } = req.params;
  const {
    username,
    email,
    address,
    pincode,
    details,
    discount,
    items,
    mode,
    payment,
    primary,
    shipping,
    status,
    totalAmount,
    userId,
  } = req.body;

  const options = {
    amount: totalAmount * 100, // amount in smallest currency unit (e.g., paisa for INR)
    currency: "INR",
    receipt: "order_rcptid_" + Math.floor(Math.random() * 1000),
  };

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    transactionInProgress = true;

    // Update user
    const user = await userModel.findByIdAndUpdate(
      id,
      { username, email, pincode, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create order for the updated user
    if (!status || !mode || !details || !totalAmount || !userId || !payment) {
      console.log("status:", status);
      console.log("mode:", mode);
      console.log("details:", details);
      console.log("totalAmount:", totalAmount);
      console.log("userId:", userId);
      console.log("payment:", payment);
      console.log("shipping:", shipping);

      return res.status(400).json({
        success: false,
        message: "Please provide all fields for the order",
      });
    }

    const order = await Razorpay.orders.create(options);
    const apiKey = process.env.RAZORPAY_API_KEY;

    const newOrder = new orderModel({
      details,
      discount,
      items,
      mode,
      payment: 0,
      primary,
      shipping,
      status,
      totalAmount,
      userId,
      orderId: order.id,
    });

    await newOrder.save({ session });
    user.orders.push(newOrder);
    await user.save({ session });

    // Update stock quantity for each product in the order
    for (const item of items) {
      const product = await productModel.findById(item.id);
      if (product) {
        product.stock -= item.quantity; // Decrement stock by the quantity ordered
        await product.save({ session });
      }
    }

    await session.commitTransaction();
    transactionInProgress = false;

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      newOrder,
      order,
      apiKey,
      user,
      Amount: totalAmount,
    });
  } catch (error) {
    if (transactionInProgress) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }
    console.error("Error:", error);
    return res.status(400).json({
      success: false,
      message: "Error while creating order",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const razorpayCallback = async (req, res) => {
  const { payment_id, order_id, status } = req.body;

  try {
    if (status === "paid") {
      // Payment successful, update order status to paid
      await orderModel.findOneAndUpdate({ orderId: order_id }, { payment: 1 });
    } else if (status === "failed") {
      // Payment failed, update order status to unpaid
      await orderModel.findOneAndUpdate({ orderId: order_id }, { payment: 2 });
    }
    res.status(200).send("Order status updated successfully.");
  } catch (error) {
    res.status(500).send("Error updating order status: " + error.message);
  }
};

//category fillter

export const GetAllCategoriesByParentIdController_old = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { filter, price, page = 1, perPage = 2 } = req.query; // Extract filter, price, page, and perPage query parameters

    // Check if parentId is undefined or null
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Call the recursive function to get all categories
    const categories = await getAllCategoriesByParentId(parentId);
    const MainCat = await categoryModel
      .findById(parentId)
      .select("title description slug")
      .lean();

    const filters = { Category: parentId }; // Initialize filters with parent category filter

    if (filter) {
      // Parse the filter parameter
      const filterParams = JSON.parse(filter);

      // Iterate through each parameter in the filter
      Object.keys(filterParams).forEach((param) => {
        // Split parameter values by comma if present
        const paramValues = filterParams[param].split(",");

        // Check if there are multiple values for the parameter
        if (paramValues.length > 1) {
          filters[`variations.${param}.${param}`] = { $all: paramValues };
        } else {
          // If only one value, handle it as a single filter
          filters[`variations.${param}.${param}`] = { $in: paramValues };
        }
      });
    }

    // Check if price parameter is provided and not blank
    if (price && price.trim() !== "") {
      const priceRanges = price.split(","); // Split multiple price ranges by comma
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-"); // Split each range into min and max prices
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
        };
      });

      // Add price filters to the existing filters
      filters.$or = priceFilters;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Fetch products based on filters with pagination
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations")
      .skip(skip)
      .limit(perPage)
      .lean();

    const Procat = { Category: parentId }; // Initialize filters with parent category filter
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const GetAllCategoriesByParentIdController = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { filter, price, page = 1, perPage = 2 } = req.query; // Extract filter, price, page, and perPage query parameters

    // Check if parentId is undefined or null
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Call the recursive function to get all categories
    const categories = await getAllCategoriesByParentId(parentId);
    const MainCat = await categoryModel
      .findById(parentId)
      .select("title metaTitle metaDescription metaKeywords image description slug canonical")
      .lean();

    const filters = { Category: parentId }; // Initialize filters with parent category filter


    // Handle variation filters
    if (filter) {
      let filterParams;
      try {
        filterParams = JSON.parse(filter);
      } catch (err) {
        console.error("Invalid filter JSON:", err);
        return res.status(400).json({ success: false, message: "Invalid filter format." });
      }

      // Loop through filter params and create dynamic queries for each variation name
      const variationFilters = Object.entries(filterParams).map(([variationName, valueString]) => {
        const values = valueString.split(",").map(v => v.trim()).filter(Boolean);
        return {
          $elemMatch: {
            name: variationName,
            value: { $in: values },
          }
        };
      });

      // If variations are provided in the filter, apply them to the main filters
      if (variationFilters.length > 0) {
        filters.variations = { $all: variationFilters };
      }
    }

    // Check if price parameter is provided and not blank
    if (price && price.trim() !== "") {
      const priceRanges = price.split(","); // Split multiple price ranges by comma
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-"); // Split each range into min and max prices
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
        };
      });

      // Add price filters to the existing filters
      filters.$or = priceFilters;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Fetch products based on filters with pagination
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations")
      .skip(skip)
      .limit(perPage)
      .lean();

    const Procat = { Category: parentId }; // Initialize filters with parent category filter
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice variations")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const GetAllCategoriesBySlugController = async (req, res) => {
  try {
    const { parentSlug } = req.params;
    const { filter, price, page = 1, perPage = 2,location } = req.query;

    // Check if parentSlug is undefined or null
    if (!parentSlug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Fetch the main category with status check
    const MainCat = await categoryModel
      .findOne({ slug: parentSlug, status: "true" })
      .select(
        "title metaTitle metaDescription metaKeywords image description specifications slide_head slide_para filter slug canonical"
      )
      .lean();

    // Check if the MainCat exists
    if (!MainCat) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive.",
      });
    }

    const parentId = MainCat._id;
    const categories = await getAllCategoriesByParentId(parentId);

    const filters = { Category: parentId, status: "true" }; // Add status filter for products

  
    // Handle variation filters
    if (filter) {
      let filterParams;
      try {
        filterParams = JSON.parse(filter);
      } catch (err) {
        console.error("Invalid filter JSON:", err);
        return res.status(400).json({ success: false, message: "Invalid filter format." });
      }

      // Loop through filter params and create dynamic queries for each variation name
      const variationFilters = Object.entries(filterParams).map(([variationName, valueString]) => {
        const values = valueString.split(",").map(v => v.trim()).filter(Boolean);
        return {
          $elemMatch: {
            name: variationName,
            value: { $in: values },
          }
        };
      });

      // If variations are provided in the filter, apply them to the main filters
      if (variationFilters.length > 0) {
        filters.variations = { $all: variationFilters };
      }
    }


    // Check if price parameter is provided
    if (price && price.trim() !== "") {
      const priceRanges = price.split(",");
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-");
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
          status: "true", // Ensure products are active
        };
      });

      filters.$or = priceFilters;
    }
 
    if (location) {
      const trimmedLocation = location.trim();
      const matchingUsers = await userModel.find({
        coverage: { $elemMatch: { $regex: new RegExp(`^${trimmedLocation}$`, 'i') } }
      }).select('_id');
    
      const matchingUserIds = matchingUsers.map(user => user._id);
    
      if (matchingUserIds.length > 0) {
        filters['userId'] = { $in: matchingUserIds };
    }
  }
    
    
    

    const skip = (page - 1) * perPage;

    // Fetch products based on filters with pagination
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations slug features userId images")
      .populate('userId', 'username phone email coverage')
       .skip(skip)
      .limit(perPage)
      
 
    const Procat = { Category: parentId, status: "true" }; // Add status filter for products
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice variations slug images")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesBySlugController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllCategoriesByParentId = async (parentId) => {
  try {
    const categories = await categoryModel.find({ parent: parentId }).lean();

    if (!categories || categories.length === 0) {
      return [];
    }

    const result = [];

    for (const category of categories) {
      const { _id, title, image, slug /* other fields */ } = category;

      const categoryData = {
        _id,
        title,
        image,
        subcategories: await getAllCategoriesByParentId(_id), // Recursive call
        slug,
      };

      result.push(categoryData);
    }

    return result;
  } catch (error) {
    console.error("Error while fetching categories:", error);
    throw error;
  }
};

export const userOrdersController = async (req, res) => {
  try {
    const userOrder = await userModel.findById(req.params.id).populate({
      path: "orders",
      select: "_id createdAt totalAmount status mode orderId", // Select only _id and title fields
      options: {
        sort: { createdAt: -1 }, // Sort by createdAt field in descending order
      },
    });

    if (!userOrder) {
      return res.status(200).send({
        message: "Order Not Found By user",
        success: false,
      });
    }
    return res.status(200).json({
      message: " user Orders!",
      success: true,
      userOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Getting Orders",
      error,
    });
  }
};

export const userOrdersViewController = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    // Find the user by ID and populate their orders
    const userOrder = await userModel.findById(userId).populate({
      path: "orders",
      match: { _id: orderId }, // Match the order ID
    });

    // If user or order not found, return appropriate response
    if (!userOrder || !userOrder.orders.length) {
      return res.status(404).json({
        message: "Order Not Found By user or Order ID",
        success: false,
      });
    }

    // If user order found, return success response with the single order
    return res.status(200).json({
      message: "Single Order Found By user ID and Order ID",
      success: true,
      userOrder: userOrder.orders[0], // Assuming there's only one order per user
    });
  } catch (error) {
    // If any error occurs during the process, log it and return error response
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error while getting order",
      error,
    });
  }
};

export const FullOrdersViewController = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the user by ID and populate their orders
    const userOrder = await orderModel.findById(orderId).populate('agentId').exec();
 
    console.log(userOrder,orderId)
    // If user or order not found, return appropriate response
    if (!userOrder) {
      return res.status(400).json({
        message: "Order Not Found By user or Order ID",
        success: false,
      });
    }

    // If user order found, return success response with the single order
    return res.status(200).json({
      message: "Single Order Found By user ID and Order ID",
      success: true,
      userOrder: userOrder, // Assuming there's only one order per user
    });
  } catch (error) {
    // If any error occurs during the process, log it and return error response
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error while getting order",
      error,
    });
  }
};

export const AddCart = async (req, res) => {
  try {
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } =
      req.body;

    const Cart = new cartModel({
      items,
      isEmpty,
      totalItems,
      totalUniqueItems,
      cartTotal,
    });
    await Cart.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      Cart,
    });
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const UpdateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } =
      req.body;
    const Cart = await cartModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).json({
      message: "Cart Updated!",
      success: true,
      Cart,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating cart: ${error}`,
      success: false,
      error,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const { id } = req.params;
    const Cart = await cartModel.findById(id);
    if (!Cart) {
      return res.status(200).send({
        message: "Cart Not Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Cart Found successfully!",
      success: true,
      Cart,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get cart: ${error}`,
      success: false,
      error,
    });
  }
};

export const AddRating = async (req, res) => {
  try {
    const { userId, rating, comment, productId } = req.body;

    // Validation
    if (!userId || !rating || !comment || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    } else {
      // Create a new user rating instance
      const newUserRating = new ratingModel({
        userId,
        rating,
        comment,
        productId,
      });

      // Save the user rating to the database
      await newUserRating.save();

      return res.status(200).json({
        message: "User rating created successfully!",
        success: true,
        newUserRating,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while add rating: ${error}`,
      success: false,
      error,
    });
  }
};

export const ViewProductRating = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find all ratings for a specific product
    const productRatings = await ratingModel.find({ productId, status: 1 });

    // Fetch user details for each rating
    const ratingsWithUserDetails = await Promise.all(
      productRatings.map(async (rating) => {
        const user = await userModel.findById(rating.userId);
        return {
          rating: rating.rating,
          comment: rating.comment,
          username: user ? user.username : "Unknown",
          createdAt: rating.createdAt,
          userId: user ? user._id : "Unknown",
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Getting product ratings successfully!",
      productRatings: ratingsWithUserDetails,
    });
  } catch (error) {
    console.error("Error getting product ratings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const ViewCategoryRating = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const ratings = await ratingModel.find({ status: 1 });

    res.status(200).json({ success: true, ratings });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// add Wishlist by user
export const AddWishListByUser = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both userId & productId",
      });
    }

    // Check if the wishlist item already exists for the user
    const existingWishlistItem = await wishlistModel.findOne({
      userId,
      productId,
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Wishlist item already exists",
      });
    }

    // Create a new wishlist item
    const newWishlistItem = new wishlistModel({
      userId,
      productId,
    });

    // Save the wishlist item to the database
    await newWishlistItem.save();

    return res.status(200).json({
      message: "Wishlist item created successfully!",
      success: true,
      newWishlistItem,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while adding wishlist item: ${error}`,
      success: false,
      error,
    });
  }
};


export const getProductIdUserBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const Product = await productModel.findOne({ slug: slug })
     .populate('userId', 'username phone email coverage address createdAt');
    if (!Product) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};


export const ViewWishListByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find wishlist items for the specified user ID
    const wishlistItems = await wishlistModel.find({ userId });

    // Extract product IDs from wishlist items
    const productIds = wishlistItems.map((item) => item.productId);

    // Fetch product details for each product ID
    const productDetails = await productModel
      .find({ _id: { $in: productIds } })
      .select("_id pImage regularPrice salePrice title");

    // Combine wishlist items with product details
    const wishlistWithProductDetails = wishlistItems.map((item) => {
      const productDetail = productDetails.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return {
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productDetail: productDetail, // Add product details to wishlist item
      };
    });

    return res.status(200).json({
      success: true,
      message: "Getting wishlist successfully!",
      wishlist: wishlistWithProductDetails,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteWishListByUser = async (req, res) => {
  try {
    await wishlistModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Wishlist Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Wishlist",
      error,
    });
  }
};

export const AddCompareByUser = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please fill userId & productId",
      });
    } else {
      // Check if the wishlist item already exists for the user
      const existingWishlistItem = await compareModel.findOne({
        userId,
        productId,
      });

      if (existingWishlistItem) {
        return res.status(400).json({
          success: false,
          message: "Comparsion item already exists",
        });
      }
      const entryCount = await compareModel.countDocuments({ userId });

      if (entryCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "Sorry You Can't Add More Than 3 Products",
        });
      }

      // Create a new user rating instance
      const newUserCompare = new compareModel({
        userId,
        productId,
      });

      // Save the user rating to the database
      await newUserCompare.save();

      return res.status(200).json({
        message: "User comparsion created successfully!",
        success: true,
        newUserCompare,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while add comparsion: ${error}`,
      success: false,
      error,
    });
  }
};

export const ViewCompareByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find wishlist items for the specified user ID
    const CompareItems = await compareModel.find({ userId });

    // Extract product IDs from wishlist items
    const productIds = CompareItems.map((item) => item.productId);

    // Fetch product details for each product ID
    const productDetails = await productModel
      .find({ _id: { $in: productIds } })
      .select("_id pImage regularPrice salePrice title specifications");

    // Combine wishlist items with product details
    const CompareWithProductDetails = CompareItems.map((item) => {
      const productDetail = productDetails.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return {
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productDetail: productDetail, // Add product details to wishlist item
      };
    });

    return res.status(200).json({
      success: true,
      message: "Getting Compare successfully!",
      comparsion: CompareWithProductDetails,
    });
  } catch (error) {
    console.error("Error getting Compare:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteCompareByUser = async (req, res) => {
  try {
    await compareModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Compare Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Compare",
      error,
    });
  }
};

export const ViewOrderByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find userItems items for the specified user ID
    const userItems = await userModel.find({ userId });

    // Extract product IDs from userItems items
    const productIds = userItems.map((item) => item.productId);

    // Fetch product details for each product ID
    const productDetails = await orderModel
      .find({ _id: { $in: productIds } })
      .select("_id username email phone pincode country address status");

    // Combine userItems items with product details
    const UsertWithProductDetails = userItems.map((item) => {
      const productDetail = productDetails.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return {
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productDetail: productDetail, // Add product details to wishlist item
      };
    });

    return res.status(200).json({
      success: true,
      message: "Getting wishlist successfully!",
      wishlist: wishlistWithProductDetails,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// for zones

export const ViewAllZones = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({ status: "true" });

    res.status(200).json({ success: true, Zones });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// export const ViewAllZonesOnly = async (req, res) => {
//   try {
//     // Get all products, populate user data
//     const products = await productModel.find().populate('userId', 'statename city');

//     // Extract statename and city from each product's associated user
//     const locations = products.map(product => ({
//       statename: product.userId?.statename,
//       city: product.userId?.city,
//     }));

//     // Combine both statenames and cities into a single array
//     const allLocations = [...locations.map(loc => loc.statename), ...locations.map(loc => loc.city)];

//     // Remove duplicates by using a Set
//     const uniqueLocations = [...new Set(allLocations)].filter(location => location != undefined);

//     // Respond with the unique locations array
//     res.status(200).json({ success: true, uniqueLocations });
//   } catch (error) {
//     console.error("Error getting locations:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

export const ViewAllZonesOnly = async (req, res) => {
  try {
    // Get all products, populate user data
    const products = await productModel.find().populate('userId', 'coverage username email phone');

    // Collect and flatten all coverage arrays from users
    const allLocations = products
      .map(product => product.userId?.coverage || [])
      .flat(); // or .reduce((acc, val) => acc.concat(val), [])

      console.log('allLocations',products)
    // Remove duplicates and undefined
    const uniqueLocations = [...new Set(allLocations)].filter(Boolean);

    // Respond with the unique locations array
    res.status(200).json({ success: true, uniqueLocations });
  } catch (error) {
    console.error("Error getting locations:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const ViewAllUserTaxes = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const taxes = await taxModel.find({ status: "true" });

    res.status(200).json({ success: true, taxes });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getTaxIdUser = async (req, res) => {
  try {
    const { id } = req.params;
    const taxes = await taxModel.find({ zoneId: id });
    if (!taxes || taxes.length === 0) {
      return res.status(200).send({
        message: "No taxes found for the specified zoneId",
        success: false,
      });
    }
    // Get the last element from the taxes array
    const lastTax = taxes[taxes.length - 1];
    return res.status(200).json({
      message: "Fetched last tax by zoneId successfully",
      success: true,
      tax: lastTax,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting taxes: ${error}`,
      success: false,
      error,
    });
  }
};

export const applyPromoCode = async (req, res) => {
  try {
    const { promoCode } = req.body;
    console.log("promoCode", req.body.promoCode);
    // Find the promo code in the database
    const promo = await promoModel.findOne({ name: promoCode });

    if (!promo) {
      return res.status(400).json({ message: "Promo code not found" });
    }

    // Check if the promo code is valid and active
    if (promo.status !== "true") {
      return res.status(400).json({ message: "Promo code is not active" });
    }

    // Apply the promo code based on its type
    let discount = 0;
    let type = "";

    if (promo.type === 1) {
      // Percentage
      // Calculate discount percentage
      discount = parseFloat(promo.rate) / 100;
      type = "percentage";
    } else if (promo.type === 2) {
      // Fixed Amount
      // Assume type is 'value', calculate discount value
      discount = parseFloat(promo.rate);
      type = "fixed";
    } else {
      return res.status(400).json({ message: "Invalid promo code type" });
    }

    // Return the discount and type to the client
    return res.status(200).json({ discount, type });
  } catch (error) {
    console.error("Error applying promo code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendRegOTP = async (phone, otp) => {
  try {
    // Construct the request URL with query parameters
    const queryParams = querystring.stringify({
      username: "cayro.trans",
      password: "CsgUK",
      unicode: false,
      from: "CAYROE",
      to: phone,
      text: `Here is your OTP ${otp} for registering your account on cayroshop.com`,
    });
    const url = `https://pgapi.smartping.ai/fe/api/v1/send?${queryParams}`;

    // Make the GET request to send OTP
    https
      .get(url, (res) => {
        console.log(`OTP API response status code: ${res.statusCode}`);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`Response body: ${chunk}`);
        });
      })
      .on("error", (error) => {
        // console.log('url', url)
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
      });

    console.log("OTP request sent successfully");
  } catch (error) {
    // Handle errors
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

const sendLogOTP = async (phone, otp) => {
  // try {
  //   // Construct the request URL with query parameters
  //   const queryParams = querystring.stringify({
  //     username: "ynbhealth.trans",
  //     password: "qEX1P",
  //     unicode: false,
  //     from: "YNBHLT",
  //     to: phone,
  //     text: `OTP is ${otp} for your account Login-Register in YNB Healthcare`,
  //   });
  //   const url = `https://pgapi.smartping.ai/fe/api/v1/send?${queryParams}`;

  //   console.log(url);
  //   // Make the GET request to send OTP
  //   https
  //     .get(url, (res) => {
  //       console.log(`OTP API response status code: ${res.statusCode}`);
  //       res.setEncoding("utf8");
  //       res.on("data", (chunk) => {
  //         console.log(`Response body: ${chunk}`);
  //       });
  //     })
  //     .on("error", (error) => {
  //       // console.log('url', url)
  //       console.error("Error sending OTP:", error);
  //       throw new Error("Failed to send OTP");
  //     });

  //   console.log("OTP request sent successfully");
  // } catch (error) {
  //   // Handle errors
  //   console.error("Error sending OTP:", error);
  //   throw new Error("Failed to send OTP");
  // }
};

const sendOrderOTP = async (phone, order_id) => {
  try {
    // Construct the request URL with query parameters
    const queryParams = querystring.stringify({
      username: "cayro.trans",
      password: "CsgUK",
      unicode: false,
      from: "CAYROE",
      to: phone,
      text: `Thank you for your order. Your order id is ${order_id} cayroshop.com`,
    });
    const url = `https://pgapi.smartping.ai/fe/api/v1/send?${queryParams}`;

    console.log(url);
    // Make the GET request to send OTP
    https
      .get(url, (res) => {
        console.log(`OTP API response status code: ${res.statusCode}`);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`Response body: ${chunk}`);
        });
      })
      .on("error", (error) => {
        // console.log('url', url)
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
      });

    console.log("OTP request sent successfully");
  } catch (error) {
    // Handle errors
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

export const SendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // Send OTP via Phone
    await sendOTP(phone, otp);

    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", OTP: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const SignupLoginUser_old = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    //  await sendRegOTP(phone, otp);
 

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      if (existingUser.password !== undefined) {
        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }
        return res.status(201).json({
          success: true,
          message: "User found with password",
          password: true,
        });
      } else {
        // Hash the OTP
        const ecryptOTP = await bcrypt.hash(String(otp), 10);

        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }

        // block
        console.log(otp);
         await sendLogOTP(phone, otp);

        return res.status(201).json({
          success: true,
          message: "User found",
          existingUser: {
            _id: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone,
            email: existingUser.email,
            type: existingUser.type,
          },
          token: existingUser.token,
          otp: ecryptOTP,
          type: 2,

        });
      }
    } else {
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
      await sendLogOTP(phone, otp);
      return res.status(200).json({
        success: true,
        message: "New User found",
        newUser: true,
        otp: ecryptOTP,
      });
    }
  } catch (error) {
    console.error("Error on login:", error);
    return res.status(500).json({
      success: false,
      message: "Error on login",
      error: error.message,
    });
  }
};
 
export const SignupLoginUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    //  await sendRegOTP(phone, otp);
 

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      if(existingUser.type !== 2){
       return res.status(400).json({
        success: false,
        message: "User Already register as vendor",
       });
      }
      
      if (existingUser.password !== undefined) {
        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }
        return res.status(201).json({
          success: true,
          message: "User found with password",
          password: true,
        });
      } else {
        // Hash the OTP
        const ecryptOTP = await bcrypt.hash(String(otp), 10);

        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }

        // block
        console.log(otp);
         await sendLogOTP(phone, otp);

        return res.status(201).json({
          success: true,
          message: "User found",
          existingUser: {
            _id: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone,
            email: existingUser.email,
            type: existingUser.type,
          },
          token: existingUser.token,
          otp: ecryptOTP,
          type: 2,

        });
      }
    } else {
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
      // await sendLogOTP(phone, otp);
      return res.status(200).json({
        success: true,
        message: "New User found",
        newUser: true,
        otp: ecryptOTP,
      });
      // return res.status(400).json({
      //   success: false,
      //   message: "User Not Found",
        
      //  });

    }
  } catch (error) {
    console.error("Error on login:", error);
    return res.status(500).json({
      success: false,
      message: "Error on login",
      error: error.message,
    });
  }
};


export const SignupLoginNew = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    //  await sendRegOTP(phone, otp);
 

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      if (existingUser.password !== undefined) {
        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }
        return res.status(201).json({
          success: true,
          message: "User found with password",
          password: true,
        });
      } else {
        // Hash the OTP
        const ecryptOTP = await bcrypt.hash(String(otp), 10);

        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }

        // block
        console.log(otp);
         await sendLogOTP(phone, otp);

        return res.status(201).json({
          success: true,
          message: "User found",
          existingUser: {
            _id: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone,
            email: existingUser.email,
            type: existingUser.type,
            cHealthStatus: existingUser.cHealthStatus,
            pHealthHistory: existingUser.pHealthHistory,

          },
          newUser: false,
          token: existingUser.token,
          otp: ecryptOTP,
          type: 2,

        });
      }
    } else {
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
      await sendLogOTP(phone, otp);
      return res.status(200).json({
        success: true,
        message: "New User found",
        newUser: true,
        otp: ecryptOTP,
      });
    }
  } catch (error) {
    console.error("Error on login:", error);
    return res.status(500).json({
      success: false,
      message: "Error on login",
      error: error.message,
    });
  }
};

export const SignupNewUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    // await sendOTP(phone, otp);

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Create a new user
    const user = new userModel({ phone });
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    user.token = token; // Update the user's token field with the generated token
    user.type = 2; // Update the user's token field with the generated token

    await user.save();

    // Hash the OTP
    const ecryptOTP = await bcrypt.hash(String(otp), 10);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      existingUser: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        type: user.type,
      },
      otp: ecryptOTP,
      token,
      type: 2,
    });
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const LoginUserWithOTP = async (req, res) => {
  try {
    const { phone, Gtoken } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    // await sendLogOTP(phone, otp);

    // if (!Gtoken) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'you can access this page ',
    //   });
    // }
    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone, status: "1", type: 2 });

    if (existingUser) {
      // Hash the OTP
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
        await sendLogOTP(phone, otp);

      return res.status(201).json({
        success: true,
        message: "User found",
        existingUser: {
          _id: existingUser._id,
          username: existingUser.username,
          phone: existingUser.phone,
          email: existingUser.email,
          type: existingUser.type,
        },
        token: existingUser.token,
        otp: ecryptOTP,
        type: 2,

      });
    }
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const LoginUserWithPass = async (req, res) => {
  try {
    const { phone, Gtoken, password } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    if (!phone || !password || !Gtoken) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const user = await userModel.findOne({ phone, status: "1", type: 2 });

    // password check

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        user,
      });
    }

    // const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: "login sucesssfully with password",
      existingUser: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        type: user.type,
      },
      token: user.token,
      checkpass: true,
      type: 2,

    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const LoginAndVerifyOTP = async (req, res) => {
  try {
    const { OTP, HASHOTP } = req.body;

    const isMatch = await bcrypt.compare(OTP, HASHOTP);

    if (isMatch) {
      return res.status(200).json({
        success: true,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "OTP Not Verified",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const updatePromoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, status } = req.body;

    let updateFields = {
      name,
      rate,
      type,
      status,
    };

    const Promo = await promoModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Promo code Updated!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};



const cityData = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  Haryana: [
    "Faridabad",
    "Gurgaon",
    "Hisar",
    "Rohtak",
    "Panipat",
    "Karnal",
    "Sonipat",
    "Yamunanagar",
    "Panchkula",
    "Bhiwani",
    "Bahadurgarh",
    "Jind",
    "Sirsa",
    "Thanesar",
    "Kaithal",
    "Palwal",
    "Rewari",
    "Hansi",
    "Narnaul",
    "Fatehabad",
    "Gohana",
    "Tohana",
    "Narwana",
    "Mandi Dabwali",
    "Charkhi Dadri",
    "Shahbad",
    "Pehowa",
    "Samalkha",
    "Pinjore",
    "Ladwa",
    "Sohna",
    "Safidon",
    "Taraori",
    "Mahendragarh",
    "Ratia",
    "Rania",
    "Sarsod",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Ranipet",
    "Nagercoil",
    "Thanjavur",
    "Vellore",
    "Kancheepuram",
    "Erode",
    "Tiruvannamalai",
    "Pollachi",
    "Rajapalayam",
    "Sivakasi",
    "Pudukkottai",
    "Neyveli (TS)",
    "Nagapattinam",
    "Viluppuram",
    "Tiruchengode",
    "Vaniyambadi",
    "Theni Allinagaram",
    "Udhagamandalam",
    "Aruppukkottai",
    "Paramakudi",
    "Arakkonam",
    "Virudhachalam",
    "Srivilliputhur",
    "Tindivanam",
    "Virudhunagar",
    "Karur",
    "Valparai",
    "Sankarankovil",
    "Tenkasi",
    "Palani",
    "Pattukkottai",
    "Tirupathur",
    "Ramanathapuram",
    "Udumalaipettai",
    "Gobichettipalayam",
    "Thiruvarur",
    "Thiruvallur",
    "Panruti",
    "Namakkal",
    "Thirumangalam",
    "Vikramasingapuram",
    "Nellikuppam",
    "Rasipuram",
    "Tiruttani",
    "Nandivaram-Guduvancheri",
    "Periyakulam",
    "Pernampattu",
    "Vellakoil",
    "Sivaganga",
    "Vadalur",
    "Rameshwaram",
    "Tiruvethipuram",
    "Perambalur",
    "Usilampatti",
    "Vedaranyam",
    "Sathyamangalam",
    "Puliyankudi",
    "Nanjikottai",
    "Thuraiyur",
    "Sirkali",
    "Tiruchendur",
    "Periyasemur",
    "Sattur",
    "Vandavasi",
    "Tharamangalam",
    "Tirukkoyilur",
    "Oddanchatram",
    "Palladam",
    "Vadakkuvalliyur",
    "Tirukalukundram",
    "Uthamapalayam",
    "Surandai",
    "Sankari",
    "Shenkottai",
    "Vadipatti",
    "Sholingur",
    "Tirupathur",
    "Manachanallur",
    "Viswanatham",
    "Polur",
    "Panagudi",
    "Uthiramerur",
    "Thiruthuraipoondi",
    "Pallapatti",
    "Ponneri",
    "Lalgudi",
    "Natham",
    "Unnamalaikadai",
    "P.N.Patti",
    "Tharangambadi",
    "Tittakudi",
    "Pacode",
    "O' Valley",
    "Suriyampalayam",
    "Sholavandan",
    "Thammampatti",
    "Namagiripettai",
    "Peravurani",
    "Parangipettai",
    "Pudupattinam",
    "Pallikonda",
    "Sivagiri",
    "Punjaipugalur",
    "Padmanabhapuram",
    "Thirupuvanam",
  ],
  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Ratlam",
    "Satna",
    "Murwara (Katni)",
    "Morena",
    "Singrauli",
    "Rewa",
    "Vidisha",
    "Ganjbasoda",
    "Shivpuri",
    "Mandsaur",
    "Neemuch",
    "Nagda",
    "Itarsi",
    "Sarni",
    "Sehore",
    "Mhow Cantonment",
    "Seoni",
    "Balaghat",
    "Ashok Nagar",
    "Tikamgarh",
    "Shahdol",
    "Pithampur",
    "Alirajpur",
    "Mandla",
    "Sheopur",
    "Shajapur",
    "Panna",
    "Raghogarh-Vijaypur",
    "Sendhwa",
    "Sidhi",
    "Pipariya",
    "Shujalpur",
    "Sironj",
    "Pandhurna",
    "Nowgong",
    "Mandideep",
    "Sihora",
    "Raisen",
    "Lahar",
    "Maihar",
    "Sanawad",
    "Sabalgarh",
    "Umaria",
    "Porsa",
    "Narsinghgarh",
    "Malaj Khand",
    "Sarangpur",
    "Mundi",
    "Nepanagar",
    "Pasan",
    "Mahidpur",
    "Seoni-Malwa",
    "Rehli",
    "Manawar",
    "Rahatgarh",
    "Panagar",
    "Wara Seoni",
    "Tarana",
    "Sausar",
    "Rajgarh",
    "Niwari",
    "Mauganj",
    "Manasa",
    "Nainpur",
    "Prithvipur",
    "Sohagpur",
    "Nowrozabad (Khodargama)",
    "Shamgarh",
    "Maharajpur",
    "Multai",
    "Pali",
    "Pachore",
    "Rau",
    "Mhowgaon",
    "Vijaypur",
    "Narsinghgarh",
  ],
  Jharkhand: [
    "Dhanbad",
    "Ranchi",
    "Jamshedpur",
    "Bokaro Steel City",
    "Deoghar",
    "Phusro",
    "Adityapur",
    "Hazaribag",
    "Giridih",
    "Ramgarh",
    "Jhumri Tilaiya",
    "Saunda",
    "Sahibganj",
    "Medininagar (Daltonganj)",
    "Chaibasa",
    "Chatra",
    "Gumia",
    "Dumka",
    "Madhupur",
    "Chirkunda",
    "Pakaur",
    "Simdega",
    "Musabani",
    "Mihijam",
    "Patratu",
    "Lohardaga",
    "Tenu dam-cum-Kathhara",
  ],
  Mizoram: ["Aizawl", "Lunglei", "Saiha"],
  Nagaland: [
    "Dimapur",
    "Kohima",
    "Zunheboto",
    "Tuensang",
    "Wokha",
    "Mokokchung",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Mandi",
    "Solan",
    "Nahan",
    "Sundarnagar",
    "Palampur",
    "Kullu",
  ],
  Tripura: [
    "Agartala",
    "Udaipur",
    "Dharmanagar",
    "Pratapgarh",
    "Kailasahar",
    "Belonia",
    "Khowai",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Rajahmundry",
    "Kakinada",
    "Tirupati",
    "Anantapur",
    "Kadapa",
    "Vizianagaram",
    "Eluru",
    "Ongole",
    "Nandyal",
    "Machilipatnam",
    "Adoni",
    "Tenali",
    "Chittoor",
    "Hindupur",
    "Proddatur",
    "Bhimavaram",
    "Madanapalle",
    "Guntakal",
    "Dharmavaram",
    "Gudivada",
    "Srikakulam",
    "Narasaraopet",
    "Rajampet",
    "Tadpatri",
    "Tadepalligudem",
    "Chilakaluripet",
    "Yemmiganur",
    "Kadiri",
    "Chirala",
    "Anakapalle",
    "Kavali",
    "Palacole",
    "Sullurpeta",
    "Tanuku",
    "Rayachoti",
    "Srikalahasti",
    "Bapatla",
    "Naidupet",
    "Nagari",
    "Gudur",
    "Vinukonda",
    "Narasapuram",
    "Nuzvid",
    "Markapur",
    "Ponnur",
    "Kandukur",
    "Bobbili",
    "Rayadurg",
    "Samalkot",
    "Jaggaiahpet",
    "Tuni",
    "Amalapuram",
    "Bheemunipatnam",
    "Venkatagiri",
    "Sattenapalle",
    "Pithapuram",
    "Palasa Kasibugga",
    "Parvathipuram",
    "Macherla",
    "Gooty",
    "Salur",
    "Mandapeta",
    "Jammalamadugu",
    "Peddapuram",
    "Punganur",
    "Nidadavole",
    "Repalle",
    "Ramachandrapuram",
    "Kovvur",
    "Tiruvuru",
    "Uravakonda",
    "Narsipatnam",
    "Yerraguntla",
    "Pedana",
    "Puttur",
    "Renigunta",
    "Rajam",
    "Srisailam Project (Right Flank Colony) Township",
  ],
  Punjab: [
    "Ludhiana",
    "Patiala",
    "Amritsar",
    "Jalandhar",
    "Bathinda",
    "Pathankot",
    "Hoshiarpur",
    "Batala",
    "Moga",
    "Malerkotla",
    "Khanna",
    "Mohali",
    "Barnala",
    "Firozpur",
    "Phagwara",
    "Kapurthala",
    "Zirakpur",
    "Kot Kapura",
    "Faridkot",
    "Muktsar",
    "Rajpura",
    "Sangrur",
    "Fazilka",
    "Gurdaspur",
    "Kharar",
    "Gobindgarh",
    "Mansa",
    "Malout",
    "Nabha",
    "Tarn Taran",
    "Jagraon",
    "Sunam",
    "Dhuri",
    "Firozpur Cantt.",
    "Sirhind Fatehgarh Sahib",
    "Rupnagar",
    "Jalandhar Cantt.",
    "Samana",
    "Nawanshahr",
    "Rampura Phul",
    "Nangal",
    "Nakodar",
    "Zira",
    "Patti",
    "Raikot",
    "Longowal",
    "Urmar Tanda",
    "Morinda, India",
    "Phillaur",
    "Pattran",
    "Qadian",
    "Sujanpur",
    "Mukerian",
    "Talwara",
  ],
  Chandigarh: ["Chandigarh"],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Bikaner",
    "Udaipur",
    "Ajmer",
    "Bhilwara",
    "Alwar",
    "Bharatpur",
    "Pali",
    "Barmer",
    "Sikar",
    "Tonk",
    "Sadulpur",
    "Sawai Madhopur",
    "Nagaur",
    "Makrana",
    "Sujangarh",
    "Sardarshahar",
    "Ladnu",
    "Ratangarh",
    "Nokha",
    "Nimbahera",
    "Suratgarh",
    "Rajsamand",
    "Lachhmangarh",
    "Rajgarh (Churu)",
    "Nasirabad",
    "Nohar",
    "Phalodi",
    "Nathdwara",
    "Pilani",
    "Merta City",
    "Sojat",
    "Neem-Ka-Thana",
    "Sirohi",
    "Pratapgarh",
    "Rawatbhata",
    "Sangaria",
    "Lalsot",
    "Pilibanga",
    "Pipar City",
    "Taranagar",
    "Vijainagar, Ajmer",
    "Sumerpur",
    "Sagwara",
    "Ramganj Mandi",
    "Lakheri",
    "Udaipurwati",
    "Losal",
    "Sri Madhopur",
    "Ramngarh",
    "Rawatsar",
    "Rajakhera",
    "Shahpura",
    "Shahpura",
    "Raisinghnagar",
    "Malpura",
    "Nadbai",
    "Sanchore",
    "Nagar",
    "Rajgarh (Alwar)",
    "Sheoganj",
    "Sadri",
    "Todaraisingh",
    "Todabhim",
    "Reengus",
    "Rajaldesar",
    "Sadulshahar",
    "Sambhar",
    "Prantij",
    "Mount Abu",
    "Mangrol",
    "Phulera",
    "Mandawa",
    "Pindwara",
    "Mandalgarh",
    "Takhatgarh",
  ],
  Assam: [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Nagaon",
    "Tinsukia",
    "Jorhat",
    "Bongaigaon City",
    "Dhubri",
    "Diphu",
    "North Lakhimpur",
    "Tezpur",
    "Karimganj",
    "Sibsagar",
    "Goalpara",
    "Barpeta",
    "Lanka",
    "Lumding",
    "Mankachar",
    "Nalbari",
    "Rangia",
    "Margherita",
    "Mangaldoi",
    "Silapathar",
    "Mariani",
    "Marigaon",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Raurkela",
    "Brahmapur",
    "Sambalpur",
    "Puri",
    "Baleshwar Town",
    "Baripada Town",
    "Bhadrak",
    "Balangir",
    "Jharsuguda",
    "Bargarh",
    "Paradip",
    "Bhawanipatna",
    "Dhenkanal",
    "Barbil",
    "Kendujhar",
    "Sunabeda",
    "Rayagada",
    "Jatani",
    "Byasanagar",
    "Kendrapara",
    "Rajagangapur",
    "Parlakhemundi",
    "Talcher",
    "Sundargarh",
    "Phulabani",
    "Pattamundai",
    "Titlagarh",
    "Nabarangapur",
    "Soro",
    "Malkangiri",
    "Rairangpur",
    "Tarbha",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bhilai Nagar",
    "Korba",
    "Bilaspur",
    "Durg",
    "Rajnandgaon",
    "Jagdalpur",
    "Raigarh",
    "Ambikapur",
    "Mahasamund",
    "Dhamtari",
    "Chirmiri",
    "Bhatapara",
    "Dalli-Rajhara",
    "Naila Janjgir",
    "Tilda Newra",
    "Mungeli",
    "Manendragarh",
    "Sakti",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Baramula",
    "Anantnag",
    "Sopore",
    "KathUrban Agglomeration",
    "Rajauri",
    "Punch",
    "Udhampur",
  ],
  Karnataka: [
    "Bengaluru",
    "Hubli-Dharwad",
    "Belagavi",
    "Mangaluru",
    "Davanagere",
    "Ballari",
    "Mysore",
    "Tumkur",
    "Shivamogga",
    "Raayachuru",
    "Robertson Pet",
    "Kolar",
    "Mandya",
    "Udupi",
    "Chikkamagaluru",
    "Karwar",
    "Ranebennuru",
    "Ranibennur",
    "Ramanagaram",
    "Gokak",
    "Yadgir",
    "Rabkavi Banhatti",
    "Shahabad",
    "Sirsi",
    "Sindhnur",
    "Tiptur",
    "Arsikere",
    "Nanjangud",
    "Sagara",
    "Sira",
    "Puttur",
    "Athni",
    "Mulbagal",
    "Surapura",
    "Siruguppa",
    "Mudhol",
    "Sidlaghatta",
    "Shahpur",
    "Saundatti-Yellamma",
    "Wadi",
    "Manvi",
    "Nelamangala",
    "Lakshmeshwar",
    "Ramdurg",
    "Nargund",
    "Tarikere",
    "Malavalli",
    "Savanur",
    "Lingsugur",
    "Vijayapura",
    "Sankeshwara",
    "Madikeri",
    "Talikota",
    "Sedam",
    "Shikaripur",
    "Mahalingapura",
    "Mudalagi",
    "Muddebihal",
    "Pavagada",
    "Malur",
    "Sindhagi",
    "Sanduru",
    "Afzalpur",
    "Maddur",
    "Madhugiri",
    "Tekkalakote",
    "Terdal",
    "Mudabidri",
    "Magadi",
    "Navalgund",
    "Shiggaon",
    "Shrirangapattana",
    "Sindagi",
    "Sakaleshapura",
    "Srinivaspur",
    "Ron",
    "Mundargi",
    "Sadalagi",
    "Piriyapatna",
    "Adyar",
  ],
  Manipur: ["Imphal", "Thoubal", "Lilong", "Mayang Imphal"],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Kollam",
    "Thrissur",
    "Palakkad",
    "Alappuzha",
    "Malappuram",
    "Ponnani",
    "Vatakara",
    "Kanhangad",
    "Taliparamba",
    "Koyilandy",
    "Neyyattinkara",
    "Kayamkulam",
    "Nedumangad",
    "Kannur",
    "Tirur",
    "Kottayam",
    "Kasaragod",
    "Kunnamkulam",
    "Ottappalam",
    "Thiruvalla",
    "Thodupuzha",
    "Chalakudy",
    "Changanassery",
    "Punalur",
    "Nilambur",
    "Cherthala",
    "Perinthalmanna",
    "Mattannur",
    "Shoranur",
    "Varkala",
    "Paravoor",
    "Pathanamthitta",
    "Peringathur",
    "Attingal",
    "Kodungallur",
    "Pappinisseri",
    "Chittur-Thathamangalam",
    "Muvattupuzha",
    "Adoor",
    "Mavelikkara",
    "Mavoor",
    "Perumbavoor",
    "Vaikom",
    "Palai",
    "Panniyannur",
    "Guruvayoor",
    "Puthuppally",
    "Panamattom",
  ],
  Delhi: ["Delhi", "New Delhi"],
  "Dadra and Nagar Haveli": ["Silvassa"],
  Puducherry: ["Pondicherry", "Karaikal", "Yanam", "Mahe"],
  Uttarakhand: [
    "Dehradun",
    "Hardwar",
    "Haldwani-cum-Kathgodam",
    "Srinagar",
    "Kashipur",
    "Roorkee",
    "Rudrapur",
    "Rishikesh",
    "Ramnagar",
    "Pithoragarh",
    "Manglaur",
    "Nainital",
    "Mussoorie",
    "Tehri",
    "Pauri",
    "Nagla",
    "Sitarganj",
    "Bageshwar",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Firozabad",
    "Agra",
    "Meerut",
    "Varanasi",
    "Allahabad",
    "Amroha",
    "Moradabad",
    "Aligarh",
    "Saharanpur",
    "Noida",
    "Loni",
    "Jhansi",
    "Shahjahanpur",
    "Rampur",
    "Modinagar",
    "Hapur",
    "Etawah",
    "Sambhal",
    "Orai",
    "Bahraich",
    "Unnao",
    "Rae Bareli",
    "Lakhimpur",
    "Sitapur",
    "Lalitpur",
    "Pilibhit",
    "Chandausi",
    "Hardoi ",
    "Azamgarh",
    "Khair",
    "Sultanpur",
    "Tanda",
    "Nagina",
    "Shamli",
    "Najibabad",
    "Shikohabad",
    "Sikandrabad",
    "Shahabad, Hardoi",
    "Pilkhuwa",
    "Renukoot",
    "Vrindavan",
    "Ujhani",
    "Laharpur",
    "Tilhar",
    "Sahaswan",
    "Rath",
    "Sherkot",
    "Kalpi",
    "Tundla",
    "Sandila",
    "Nanpara",
    "Sardhana",
    "Nehtaur",
    "Seohara",
    "Padrauna",
    "Mathura",
    "Thakurdwara",
    "Nawabganj",
    "Siana",
    "Noorpur",
    "Sikandra Rao",
    "Puranpur",
    "Rudauli",
    "Thana Bhawan",
    "Palia Kalan",
    "Zaidpur",
    "Nautanwa",
    "Zamania",
    "Shikarpur, Bulandshahr",
    "Naugawan Sadat",
    "Fatehpur Sikri",
    "Shahabad, Rampur",
    "Robertsganj",
    "Utraula",
    "Sadabad",
    "Rasra",
    "Lar",
    "Lal Gopalganj Nindaura",
    "Sirsaganj",
    "Pihani",
    "Shamsabad, Agra",
    "Rudrapur",
    "Soron",
    "SUrban Agglomerationr",
    "Samdhan",
    "Sahjanwa",
    "Rampur Maniharan",
    "Sumerpur",
    "Shahganj",
    "Tulsipur",
    "Tirwaganj",
    "PurqUrban Agglomerationzi",
    "Shamsabad, Farrukhabad",
    "Warhapur",
    "Powayan",
    "Sandi",
    "Achhnera",
    "Naraura",
    "Nakur",
    "Sahaspur",
    "Safipur",
    "Reoti",
    "Sikanderpur",
    "Saidpur",
    "Sirsi",
    "Purwa",
    "Parasi",
    "Lalganj",
    "Phulpur",
    "Shishgarh",
    "Sahawar",
    "Samthar",
    "Pukhrayan",
    "Obra",
    "Niwai",
    "Mirzapur",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Arrah",
    "Begusarai",
    "Chhapra",
    "Katihar",
    "Munger",
    "Purnia",
    "Saharsa",
    "Sasaram",
    "Hajipur",
    "Dehri-on-Sone",
    "Bettiah",
    "Motihari",
    "Bagaha",
    "Siwan",
    "Kishanganj",
    "Jamalpur",
    "Buxar",
    "Jehanabad",
    "Aurangabad",
    "Lakhisarai",
    "Nawada",
    "Jamui",
    "Sitamarhi",
    "Araria",
    "Gopalganj",
    "Madhubani",
    "Masaurhi",
    "Samastipur",
    "Mokameh",
    "Supaul",
    "Dumraon",
    "Arwal",
    "Forbesganj",
    "BhabUrban Agglomeration",
    "Narkatiaganj",
    "Naugachhia",
    "Madhepura",
    "Sheikhpura",
    "Sultanganj",
    "Raxaul Bazar",
    "Ramnagar",
    "Mahnar Bazar",
    "Warisaliganj",
    "Revelganj",
    "Rajgir",
    "Sonepur",
    "Sherghati",
    "Sugauli",
    "Makhdumpur",
    "Maner",
    "Rosera",
    "Nokha",
    "Piro",
    "Rafiganj",
    "Marhaura",
    "Mirganj",
    "Lalganj",
    "Murliganj",
    "Motipur",
    "Manihari",
    "Sheohar",
    "Maharajganj",
    "Silao",
    "Barh",
    "Asarganj",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Nadiad",
    "Porbandar",
    "Anand",
    "Morvi",
    "Mahesana",
    "Bharuch",
    "Vapi",
    "Navsari",
    "Veraval",
    "Bhuj",
    "Godhra",
    "Palanpur",
    "Valsad",
    "Patan",
    "Deesa",
    "Amreli",
    "Anjar",
    "Dhoraji",
    "Khambhat",
    "Mahuva",
    "Keshod",
    "Wadhwan",
    "Ankleshwar",
    "Savarkundla",
    "Kadi",
    "Visnagar",
    "Upleta",
    "Una",
    "Sidhpur",
    "Unjha",
    "Mangrol",
    "Viramgam",
    "Modasa",
    "Palitana",
    "Petlad",
    "Kapadvanj",
    "Sihor",
    "Wankaner",
    "Limbdi",
    "Mandvi",
    "Thangadh",
    "Vyara",
    "Padra",
    "Lunawada",
    "Rajpipla",
    "Vapi",
    "Umreth",
    "Sanand",
    "Rajula",
    "Radhanpur",
    "Mahemdabad",
    "Ranavav",
    "Tharad",
    "Mansa",
    "Umbergaon",
    "Talaja",
    "Vadnagar",
    "Manavadar",
    "Salaya",
    "Vijapur",
    "Pardi",
    "Rapar",
    "Songadh",
    "Lathi",
    "Adalaj",
    "Chhapra",
    "Gandhinagar",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Ramagundam",
    "Khammam",
    "Mahbubnagar",
    "Mancherial",
    "Adilabad",
    "Suryapet",
    "Jagtial",
    "Miryalaguda",
    "Nirmal",
    "Kamareddy",
    "Kothagudem",
    "Bodhan",
    "Palwancha",
    "Mandamarri",
    "Koratla",
    "Sircilla",
    "Tandur",
    "Siddipet",
    "Wanaparthy",
    "Kagaznagar",
    "Gadwal",
    "Sangareddy",
    "Bellampalle",
    "Bhongir",
    "Vikarabad",
    "Jangaon",
    "Bhadrachalam",
    "Bhainsa",
    "Farooqnagar",
    "Medak",
    "Narayanpet",
    "Sadasivpet",
    "Yellandu",
    "Manuguru",
    "Kyathampalle",
    "Nagarkurnool",
  ],
  Meghalaya: ["Shillong", "Tura", "Nongstoin"],
  "Himachal Praddesh": ["Manali"],
  "Arunachal Pradesh": ["Naharlagun", "Pasighat"],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Kalyan-Dombivali",
    "Vasai-Virar",
    "Solapur",
    "Mira-Bhayandar",
    "Bhiwandi",
    "Amravati",
    "Nanded-Waghala",
    "Sangli",
    "Malegaon",
    "Akola",
    "Latur",
    "Dhule",
    "Ahmednagar",
    "Ichalkaranji",
    "Parbhani",
    "Panvel",
    "Yavatmal",
    "Achalpur",
    "Osmanabad",
    "Nandurbar",
    "Satara",
    "Wardha",
    "Udgir",
    "Aurangabad",
    "Amalner",
    "Akot",
    "Pandharpur",
    "Shrirampur",
    "Parli",
    "Washim",
    "Ambejogai",
    "Manmad",
    "Ratnagiri",
    "Uran Islampur",
    "Pusad",
    "Sangamner",
    "Shirpur-Warwade",
    "Malkapur",
    "Wani",
    "Lonavla",
    "Talegaon Dabhade",
    "Anjangaon",
    "Umred",
    "Palghar",
    "Shegaon",
    "Ozar",
    "Phaltan",
    "Yevla",
    "Shahade",
    "Vita",
    "Umarkhed",
    "Warora",
    "Pachora",
    "Tumsar",
    "Manjlegaon",
    "Sillod",
    "Arvi",
    "Nandura",
    "Vaijapur",
    "Wadgaon Road",
    "Sailu",
    "Murtijapur",
    "Tasgaon",
    "Mehkar",
    "Yawal",
    "Pulgaon",
    "Nilanga",
    "Wai",
    "Umarga",
    "Paithan",
    "Rahuri",
    "Nawapur",
    "Tuljapur",
    "Morshi",
    "Purna",
    "Satana",
    "Pathri",
    "Sinnar",
    "Uchgaon",
    "Uran",
    "Pen",
    "Karjat",
    "Manwath",
    "Partur",
    "Sangole",
    "Mangrulpir",
    "Risod",
    "Shirur",
    "Savner",
    "Sasvad",
    "Pandharkaoda",
    "Talode",
    "Shrigonda",
    "Shirdi",
    "Raver",
    "Mukhed",
    "Rajura",
    "Vadgaon Kasba",
    "Tirora",
    "Mahad",
    "Lonar",
    "Sawantwadi",
    "Pathardi",
    "Pauni",
    "Ramtek",
    "Mul",
    "Soyagaon",
    "Mangalvedhe",
    "Narkhed",
    "Shendurjana",
    "Patur",
    "Mhaswad",
    "Loha",
    "Nandgaon",
    "Warud",
  ],
  Goa: ["Marmagao", "Panaji", "Margao", "Mapusa"],
  "West Bengal": [
    "Kolkata",
    "Siliguri",
    "Asansol",
    "Raghunathganj",
    "Kharagpur",
    "Naihati",
    "English Bazar",
    "Baharampur",
    "Hugli-Chinsurah",
    "Raiganj",
    "Jalpaiguri",
    "Santipur",
    "Balurghat",
    "Medinipur",
    "Habra",
    "Ranaghat",
    "Bankura",
    "Nabadwip",
    "Darjiling",
    "Purulia",
    "Arambagh",
    "Tamluk",
    "AlipurdUrban Agglomerationr",
    "Suri",
    "Jhargram",
    "Gangarampur",
    "Rampurhat",
    "Kalimpong",
    "Sainthia",
    "Taki",
    "Murshidabad",
    "Memari",
    "Paschim Punropara",
    "Tarakeswar",
    "Sonamukhi",
    "PandUrban Agglomeration",
    "Mainaguri",
    "Malda",
    "Panchla",
    "Raghunathpur",
    "Mathabhanga",
    "Monoharpur",
    "Srirampore",
    "Adra",
  ],
};

export const uploadDataZone = async (req, res) => {
  try {
    for (const [zoneName, cities] of Object.entries(cityData)) {
      // Create a new document for each zone
      const newZone = new zonesModel({
        name: zoneName,
        cities: cities, // Cities is directly assigned as an array
        status: "true", // Status can be set to any value you want
      });

      // Save the document to MongoDB
      await newZone.save();
    }

    console.log("Data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading data:", error);
  }
};

// Controller to delete all entries in zonesModel
export const deleteAllZones = async (req, res) => {
  try {
    // Delete all documents from the collection
    await zonesModel.deleteMany({});

    console.log("All entries in the zonesModel collection have been deleted.");
    res.status(200).send({ message: "All entries deleted successfully!" });
  } catch (error) {
    console.error("Error deleting all entries:", error);
    res.status(500).send({ error: "Failed to delete all entries." });
  }
};


export const AuthUserByID = async (req, res) => {
  try {
    const { id } = req.body;

    const existingUser = await userModel.findById(id);

    if (existingUser) {

      return res.status(200).json({
        success: true,
        message: "login sucesssfully",
        existingUser: {
          _id: existingUser._id,
          username: existingUser.username,
          phone: existingUser.phone,
          email: existingUser.email,
          type: existingUser.type,
          state: existingUser.state,
          statename: existingUser.statename,
          city: existingUser.city,
          address: existingUser.address,
          verified: existingUser.verified,
          pincode: existingUser.pincode,
          DOB: existingUser.DOB,
          about: existingUser.about,
          department: existingUser.department,
          Doc1: existingUser.Doc1,
          Doc2: existingUser.Doc2,
          Doc3: existingUser.Doc3,
          profile: existingUser.profile,
          aadharno: existingUser.aadharno,
          pHealthHistory: existingUser.pHealthHistory,
          cHealthStatus: existingUser.cHealthStatus,
          coverage: existingUser.coverage,
          wallet : existingUser.wallet || 0,
        },
      });

    } else {
      return res.status(401).send({
        success: false,
        message: "user Not found",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `error on Auth ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const updateProfileUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phone, state, email, pincode, address, password } =
      req.body;

    if (!password) {
      if (!username || !email || !pincode || !address || !state) {
        return res.status(400).json({
          success: false,
          message: "Please fill all fields",
        });
      }

      let updateFields = {
        username,
        email,
        pincode,
        address,
        state,
      };

      await userModel.findByIdAndUpdate(id, updateFields, {
        new: true,
      });

      return res.status(200).json({
        message: "Profile Updated!",
        success: true,
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      let updateFields = {
        password: hashedPassword,
      };

      const user = await userModel.findByIdAndUpdate(id, updateFields, {
        new: true,
      });

      return res.status(200).json({
        message: "Password Updated!",
        success: true,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const updateDetailsUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      address,
      email,
      pincode,
      password,
      gender,
      state,
      statename,
      city,
      confirm_password,
      about,
    } = req.body;

    let updateFields = {
      username,
      address,
      gender,
      state,
      statename,
      city,
      about,
      email,
      pincode,
    };

    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const updateDetailsUserHealth = async (req, res) => {

  try {
    const { id } = req.params;
    const {
      username,
      aadharno,
      DOB,
      pHealthHistory,
      cHealthStatus,
    } = req.body;
    console.log('aadharno', aadharno)
    const profileImg = req.files ? req.files.profile : undefined;

    let updateFields = {
      username,
      aadharno,
      DOB,
      pHealthHistory,
      cHealthStatus,
    };

    if (profileImg && profileImg[0]) {
      updateFields.profile = profileImg[0].path; // Assumes profile[0] is the uploaded file
    }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const contactEnquire = async (req, res) => {
  const { name, email, message } = req.body;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD, // Update with your email password
    },
  });

  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: process.env.MAIL_TO_ADDRESS, // Update with your email address
    subject: "New Contact Us Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
};

export const getProductsByHSN = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await productModel
      .find({ hsn: id })
      .select("variations")
      .exec();
    if (!products) {
      return res.status(401).send({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product found",
      products,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on Auth ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const getProductsByFilterUser = async (req, res) => {
  try {
    const { title, value, hsn } = req.query; // Destructure title, value, and hsn

    // Construct the filter object
    const filter = {};
    if (title && value) {
      filter[`variations.${title}.0.${title}`] = value;
    }
    if (hsn) {
      filter.hsn = hsn;
    }

    // Find products based on the filter
    const products = await productModel.find(filter);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// for cancel order

export const cancelOrderUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, reason } = req.body;

    let updateFields = {
      status: "0",
      comment,
      reason,
    };

    await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Order Cancel!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};



export const getAllPlanCategoryController = async (req, res) => {
  try {
    const plan = await planCategoryModel.find({});
    if (!plan) {
      return res.status(200).send({
        message: "NO plan Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All plan List ",
      planCount: plan.length,
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting plan ${error}`,
      success: false,
      error,
    });
  }
};



// all plan & buy plan

export const getAllPlanUser = async (req, res) => {
  const { id } = req.params;

  try {

    const lastBuy = await buyPlanModel.findOne({ userId: id }).sort({ _id: -1 }).limit(1).populate('planId');
    const User = await userModel.findById(id);
    let Local;
    if (!User.state) {
      return res.status(200).send({ // Send 500 Internal Server Error response
        message: `Error`,
        success: false,
        state: false,
        plan: []
      });
    } else {
      const State = await zonesModel.findById(User.state);
      if (State.primary === 'true') {
        Local = 1;
      } else {
        Local = 0;
      }
    }


    const plan = await planModel
      .find({}).populate('Category').lean(); // Convert documents to plain JavaScript objects

    if (!plan || plan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }


    const planDetails = lastBuy?.planId;
    const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
    const purchaseDate = lastBuy?.createdAt; // Date when the plan was purchased

    // Calculate validTill date by adding validity days to the purchase date
    const validTill = new Date(purchaseDate);
    validTill.setDate(validTill.getDate() + planValidityInDays);

    // Calculate days left
    const currentDate = new Date();
    const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days



    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      success: true,
      plan, // Return users array
      lastBuy: { ...lastBuy?.toObject(), daysLeft }, // Spread lastBuy object and add daysLeft  
      Local
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const BuyPlanUser = async (req, res) => {

  try {
    const { totalAmount, planId, userId, Local } = req.body;

    if (!userId) {
      return res.status(500).send({ // Send successful response
        message: req.body,
        success: false,
      });
    }

    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId;

    if (lastLead) {
      if (lastLead.paymentId === undefined) {
        paymentId = 1;
      } else {
        // Convert lastOrder.orderId to a number before adding 1
        const lastOrderId = parseInt(lastLead.paymentId);
        paymentId = lastOrderId + 1;
      }
    } else {
      paymentId = 1;
    }


    // Create a new buy plan record
    const newBuyPlan = new buyPlanModel({
      userId,
      planId,
      totalAmount,
      paymentId,
      note: 'payment succesfully added',
      payment: 1,  // Assuming payment is the same as totalAmount initially, but could be adjusted as needed
      Local,  // You can modify this based on your actual requirements
    });
    await newBuyPlan.save();

    if (!newBuyPlan || newBuyPlan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      success: true,
      newBuyPlan, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const getAllVendor = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const state = req.query.state || ""; // Get search term from the query parameters
    const city = req.query.city || ""; // Get search term from the query parameters
    const department = req.query.department || ""; // Get search term from the query parameters

    // Get startDate and endDate from query parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // console.log(startDate, endDate)
    const skip = (page - 1) * limit;

    const query = {};


    if (state.length > 0) {
      query.state = { $in: state }; // Use $in operator to match any of the values in the array
    }
    if (city.length > 0) {
      query.city = { $in: city }; // Use $in operator to match any of the values in the array
    }
    if (department.length > 0) {
      query.department = { $in: department }; // Use $in operator to match any of the values in the array
    }

    query.type = { $in: 1 }; // Use $in operator to match any of the values in the array
    // query.verified = { $in: 1 };  

    // Add date range filtering to the query
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      query.createdAt = { $lte: endDate };
    }

    const totalUser = await userModel.countDocuments(query); // Count total documents matching the query

    const users = await userModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!users || users.length === 0) {
      // Check if no users found
      return res.status(401).send({
        // Send 404 Not Found response
        message: "No users found",
        success: false,
      });
    }

    return res.status(200).send({
      // Send successful response
      message: "All user list",
      userCount: users.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      users: users, // Return users array
    });
  } catch (error) {
    return res.status(500).send({
      // Send 500 Internal Server Error response
      message: `Error while getting users: ${error.message}`,
      success: false,
      error,
    });
  }
};



export const getAllDepartment = async (req, res) => {
  try {
    const Department = await departmentsModel.find({}).lean();
    if (!Department) {
      return res.status(200).send({
        message: "NO Department Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Department List ",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Department ${error}`,
      success: false,
      error,
    });
  }
};


export const ViewAllZonesDepartment = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({ status: "true" });
    const Department = await departmentsModel.find({}).lean();

    res.status(200).json({ success: true, Zones, Department });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const ViewAllZonesCategory = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({ status: "true" });
    const Categories = await categoryModel.find({}).lean();

    res.status(200).json({ success: true, Zones, Categories });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { slug } = req.params;
    const Mpage = await userModel.findOne({ _id: slug, type: 1 });
    if (!Mpage) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch user Page!",
      success: true,
      Mpage,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Page: ${error}`,
      success: false,
      error,
    });
  }
};

export const getAllPdlanUser = async (req, res) => {
  const { id } = req.params;

  try {

    const lastBuy = await buyPlanModel.findOne({ userId: id }).sort({ _id: -1 }).limit(1).populate('planId');

    const plan = await planModel
      .find({}).lean(); // Convert documents to plain JavaScript objects

    if (!plan || plan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }


    const planDetails = lastBuy?.planId;
    const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
    const purchaseDate = lastBuy?.createdAt; // Date when the plan was purchased

    // Calculate validTill date by adding validity days to the purchase date
    const validTill = new Date(purchaseDate);
    validTill.setDate(validTill.getDate() + planValidityInDays);

    // Calculate days left
    const currentDate = new Date();
    const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days



    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      success: true,
      plan, // Return users array
      lastBuy: { ...lastBuy?.toObject(), daysLeft }, // Spread lastBuy object and add daysLeft      
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};



export const HomeSendvendorEnquire = async (req, res) => {


  const { fullname, email, phone, service, QTY, userId, senderId,
    userEmail, requirement,userPhone } = req.body;

  if (!senderId || !userId) {
    return res.status(500).json({
      success: false,
      message: "user Not found",
    });
  }
  const lastBuy = await buyPlanModel.findOne({ userId: senderId }).sort({ _id: -1 }).limit(1).populate('planId').populate('userId');

  try {

    if (lastBuy) {
      const planDetails = lastBuy?.planId;
      const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
      const purchaseDate = lastBuy?.createdAt; // Date when the plan was purchased

      // Calculate validTill date by adding validity days to the purchase date
      const validTill = new Date(purchaseDate);
      validTill.setDate(validTill.getDate() + planValidityInDays);

      // Calculate days left
      const currentDate = new Date();
      const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days
      if (daysLeft > 0) {

      } else {
        return res.status(200).json({
          success: false,
          message: "Sorry your plan has expired",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        message: "Sorry, you don't have any plans.",
      });
    }


    // Save data to the database
    const newEnquire = new enquireModel({
      fullname,
      email,
      phone,
      service,
      QTY,
      userId,
      userEmail,
      type: 1,
      senderId,
      requirement
    });

    await newEnquire.save();

           // Create the notification data object with dynamic values
const notificationData = {
  mobile: `91${userPhone}`,  // Replace with dynamic value if needed
  templateid: "1193466729031008", // Template ID
  overridebot: "yes", // Optional: Set to "yes" or "no"
  template: {
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: fullname || "NA" },  
          { type: "text", text: phone || "NA" },  
          { type: "text", text: email || "NA" }, 
          { type: "text", text: service || "NA" }, 
          { type: "text", text: QTY || "NA" }  
        ]
      }
    ]
  }
};
  
   const WHATSAPP =   await axios.post(process.env.WHATSAPPAPI, notificationData, {
        headers: {
          "API-KEY": process.env.WHATSAPPKEY,
          "Content-Type": "application/json"
        }
      });
       console.log('WHATSAPP',WHATSAPP);
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      },
    });

    const recipients = userEmail
      ? `${userEmail}, ${process.env.MAIL_TO_ADDRESS}`
      : process.env.MAIL_TO_ADDRESS;

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: recipients, // Update with your email address
      subject: "New Enquire Form Submission",
      text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nQTY:${QTY}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Failed to send email");
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          success: true,
          message: "Email sent successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error in send data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const ApplyEnquireStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    if (!userId) {
      return res.status(400).send({
        message: "userId is required",
        success: false,
      });
    }

    const skip = (page - 1) * limit;

    const query = {
      senderId: userId, // Filter by senderId matching userId
    };

    // If there's a search term, you can apply it to a specific field in the enquire model (like 'title' or 'content')
    if (searchTerm) {
      query.$text = { $search: searchTerm }; // Assuming your model has text indexes for search
    }

    const total = await enquireModel.countDocuments(query); // Count only the documents matching the query

    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username and address only
      .populate('senderId', 'username email phone address') // Populate senderId with username and address only
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquires found for the given user.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Enquire list retrieved successfully",
      EnquireCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      Enquire,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error}`,
      success: false,
      error,
    });
  }
};


export const AllPayment = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await buyPlanModel.find({ userId: userId }).lean();

    return res.status(200).send({
      success: true,
      message: "payments fetched successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error payments fetched: ${error}`,
      success: false,
      error,
    });
  }
};


const generateUserInvoicePDF = async (invoiceData) => {
  // console.log(invoiceData);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const gstRate = 0.18;

  const totalWithGST = invoiceData.totalAmount;
  const amountWithoutGST = totalWithGST / (1 + gstRate);

  const CSGT = invoiceData.totalAmount - amountWithoutGST.toFixed(2);

  const TotalLocal = CSGT / 2;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Define the HTML content
  const htmlContent = `
    <div class="invoice">
      <div class="invoice-header">
        <div class="invoice-header-left">
          <img 
          src="data:image/jpeg;base64,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NHpa9XGmbUUVCaiJ3M5kjD7eC2S/aAr4rbazbqTlZ2Q7lU1hAw7nzxPHiSM9wK3G+6Ud8p567hnDK7Ywdr6/ldP16Gdq9qloiBFNS1FQ7oyAwHx8/mWsXXaZeq9ro6RsdDGelnZP8p9gWs3C2VlqnEFdDyMuM7m+0kDu4JwvKq08m3s+h3MXguBFKcVzfr1/6OyeaWpldNPK+WR3xnvcXE+MrrRFVO4oqC0gsjZLHW3+uFJRszji+Q/FjHWfuWW01oe4357ZpWmlo+B5V44vH6I9vN31LNos1DY6JtJQwhjB8Z35Tz1k9JVynGlPrLojzvFOOV46ddPWf9kdNgsFJp+3Clpm5cTvSyEdlI7rKyqIuqkktI8DZZKyTnN7bOURFJgEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAFwuUQGuX7RNovpMskXuepP++h4E98cx8aj+77Ob5bi51LG2vhH5UR3XeNp9hKmNcLROiE+6OricXysXpGW17MrpPBPTScnUQSQvH5MjS0+Qr4ViKijpquMx1MEczDztewOB8qwlRoTTVScutrIz/wAp7meYHCqSwn6M9DT8UQ/8sH/sRpoepdR30VMlaaSjhYX1JLsNcOgY6ST4+dbpLrmhv9HW2+iqJKGqc0imlkO6JDjoPQT5eK7pdl9ie7LJKqMdQkB9IK+G7LbI1wJmq3DqMgHoC2wrthHlRRyszh2Ta7ZbT6a6e3v7kTyb7pXmRznPLjvF3PnpyuY43yyNjjY573HAa0ZJ7wU0U+z7TVMd73v5R3XJI5w8hOFmaO2UNvbu0dJBTt6o4w30LUsOT7svT+Jaox1VBv8AXp+5EFp0FfroWufSmjhPO+o7E/u8632xbPLTad2WpzXVA/Llb2LT3G/flbaitQx64ehwcvjWXk9HLS9kcAAc3BcoisHHOUXC5QBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREB//Z" 
          alt="Company Logo" width="250">
          
          <p>WZ 10C, A-2 Block, Asalatpur Near Mata Chanan Devi Hospital, Janakpuri, New Delhi, 110058</p>
          <p>Email: info@ynbhealthcare.com</p>
          <p>Phone: +91 8100188188</p>
        </div>
        <div class="invoice-header-right">
          <h2>Invoice</h2>
          <p   >Invoice Number: #${invoiceData?.paymentId}</p>
          <p>Date: ${formatDate(invoiceData?.createdAt)}     </p>
           <p>Full Name: ${invoiceData.userId?.username}</p>
            <p>Email Id: ${invoiceData.userId?.email}</p>
            <p>Phone No.: ${invoiceData.userId?.phone}</p>

          <p style=" color:${(() => {
      if (invoiceData.payment === 0) {
        return "orange";
      } else if (invoiceData.payment === 1) {
        return "green";
      } else if (invoiceData.payment === 2) {
        return "red";
      }
    })()}"
          > Payment Status : 
          ${(() => {
      if (invoiceData.payment === 0) {
        return "Pending";
      } else if (invoiceData.payment === 1) {
        return "Success";
      } else if (invoiceData.payment === 2) {
        return "failed";
      }
    })()}
          
         </p> 
                         
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr >
            <th >Item</th>
           
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
 
            <tr>
              <td> ${invoiceData.planId?.name}</td>
             
              <td> ₹${parseFloat(amountWithoutGST.toFixed(2))}</td>
            </tr>
          
            
        </tbody>
      </table>

      <div class="invoice-total">
        <p>Subtotal: ₹${parseFloat(amountWithoutGST.toFixed(2))}</p>
        ${(() => {
      if (invoiceData.Local === 1) {
        return `<p>
                CGST:  ₹${parseFloat(TotalLocal.toFixed(2))}
              </p><p>
                SGST:  ₹${parseFloat(TotalLocal.toFixed(2))}
              </p>`;
      } else if (invoiceData.Local === 0) {
        return `<p>
IGST: ₹${(parseFloat(invoiceData?.totalAmount.toFixed(2)) - parseFloat(amountWithoutGST.toFixed(2))).toFixed(2)}
          </p>`;
      }
    })()}
        <p>Total: ₹${invoiceData?.totalAmount.toFixed(2)}</p>
      </div>

      <div class="invoice-footer">
        <div class="text-center mt-3">
          <p>Thank you for your support</p>
        </div>
      </div>
    </div>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      h2 {
        font-weight: 800;
      }
      .invoice {
        width: 95%;
        margin: 10px auto;
        padding: 20px;
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .invoice-header-left {
        flex: 1;
      }
      .invoice-header-right {
        flex: 1;
        text-align: right;
      }
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10%;
      }
      .invoice-table th,
      .invoice-table td {
        border: 1px solid #000;
        padding: 10px;
        text-align: center;
      }
      .invoice-table th {
      
        color:green;
    
      }
      .invoice-total {
        float: right;
      }
    </style>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return pdfBuffer;
};

export const downloadUserInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body; // Assuming invoiceData is sent in the request body
    if (!invoiceId) {
      return res.status(400).send("Invoice ID is required");
    }
    // Fetch invoice data from the database
    const invoiceData = await buyPlanModel
      .findById(invoiceId)
      .populate("userId")
      .populate("planId");

    const pdfBuffer = await generateUserInvoicePDF(invoiceData);

    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    await execPromise("npx puppeteer browsers install chrome");

    console.error("Error generating invoice PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const checkUserPlan = async (req, res) => {
  const { userId } = req.params;

  try {
    // Ensure that userId is in correct format (ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    // Retrieve the most recent plan purchase for the user
    const lastBuy = await buyPlanModel
      .findOne({ userId })
      .sort({ _id: -1 })
      .limit(1)
      .populate('planId');  // Ensure that 'planId' is populated with the plan details

    if (lastBuy) {
      const planDetails = lastBuy?.planId;
      const planValidityInDays = planDetails?.validity; // Ensure validity exists
      const purchaseDate = new Date(lastBuy?.createdAt); // Convert to Date object

      // Check if planValidityInDays is a valid number
      if (isNaN(planValidityInDays) || planValidityInDays <= 0) {
        return res.status(500).json({
          success: false,
          message: "Invalid plan validity period",
        });
      }

      // Calculate the validTill date
      const validTill = new Date(purchaseDate);
      validTill.setDate(validTill.getDate() + planValidityInDays);

      // Calculate the number of days left
      const currentDate = new Date();
      const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days

      if (daysLeft > 0) {
        return res.status(200).json({
          success: true,
          message: `Your plan is active. ${daysLeft} day(s) remaining.`,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "Sorry, your plan has expired.",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        message: "Sorry, you don't have any plans.",
      });
    }
  } catch (error) {
    console.error(`Error getting plan: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Error getting plan: ${error.message}`,
      error,
    });
  }
};

export const GetAllUser = async (req, res) => { 
  try {
    // Extract the category (which can be an array of ObjectIds), type, and coordinates from query parameters
   
    const users = await userModel.find(); // Missing 'await' in your original code
 
    return res.status(200).send({
      message: 'All User List',
       success: true,
      users
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching user: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const GetPlanUser = async (req, res) => {


  try {
    const plan = await planModel.find({}).populate('Category').lean();
    return res.status(200).send({
      success: true,
      message: "All plans",
      plan,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error plan fetched: ${error}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanAddUser_old = async (req, res) => {

  try {
    const {
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      planId,
      totalAmount
    } = req.body;



    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate the auto-increment ID
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId;

    if (lastUser) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastUserId = parseInt(lastUser.userId || 1);
      userId = lastUserId + 1;
    } else {
      userId = 1;
    }

    const newUser = new userModel({
      type: 2,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      userId
    });

    await newUser.save();

    let Local;
    if (!newUser.state) {
      Local = 0;
    } else {
      const State = await zonesModel.findById(newUser.state);
      if (State && State.primary === 'true') {
        Local = 1;
      } else {
        Local = 0;
      }
    }



    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId;


    if (lastLead) {
      if (lastLead.paymentId === undefined) {
        paymentId = 1;
      } else {
        // Convert lastOrder.orderId to a number before adding 1
        const lastOrderId = parseInt(lastLead.paymentId);
        paymentId = lastOrderId + 1;
      }
    } else {
      paymentId = 1;
    }

    // Create a new buy plan record
    const newBuyPlan = new buyPlanModel({
      userId: newUser._id,
      planId,
      totalAmount,
      paymentId,
      note: 'payment succesfully added',
      payment: 1,  // Assuming payment is the same as totalAmount initially, but could be adjusted as needed
      Local,  // You can modify this based on your actual requirements
    });

  

    await newBuyPlan.save();

 
    res.status(201).json({
      success: true,
      user: newUser,
      message: "User signed up successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup ${error}`,
      success: false,
      error,
    });
  }



}


// const instance = new razorpay({
//   key_id: process.env.LIVEKEY,
//   key_secret: process.env.LIVESECRET,
// });
// Wallet functionality



export const ApiGetKey = async (req, res) => {
  return res
    .status(200)
    .json({ key: encrypt(process.env.LIVEKEY, process.env.APIKEY) });
};


export const paymentVerification_old = async (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedsgnature = crypto
    .createHmac("sha256", process.env.LIVESECRET)
    .update(body.toString())
    .digest("hex");
  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    const payment = await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true } // This option returns the updated document
    );

    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    console.log("razorpay_signature", payment, req.body);

    res.redirect(
      `${process.env.LIVEWEB}paymentsuccess?reference=${razorpay_payment_id}`
    );

  } else {
    await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2,
      },
      { new: true } // This option returns the updated document
    );

    res.status(400).json({ success: false });
  }
};

export const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.LIVESECRET)
    .update(body.toString())
    .digest("hex");
  const isAuth = expectedSignature === razorpay_signature;

  if (isAuth) {
    // Update payment status in the database
    const payment = await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true }
    );

    if (payment) {
      // Populate userId to fetch the email
      const user = await payment.populate('userId'); // Assuming userId is populated

      if (user) {

           // Send notification
           const notificationData = {
            mobile: `91${user.phone}`,
            templateid: "947805560855158",
            overridebot: "yes",
            template: {
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: user.username },
                    { type: "text", text: `https://ynbhealthcare.com/card-view/${payment._id}` }
                  ]
                }
              ]
            }
          };
  
     await axios.post(process.env.WHATSAPPAPI, notificationData, {
        headers: {
          "API-KEY": process.env.WHATSAPPKEY,
          "Content-Type": "application/json"
        }
      });

      

        const userEmail = user.email;

        // Send payment ID to the user's email using nodemailer
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST, // Your SMTP host
          port: process.env.MAIL_PORT, // Your SMTP port
          secure: process.env.MAIL_ENCRYPTION === 'true', // If using SSL/TLS
          auth: {
            user: process.env.MAIL_USERNAME, // Your email address
            pass: process.env.MAIL_PASSWORD, // Your email password
          },
        });

        const mailOptions = {
          from: process.env.MAIL_FROM_ADDRESS, // Your email address
          to: userEmail, // User's email
          subject: "Payment Successful - Your Payment ID",
          text: `Hello, \n\nYour payment has been successfully processed. Your payment ID is: ${razorpay_payment_id}. \n\nThank you for choosing us!`,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            res.status(500).send("Failed to send email");
          } else {
            console.log("Payment ID sent to user email: " + info.response);
          }
        });
      } else {
        console.error("User not found for payment ID:", razorpay_order_id);
      }

      res.redirect(
        `${process.env.LIVEWEB}paymentsuccess?reference=${razorpay_payment_id}`
      );
    } else {
      res.status(404).send("Payment not found");
    }
  } else {
    // Update payment status as failed
    await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2, // Assuming 2 indicates failed payment
      },
      { new: true }
    );

    res.status(400).json({ success: false });
  }
};



const generateHash = (data, salt) => {
  // Concatenate the parameters in the correct order
  const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}||||||${salt}`;

  // Log the concatenated string for debugging
  console.log("Concatenated Hash String: ", hashString);

  // Generate SHA512 hash using CryptoJS
  const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);  // Output hash as a hexadecimal string

  // Log the generated hash to verify
  console.log("Generated Hash: ", hash);

  return hash;
};

// Function to create the sha512 hash
export const sha512 = (str) => {
  return CryptoJS.SHA512(str).toString(CryptoJS.enc.Hex);  // Generate and return the hash as a hex string
}



export const PayuHash = (amount, firstName, email, phone, transactionId) => {

  // Prepare data for the PayU request
  const data = {
    key: process.env.MERCHANTKEY,
    txnid: transactionId,                   // Unique Transaction ID
    amount: amount,                         // Amount to be paid
    productinfo: 'Buy Plan',                // Product info
    firstname: firstName,                   // Customer's First Name
    email: email,                           // Customer's Email
    phone: phone,                           // Customer's Phone Number
    surl: process.env.SUCCESSURL,                       // Success URL
    furl: process.env.FAILURL,
    udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', // Optional fields
  };

  // Generate the correct hash
  const hash = generateHash(data, process.env.MERCHANSALT);

  // Add the generated hash to the data object
  data.hash = hash;

  // Log the data to verify
  console.log('Generated Data:', data);

  return data;  // Return the generated data with hash for payment
};


export const BuyPlanByUser = async (req, res) => {
  try {

    const {
      UserData,
      planId,
      totalAmount,
    } = req.body;

    const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentData = PayuHash(totalAmount, UserData.username, UserData.email, UserData.phone, transactionId);

    // Determine 'Local' based on the state
    let Local = 0;
    if (UserData.state) {
      const State = await zonesModel.findById(UserData.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: UserData._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 0, // Placeholder for actual payment value
      Local,
      razorpay_order_id: transactionId
    });

    await newBuyPlan.save();

    res.status(200).json({
      success: true,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "plan buy sucessfully.",
      paymentData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanByUserFree = async (req, res) => {
  try {

    const {
      UserData,
      planId,
      totalAmount,
    } = req.body;

    const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentData = PayuHash(totalAmount, UserData.username, UserData.email, UserData.phone, transactionId);

    // Determine 'Local' based on the state
    let Local = 0;
    if (UserData.state) {
      const State = await zonesModel.findById(UserData.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: UserData._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 1, // Placeholder for actual payment value
      Local,
      razorpay_order_id: transactionId
    });

    await newBuyPlan.save();

    res.status(200).json({
      success: true,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "plan buy sucessfully.",
      paymentData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanAddUser = async (req, res) => {
  console.log(req.body);

  try {
    const {
       
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      planId,
      totalAmount,
      pHealthHistory,
      cHealthStatus,
      aadharno,finalAmount
     } = req.body;

     const tttt = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" , tttt});
    }
    const profileImg = req.files ? req.files.profile : undefined;


    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists by email or phone
    const existingUser = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
    }

    // Calculate the auto-increment ID for userId
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId = 1;
    if (lastUser) {
      userId = parseInt(lastUser.userId || 1) + 1;
    }


    const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentData = PayuHash(totalAmount, username, email, phone, transactionId);
	 
    let updateField = {
      type: 2,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      userId,
    };
    if (profileImg && profileImg[0]) {
      updateField.profile = profileImg[0].path; // Assumes profile[0] is the uploaded file
    }

    const newUser = new userModel(updateField);

    	 

    await newUser.save();

    // Determine 'Local' based on the state
    let Local = 0;
    if (newUser.state) {
      const State = await zonesModel.findById(newUser.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: newUser._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 0, // Placeholder for actual payment value
      Local,
      razorpay_order_id: transactionId
    });

    await newBuyPlan.save();

    res.status(201).json({
      success: true,
      user: newUser,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "User signed up successfully and plan added.",
      paymentData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const PaymentSuccess = async (req, res) => {
  // Extract the PayU response params sent to successUrl
  const { txnid, status } = req.body;

  if (status === 'success') {
    // Update the payment status if the transaction exists, or create a new one
    const updatedTransaction = await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: txnid }, // Find the transaction by txnid
      {
        $set: {
          payment: 1, // Payment successful
        },
      },
      { new: true, upsert: true } // `new: true` returns the updated document, `upsert: true` creates a new document if not found
    ).populate('userId'); // Assuming 'user' is the reference field to the user model
    

        // Send notification
        const notificationData = {
          mobile: `91${updatedTransaction?.userId.phone}`,
          templateid: "947805560855158",
          overridebot: "yes",
          template: {
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: updatedTransaction?.userId.username },
                  { type: "text", text: `https://ynbhealthcare.com/card-view/${updatedTransaction._id}` }
                ]
              }
            ]
          }
        };

   await axios.post(process.env.WHATSAPPAPI, notificationData, {
      headers: {
        "API-KEY": process.env.WHATSAPPKEY,
        "Content-Type": "application/json"
      }
    });



    if (!updatedTransaction) {
      res.redirect(process.env.RFAILURL);
    }
    res.redirect(`${process.env.RSUCCESSURL}/${txnid}`);

  } else {
    res.redirect(process.env.RFAILURL);
  }

};

export const PaymentFail = async (req, res) => {
  res.redirect(process.env.RFAILURL);
};

export const userPlanIdController = async (req, res) => {
  try {


    const PlanCat = await buyPlanModel.findById(req.params.id).populate('userId', 'username phone email address').populate('planId')  // Populating user info from the 'userId' field
    const Plan = await planModel.findById(PlanCat.planId)
      .populate('Category')  // This can be removed if Category is not directly in buyPlanModel.

    let PlanValidity;
    if (PlanCat) {
      const planDetails = PlanCat?.planId;
      const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
      const purchaseDate = PlanCat?.createdAt; // Date when the plan was purchased

      // Calculate validTill date by adding validity days to the purchase date
      const validTill = new Date(purchaseDate);
      validTill.setDate(validTill.getDate() + planValidityInDays);

      // Calculate days left
      const currentDate = new Date();
      const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days
      if (daysLeft > 0) {
        PlanValidity = daysLeft;
      } else {
        PlanValidity = 0;
      }
    }

    if (!Plan || !PlanCat) {
      return res.status(200).send({
        message: "Plan Not Found By Id",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Plan Found!",
      success: true,
      Plan,
      PlanCat,
      PlanValidity
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};

export const profileVendorImage = upload.fields([
  { name: "Doc1", maxCount: 1 },
  { name: "Doc2", maxCount: 1 },
  { name: "Doc3", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);

export const updateVendorProfileUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      address,
      email,
      pincode,
      password,
      gender,
      state,
      statename,
      city,
      confirm_password,
      about,
      department, coverage
    } = req.body;
    console.log("Uploaded files:", req.files);

    const olduser = await userModel.findById(id);

    const Doc1 = req.files ? req.files.Doc1 : undefined;
    const Doc2 = req.files ? req.files.Doc2 : undefined;
    const Doc3 = req.files ? req.files.Doc3 : undefined;
    const profileImg = req.files ? req.files.profile : undefined;

    console.log("req.body", req.body, profileImg);

    let updateFields = {
      username,
      address,
      pincode,
      gender,
      state,
      statename,
      city,
      about,
      department,
      coverage
    };

    if(olduser.email !== email){
      // updateFields.email = email;
    }
    
    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    // If the files exist, update the corresponding fields
    if (Doc1 && Doc1[0]) {
      updateFields.Doc1 = Doc1[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (Doc2 && Doc2[0]) {
      updateFields.Doc2 = Doc2[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (Doc3 && Doc3[0]) {
      updateFields.Doc3 = Doc3[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (profileImg && profileImg[0]) {
      updateFields.profile = profileImg[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const getCategoriesWithProducts = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { location =  '' } = req.query;

    // Fetch all categories
    const categories = await categoryModel.find({}).exec();

    // Fetch products for each category, limit to 20 per category, and filter by state and city
    const categoriesWithProducts = await Promise.all(categories.map(async (category) => {
      // Build the query to filter products by category
      const productQuery = [
        {
          $match: {
            Category: category._id,  // Match the category
          }
        },
        {
          $lookup: {
            from: 'users', // Assuming your User model is named 'users'
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          }
        },
        {
          $unwind: '$userDetails', // Unwind the user details array from the lookup
        },
        {
          // $match: {
          //   ...(location && { 
          //     $or: [
          //       { 'userDetails.statename': { $regex: new RegExp(`^${location}$`, 'i') } },
          //       { 'userDetails.city': { $regex: new RegExp(`^${location}$`, 'i') } }
          //     ] 
          //   }),
          // }
          $match: {
            ...(location && {
              'userDetails.coverage': {
                $elemMatch: { $regex: new RegExp(`^${location}$`, 'i') }
              }
            }),
          }
        },
        {
          $limit: 20,  // Limit to 20 products per category
        },
        {
          $project: {
            title: 1,  // Include the required fields from the product
            description: 1,
            pImage: 1,
            userId: 1,
            Category: 1,
            slug: 1,
            features: 1,
            salePrice: 1,
            regularPrice: 1,
            images:1,
            // Add any other fields you need from the product model
          }
        }
      ];

      // Fetch the products using the aggregation pipeline
      const products = await productModel.aggregate(productQuery);

      // Attach products to the category object
      category.products = products;

      // Convert category to a plain JavaScript object to include 'products'
      const categoryObject = category.toObject();

      if (products.length === 0) {
        return null;
      }else{
  // Return the updated category object with products
  return {
    ...categoryObject, // This will include the category fields
    products: category.products, // Explicitly include the products field
  };
      }
    
    }));

        // Filter out categories that have no products (i.e., where products is null)
        const filteredCategories = categoriesWithProducts.filter(category => category !== null);

    // Return response with the categories and their products
    return res.status(200).send({
      message: "Categories and Products fetched successfully",
      success: true,
      categoriesWithProducts:filteredCategories,
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`
    });
  }
}

export const AllUserByDetails = async (req, res) => { 
  try {
    // Extract the category (which can be an array of ObjectIds), type, and coordinates from query parameters
    const { type,filter,phone } = req.query;
 
    // Build the filter object
    const fillter = {};  // Only fetch employees with the type (assuming "employee")

 
    if(type && type !== 'none' ){
      fillter.type = type;
    }
    if(phone && phone !== 'none' ){
      fillter.phone = phone;
    }
    // Build the filter object
   if(filter !== 'none'){
    if(filter === '5' ){
      fillter.empType = 5;
    }
    else if(filter === '4' ){
      fillter.empType = 4;
    }else if(filter === '3'){
      fillter.empType = 3;
    }else if(filter === '2'){
      fillter.empType = 2;
    }else{
      fillter.empType = 5;
    }
  }
  
   
  console.log('fillter',filter)

    //  if (category) {
    //    const categories = Array.isArray(category) ? category : [category];
    //   filter.department = { $in: categories.map(id => new mongoose.Types.ObjectId(id)) };  // Use 'new' to create ObjectIds
    // }

    // Fetch users based on the filter
    const users = await userModel.find(fillter, '_id username email phone gender address');

    if (!users || users.length === 0) {
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }
 

    return res.status(200).send({
      message: 'All User List',
      success: true,
      Users: users,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching employees: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const SenderEnquireStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    if (!userId) {
      return res.status(400).send({
        message: "userId is required",
        success: false,
      });
    }

    const skip = (page - 1) * limit;

    const query = {
      userId: userId, // Filter by senderId matching userId
    };

    if (searchTerm) {
      query.$or = [
        { 'phone': { $regex: searchTerm, $options: 'i' } }, // Case-insensitive regex search for phone
        { 'email': { $regex: searchTerm, $options: 'i' } }, // Case-insensitive regex search for email
        { 'userId.username': { $regex: searchTerm, $options: 'i' } } // Case-insensitive regex search for username
      ];
    }
    const total = await enquireModel.countDocuments(query); // Count only the documents matching the query

    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username and address only
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquires found for the given user.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Enquire list retrieved successfully",
      EnquireCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      Enquire,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error}`,
      success: false,
      error,
    });
  }
};

// Custom waitForTimeout function
const waitForTimeout = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

// Function to minify HTML content manually
const minifyHTML = (html) => {
  return html
    .replace(/\n+/g, '') // Remove newlines
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
    .replace(/>\s+</g, '><'); // Remove spaces between tags
};

export const GetWebsiteData_old = async (req, res) => {
  const Web_page = req.query.web;

  try {
    if (!Web_page) {
      return res.status(200).send('No webpage URL provided.');
    }

    // Launch browser with headless mode and optimized settings
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Navigate to the page and wait until network is idle (all network requests are finished)
    await page.goto(Web_page, {
      waitUntil: 'networkidle0', timeout: 60000
    });

    // Get the HTML content after JavaScript is executed and DOM is fully loaded
    const content = await page.content();

    // // Minify the HTML content
    // const compressedContent = minifyHTML(content);

    // Close the browser after scraping
    await browser.close();

    // Return the compressed HTML content in the response
    return res.status(200).send(content);

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error while getting data</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
};



export const GetWebsiteData = async (req, res) => {
  const Web_page = req.query.web;

  try {
    if (!Web_page) {
      return res.status(200).send('No webpage URL provided.');
    }

    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Navigate to the page and wait for the DOM content to load
    await page.goto(Web_page, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for 2 seconds using waitForTimeout (works in Puppeteer v2.1.0 and later)
    await waitForTimeout(300);  // Wait for 2 seconds

    // Get the HTML content after JavaScript is executed
    const content = await page.content();

    // Close the browser after scraping the content
    await browser.close();

    // Return the wrapped HTML content in the response
    return res.status(200).send(content);

  } catch (error) {
    await execPromise("npx puppeteer browsers install chrome");
    console.error('Error:', error.message);
    return res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error while getting data</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
};

export const UserAllgallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const query = {}; // You can customize this if you want to filter products

    // Get total count for pagination
    const total = await productModel.countDocuments(query);

    // Fetch products with only image and slug fields
    const products = await productModel
      .find(query)
      .select("pImage slug userId") // Only select these fields
        .populate({
        path: 'userId',
        select: 'username phone email', // Populate these fields
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!products || products.length === 0) {
      return res.status(200).send({
        message: "No products found!",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Product gallery fetched successfully!",
      toatalCount: products.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      total,
      products,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting product data: ${error.message || error}`,
      success: false,
      error,
    });
  }
};

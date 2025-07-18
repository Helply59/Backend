import adminModel from "../models/adminModel.js";
import bcrypt from "bcrypt";
import galleryModel from "../models/galleryModel.js";
import blogModel from "../models/blogModel.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import attributeModel from "../models/attributeModel.js";
import tagModel from "../models/tagModel.js";
import homeModel from "../models/homeModel.js";
import homeLayoutModel from "../models/homeLayoutModel.js";
import folderModel from "../models/folderModel.js";
import csv from "csv-parser";
import { stringify } from "csv-stringify";
import csvParser from 'csv-parser';
import pageModel from "../models/pageModel.js";
// image function

import multer from "multer";
import { unlink } from "fs/promises";
import imageSize from "image-size";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

import { dirname } from "path";
import ratingModel from "../models/ratingModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import zonesModel from "../models/zonesModel.js";
import taxModel from "../models/taxModel.js";
import promoModel from "../models/promoModel.js";
import productVarientModel from "../models/productVarientModel.js";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import wishlistModel from "../models/wishlistModel.js";
import compareModel from "../models/compareModel.js";
import enquireModel from "../models/enquireModel.js";
import planCategoryModel from "../models/planCategoryModel.js";
import planModel from "../models/planModel.js";
import departmentsModel from "../models/departmentsModel.js";
import buyPlanModel from "../models/buyPlanModel.js";
import mongoose from 'mongoose';
import geolib from 'geolib';
import transactionModel from "../models/transactionModel.js";

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

export const SignupAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }

    const existingadmin = await adminModel.findOne({ email });
    if (existingadmin) {
      return res.status(401).send({
        success: false,
        message: "admin Already exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // save new admin
    const admin = await new adminModel({ email, password: hashedPassword });
    await admin.save();
    return res.status(201).send({
      success: true,
      message: "admin created sucessfully",
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on signup ${error}`,
      success: false,
      error,
    });
  }
};


export const ForgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please provide an email address",
      });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD,// Update with your email password
      }
    });

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: email, // Update with your email address
      subject: 'Cayro Shop Panel OTP ',
      text: `OTP: ${otp}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send email');
      } else {

        return res.status(200).send({
          success: true,
          message: "OTP sent to your email address",
          otp
        });

      }
    });


  } catch (error) {
    return res.status(500).send({
      message: `Error on forgot password: ${error}`,
      success: false,
      error,
    });
  }
};

export const ChangePassAdmin = async (req, res) => {

  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email, current password, and new password",
      });
    }

    // Find the admin by email
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }


    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(password, 10);


    const newToken = jwt.sign({ email: admin.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Update the admin's password and token with the new values
    admin.password = hashedNewPassword;
    admin.token = newToken;
    await admin.save();

    return res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Error on change password:", error);
    return res.status(500).send({
      message: "Failed to change password",
      success: false,
      error: error.message, // Return error message for debugging
    });
  }


};


export const Adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(200).send({
        success: false,
        message: "email is not registerd",
        admin,
      });
    }
    // password check

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        admin,
      });
    }

    return res.status(200).send({
      success: true,
      message: "login sucesssfully",
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      success: false,
      error,
    });
  }
};

function formatFileSize(bytes) {
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return kilobytes.toFixed(2) + " KB";
  }
  const megabytes = kilobytes / 1024;
  return megabytes.toFixed(2) + " MB";
}

export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const uploadedImage = req.file;
    const imageName = uploadedImage.originalname;
    const filename = uploadedImage.filename;

    const fileSizeFormatted = formatFileSize(uploadedImage.size); // Assuming this function is defined elsewhere
    const dimensions = imageSize(uploadedImage.path); // Assuming this function is defined elsewhere
    const width = dimensions.width;
    const height = dimensions.height;
    const title = imageName.substring(0, imageName.lastIndexOf("."));

    const filePathAndName = `new/${filename}`;

    let newImage;
    if (!req.query.id) { // Check if id is not provided or undefined
      newImage = new galleryModel({
        title: title,
        filePath: filePathAndName,
        fileType: uploadedImage.mimetype,
        fileSize: fileSizeFormatted,
        dimensions: `${width}x${height}`,
      });
    } else {
      newImage = new galleryModel({
        title: title,
        filePath: filePathAndName,
        fileType: uploadedImage.mimetype,
        fileSize: fileSizeFormatted,
        dimensions: `${width}x${height}`,
        folderId: req.query.id, // Use the provided id
      });
    }

    await newImage.save();

    res.status(200).json({ success: true, message: "Image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

};


export const getAllGalleryController = async (req, res) => {
  try {
    const gallery = await galleryModel.find({});
    if (!gallery) {
      return res.status(200).send({
        message: "NO Gallery Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Gallery List ",
      BlogCount: gallery.length,
      success: true,
      gallery,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Gallery ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteGalleryController = async (req, res) => {
  try {
    const image = await galleryModel.findById(req.params.id);

    if (!image) {
      return res.status(404).send({
        success: false,
        message: "Gallery not found",
      });
    }

    // Get the current module's file path
    const __filename = fileURLToPath(import.meta.url);

    // Get the current module's directory name
    const __dirname = dirname(__filename);

    // Construct the file path on the server
    const imagePath = path.join(__dirname, "../public/uploads", image.filePath);

    // Check if the file exists before attempting to delete it
    try {
      await fs.unlink(imagePath); // Delete the file asynchronously
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    // Delete the gallery item from the database
    await galleryModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Gallery Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Gallery",
      error,
    });
  }
};

export const uploadImage = upload.single("image");

export const AddAdminBlogController = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !image ||
      !metaTitle ||
      !metaDescription ||
      !metaKeywords
    ) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // Custom slug generator
    const generateSlug = (text) =>
      text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-'); // Replace multiple - with single -

    const slug = generateSlug(title);

    const newBlog = new blogModel({
      title,
      description,
      image,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
    });

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
      message: "Error While Creating Blog",
      error,
    });
  }
};

export const UpdateAdminBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      image,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !image ||
      !metaTitle ||
      !metaDescription ||
      !metaKeywords
    ) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // Custom slug generator
    const generateSlug = (text) =>
      text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

    const slug = generateSlug(title);

    const updatedBlog = await blogModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        image,
        slug,
        metaTitle,
        metaDescription,
        metaKeywords,
      },
      { new: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).send({
        success: false,
        message: "Blog Not Found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Blog Updated Successfully",
      updatedBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error While Updating Blog",
      error,
    });
  }
};


export const getAllBlogAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { title: regex },
        { slug: regex },
      ];
    }

    const totalUser = await blogModel.countDocuments(query); // Count total documents matching the query

    const Blog = await blogModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Blog || Blog.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Blogs Available",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Blog list",
      Count: Blog.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Blog, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while All Blog: ${error.message}`,
      success: false,
      error,
    });
  }
};



export const AdmindeleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      // .findOneAndDelete(req.params.id)
      .findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message: "Blog Deleted!",
      blog,
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


export const AddAdminCategoryController = async (req, res) => {
  try {
    const {
      title,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status,
      slide_head,
      slide_para,
      specifications, canonical
    } = req.body;

    // Validation
    if (!title || !slug) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // Create a new category with the specified parent
    const newCategory = new categoryModel({
      title,
      slide_head,
      slide_para,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status,
      specifications, canonical
    });
    await newCategory.save();

    return res.status(201).send({
      success: true,
      message: "Category Created!",
      newCategory,
    });
  } catch (error) {
    console.error("Error while creating category:", error);
    return res.status(400).send({
      success: false,
      message: "Error While Creating Category",
      error,
    });
  }
};

export const GetAllCategoriesByParentIdController_new = async (req, res) => {
  try {
    const { parentId } = req.params;
    const perPage = 10; // Default number of results per page

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
      .select("title")
      .lean();

    const queryParameters = req.query; // Extract query parameters

    const filters = { Category: parentId }; // Apply parentId filter

    // Construct filters based on the query parameters (variations)
    Object.keys(queryParameters).forEach((param) => {
      if (param !== "Category") {
        // Split parameter values by comma if present
        const paramValues = queryParameters[param].split(",");

        // Check if there are multiple values for the parameter
        if (paramValues.length > 1) {
          filters[`variations.${param}.${param}`] = { $all: paramValues };
        } else {
          // If only one value, handle it as a single filter
          filters[`variations.${param}.${param}`] = { $in: paramValues };
        }
      }
    });

    // Query products with pagination and apply filters
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations")
      .limit(perPage) // Limit initial results to perPage
      .lean();

    const proLength = products.length;

    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      perPage, // Send perPage value to the frontend
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
      .select("title")
      .select("title")
      .lean();

    const queryParameters = req.query; // Extract query parameters

    const filters = { Category: parentId }; // Apply parentId filter

    // Construct filters based on the query parameters (variations)
    Object.keys(queryParameters).forEach((param) => {
      if (param !== "Category") {
        // Split parameter values by comma if present
        const paramValues = queryParameters[param].split(",");

        // Check if there are multiple values for the parameter
        if (paramValues.length > 1) {
          filters[`variations.${param}.${param}`] = { $all: paramValues };
        } else {
          // If only one value, handle it as a single filter
          filters[`variations.${param}.${param}`] = { $in: paramValues };
        }
      }
    });

    const products = await productModel
      .find(filters)
      .select("_id")
      .select("title")
      .select("regularPrice")
      .select("salePrice")
      .select("pImage")
      .select("variations")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
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
      const { _id, title, image /* other fields */ } = category;

      const categoryData = {
        _id,
        title,
        image,
        subcategories: await getAllCategoriesByParentId(_id), // Recursive call
      };

      result.push(categoryData);
    }

    return result;
  } catch (error) {
    console.error("Error while fetching categories:", error);
    throw error;
  }
};

export const AdmingetAllCategories = async () => {
  try {
    const categories = await categoryModel
      .find({ parent: { $exists: false } })
      .lean();

    return categories;
  } catch (error) {
    console.error("Error while fetching top-level categories:", error);
    throw error;
  }
};

export const getAllcategoryFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { slug: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalCategory = await categoryModel.countDocuments();

    const Category = await categoryModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Category) {
      return res.status(200).send({
        message: "NO category found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All category list ",
      CategoryCount: Category.length,
      currentPage: page,
      totalPages: Math.ceil(totalCategory / limit),
      success: true,
      Category,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting category ${error}`,
      success: false,
      error,
    });
  }
};

export const updateCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      slide_head,
      slide_para,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status, specifications, canonical, icon_image
    } = req.body;

    let updateFields = {
      title,
      slide_head,
      slide_para,
      image,
      slug,
      description,
      metaTitle,
      metaDescription,
      metaKeywords,
      parent,
      status, specifications, canonical, icon_image
    };

    const Category = await categoryModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Category Updated!",
      success: true,
      Category,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Category: ${error}`,
      success: false,
      error,
    });
  }
};

export const getCategoryIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Category = await categoryModel.findById(id);
    if (!Category) {
      return res.status(200).send({
        message: "Category Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Category!",
      success: true,
      Category,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Category: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteCategoryAdmin = async (req, res) => {
  try {
    await categoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Employee Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Employee",
      error,
    });
  }
};

export const AddAdminProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag,
      features,
      specifications, gst, weight, hsn, sku, canonical,userId
    } = req.body;

    // Validation
    if (!title || !slug || !salePrice || !userId || !Category) {
      console.log(userId)
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",

      });
    }

    let updatespecifications;

    if (!specifications || !specifications.specifications || !specifications.specifications[0] || !specifications.specifications[0].heading) {
      updatespecifications = {
        "specifications": [
          {
            "heading": " ",
            "labels": [
              {
                "label": " ",
                "value": " "
              }
            ]
          }
        ]
      };
    } else {
      updatespecifications = specifications;
    }

    const lastProduct = await productModel.findOne().sort({ _id: -1 }).limit(1);

    // Initialize p_id
    let p_id;

    // Check if a last product was found
    if (!lastProduct) {
      p_id = 0; // If no products are found, start with 0
    } else {
      // Convert p_id to a number if it's a string
      const lastProductId = typeof lastProduct.p_id === 'string' ? parseFloat(lastProduct.p_id) : lastProduct.p_id;
      p_id = lastProductId + 1; // Calculate the new p_id
    }

    console.log('p_idp_idp_id', p_id)
    // Create a new category with the specified parent
    const newProduct = new productModel({
      p_id,
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag,
      features,
      specifications: updatespecifications, gst, weight, hsn, sku, canonical,userId
    });


    await newProduct.save();

    return res.status(201).send({
      success: true,
      message: "Product Added Success!",
      newProduct,
    });
  } catch (error) {
    console.error("Error while creating category:", error);
    return res.status(400).send({
      success: false,
      message: "Error While Adding Product",
      error,
    });
  }
};

export const getAllProductFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { slug: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }
    if (userId !== 'null' && userId) {
      query.userId = userId;
    }
    const totalProduct = await productModel.countDocuments();

    const Product = await productModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("userId", "username email type"); // Fixed the comma issue




    if (!Product) {
      return res.status(200).send({
        message: "NO category found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All category list ",
      ProductCount: Product.length,
      currentPage: page,
      totalPages: Math.ceil(totalProduct / limit),
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting category ${error}`,
      success: false,
      error,
    });
  }
};

export const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag, features,
      specifications, weight, gst, hsn, sku, variant_products, type, canonical, testimonials, 
      how_it_works, 
      what_is_included, 
      what_is_excluded, 
      extra_content 
    } = req.body;

    console.log('typp', type);
    console.log('Type of type:', typeof type);
    let updateFields = {
      title,
      description,
      pImage,
      images,
      slug,
      metaDescription,
      metaTitle,
      regularPrice,
      salePrice,
      status,
      stock,
      variations,
      metaKeywords,
      Category,
      tag, features,
      specifications, weight, gst, hsn, sku, variant_products, type, canonical, testimonials,
      how_it_works, 
      what_is_included, 
      what_is_excluded, 
      extra_content
    };

    const Product = await productModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "product Updated!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating product: ${error}`,
      success: false,
      error,
    });
  }
};

export const getProductIdAdmin = async (req, res) => {
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


export const deleteProductAdmin = async (req, res) => {
  try {
    // Find and delete the product
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);

    // If product is successfully deleted
    if (deletedProduct) {
      // Remove corresponding wishlist entries
      await wishlistModel.deleteMany({ productId: req.params.id });

      await compareModel.deleteMany({ productId: req.params.id });

      return res.status(200).send({
        success: true,
        message: "Product deleted!",
      });

    } else {
      // If product doesn't exist
      return res.status(404).send({
        success: false,
        message: "Product not found.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};


export const AddAdminAttributeController = async (req, res) => {
  try {
    const { name, image, type, color, value, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newAttribute = new attributeModel({
      name,
      image,
      type,
      color,
      value,
      status,
    });
    await newAttribute.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Created!",
      newAttribute,
    });
  } catch (error) {
    console.error("Error while creating attribute:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating attribute",
      error,
    });
  }
};

export const getAllAttributeFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalattribute = await attributeModel.countDocuments();

    const Attribute = await attributeModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Attribute) {
      return res.status(200).send({
        message: "NO attribute found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All attribute list ",
      AttributeCount: Attribute.length,
      currentPage: page,
      totalPages: Math.ceil(totalattribute / limit),
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting category ${error}`,
      success: false,
      error,
    });
  }
};

export const updateAttributeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, image, type, color, value, status } = req.body;

    let updateFields = {
      name,
      image,
      type,
      color,
      value,
      status,
    };

    const Attribute = await attributeModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Attribute Updated!",
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating attribute: ${error}`,
      success: false,
      error,
    });
  }
};

export const getAttributeIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Attribute = await attributeModel.findById(id);
    if (!Attribute) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteAttributeAdmin = async (req, res) => {
  try {
    await attributeModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Attribute Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Attribute",
      error,
    });
  }
};

export const getAllAttribute = async (req, res) => {
  try {
    const Attribute = await attributeModel.find({}).lean();
    if (!Attribute) {
      return res.status(200).send({
        message: "NO Attribute Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Attribute List ",
      BlogCount: Attribute.length,
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Blogs ${error}`,
      success: false,
      error,
    });
  }
};

export const AddAdminTagController = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newTag = new tagModel({ name });
    await newTag.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Created!",
      newTag,
    });
  } catch (error) {
    console.error("Error while creating tag:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating tag",
      error,
    });
  }
};

export const getAllTagFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        // { value: { $regex: searchTerm, $options: 'i' } },    // Case-insensitive email search
      ];
    }

    const totalTag = await tagModel.countDocuments();

    const Tag = await tagModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Tag) {
      return res.status(200).send({
        message: "NO tag found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All tag list ",
      TagCount: Tag.length,
      currentPage: page,
      totalPages: Math.ceil(totalTag / limit),
      success: true,
      Tag,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting tag ${error}`,
      success: false,
      error,
    });
  }
};

export const updateTagAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    let updateFields = {
      name,
    };

    const Attribute = await tagModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Tag Updated!",
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating tag: ${error}`,
      success: false,
      error,
    });
  }
};

export const getTagIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Tag = await tagModel.findById(id);
    if (!Tag) {
      return res.status(200).send({
        message: "Tag Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Tag!",
      success: true,
      Tag,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get tag: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteTagAdmin = async (req, res) => {
  try {
    await tagModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Tag Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tag",
      error,
    });
  }
};

export const getAllTag = async (req, res) => {
  try {
    const Tag = await tagModel.find({}).lean();
    if (!Tag) {
      return res.status(200).send({
        message: "NO Tag Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Tag List ",
      BlogCount: Tag.length,
      success: true,
      Tag,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Tag ${error}`,
      success: false,
      error,
    });
  }
};





export const editHomeData = async (req, res) => {
  try {

    const {
      meta_title,
      meta_description,
      meta_head,
      meta_logo,
      meta_favicon,
      header,
      footer,
      contact_details,
      payment_method,
      footer_credit,
      phone,
      email,
      address,
      cash,
      razorpay
    } = req.body;

    console.log(meta_favicon)
    let updateFields = {
      meta_title,
      meta_description,
      meta_head,
      meta_logo,
      meta_favicon,
      header,
      footer,
      contact_details,
      payment_method,
      footer_credit, phone,
      email,
      address,
      cash,
      razorpay
    };

    const homeData = await homeModel.findOneAndUpdate({}, updateFields, {
      new: true,
    });

    if (homeData) {
      return res.status(200).json({
        message: "Home Settings Updated!",
        success: true,
        homeData,
      });
    } else {
      return res.status(404).json({
        message: "Home Settings not found.",
        success: false,
      });
    }

  } catch (error) {
    return res.status(400).json({
      message: `Error while Home Settings updating: ${error}`,
      success: false,
      error,
    });
  }
};



export const editHomeLayoutData = async (req, res) => {
  try {

    const {
      home_slider,
      trending_product,
      trending_product_banner,
      trending_highlights_carousal,
      service_category_carousal,
      service_category_Images,
      service_logos,
      service_banner_images, slider_img, top_bar,
      trending_product_carousal,
      best_selling_laptop,
      collection_heading,
      collection_paragraph,
      collection_url,
      collection_img,
      latest_product,
      latest_product_banner,
      latest_product_carousal,
      best_selling_smartphone,
      recommended_products
    } = req.body;

    console.log('top_bar', top_bar)
    let updateFields = {
      home_slider,
      trending_product,
      trending_product_banner,
      trending_highlights_carousal,
      service_category_carousal,
      service_category_Images,
      service_logos,
      service_banner_images, slider_img, top_bar,
      trending_product_carousal,
      best_selling_laptop,
      collection_heading,
      collection_paragraph,
      collection_url,
      collection_img,
      latest_product,
      latest_product_banner,
      latest_product_carousal,
      best_selling_smartphone,
      recommended_products
    };

    const homeLayoutData = await homeLayoutModel.findOneAndUpdate({}, updateFields, {
      new: true,
    });

    if (homeLayoutData) {
      return res.status(200).json({
        message: "Home Layout Updated!",
        success: true,
        homeLayoutData,
      });
    } else {
      return res.status(404).json({
        message: "Home Layout not found.",
        success: false,
      });
    }

  } catch (error) {
    return res.status(400).json({
      message: `Error while Home Layout updating: ${error}`,
      success: false,
      error,
    });
  }
};

// for reviews

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { userId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { productId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalrating = await ratingModel.countDocuments(query); // Count documents matching the query

    const Rating = await ratingModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        model: userModel,
        select: "username",
      })
      .populate({
        path: "productId",
        model: productModel,
        select: "title",
      })
      .lean();

    if (!Rating || Rating.length === 0) {
      return res.status(200).send({
        message: "No ratings found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All rating list",
      ratingCount: Rating.length,
      currentPage: page,
      totalPages: Math.ceil(totalrating / limit),
      success: true,
      Rating,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting ratings: ${error}`,
      success: false,
      error,
    });
  }
};

// for Enquire 

export const getAllEnquireAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { userId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { productId: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalpage = await enquireModel.countDocuments(query); // Count documents matching the query

    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquire found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Enquire list",
      ratingCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(totalpage / limit),
      success: true,
      Enquire,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire: ${error}`,
      success: false,
      error,
    });
  }
};


export const deleteRatingAdmin = async (req, res) => {
  try {
    await ratingModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Rating Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Rating",
      error,
    });
  }
};




export const editReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    let updateFields = {
      status,
    };

    const rating = await ratingModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Rating Updated!",
      success: true,
      rating,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};

// for order 


export const RejectOrderEmployee = async (req, res) => {
  try {
    const { orderId, userId } = req.body; // Changed to camelCase orderId

    // Validation
    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both orderId & userId",
      });
    }

    // Check if the order exists
    const order = await orderModel.findById(userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order already has a driver assigned
    if (order.CancelId.length !== 0) {
      return res.status(400).json({
        success: false,
        message: "This booking has already been Cancel by another driver",
      });
    }

    // Update the order with the provided driverId
    order.CancelId = driverId;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancel by the driver successfully",
      order,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while cancel booking: ${error}`,
      success: false,
      error,
    });
  }
};


export const EmployeeAcceptOrderController = async (req, res) => {
  const { UserId, OrderId } = req.body;

  console.log('UserId, OrderId',UserId, OrderId)
  if (!UserId || !OrderId) {
    return res
      .status(400)
      .json({ message: "UserId and OrderId are required", success: false });
  }

  try {
    // Find the lead by leadId
    const Order = await orderModel.findById(OrderId);

    if (!Order) {
      return res
        .status(404)
        .json({ message: "Lead not found", success: false });
    }

   // Check if order is already accepted
    if (Order.agentId) {
      if (Order.agentId.toString() === UserId) {
        return res
          .status(400)
          .json({ message: "You have already accepted this order", success: false });
      }

      return res
        .status(400)
        .json({ message: "Order already accepted by another agent", success: false });
    }

    // Assign agent to the order
    Order.agentId = UserId;
    await Order.save();

    // if (Order.count < Order.agentId.length + 1) {
    //   return res.status(400).json({
    //     message: "Cannot add more UserId, limit reached",
    //     success: false,
    //   });
    // }

    // Update user wallet

    // const user = await userModel.findById(BuyId);
    // if (user.status === 2) {
    //   return res.status(400).json({
    //     message: "Account Suspended",
    //     success: false,
    //   });
    // }

  

    // for create trasaction id
 
    // await Promise.all([
    //   lead.save(),
    //   transaction.save(),
    //   user.save(),
    //   buymodel.save(),
    // ]);

    return res.status(200).json({
      message: "Accept Job successfully",
      success: true,
      
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Error occurred during processing: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const getAllOrderAdmin = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const statusFilter = req.query.status ? req.query.status : null; // Get status filter from the query parameters and split into an array
    const employeeId = req.query.employeeId ; // Get search term from the query parameters
    const employee = req.query.employee; // Get search term from the query parameters
    const Referral = req.query.referral; // Get search term from the query parameters
    const job = req.query.job || null; // Get search term from the query parameters
    const statusNoFilter = req.query.nostatus ? req.query.nostatus : null; // Get status filter from the query parameters and split into an array
    const cancelId = req.query.cancelId ? req.query.cancelId : null; // Get status filter from the query parameters and split into an array

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { orderId: regex },
        { mode: regex },
      ];
    }
    // Add status filter to the query if statusFilter is provided
    if (statusFilter) {
      query.status = { $in: statusFilter }; // Use $in operator to match any of the values in the array
    }
 // Add status filter to the query if statusFilter is provided
    if (statusNoFilter) {
      query.status = { $ne: statusNoFilter }; // Use $in operator to match any of the values in the array
    }
    

    if (employeeId.length > 0 && employeeId !== 'null') {
      query.agentId = employeeId; // Use $in operator to match any of the values in the array
    }
    
    if(employee === "true"){
      query.agentId = { $ne: null }; // agentId should not be null
    }
    if(employee === "false"){
      query.agentId = { $in: null }; // agentId should not be null
    }

 if (Referral === 'True') {
  query.Referral = { $nin: null }; // Not null and not empty
} else {
  query.Referral = { $in: null };  // Is null or empty
}

if (job === 'All') {
  query.agentId = { $in: [null, undefined] }; // Matches null or missing
}
if(cancelId){
query.$or = [
    { CancelId: null },
    { CancelId: { $exists: false } }
  ];} 
    const total = await orderModel.countDocuments(query); // Count total documents matching the query

    const Order = await orderModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        model: userModel,
        select: "username",
      }).populate({
        path: "agentId",
        model: userModel,
        select: "username email phone",
      }).populate({
        path: "asignId",
        model: userModel,
        select: "username",
      }).lean();


    if (!Order || Order.length === 0) { // Check if no users found
      return res.status(400).send({ // Send 404 Not Found response
        message: "No Order Found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Order list",
      Count: Order.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      Order, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Order: ${error.message}`,
      success: false,
      error,
    });
  }


};



// export const AdminGetAllEmployee = async (req, res) => {
//   try {
//     // Extract the category from the query parameters
//     const { category } = req.query; 

//     console.log(req.query);
//     // Build the filter object
//     const filter = { type: 1 };
//     if (category) {
//       filter.department = category; // Add category filter only if it exists
//     }

//     // Fetch users based on filter
//     const Users = await userModel.find(filter, '_id username');

//     if (!Users || Users.length === 0) {
//       return res.status(200).send({
//         message: 'No User Found',
//         success: false,
//       });
//     }

//     return res.status(200).send({
//       message: 'All User List',
//       proCount: Users.length,
//       success: true,
//       Users,
//     });

//   } catch (error) {
//     return res.status(500).send({
//       message: `Error while fetching employees: ${error.message}`,
//       success: false,
//       error,
//     });
//   }
// };

export const AdminGetAllEmployee_old = async (req, res) => { 
  try {
    // Extract the category (which can be an array of ObjectIds) from the query parameters
    const { category ,type ,longitude,latitude} = req.query;

    if(!category || !type){
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }
 
    // Build the filter object
    const filter = { type };  // Only fetch employees with type = 1 (assuming "employee")

    // Check if 'category' (which is an array of ObjectIds) is passed
    if (category) {
      // Ensure the category is an array
      const categories = Array.isArray(category) ? category : [category];
      filter.department = { $in: categories.map(id => new mongoose.Types.ObjectId(id)) };  // Use 'new' keyword to create ObjectIds
    }

    // Fetch users based on the filter
    const users = await userModel.find(filter, '_id username department longitude latitude');

    console.log('Users:', users);

    if (!users || users.length === 0) {
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }
    

    return res.status(200).send({
      message: 'All User List',
      proCount: users.length,
      success: true,
      users,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching employees: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const AdminGetAllEmployee_distance = async (req, res) => { 
  try {
    // Extract the category (which can be an array of ObjectIds), type, and coordinates from query parameters
    const { category, type, longitude, latitude } = req.query;

    if (!category || !type || !longitude || !latitude) {
      return res.status(200).send({
        message: 'Missing required parameters.',
        success: false,
      });
    }

    // Build the filter object
    const filter = { type };  // Only fetch employees with the type (assuming "employee")

    // Check if 'category' (which is an array of ObjectIds) is passed
    if (category) {
      // Ensure the category is an array
      const categories = Array.isArray(category) ? category : [category];
      filter.department = { $in: categories.map(id => new mongoose.Types.ObjectId(id)) };  // Use 'new' to create ObjectIds
    }

    // Fetch users based on the filter
    const users = await userModel.find(filter, '_id username department longitude latitude');

    if (!users || users.length === 0) {
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }

    // Convert the users' coordinates and calculate distances
    const usersWithDistances = users.map(user => {
      // Calculate distance using geolib library (in meters)
      const distance = geolib.getDistance(
        { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        { latitude: parseFloat(user.latitude), longitude: parseFloat(user.longitude) }
      );

      // Add the distance in meters and kilometers to the user object
      return {
        ...user.toObject(),  // Convert mongoose document to plain JavaScript object
        distance: {
          meters: distance,
          kilometers: distance / 1000,
        },
      };
    });

    // Sort users by distance (ascending order)
    usersWithDistances.sort((a, b) => a.distance.meters - b.distance.meters);

    return res.status(200).send({
      message: 'All User List',
      proCount: usersWithDistances.length,
      success: true,
      users: usersWithDistances,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching employees: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const AdminGetAllEmployee = async (req, res) => { 
  try {
    // Extract the category (which can be an array of ObjectIds), type, and coordinates from query parameters
    const { category, type, longitude, latitude,empType } = req.query;

    if (!type ) {
      return res.status(200).send({
        message: 'Missing required parameters.',
        success: false,
      });
    }

    // Build the filter object
    const filter = { type,empType };  // Only fetch employees with the type (assuming "employee")

    // Check if 'category' (which is an array of ObjectIds) is passed
    if (category) {
      // Ensure the category is an array
      const categories = Array.isArray(category) ? category : [category];
      filter.department = { $in: categories.map(id => new mongoose.Types.ObjectId(id)) };  // Use 'new' to create ObjectIds
    }

    // Fetch users based on the filter
    const users = await userModel.find(filter, '_id username department longitude latitude');

    if (!users || users.length === 0) {
      return res.status(200).send({
        message: 'No User Found',
        success: false,
      });
    }

 

    return res.status(200).send({
      message: 'All User List',
      proCount: users.length,
      success: true,
      users: users,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while fetching employees: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const editOrderEmployeeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId ,asignId } = req.body;


    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    if(agentId){
      order.agentId = agentId;
    }else if(asignId){
      order.asignId = asignId;
    }

    await order.save();

    // Fetch the updated order to confirm the change
    const updatedOrder = await orderModel.findById(id);
    console.log(`Updated agentId: ${updatedOrder.agentId}`);

    return res.status(200).json({
      message: "Order Updated!",
      success: true,
      updatedOrder,
    });

  } catch (error) {
    console.error(`Error while updating Order: ${error}`);
    return res.status(500).json({
      message: `Error while updating Order: ${error}`,
      success: false,
      error,
    });
  }
};



export const editOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(status);
    
    const order = await orderModel.findById(id).populate('userId'); // Fetch order details including user

    if (!order) {
      return res.status(400).json({
        message: "Order not found",
        success: false,
      });
    }

    console.log('order',order)
    // const user = order.userId[0]; // Assuming there's only one user associated with the order

    // const { email, username, _id } = user; // Extract user email

    let updateFields = {
      status,
    };

    const updatedOrder = await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    // // Configure nodemailer transporter
    // const transporter = nodemailer.createTransport({
    //   // SMTP configuration
    //   host: process.env.MAIL_HOST, // Update with your SMTP host
    //   port: process.env.MAIL_PORT, // Update with your SMTP port
    //   secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    //   auth: {
    //     user: process.env.MAIL_USERNAME, // Update with your email address
    //     pass: process.env.MAIL_PASSWORD, // Update with your email password
    //   }
    // });

    // // Email message
    // const mailOptions = {
    //   from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    //   to: email, // Use the extracted email here
    //   subject: `cayroshop.com Order ${status === '0' ? 'cancel' :
    //     status === '1' ? 'Placed' :
    //       status === '2' ? 'Accepted' :
    //         status === '3' ? 'Packed' :
    //           status === '4' ? 'Shipped' :
    //             status === '5' ? 'Delivered' :
    //               'Unknown'
    //     }`,
    //   html: `
    //       <div class="bg-light w-100 h-100" style="background-color:#f8f9fa!important;width: 90%;font-family:sans-serif;padding:20px;border-radius:10px;padding: 100px 0px;margin: auto;">
    //  <div class="modal d-block" style="
    //     width: 500px;
    //     background: white;
    //     padding: 20px;
    //     margin: auto;
    //     border: 2px solid #8080802e;
    //     border-radius: 10px;
    // ">
    //   <div class="modal-dialog">
    //     <div class="modal-content" style="
    //     text-align: center;
    // ">
    //       <div class="modal-header">
    // <h1 style="color:black;"> Cayro Shop <h1>
    //       </div>
    //       <div class="modal-body text-center">
    //         <h5 style="
    //     margin: 0px;
    //     margin-top: 14px;
    //     font-size: 20px;color:black;
    // "> Order Id : #${order.orderId} </h5>
    //        <p style="color:black;" >Hey ${username},</p>
    //       <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#47ca00" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    //        <h2 style="color:black;"> Your Order Is ${status === '1' ? 'Placed' :
    //       status === '2' ? 'Accepted' :
    //         status === '3' ? 'Packed' :
    //           status === '4' ? 'Shipped' :
    //             status === '5' ? 'Delivered' :
    //               'Unknown'
    //     }! </h2>
         
    //        <p style="color:black;" > We'll send you a shipping confirmation email
    // as soon as your order ${status === '1' ? 'Placed' :
    //       status === '2' ? 'Accepted' :
    //         status === '3' ? 'Packed' :
    //           status === '4' ? 'Shipped' :
    //             status === '5' ? 'Delivered' :
    //               'Unknown'
    //     }. </p>
    //       </div>
    //       <div class="modal-footer">
      
    //         <a href="https://cayroshop.com/account/order/${_id}/${updatedOrder._id}" style="
    //     background: green;
    //     color: white;
    //     padding: 10px;
    //     display: block;
    //     margin: auto;
    //     border-radius: 6px;
    //     text-decoration: none;
    // "> Track Order</a>
    //       </div>
    //     </div>
    //   </div>
    // </div> </div>
    //       `
    // };

    // // Send email
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error(error);
    //     res.status(500).send('Failed to send email');
    //   } else {
    //     return res.status(200).json({
    //       message: "Order Updated!",
    //       success: true,
    //     });
    //   }
    // });
    console.log('updatedOrder',updatedOrder)

    return res.status(200).json({
      message: "Order Updated!",
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

export const editLeadStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(status)
    const order = await orderModel.findById(id).populate('userId').populate('Referral'); // Fetch order details including user

    if (!order) {
      return res.status(400).json({
        message: "Order not found",
        success: false,
      });
    }

    let updateFields;

    if(status === 100){

      const user = await userModel.findById(order.Referral._id); // Fetch order details including user
      const Homedata = await homeModel.findOne(); // Fetch order details including user
             console.log('Homedata',Homedata);
      const shareAmt = Homedata.shareAmt || 0;
                   console.log('shareAmt',shareAmt);

    updateFields = {
      leadStatus: status,
      lead : 1
    };
          console.log('user',user);
      console.log('Referral',order.Referral);

    if (user) {
       

    user.wallet = (user.wallet || 0) + shareAmt;
    await user.save();
    }

    }else{

    updateFields = {
      leadStatus: status,
      lead : 0,
      status: status,
    };

    }

    // const user = order.userId[0]; // Assuming there's only one user associated with the order

    // const { email, username, _id } = user; // Extract user email

    
    const updatedOrder = await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    // // Configure nodemailer transporter
    // const transporter = nodemailer.createTransport({
    //   // SMTP configuration
    //   host: process.env.MAIL_HOST, // Update with your SMTP host
    //   port: process.env.MAIL_PORT, // Update with your SMTP port
    //   secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    //   auth: {
    //     user: process.env.MAIL_USERNAME, // Update with your email address
    //     pass: process.env.MAIL_PASSWORD, // Update with your email password
    //   }
    // });

    // // Email message
    // const mailOptions = {
    //   from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    //   to: email, // Use the extracted email here
    //   subject: `cayroshop.com Order ${status === '0' ? 'cancel' :
    //     status === '1' ? 'Placed' :
    //       status === '2' ? 'Accepted' :
    //         status === '3' ? 'Packed' :
    //           status === '4' ? 'Shipped' :
    //             status === '5' ? 'Delivered' :
    //               'Unknown'
    //     }`,
    //   html: `
    //       <div class="bg-light w-100 h-100" style="background-color:#f8f9fa!important;width: 90%;font-family:sans-serif;padding:20px;border-radius:10px;padding: 100px 0px;margin: auto;">
    //  <div class="modal d-block" style="
    //     width: 500px;
    //     background: white;
    //     padding: 20px;
    //     margin: auto;
    //     border: 2px solid #8080802e;
    //     border-radius: 10px;
    // ">
    //   <div class="modal-dialog">
    //     <div class="modal-content" style="
    //     text-align: center;
    // ">
    //       <div class="modal-header">
    // <h1 style="color:black;"> Cayro Shop <h1>
    //       </div>
    //       <div class="modal-body text-center">
    //         <h5 style="
    //     margin: 0px;
    //     margin-top: 14px;
    //     font-size: 20px;color:black;
    // "> Order Id : #${order.orderId} </h5>
    //        <p style="color:black;" >Hey ${username},</p>
    //       <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#47ca00" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    //        <h2 style="color:black;"> Your Order Is ${status === '1' ? 'Placed' :
    //       status === '2' ? 'Accepted' :
    //         status === '3' ? 'Packed' :
    //           status === '4' ? 'Shipped' :
    //             status === '5' ? 'Delivered' :
    //               'Unknown'
    //     }! </h2>
         
    //        <p style="color:black;" > We'll send you a shipping confirmation email
    // as soon as your order ${status === '1' ? 'Placed' :
    //       status === '2' ? 'Accepted' :
    //         status === '3' ? 'Packed' :
    //           status === '4' ? 'Shipped' :
    //             status === '5' ? 'Delivered' :
    //               'Unknown'
    //     }. </p>
    //       </div>
    //       <div class="modal-footer">
      
    //         <a href="https://cayroshop.com/account/order/${_id}/${updatedOrder._id}" style="
    //     background: green;
    //     color: white;
    //     padding: 10px;
    //     display: block;
    //     margin: auto;
    //     border-radius: 6px;
    //     text-decoration: none;
    // "> Track Order</a>
    //       </div>
    //     </div>
    //   </div>
    // </div> </div>
    //       `
    // };

    // // Send email
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error(error);
    //     res.status(500).send('Failed to send email');
    //   } else {
    //     return res.status(200).json({
    //       message: "Order Updated!",
    //       success: true,
    //     });
    //   }
    // });

    return res.status(200).json({
      message: "Order Updated!",
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


export const editOrderAdmin_old = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderModel.findById(id).populate('userId'); // Fetch order details including user

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    const { email, username } = order.userId; // Extract user email

    let updateFields = {
      status,
    };

    await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      }
    });


    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: email, // Update with your email address
      subject: 'Order Confirmation',
      html: `
          <div class="bg-light w-100 h-100" style="background-color:#f8f9fa!important;width: 90%;font-family:sans-serif;padding:20px;border-radius:10px;padding: 100px 0px;margin: auto;">
     <div class="modal d-block" style="
        width: 500px;
        background: white;
        padding: 20px;
        margin: auto;
        border: 2px solid #8080802e;
        border-radius: 10px;
    ">
      <div class="modal-dialog">
        <div class="modal-content" style="
        text-align: center;
    ">
          <div class="modal-header">
    <h1 style="color:black;"> Cayro Shop <h1>
          </div>
          <div class="modal-body text-center">
            <h5 style="
        margin: 0px;
        margin-top: 14px;
        font-size: 20px;color:black;
    "> Order Id : #${order.orderId} </h5>
           <p style="color:black;" >Hey ${username},</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#47ca00" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
           <h2 style="color:black;"> Your Order Is ${status === '1' ? 'Placed' :
          status === '2' ? 'Accepted' :
            status === '3' ? 'Packed' :
              status === '4' ? 'Shipped' :
                status === '5' ? 'Delivered' :
                  'Unknown'
        }! </h2>
         
           <p style="color:black;" > We'll send you a shipping confirmation email
    as soon as your order ${status === '1' ? 'Placed' :
          status === '2' ? 'Accepted' :
            status === '3' ? 'Packed' :
              status === '4' ? 'Shipped' :
                status === '5' ? 'Delivered' :
                  'Unknown'
        }. </p>
          </div>
          <div class="modal-footer">
      
            <a href="https://cayroshop.com/" style="
        background: green;
        color: white;
        padding: 10px;
        display: block;
        margin: auto;
        border-radius: 6px;
        text-decoration: none;
    "> Track Order</a>
          </div>
        </div>
      </div>
    </div> </div>
          `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send email');
      } else {
        return res.status(200).json({
          message: "Order Updated!",
          success: true,
        });
      }
    });

  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};


export const getAllUserAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { username: regex },
        { email: regex },
        { phone: regex } // Add phone number search if needed
      ];
    }

    const totalUser = await userModel.countDocuments(query); // Count total documents matching the query

    const users = await userModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!users || users.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No users found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All user list",
      userCount: users.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      users, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while getting users: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const editUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    let updateFields = {
      status,
    };

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!user) {
      return res.status(200).send({
        message: "NO User found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User Updated!",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating User: ${error}`,
      success: false,
      error,
    });
  }
};

export const getUserIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const User = await userModel.findById(id);
    if (!User) {
      return res.status(200).send({
        message: "User Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single User!",
      success: true,
      User,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get User : ${error}`,
      success: false,
      error,
    });
  }
};


// for folder logic 

export const AddAdminFolderController = async (req, res) => {
  try {
    const { id } = req.query; // Access id from query parameters
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide Folder name",
      });
    }

    let newFolder;
    if (id) {
      // Create a new category with the specified parent
      newFolder = new folderModel({ name, folderId: id });
    } else {
      // Create a new category without a parent
      newFolder = new folderModel({ name });
    }

    await newFolder.save();

    return res.status(201).send({
      success: true,
      message: "Folder Created!",
      newFolder,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      // Duplicate key error, i.e., folder name already exists
      return res.status(400).send({
        success: false,
        message: "Folder name already exists. Please choose a different name.",
      });
    }
    console.error("Error while creating Folder:", error);
    return res.status(500).send({
      success: false,
      message: "Error while creating Folder",
      error,
    });
  }
};


export const GetFolderIDAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await folderModel.findById(id);
    if (!folder) {
      return res.status(404).json({
        message: "Folder not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Folder found by ID",
      success: true,
      folder,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error while getting folder: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};


export const GetFolderAdmin = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      // If id is provided, fetch both parent and child folders
      const [parentFolder, Folder] = await Promise.all([
        folderModel.findById(id).lean(), // Fetch parent folder
        folderModel.find({ folderId: id }).lean(), // Fetch child folders
      ]);

      const userId = req.params.id;



      if (!parentFolder) {
        return res.status(404).send({
          message: "Parent Folder not found",
          success: false,
        });
      }

      return res.status(200).send({
        message: "Parent and Child Folders found",
        success: true,
        parentFolder,
        Folder,
      });
    } else {
      // If id is not provided, fetch folders where folderId is empty
      const Folder = await folderModel.find({ folderId: null }).lean();

      return res.status(200).send({
        message: "Folders without Parent found",
        success: true,
        Folder,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting folders ${error}`,
      success: false,
      error,
    });
  }
};



export const GetImageAdmin = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {

      // Find galleryModel items for the specified user ID
      const Gallery = await galleryModel.find({ folderId: id }).lean();

      if (!Gallery) {
        return res.status(404).send({
          message: "Images not found",
          success: false,
        });
      }

      return res.status(200).send({
        message: "images found by Id",
        success: true,
        Gallery,
      });
    } else {
      // If id is not provided, fetch folders where folderId is empty
      const Gallery = await galleryModel.find({ folderId: null }).lean();

      return res.status(200).send({
        message: "All images found",
        success: true,
        Gallery,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting images ${error}`,
      success: false,
      error,
    });
  }
};




export const UpdateFolderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, folderId } = req.body;

    // Validation: Check if the name is empty
    if (!name || /^\s*$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check if the name already exists for another folder
    const existingFolder = await folderModel.findOne({ name });
    if (existingFolder && existingFolder._id.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Folder name already exists. Please choose a different name.",
      });
    }

    let updateFields = {
      name,
      folderId,
    };

    const Folder = await folderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!Folder) {
      return res.status(404).json({
        message: "Folder not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Folder updated successfully!",
      success: true,
      Folder,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error while updating Folder: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const deleteFolderAdmin = async (req, res) => {
  try {
    await folderModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Folder Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Folder",
      error,
    });
  }
};


// for zones

export const AddAdminZonesController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name || !status) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newZones = new zonesModel({
      name,
      status,
    });
    await newZones.save();

    return res.status(201).send({
      success: true,
      message: "Attribute Zones!",
      newZones,
    });
  } catch (error) {
    console.error("Error while creating Zones:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Zones",
      error,
    });
  }
};

export const getAllZonesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { username: regex },
        { email: regex },
        { phone: regex } // Add phone number search if needed
      ];
    }

    const totalUser = await zonesModel.countDocuments(query); // Count total documents matching the query

    const zones = await zonesModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!zones || zones.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No zones found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All zones list",
      Count: zones.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      zones, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while getting zones: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const updateZonesAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, cities, primary } = req.body;

    console.log("primary", primary);

    // Check if primary is set to "true"
    if (primary === true) {
      // Query to check if any items in zonesModel have primary === 'true'
      const existingPrimaryZone = await zonesModel.findOne({ primary: "true" });

      // If existingPrimaryZone is found, it means primary is already set to 'true'
      if (existingPrimaryZone) {
        return res.status(400).json({
          message: "Zones primary already set!",
          success: false,
        });
      }
    }

    // Update fields
    const updateFields = { name, status, primary, cities };

    // Update the zone
    const updatedZone = await zonesModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Zones Updated!",
      success: true,
      zone: updatedZone,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Zones: ${error.message}`,
      success: false,
      error: error.message,
    });
  }
};



export const getZonesIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Zones = await zonesModel.findById(id);
    if (!Zones) {
      return res.status(200).send({
        message: "Zones Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Zones!",
      success: true,
      Zones,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Zones: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteZonesAdmin = async (req, res) => {
  try {
    await zonesModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Zone Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Zone",
      error,
    });
  }
};

export const ViewAllAdminZones = async (req, res) => {

  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({});

    res.status(200).json({ success: true, Zones });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

}


// for tax 

export const AddAdminTaxController = async (req, res) => {
  try {
    const { name, rate, type, zoneId, status } = req.body;

    // Validation
    if (!name || !rate || !status) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Field",
      });
    }

    // Create a new category with the specified parent
    const newTax = new taxModel({
      name, rate, type, zoneId, status
    });
    await newTax.save();

    return res.status(201).send({
      success: true,
      message: "Tax created!",
      newTax,
    });
  } catch (error) {
    console.error("Error while creating Tax:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Tax",
      error,
    });
  }
};

export const getAllTaxAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalUser = await taxModel.countDocuments(query); // Count total documents matching the query

    const Tax = await taxModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Tax || Tax.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No tax found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All tax list",
      Count: Tax.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Tax, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while getting Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updateTaxAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, zoneId, status } = req.body;

    let updateFields = {
      name, rate, type, zoneId, status
    };

    const Tax = await taxModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Tax Updated!",
      success: true,
      Tax,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Tax: ${error}`,
      success: false,
      error,
    });
  }
};

export const getTaxIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Tax = await taxModel.findById(id);
    if (!Tax) {
      return res.status(200).send({
        message: "Tax Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Tax!",
      success: true,
      Tax,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Tax: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteTaxAdmin = async (req, res) => {
  try {
    await taxModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Tax Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tax",
      error,
    });
  }
};

// for promo code 

export const AddAdminPromoController = async (req, res) => {
  try {
    const { name, rate, type, status } = req.body;

    // Validation
    if (!name || !rate || !status) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Field",
      });
    }

    // Create a new category with the specified parent
    const newPromo = new promoModel({
      name, rate, type, status
    });
    await newPromo.save();

    return res.status(201).send({
      success: true,
      message: "Promo code created!",
      newPromo,
    });
  } catch (error) {
    console.error("Error while creating Promo code:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Promo code",
      error,
    });
  }
};

export const getAllPromoAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalUser = await promoModel.countDocuments(query); // Count total documents matching the query

    const Promo = await promoModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Promo || Promo.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No tax Promo code",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Promo list",
      Count: Promo.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Promo, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Promo Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updatePromoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, status } = req.body;

    let updateFields = {
      name, rate, type, status
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

export const getPromoIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Promo = await promoModel.findById(id);
    if (!Promo) {
      return res.status(200).send({
        message: "Promo code Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Promo code!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const deletePromoAdmin = async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Promo code Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tax",
      error,
    });
  }
};


export const deleteOrderAdmin = async (req, res) => {
  try {
    await orderModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Order Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Order",
      error,
    });
  }
};

// for pages 


export const AddAdminPageController = async (req, res) => {
  try {
    const { title, description, metaTitle, metaDescription, metaKeywords } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Field",
      });
    }

    // Create a new category with the specified parent
    const newPage = new pageModel({
      title, description, metaTitle, metaDescription, metaKeywords
    });
    await newPage.save();

    return res.status(201).send({
      success: true,
      message: "Page created!",
      newPage,
    });
  } catch (error) {
    console.error("Error while creating Page:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Promo code",
      error,
    });
  }
};


export const getAllPageAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { title: regex },
        // { description: regex },
      ];
    }

    const totalUser = await pageModel.countDocuments(query); // Count total documents matching the query

    const Mpage = await pageModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!Mpage || Mpage.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Page found",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Page list",
      Count: Mpage.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      Mpage, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Page: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updatePageAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, metaTitle, metaDescription, metaKeywords
    } = req.body;

    let updateFields = {
      title, description, metaTitle, metaDescription, metaKeywords
    };

    const MPage = await pageModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Page Updated!",
      success: true,
      MPage,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Page: ${error}`,
      success: false,
      error,
    });
  }
};

export const getPageIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Mpage = await pageModel.findById(id);
    if (!Mpage) {
      return res.status(200).send({
        message: "Page not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Page!",
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

export const deletePageAdmin = async (req, res) => {
  try {
    await pageModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Page Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr While Deleteing Page",
      error,
    });
  }
};


// for Product Varients





export const getAllproductVarientAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalCount = await productVarientModel.countDocuments(query); // Count total documents matching the query

    const productVarient = await productVarientModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!productVarient || productVarient.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No tax Promo code",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Product Varient list",
      Count: productVarient.length,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
      productVarient, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Promo Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updateproductVarientAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, status } = req.body;

    let updateFields = {
      name, rate, type, status
    };

    const Promo = await productVarient.findByIdAndUpdate(id, updateFields, {
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

export const getproductVarientIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Promo = await promoModel.findById(id);
    if (!Promo) {
      return res.status(200).send({
        message: "Promo code Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Promo code!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteproductVarientAdmin = async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Promo code Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Tax",
      error,
    });
  }
};



export const exportAllProAdmin = async (req, res) => {

  try {
    // Fetch data from the database (assuming using Mongoose)
    //   const products = await productModel.find({}, 'title description pImage images slug regularPrice salePrice status stock Category weight tag').lean();
    const products = await productModel.find({}, 'p_id title description Category pImage  images slug regularPrice salePrice status stock weight gst hsn sku specifications variations  metaTitle metaDescription metaKeywords ').lean();

    const filename = 'all_products.csv';

    // Stringify the product data
    stringify(products, { header: true }, (err, csvString) => {
      if (err) {
        console.error('Error generating CSV:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Set response headers
      res.header('Content-Type', 'text/csv');
      res.attachment(filename);

      // Send CSV data
      res.send(csvString);

    });
  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).send('Internal Server Error');
  }

};

// export const importAllProAdmin = async (req, res) => {
//   try {
//     const jsonData = req.body;

//     if (!jsonData || !Array.isArray(jsonData)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid JSON data provided'
//       });
//     }

//     // Process the parsed JSON data
//     for (const productData of jsonData) {
//       try {
//         // Ensure that p_id is present and not 'new'
//         if (productData.p_id !== undefined && productData.p_id !== 'new') {
//           // Convert p_id to a number if it's numeric
//           if (!isNaN(productData.p_id)) {
//             productData.p_id = parseFloat(productData.p_id);
//           }

//           // Check if the product already exists by p_id
//           const existingProduct = await productModel.findOne({ p_id: productData.p_id }).lean();

//           if (existingProduct) {
//             // Update existing product
//             // Convert regularPrice and salePrice to numbers if they are strings
//             if (typeof productData.regularPrice === 'string') {
//               productData.regularPrice = parseFloat(productData.regularPrice);
//             }
//             if (typeof productData.salePrice === 'string') {
//               productData.salePrice = parseFloat(productData.salePrice);
//             }
//             if (typeof productData.status === 'string') {
//               productData.status = productData.status.toLowerCase();
//             }
//             await productModel.findOneAndUpdate({ p_id: productData.p_id }, productData);
//           }
//         } else {

//           for (const key in productData) {
//             if (productData[key] !== '' && productData[key] !== null && productData[key] !== undefined) {
//               newProductData[key] = productData[key];
//             }
//           }

//           // Convert regularPrice and salePrice to numbers if they are strings
//           if (typeof newProductData.regularPrice === 'string') {
//             newProductData.regularPrice = parseFloat(newProductData.regularPrice);
//           }
//           if (typeof newProductData.salePrice === 'string') {
//             newProductData.salePrice = parseFloat(newProductData.salePrice);
//           }

//           // Create the new product
//           await productModel.create(newProductData);
//         }
//       } catch (error) {
//         console.error('Error importing product:', error);
//         // Log the error and proceed to the next product
//       }
//     }

//     console.log('Products imported successfully');
//     return res.status(200).json({
//       success: true,
//       message: 'Products imported successfully'
//     });

//   } catch (error) {
//     console.error('Error importing products:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error while importing products',
//       error: error.message
//     });
//   }
// };



export const importAllProAdmin = async (req, res) => {
  try {
    const jsonData = req.body;

    if (!jsonData || !Array.isArray(jsonData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON data provided'
      });
    }

    try {
      // Process the parsed JSON data
      for (const productData of jsonData) {

        if (productData.p_id !== undefined) {

          if (!isNaN(productData.p_id)) {
            productData.p_id = parseFloat(productData.p_id);
          }
          if (productData.p_id !== 'new') {
            try {
              // Check if the product already exists
              const existingProduct = await productModel.findOne({ p_id: productData.p_id }).lean();
              if (existingProduct) {

                if (typeof productData.regularPrice === 'string') {
                  productData.regularPrice = parseFloat(productData.regularPrice);
                }
                if (typeof productData.salePrice === 'string') {
                  productData.salePrice = parseFloat(productData.salePrice);
                }
                if (typeof productData.status === 'string') {
                  productData.status = productData.status.toLowerCase();
                }
                await productModel.findOneAndUpdate({ p_id: productData.p_id }, productData);

              }

            } catch (error) {
              console.error('Error importing product:', error);
            }
          } else { }

          if (productData.p_id === 'new') {

            const lastProduct = await productModel.findOne().sort({ _id: -1 }).limit(1);
            if (typeof lastProduct.p_id === 'string') {
              lastProduct.p_id = parseFloat(lastProduct.p_id);
            }

            const lastProductId = lastProduct ? lastProduct.p_id : 0;

            // Calculate the auto-increment ID
            const pro_id = lastProductId + 1;


            try {

              if (typeof productData.regularPrice === 'string') {
                productData.regularPrice = parseFloat(productData.regularPrice);
              }
              if (typeof productData.salePrice === 'string') {
                productData.salePrice = parseFloat(productData.salePrice);
              }
              if (typeof productData.status === 'string') {
                productData.status = productData.status.toLowerCase();
              }


              const {
                title,
                description,
                pImage,
                images,
                slug,
                regularPrice,
                salePrice,
                status,
                stock,
                weight,
                Category,
                gst,
                hsn,
                sku,
                variations,
                metaTitle,
                metaDescription,
                metaKeywords
              } = productData;

              const newProduct = new productModel({
                p_id: pro_id,
                title,
                description,
                pImage,
                images,
                slug,
                regularPrice,
                salePrice,
                status,
                stock,
                weight,
                Category,
                gst,
                hsn,
                sku,
                variations,
                metaTitle,
                metaDescription,
                metaKeywords
              });


              // Save the product to the database
              await newProduct.save();

            } catch (error) {
              console.error('Error importing product:', error);
            }

          }


          console.log(productData.p_id)

        }

      }

      console.log('Products imported successfully');
      return res.status(200).json({
        success: true,
        message: 'Products imported successfully'
      });

    } catch (error) {
      console.error('Error importing products:', error);
      return res.status(500).json({
        success: false,
        message: 'Error while importing products',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Error importing products:', error);
    return res.status(500).json({
      success: false,
      message: 'Error while importing products',
      error: error.message
    });
  }
};

// Add Plan Category

export const AddPlanCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name Field",
      });
    }

    // Create a new category with the specified parent
    const planCategory = new planCategoryModel({
      name
    });
    await planCategory.save();

    return res.status(201).send({
      success: true,
      message: "Plan category created!",
      planCategory,
    });
  } catch (error) {
    console.error("Error while creating plan category:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Promo code",
      error,
    });
  }
};

export const getAllPlanCategoryAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { rate: regex },
      ];
    }

    const totalCount = await planCategoryModel.countDocuments(query); // Count total documents matching the query

    const planCategory = await planCategoryModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!planCategory || planCategory.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan Category",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Plan Category list",
      Count: planCategory.length,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
      planCategory, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while Promo Tax: ${error.message}`,
      success: false,
      error,
    });
  }
};


// Add Plan

export const AddPlanController = async (req, res) => {
  try {
    const { name, price, Category } = req.body;

    // Validation



    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name Field",
      });
    }

    // Create a new category with the specified parent
    const plan = new planModel({
      name, price, Category
    });
    await plan.save();

    return res.status(201).send({
      success: true,
      message: "Plan created!",
      plan,
    });
  } catch (error) {
    console.error("Error while creating plan:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating plan",
      error,
    });
  }
};

export const getAllPlanAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // Case-insensitive regex pattern for the search term

      // Add regex pattern to search both username and email fields for the full name
      query.$or = [
        { name: regex },
        { price: regex },
      ];
    }

    const totalCount = await planModel.countDocuments(query); // Count total documents matching the query

    const plan = await planModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!plan || plan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      Count: plan.length,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
      plan, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const updatePlanAdmin = async (req, res) => {
  const { name, price, Category, validity } = req.body;
  console.log('Category', Category);

  try {
    const { id } = req.params;
    let updateFields = {
      name, price, Category, validity
    };

    const plan = await planModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Plan Updated!",
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating plan: ${error}`,
      success: false,
      error,
    });
  }
};

export const getPlanIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await planModel.findById(id);
    if (!plan) {
      return res.status(200).send({
        message: "plan Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single plan!",
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get plan: ${error}`,
      success: false,
      error,
    });
  }
};

export const deletePlanAdmin = async (req, res) => {
  try {
    await planModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Plan Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr while deleteing",
      error,
    });
  }
};


export const UserloginAll = async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Find the user by email
    const admin = await userModel.findOne({ email });
    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Email is not registered",
        admin,
      });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Password is incorrect",
        admin,
      });
    }

    // Update the user's latitude and longitude if provided
    if (latitude && longitude) {
      admin.latitude = latitude;
      admin.longitude = longitude;

      // Save the updated user details
      await admin.save();
    }

    // Send the success response
    return res.status(200).send({
      success: true,
      message: "Login successful",
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error during login: ${error}`,
      success: false,
      error,
    });
  }
};



// for department model
export const AddAdminDepartmentController = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Provide name",
      });
    }

    // Create a new category with the specified parent
    const newDepartment = new departmentsModel({
      name,
      status,
    });
    await newDepartment.save();

    return res.status(201).send({
      success: true,
      message: "Department Created!",
      newDepartment,
    });
  } catch (error) {
    console.error("Error while creating Department:", error);
    return res.status(400).send({
      success: false,
      message: "Error while creating Department",
      error,
    });
  }
};

export const getAllDepartmentFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
        { value: { $regex: searchTerm, $options: "i" } }, // Case-insensitive email search
      ];
    }

    const totalDepartment = await departmentsModel.countDocuments();

    const Department = await departmentsModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Department) {
      return res.status(200).send({
        message: "NO Department found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Department list ",
      DepartmentCount: Department.length,
      currentPage: page,
      totalPages: Math.ceil(totalDepartment / limit),
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Department ${error}`,
      success: false,
      error,
    });
  }
};

export const updateDepartmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status } = req.body;

    let updateFields = {
      name,
      status,
    };

    const Department = await departmentsModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Department Updated!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const getDepartmentIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const Department = await departmentsModel.findById(id);
    if (!Department) {
      return res.status(200).send({
        message: "Department Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Department!",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Department: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteDepartmentAdmin = async (req, res) => {
  try {
    await departmentsModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Department Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Department",
      error,
    });
  }
};




export const editUserVerifyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    let updateFields = {
      verified: status,
    };

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!user) {
      return res.status(200).send({
        message: "NO User found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User Updated!",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating User: ${error}`,
      success: false,
      error,
    });
  }
};

export const profileVendorImage = upload.fields([
  { name: "Doc1", maxCount: 1 },
  { name: "Doc2", maxCount: 1 },
  { name: "Doc3", maxCount: 1 },
  { name: "ProfileFile", maxCount: 1 },
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
      department
    } = req.body;

    const Doc1 = req.files ? req.files.Doc1 : undefined;
    const Doc2 = req.files ? req.files.Doc2 : undefined;
    const Doc3 = req.files ? req.files.Doc3 : undefined;

    const profileImg = req.files ? req.files.ProfileFile : undefined;

    console.log("req.body", req.body, profileImg);

    let updateFields = {
      username,
      address,
      email,
      pincode,
      gender,
      state,
      statename,
      city,
      about,
      department,
    };

    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    if (Doc1 && Doc1[0]) {
      updateFields.Doc1 = Doc1[0].path; // Assumes profile[0] is the uploaded file
    }
    if (Doc2 && Doc2[0]) {
      updateFields.Doc2 = Doc2[0].path; // Assumes profile[0] is the uploaded file
    } if (Doc3 && Doc3[0]) {
      updateFields.Doc3 = Doc3[0].path; // Assumes profile[0] is the uploaded file
    }
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


export const AllPaymentAdmin = async (req, res) => {
  try {
    const transactions = await buyPlanModel.find({ payment: 1 }).populate('userId', 'phone email username').sort({ createdAt: -1 }).lean();

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

export const AllTransactionAdmin_old = async (req, res) => {

    try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
     const userId = req.query.userId || ''; // Get search term from the query parameters


    const skip = (page - 1) * limit;

    const query = {};
 
    
  if (userId.length > 0 && userId !== '') {
      query.userId = userId; // Use $in operator to match any of the values in the array
    }
    
    const totalTransaction = await transactionModel.countDocuments();

    const Transaction = await transactionModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit) .populate({
    path: 'userId', // Make sure this matches the field name in your schema
    select: 'username phone',
  }) .lean();

  

    if (!Transaction) {
      return res.status(200).send({
        message: "NO Transaction found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Transaction list ",
      TransactionCount: Transaction.length,
      currentPage: page,
      totalPages: Math.ceil(totalTransaction / limit),
      success: true,
      Transaction,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Department ${error}`,
      success: false,
      error,
    });
  }


   
};


export const AllTransactionAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;
    const search = req.query.search?.trim() || '';

    const skip = (page - 1) * limit;

    const match = {};

    if (userId) {
      match.userId = userId;
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: match },

      // Join with user collection
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' }, // Flatten userId array

      // Search filtering
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { 'userId.username': { $regex: search, $options: 'i' } },
                  { 'userId.phone': { $regex: search, $options: 'i' } },
                  { 'userId.email': { $regex: search, $options: 'i' } },
                  { t_id: { $regex: search, $options: 'i' } },
                ],
              },
            },
          ]
        : []),

      // Sort & paginate
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit },

      // Return all fields including populated userId
      {
        $project: {
          _id: 1,
          note: 1,
          amount: 1,
          type: 1,
          t_id: 1,
          t_no: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            _id: 1,
            username: 1,
            phone: 1,
            email: 1,
          },
        },
      },
    ];

    // Count pipeline
    const countPipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { 'userId.username': { $regex: search, $options: 'i' } },
                  { 'userId.phone': { $regex: search, $options: 'i' } },
                  { 'userId.email': { $regex: search, $options: 'i' } },
                  { t_id: { $regex: search, $options: 'i' } },
                ],
              },
            },
          ]
        : []),
      { $count: 'total' },
    ];

    const [transactions, countResult] = await Promise.all([
      transactionModel.aggregate(pipeline),
      transactionModel.aggregate(countPipeline),
    ]);

    const totalTransaction = countResult.length > 0 ? countResult[0].total : 0;

    return res.status(200).json({
      message: 'All Transaction list',
      TransactionCount: transactions.length,
      currentPage: page,
      totalPages: Math.ceil(totalTransaction / limit),
      success: true,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error while getting transactions: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const withdrawalUserAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const homeData = await homeModel.findOne();
    if (!homeData) {
      return res.status(500).send({
        success: false,
        message: "Home settings not found",
      });
    }

    const withdrawalAmt = homeData.withdrawalAmt;

    if ((user.wallet || 0) < withdrawalAmt) {
      return res.status(400).send({
        success: false,
        message: `Sorry, your wallet balance is less than the minimum withdrawal amount of ${withdrawalAmt}`,
      });
    }

    // Deduct withdrawal amount
    user.wallet = (user.wallet || 0) - withdrawalAmt;

    // Get last transaction number
    const lastTrans = await transactionModel
      .findOne()
      .sort({ _id: -1 })
      .limit(1);

    const lastTransId = lastTrans ? parseInt(lastTrans.t_no || 0) + 1 : 1;
    const t_id = "tt00" + lastTransId;

    // Create a new transaction
    const transaction = new transactionModel({
      userId,
      type: 1,
      note: `Withdrawal amount -${withdrawalAmt}`,
      amount: -withdrawalAmt,
      t_id,
      t_no: lastTransId,
    });

    await transaction.save();
    await user.save();

    // Send successful response
    return res.status(200).send({
      success: true,
      message: `Withdrawal of ${withdrawalAmt} successful.`,
      transaction,
      walletBalance: user.wallet,
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Error processing withdrawal: ${error.message}`,
      error,
    });
  }
};

 
    
export const AdminAllEnquireStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    const skip = (page - 1) * limit;

    // Initialize the query object
    let query = {};

    // If userId is provided, filter by userId
    if (userId) {
      query.userId = userId; // Filter by userId
    }

    query.type = 1; // Filter by userId


    // If there's a search term, apply it to a specific field (assuming a text index exists on the model)
    if (searchTerm) {
      query.$text = { $search: searchTerm }; // Assuming your model has text indexes for search
    }

    // Count the total documents matching the query
    const total = await enquireModel.countDocuments(query);

    // Retrieve the data
    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username, email, phone, and address
      .populate('senderId', 'username email phone address') // Populate senderId with username, email, phone, and address
      .lean();

    const allvendor = await userModel.find({ type: 1 }).lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquiries found for the given criteria.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Enquiry list retrieved successfully",
      EnquireCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      total,
      Enquire,
      allvendor
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error.message || error}`,
      success: false,
      error,
    });
  }
};

export const profileImageHealth = upload.fields([
  { name: "profile", maxCount: 1 },
]);


export const AdminAllgallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    const skip = (page - 1) * limit;

    // Initialize the query object
    let query = {};

    // If userId is provided, filter by userId
    if (userId) {
      query.userId = userId; // Filter by userId
    }

    query.type = 1; // Filter by userId


    // If there's a search term, apply it to a specific field (assuming a text index exists on the model)
    if (searchTerm) {
      query.$text = { $search: searchTerm }; // Assuming your model has text indexes for search
    }

    // Count the total documents matching the query
    const total = await productModel.countDocuments(query);

    // Retrieve the data
    const products = await productModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username, email, phone, and address
      .populate('senderId', 'username email phone address') // Populate senderId with username, email, phone, and address
      .lean();
 
    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquiries found for the given criteria.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "All products!",
      toatalCount: products.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      total,
      products,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error.message || error}`,
      success: false,
      error,
    });
  }
};

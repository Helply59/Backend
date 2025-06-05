import express from "express";
import {
  UserloginAll, SignupAdmin, Adminlogin, getAllGalleryController, deleteGalleryController, AddAdminBlogController,UpdateAdminBlogController, AdmindeleteBlogController, AddAdminCategoryController
  , getAllReviewsAdmin, AdmingetAllCategories, AddAdminProduct, getAllcategoryFillAdmin, updateCategoryAdmin, getCategoryIdAdmin, deleteCategoryAdmin, getAllProductFillAdmin, updateProductAdmin, getProductIdAdmin, deleteProductAdmin,
  AddAdminPromoController, getAllPromoAdmin, updatePromoAdmin, getPromoIdAdmin, deletePromoAdmin
  , getAllEnquireAdmin, ChangePassAdmin, ForgotAdminPassword, editOrderAdmin, editLeadStatusAdmin,deleteOrderAdmin, AddAdminPageController, getAllPageAdmin, updatePageAdmin, getPageIdAdmin, deletePageAdmin, getAllBlogAdmin, exportAllProAdmin, importAllProAdmin,editOrderEmployeeAdmin, AdminGetAllEmployee, getAllUserAdmin, AddAdminTaxController, getAllTaxAdmin, updateTaxAdmin, getTaxIdAdmin, deleteTaxAdmin, ViewAllAdminZones, AddAdminZonesController, getAllZonesAdmin, updateZonesAdmin, getZonesIdAdmin, deleteZonesAdmin, GetImageAdmin, deleteFolderAdmin, UpdateFolderAdmin, getUserIdAdmin, GetFolderIDAdmin, AddAdminFolderController, GetFolderAdmin, editUserAdmin, AddAdminAttributeController, deleteRatingAdmin, editReviewAdmin, getAllOrderAdmin, getAllAttributeFillAdmin, updateAttributeAdmin, getAttributeIdAdmin, deleteAttributeAdmin, getAllAttribute, AddAdminTagController, getAllTagFillAdmin, updateTagAdmin, getTagIdAdmin, deleteTagAdmin, getAllTag, editHomeData, editHomeLayoutData,
  AddPlanCategoryController, getAllPlanCategoryAdmin, AddPlanController, getAllPlanAdmin, getPlanIdAdmin, updatePlanAdmin, deletePlanAdmin, AddAdminDepartmentController,
  getAllDepartmentFillAdmin,
  getDepartmentIdAdmin,
  updateDepartmentAdmin,
  deleteDepartmentAdmin, editUserVerifyAdmin, AllPaymentAdmin, AdminAllEnquireStatus, profileImageHealth,withdrawalUserAdmin,AllTransactionAdmin
} from "../controller/adminController.js";

import {
  getCategoriesWithProducts , AddCart, contactEnquire, razorpayCallback, UpdateCart, getCart, userTokenController, userBlogsController, Userlogin, SignupUser, getAllBlogsController, createBlogController,
  LoginAndVerifyOTP, updateBlogController, deleteBlogController, getBlogIdController, CreateChatController, findUserschatController, findchatController
  , EmailVerify, postman, PaymentResponse, PaymentRequest, getProductsByFilterUser, cancelOrderUser, ViewAllZones, ViewAllZonesOnly,getProductsByHSN, AuthUserByID, updateProfileUser, SignupNewUser, LoginUserWithOTP, LoginUserWithPass, SendOTP,SignupLoginNew, SignupLoginUser, getTaxIdUser, ViewAllUserTaxes, ViewCompareByUser, applyPromoCode, getHomeLayoutData, AddWishListByUser, deleteCompareByUser, deleteWishListByUser, ViewWishListByUser, AddCompareByUser, ViewProductRating, ViewCategoryRating, AddRating, UsergetAllCategories, UsergetAllProducts, UsergetAllHomeProducts,FullOrdersViewController, userOrdersViewController, getAllAttributeUser, getProductIdUser, updateUserController, createOrderController, updateUserAndCreateOrderController, userOrdersController, getHomeData, GetAllCategoriesByParentIdController, GetAllCategoriesBySlugController
  , BuyPlanUser, GetPlanUser, HomeSendEnquire,contactSendEnquire,HomeSendEnquireCatgeory,HomeReferralEnquire, getAllPlanCategoryController, uploadDataZone, deleteAllZones, SignupUserType, updateDetailsUser, updateDetailsUserHealth, getAllPlanUser, getProductIdUserBySlug
  , getAllVendor, getAllDepartment, profileVendorImage, ApiGetKey, PaymentSuccess, PaymentFail,
  updateVendorProfileUser,GetAllUser,UserAllgallery, paymentVerification,AllUserByDetails, BuyPlanAddUser, BuyPlanByUser,BuyPlanByUserFree, PayuHash, userPlanIdController,ViewAllZonesCategory, ViewAllZonesDepartment, getVendorById, HomeSendvendorEnquire, ApplyEnquireStatus, SenderEnquireStatus, AllPayment, downloadUserInvoice, checkUserPlan, GetWebsiteData, GetWebsiteData_old
} from "../controller/userController.js"
import authenticateToken from "../middleware/authMiddleware.js";
import { uploadImage, handleImageUpload } from "../controller/adminController.js";

const router = express.Router();

// admin routes

router.post('/admin/forgot', ForgotAdminPassword);
router.post('/admin/change-pass', ChangePassAdmin);
router.post('/admin', Adminlogin);
router.post('/admin/upload-img', uploadImage, handleImageUpload);
router.get('/admin/allgallery', getAllGalleryController);
router.delete('/admin/delete-gallery/:id', deleteGalleryController);

router.post('/admin/addBlog', AddAdminBlogController);
router.get('/admin/all-blogs', getAllBlogAdmin);


router.post('/admin/update-blog/:id', UpdateAdminBlogController);
router.delete('/admin/delete-blog/:id', AdmindeleteBlogController);

router.post('/admin/add-category', AddAdminCategoryController);
router.get('/all/category/:parentId', GetAllCategoriesByParentIdController);
router.get('/all/category-slug/:parentSlug', GetAllCategoriesBySlugController);

router.get('/all-category', UsergetAllCategories);
router.get('/all-products', UsergetAllProducts);
router.get('/all-home-products', UsergetAllHomeProducts);

router.get('/admin/all-category-fillter', getAllcategoryFillAdmin);
router.get('/admin/get-category/:id', getCategoryIdAdmin);
router.put('/admin/update-category/:id', updateCategoryAdmin);
router.delete('/admin/delete-category/:id', deleteCategoryAdmin);

router.post('/admin/add-product', AddAdminProduct);
router.get('/admin/all-product-fillter', getAllProductFillAdmin);
router.get('/admin/get-product/:id', getProductIdAdmin);
router.put('/admin/update-product/:id', updateProductAdmin);
router.delete('/admin/delete-product/:id', deleteProductAdmin);


router.post('/admin/add-attribute', AddAdminAttributeController);
router.get('/admin/all-attribute-fillter', getAllAttributeFillAdmin);
router.get('/admin/get-attribute/:id', getAttributeIdAdmin);
router.put('/admin/update-attribute/:id', updateAttributeAdmin);
router.delete('/admin/delete-attribute/:id', deleteAttributeAdmin);
router.get('/admin/all-attribute', getAllAttribute);


router.post('/admin/add-tag', AddAdminTagController);
router.get('/admin/all-tag-fillter', getAllTagFillAdmin);
router.get('/admin/get-tag/:id', getTagIdAdmin);
router.put('/admin/update-tag/:id', updateTagAdmin);
router.delete('/admin/delete-tag/:id', deleteTagAdmin);
router.get('/admin/all-tag', getAllTag);

// home settings Admin
router.put('/admin/edit-home', editHomeData);
router.put('/admin/edit-home-layout', editHomeLayoutData);

// review admin
router.get('/admin/all-review', getAllReviewsAdmin);

router.put('/admin/update-rating/:id', editReviewAdmin);
router.delete('/admin/delete-rating/:id', deleteRatingAdmin);

// enquire Admin

router.get('/admin/all-enquire', getAllEnquireAdmin);

// order Admin

router.get('/admin/all-order', getAllOrderAdmin);
router.put('/admin/update-order/:id', editOrderAdmin);
router.put('/admin/update-lead/:id', editLeadStatusAdmin);

// user Admin

router.get('/admin/all-user', getAllUserAdmin);
router.put('/admin/update-user/:id', editUserAdmin);
router.get('/admin/get-user/:id', getUserIdAdmin);

router.get("/all-employee", AdminGetAllEmployee);
router.put("/admin/update-employee-order/:id/", editOrderEmployeeAdmin);
 router.get("/all-user", GetAllUser);


// Folder Admin 

router.post('/admin/add-folder', AddAdminFolderController);
router.get('/admin/get-folder', GetFolderAdmin);
router.get('/admin/get-folder/:id', GetFolderIDAdmin);
router.put('/admin/update-folder/:id', UpdateFolderAdmin);
router.delete('/admin/delete-folder/:id', deleteFolderAdmin);

// for Plan Category
router.get('/all-plan-category', getAllPlanCategoryController);

router.post('/admin/add-plan-category', AddPlanCategoryController);
router.get('/admin/all-plan-category', getAllPlanCategoryAdmin);
router.get('/admin/get-plan-category/:id', GetFolderIDAdmin);
router.put('/admin/update-plan-category/:id', UpdateFolderAdmin);
router.delete('/admin/delete-plan-category/:id', deleteFolderAdmin);

// for Plan

router.post('/admin/add-plan', AddPlanController);
router.get('/admin/all-plan', getAllPlanAdmin);
router.get('/admin/get-plan/:id', getPlanIdAdmin);
router.put('/admin/update-plan/:id', updatePlanAdmin);
router.delete('/admin/delete-plan/:id', deletePlanAdmin);

// for Zones

router.post('/admin/add-zones', AddAdminZonesController);
router.get('/admin/all-zones', getAllZonesAdmin);
router.get('/admin/get-zones/:id', getZonesIdAdmin);
router.put('/admin/update-zones/:id', updateZonesAdmin);
router.delete('/admin/delete-zones/:id', deleteZonesAdmin);
router.get('/admin/get-all-zones', ViewAllAdminZones);


// for Taxes

router.post('/admin/add-tax', AddAdminTaxController);
router.get('/admin/all-tax', getAllTaxAdmin);
router.get('/admin/get-tax/:id', getTaxIdAdmin);
router.put('/admin/update-tax/:id', updateTaxAdmin);
router.delete('/admin/delete-tax/:id', deleteTaxAdmin);

// for promo code

router.post('/admin/add-promo', AddAdminPromoController);
router.get('/admin/all-promo', getAllPromoAdmin);
router.get('/admin/get-promo/:id', getPromoIdAdmin);
router.put('/admin/update-promo/:id', updatePromoAdmin);
router.delete('/admin/delete-promo/:id', deletePromoAdmin);

// for order delete
router.delete('/admin/delete-order/:id', deleteOrderAdmin);


// for page 


router.post('/admin/add-page', AddAdminPageController);
router.get('/admin/all-page', getAllPageAdmin);
router.get('/admin/get-page/:id', getPageIdAdmin);
router.put('/admin/update-page/:id', updatePageAdmin);
router.delete('/admin/delete-page/:id', deletePageAdmin);


router.get('/admin/get-image', GetImageAdmin);

// for export admin

router.get('/admin/export/allproducts/', exportAllProAdmin);
router.post('/admin/import/allproducts/', importAllProAdmin);


// --------------------    user routes start  -------------------//

// Middleware function to check if the request is coming from an authorized domain
function checkOrigin(req, res, next) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://localhost:443",
    "http://localhost:3001",
    "https://localhost:80",
    "https://drarrysmediclinic.com", "https://admin.drarrysmediclinic.com/",
    "https://localhost:5559",
  ]; // Add your authorized domains here
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    next();
  } else {
    const secretKey = process.env.Authtoken;

    const token = req.header("x-auth-token");

    // Check if no token or token doesn't match
    if (!token || token !== secretKey) {
      // res.status(403).json({ error: "Unauthorized domain" });
      next();
    } else {
      next();
    }
  }
}



router.post('/signup', checkOrigin, SignupUser);
router.post('/login', checkOrigin, Userlogin);
router.post("/user-login-all", UserloginAll);

//router.post('/create-order', createOrderController);
router.post('/create-order/:id', checkOrigin, updateUserAndCreateOrderController);
router.post('/razorpayCallback', razorpayCallback);

router.put('/cancel-order/:id', cancelOrderUser);

router.get('/user-orders/:id', checkOrigin, userOrdersController);
router.get('/user-orders-view/:userId/:orderId', checkOrigin, userOrdersViewController);
router.get('/user-orders-view/:orderId', checkOrigin, FullOrdersViewController);


router.post('/payment-request', PaymentRequest);
router.post('/payment-response', PaymentResponse);
router.get('/update-stuck-order/:id', postman);



router.post('/add-cart', AddCart);
router.get('/get-cart/:id', getCart);
router.put('/update-cart/:id', UpdateCart);


router.get('/all-blogs', getAllBlogsController);



router.put('/update-user/:id', updateUserController);
router.put('/update-profile/:id', updateProfileUser);


router.post('/create-blog', createBlogController);
router.put('/update-blog/:id', updateBlogController);
router.get('/get-blog/:id', getBlogIdController);
router.delete('/delete-blog/:id', deleteBlogController);

router.post('/create-chat', CreateChatController);
router.get('/find-chats/:id', findUserschatController);
router.get('/find-chat/:firstId/:secondId', findchatController);




// get blog by user 
router.get('/validatetoken/:id', checkOrigin, userTokenController);

router.get('/user-blogs/:id', checkOrigin, userBlogsController);

router.get('/user-product/:id', checkOrigin, getProductIdUser);
router.get("/user-product-slug/:slug", checkOrigin, getProductIdUserBySlug);

router.get('/all-attribute', checkOrigin, getAllAttributeUser);

// home settings user
router.get('/home-data', checkOrigin, getHomeData);

router.get('/home-layout-data', checkOrigin, getHomeLayoutData);

router.post('/add-rating', checkOrigin, AddRating);

router.get('/view-product-rating/:id', checkOrigin, ViewProductRating);

router.get('/all-rating/', checkOrigin, ViewCategoryRating);

router.post('/add-wishlist', checkOrigin, AddWishListByUser);

router.post('/add-compare', checkOrigin, AddCompareByUser);

router.delete('/delete-compare/:id', checkOrigin, deleteCompareByUser);

router.get('/view-wishlist/:id', checkOrigin, ViewWishListByUser);

router.get('/view-compare/:id', checkOrigin, ViewCompareByUser);


router.delete('/delete-wishlist/:id', checkOrigin, deleteWishListByUser);

router.post('/apply-promo', checkOrigin, applyPromoCode);

router.get('/get-all-zones', checkOrigin, ViewAllZones);
router.get('/get-all-zones-only', checkOrigin, ViewAllZonesOnly);
 

router.get('/get-all-taxes', checkOrigin, ViewAllUserTaxes);
router.get('/get-tax/:id', checkOrigin, getTaxIdUser);

router.post('/send-otp/', checkOrigin, SendOTP);

router.post('/email-verify/', checkOrigin, EmailVerify);


router.post('/signup-login-otp/', checkOrigin, SignupLoginUser);
router.post('/signup-login-new/', checkOrigin, SignupLoginNew);
router.get('/get-user-details/', checkOrigin, AllUserByDetails);
 


router.post('/login-with-pass/', checkOrigin, LoginUserWithPass);

router.post('/login-with-otp/', checkOrigin, LoginUserWithOTP);

router.post('/signup-new-user/', checkOrigin, SignupNewUser);

router.post('/auth-user/', checkOrigin, AuthUserByID);

router.post('/contact-enquire/', checkOrigin, contactEnquire);

router.post('/send-enquire/', checkOrigin, HomeSendEnquire);
router.post('/send-referral-enquire', checkOrigin, HomeReferralEnquire);


router.post('/send-enquire-vendor/', checkOrigin, HomeSendvendorEnquire);

router.post('/send-enquire-category/', checkOrigin, HomeSendEnquireCatgeory);

router.put("/admin/update-user-details/:id", updateDetailsUser);

router.put("/update-user-details-health/:id", profileImageHealth, updateDetailsUserHealth);

// for get product varient 

router.get('/products-variations-hsn/:id', checkOrigin, getProductsByHSN);

router.get('/products-variations-fillter/', checkOrigin, getProductsByFilterUser);

router.post('/login-verify-otp/', checkOrigin, LoginAndVerifyOTP);

router.post("/signup-user-type", SignupUserType);
router.get("/my-plan/:id", getAllPlanUser);

router.post("/buy-plan", BuyPlanUser);
router.get("/all-vendors", getAllVendor);

router.get("/get-vendor/:slug", getVendorById);


 router.get('/upload-zones',uploadDataZone);
router.get('/delete-zones',deleteAllZones);

router.get("/get-all-department", getAllDepartment);
router.post("/admin/add-department", AddAdminDepartmentController);
router.get("/admin/all-department-fillter", getAllDepartmentFillAdmin);
router.get("/admin/get-department/:id", getDepartmentIdAdmin);
router.put("/admin/update-department/:id", updateDepartmentAdmin);
router.delete("/admin/delete-department/:id", deleteDepartmentAdmin);



router.get('/get-all-zones-department', checkOrigin, ViewAllZonesDepartment);
router.get('/get-all-zones-category', checkOrigin, ViewAllZonesCategory);



router.put("/admin/update-user-verify/:id", editUserVerifyAdmin);
router.get("/apply-enquire-status", ApplyEnquireStatus);
router.get("/all-payment/:userId", AllPayment);
router.post("/download-invoice", downloadUserInvoice);
router.get("/admin/sender-enquire-status", SenderEnquireStatus);

router.get("/admin/all-payment", AllPaymentAdmin);
router.get("/admin/withdrawal/:userId", withdrawalUserAdmin);
router.get("/admin/all-transaction", AllTransactionAdmin);
 

router.get("/check-plan-user/:userId", checkUserPlan);
 
router.get("/all-plan", GetPlanUser);

router.post("/buy-plan-add-user", profileImageHealth, BuyPlanAddUser);

router.post("/paymentverification-plan", paymentVerification);

router.get("/api/get-key", checkOrigin, ApiGetKey);


router.get("/get-plan/:id", userPlanIdController);

router.post("/buy-plan-by-user", BuyPlanByUser);
router.post("/buy-plan-by-user-free", BuyPlanByUserFree);



router.put(
  "/update-user-vendor/:id",
  profileVendorImage,
  updateVendorProfileUser
);

router.get("/admin/all-healthcard", AdminAllEnquireStatus);

router.get("/payu-hash", PayuHash);

router.get("/ssr-data", GetWebsiteData);
router.get("/full-ssr-data", GetWebsiteData_old);
router.post("/payment-success", PaymentSuccess);
router.post("/payment-fail", PaymentFail);

router.get('/get-catgeory-product', getCategoriesWithProducts );

router.get('/user-all-gallery', UserAllgallery );



export default router;


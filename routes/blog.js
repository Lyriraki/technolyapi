const express = require("express");
const router = express.Router();
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
} = require("../controllers/auth");
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
  listSearch,
} = require("../controllers/blog");

// Admin
router.post("/blog", requireSignin, adminMiddleware, create);
router.delete("/blog/:slug", requireSignin, adminMiddleware, remove);
router.put("/blog/:slug", requireSignin, adminMiddleware, update);

// User Login
router.post("/user/blog", requireSignin, authMiddleware, create);
router.delete("/user/blog/:slug", requireSignin, authMiddleware, remove);
router.put("/user/blog/:slug", requireSignin, authMiddleware, update);

// User
router.get("/blogs", list);
router.get("/blog/:slug", read);
router.get("/blogs/search", listSearch);
router.get("/blog/photo/:slug", photo);
router.post("/blogs-categories-tags", listAllBlogsCategoriesTags);
router.post("/blogs/related", listRelated);

module.exports = router;

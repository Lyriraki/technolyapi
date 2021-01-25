const express = require("express");
const router = express.Router();
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
  canUpdateDeleteBlog,
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
  listByUser,
} = require("../controllers/blog");

// Admin
router.post("/blog", requireSignin, adminMiddleware, create);
router.delete("/blog/:slug", requireSignin, adminMiddleware, remove);
router.put("/blog/:slug", requireSignin, adminMiddleware, update);

// User Login
router.get("/:username/blogs", listByUser);
router.post("/user/blog", requireSignin, authMiddleware, create);
router.delete(
  "/user/blog/:slug",
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  remove
);
router.put(
  "/user/blog/:slug",
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  update
);

// User
router.get("/blogs", list);
router.get("/blog/:slug", read);
router.get("/blogs/search", listSearch);
router.get("/blog/photo/:slug", photo);
router.post("/blogs-categories-tags", listAllBlogsCategoriesTags);
router.post("/blogs/related", listRelated);

module.exports = router;

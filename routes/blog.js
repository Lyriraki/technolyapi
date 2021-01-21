const express = require("express");
const router = express.Router();
const { requireSignin, adminMiddleware } = require("../controllers/auth");
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
} = require("../controllers/blog");

router.post("/blog", requireSignin, adminMiddleware, create);
router.post("/blogs-categories-tags", listAllBlogsCategoriesTags);

router.get("/blogs", list);
router.get("/blog/:slug", read);
router.get("/blog/photo/:slug", photo);

router.delete("/blog/:slug", requireSignin, adminMiddleware, remove);

router.put("/blog/:slug", requireSignin, adminMiddleware, update);

module.exports = router;

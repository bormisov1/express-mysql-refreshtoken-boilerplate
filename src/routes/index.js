const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const fileController = require("../controllers/file");

router.post("/signup", authController.formatId, authController.signup);
router.post("/signin", authController.formatId, authController.signin);
router.post("/signin/new_token", authController.issueAccessToken);
router.use(authController.authenticateAccess);
router.post("/logout", authController.logout);
router.post("/file/upload", fileController.acceptFile, fileController.upload);
router.put(
  "/file/update/:id",
  fileController.acceptFile,
  fileController.update
);
router.get("/file/list", fileController.list);
router.delete("/file/delete/:id", fileController.remove);
router.get("/file/:id", fileController.details);
router.get("/file/download/:id", fileController.download);
router.get("/info", (req, res) => res.send(req.user.id));

module.exports = router;

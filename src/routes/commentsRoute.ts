import express from "express";
import commentsController from "../controllers/commentsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         postId:
 *           type: mongoose.Schema.Types.ObjectId
 *           description: The postId associated with the comment
 *         comment:
 *           type: string
 *           description: The content of the comment
 *         sender:
 *           type: string
 *           description: The owner of the comment id
 *       example:
 *         _id: 245234t234234r234r23f4
 *         postId: 685211t234234r124r23aa
 *         comment: This is the content of my comment.
 *         sender: 324vt23r4tr234t245tbv45by
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts
 *     tags:
 *       - Comments
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get("/", (req, res) => {
  commentsController.getAll(req, res);
});

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a single comment by its ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.get("/:id", (req, res) => {
  commentsController.getById(req, res);
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              postId:
 *                type: mongoose.Schema.Types.ObjectId
 *                description: The postId associated with the comment
 *              comment:
 *                type: string
 *                description: The content of the comment
 *              sender:
 *                type: string
 *                description: The owner of the comment id
 *             required:
 *               - postId
 *               - comment
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, (req, res) => {
  commentsController.create(req, res);
});

/**
 * @swagger
 * comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     description: Delete a single comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, (req, res) => {
  commentsController.deleteById(req, res);
});

export default router;

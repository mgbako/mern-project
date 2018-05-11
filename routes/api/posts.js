const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const validatePostInput = require("../../validations/post");

/**
 * @route GET api/post/
 * @desc Get All Post
 * @access Public
 */

router.get("/", (req, res) => {
  Post.find()
    .sort({
      date: -1
    })
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error =>
      res.status(404).json({
        post: "No post found"
      })
    );
});

/**
 * @route POST api/post/
 * @desc Create Posts
 * @access Private
 */

router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      content: req.body.content,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost
      .save()
      .then(posts => {
        res.status(200).json(posts);
      })
      .catch(error => res.status(500).json(error));
  }
);

/**
 * @route GET api/post/:post_id
 * @desc Get a single Post
 * @access Public
 */

router.get("/:post_id", (req, res) => {
  Post.findById(req.params.post_id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error =>
      res.status(404).json({
        post: "No post found"
      })
    );
});

/**
 * @route DELETE api/post/:post_id
 * @desc Delete single Post
 * @access Private
 */

router.delete(
  "/:post_id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    })
      .then(profile => {
        Post.findById(req.params.post_id).then(post => {
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              post: "you can not delete this post"
            });
          }

          post
            .remove()
            .then(() => {
              return res.status(200).json({
                post: "Post deleted"
              });
            })
            .catch(error =>
              res.status(404).json({
                post: "No post found"
              })
            );
        });
      })
      .catch(error =>
        res.status(404).json({
          profile: "Profile Not found"
        })
      );
  }
);

/**
 * @route POST api/post/:id/like/
 * @desc Like Post
 * @access Private
 */

router.post(
  "/:id/like",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res.status(400).json({
            liked: "You already liked this post"
          });
        }

        post.likes.unshift({
          user: req.user.id
        });
        post
          .save()
          .then(post =>
            res.status(200).json({
              liked: "You liked this Post"
            })
          )
          .catch(error =>
            res.status(404).json({
              post: "Post not found"
            })
          );
      });
    });
  }
);

/**
 * @route POST api/post/:id/unlike
 * @desc Like Post
 * @access Private
 */
router.post(
  "/:id/unlike",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          res.json({
            liked: "You have not liked this post"
          });
        }

        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);
        post
          .save()
          .then(post =>
            res.status(200).json({
              unliked: "You have Unliked this Post"
            })
          )
          .catch(error =>
            res.status(404).json({
              post: "Post not found"
            })
          );
      });
    });
  }
);

/**
 * @route POST api/post/:id/comment
 * @desc Comment on Post
 * @access Private
 */
router.post(
  "/:id/comment",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        newComment = {
          user: req.user.id,
          content: req.body.content,
          name: req.body.name,
          avatar: req.body.avatar
        };

        post.comments.unshift(newComment);
        post
          .save()
          .then(post => {
            res.status(200).json(post);
          })
          .catch(error =>
            res.status(404).json({ comment: "Comment not saved" })
          );
      })
      .catch(error => res.status(404).json({ post: "Post not found" }));
  }
);

/**
 * @route POST api/post/:id/comment
 * @desc Remove Comment from Post
 * @access Private
 */
router.delete(
  "/:id/comment/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.comments.filter(
                comment => comment._id.toString() === req.params.comment_id
              ).length === 0
            ) {
              res.status(404).json({ comment: "No comment found" });
            }

            const removeIndex = post.comments
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            post.comments.splice(removeIndex, 1);
            post
              .save()
              .then(post => res.status(200).json(post))
              .catch(error => res.status(404).json({ comment: error }));
          })
          .catch(error => res.status(404).json({ post: error }));
      })
      .catch(error => res.status(404).json({ profile: error }));
  }
);
module.exports = router;

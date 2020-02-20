const express = require('express')
const router  = express.Router({mergeParams: true})
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const { isLoggedIn, checkCommentOwnership } = require('../middleware')

//Comments New
router.get('/new', isLoggedIn, (req, res) => {
    // find campground by id
    console.log(req.params.id)
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err)
        } else {
             res.render('comments/new', {campground: campground})
        }
    })
})

//Comments Create
router.post('/', isLoggedIn,(req, res) => {
   //lookup campground using ID
   Campground.findById(req.params.id, (err, campground) => {
       if(err){
           console.log(err)
           res.redirect('/campgrounds')
       } else {
        Comment.create(req.body.comment, (err, comment) => {
           if(err){
               req.flash('error', 'Something went wrong')
               console.log(err)
           } else {
               //add username and id to comment
               comment.author.id = req.user._id
               comment.author.username = req.user.username
               //save comment
               comment.save()
               campground.comments.push(comment)
               campground.save()
               console.log(comment)
               req.flash('success', 'Successfully added comment')
               res.redirect('/campgrounds/' + campground._id)
           }
        })
       }
   })
})

// COMMENT EDIT ROUTE
router.get('/:comment_id/edit', checkCommentOwnership, (req, res) => {
   Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err){
          res.redirect('back')
      } else {
        res.render('comments/edit', {campground_id: req.params.id, comment: foundComment})
      }
   })
})

// COMMENT UPDATE
router.put('/:comment_id', checkCommentOwnership, (req, res) => {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if(err){
          res.redirect('back')
      } else {
          res.redirect('/campgrounds/' + req.params.id )
      }
   })
})

// COMMENT DESTROY ROUTE
router.delete('/:comment_id', checkCommentOwnership, (req, res) => {
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
       if(err){
           res.redirect('back')
       } else {
           req.flash('success', 'Comment deleted')
           res.redirect('/campgrounds/' + req.params.id)
       }
    })
})

module.exports = router
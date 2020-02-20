const express = require('express')
const router  = express.Router()
const Campground = require('../models/campground')
const { asyncMiddleware, isLoggedIn, checkCampgroundOwnership } = require('../middleware')


//INDEX - show all campgrounds
router.get('/', asyncMiddleware(async (req, res, next) => {
  // Get all campgrounds from DB
  let allCampgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds: allCampgrounds})
}))

//CREATE - add new campground to DB
router.post('/', isLoggedIn, asyncMiddleware(async (req, res) => {
  // get data from form and add to campgrounds array
  let name = req.body.name
  let image = req.body.image
  let desc = req.body.description
  let author = {
      id: req.user._id,
      username: req.user.username
  }
  let newCampground = {name: name, image: image, description: desc, author:author}
  // Create a new campground and save to DB
  let newlyCreated = await Campground.create(newCampground)
  //redirect back to campgrounds page
  console.log(newlyCreated)
  res.redirect('/campgrounds')
}))

//NEW - show form to create new campground
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new') 
})

// SHOW - shows more info about one campground
router.get('/:id', asyncMiddleware(async (req, res) => {
  //find the campground with provided ID
  let foundCampground = await Campground.findById(req.params.id).populate('comments').exec()
  //render show template with that campground
  res.render('campgrounds/show', {campground: foundCampground})
}))

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', checkCampgroundOwnership, asyncMiddleware(async (req, res) => {
  let foundCampground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', {campground: foundCampground})
}))

// UPDATE CAMPGROUND ROUTE
router.put('/:id', checkCampgroundOwnership, asyncMiddleware(async (req, res) => {
  // find and update the correct campground
  await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
  //redirect somewhere(show page)
  res.redirect(`/campgrounds/${req.params.id}`)
}))

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', checkCampgroundOwnership, asyncMiddleware(async (req, res) => {
  await Campground.findByIdAndRemove(req.params.id)
  res.redirect('/campgrounds')
}))

module.exports = router

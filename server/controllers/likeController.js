const User = require('../models/User')
const Blog = require('../models/Blog')
const Like = require('../models/Like')

// @desc Get all likes
// route Get /lies
// @access Private
const getAllLikes = async (req, res) => {
  const likes = await Like.find().lean()

  if (!likes.length) return res.status(400).json({ message: 'No likes found' })

  res.status(200).json(likes)
}

// // @desc Get likes for specific blog
// // route Get /lies
// // @access Private
// const getLikesFromBlog = async (req, res) => {
//   const { blog_id } = req.body

//   const numbersOfLike = await Like.findOne({ blog_id }).lean().exec()

//   if (!numbersOfLike) return res.status(400).json({ message: 'No likes found for current Blog' })

//   res.status(200).json(numbersOfLike)
// }


const getLikesForUser = async (req, res) => {


  const { username } = req.query

  console.log('username', username)

  const currentUserLikes = await Like.aggregate([
    { $match: { liked_by_user_username: username } }
  ])

  // if (!currentUserLikes.length) return res.status(400).json({ message: 'No liked blog found' })

  console.log(currentUserLikes)

  res.status(200).json(currentUserLikes)
}

// @desc created a like to specific blog
// route post /lies
// @access Private
const addedLike = async (req, res) => {
  const { blog_id, user_id, username, is_like } = req.body

  console.log(req.body)

  if (!blog_id || !user_id || !username, !is_like) return res.status(200).json({ message: 'All fields are required' })

  const blog = await Blog.findById(blog_id).lean().exec()

  console.log(blog)

  if (!blog) return res.status(400).json({ message: 'net work error, please try again' })


  const info = {
    blog_id,
    blog_owner: blog.user_id,
    liked_by_user_id: user_id,
    liked_by_user_username: username,
    is_like,
  }

  await Like.create(info)

  res.status(200).json({ message: `${username} has liked to this Blog` })
}

const editLIke = async (req, res) => {
  const { blog_id, is_like } = req.body


  // Like.findOne({ blog_id }).lean().exec() turn plain js object not mongodb document, can not save
  const likedBlog = await Like.findOne({ blog_id }).exec()

  if (!likedBlog) return res.status(400).json({ message: 'net work error, please try again' })
  console.log(likedBlog)

  likedBlog.is_like = is_like

  await likedBlog.save()

  res.status(200).json({ message: 'updated' })
}

const deleteLike = async (req, res) => {
  const { blog_id } = req.body
  const likedBlog = await Like.findOne({ blog_id }).exec()

  if (!likedBlog) return res.status(400).json({ message: 'net work error, please try again' })
  console.log(likedBlog)

  await likedBlog.deleteOne()

  res.status(200).json({ message: 'unlike this blog' })
}



module.exports = { getAllLikes, getLikesForUser, addedLike, editLIke, deleteLike }
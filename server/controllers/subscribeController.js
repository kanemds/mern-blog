const User = require('../models/User')
const Blog = require('../models/Blog')
const Subscribe = require('../models/Subscribe')



// @desc Get subscribe for current user 
// route Get /subscribe
// @access Private
const findSubscribedUsers = async (req, res) => {
  const { username } = req.query

  const isUserExist = await User.find({ username }).exec()

  if (!isUserExist) return res.status(404).json({ message: 'The username is not exist' })

  const currentUserSubscribed = await Subscribe.aggregate([
    { $match: { subscribed_by_user_username: username } }
  ])

  console.log(currentUserSubscribed)

  if (!currentUserSubscribed || !currentUserSubscribed.length) return res.status(200).json([])

  const decOrderSub = await currentUserSubscribed?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.status(200).json(decOrderSub)
}

const addSubscribe = async (req, res) => {
  const { id, userId, username, isSubscribed } = req.body

  if (!id || !userId || !username) return res.status(404).json({ message: 'All fields are required' })
  const blog = await Blog.findById(id).lean().exec()
  if (!blog) return res.status(404).json({ message: 'net work error, please try again' })

  console.log(blog)
  const info = {
    blog_owner_id: blog.user_id,
    blog_owner_username: blog.username,
    subscribed_by_user_id: userId,
    subscribed_by_user_username: username,
    is_subscribed: isSubscribed,
  }

  console.log(info)
  await Subscribe.create(info)
  res.status(200).json({ message: `${username} has subscribed to this Blog` })
}

const deleteSubscribe = async (req, res) => {
  const { id } = req.body

  const subscribedBlog = await Subscribe.findById(id).exec()

  if (!subscribedBlog) return res.status(404).json({ message: 'net work error, please try again' })

  await subscribedBlog.deleteOne()
  console.log('subscribe removed')
  res.status(200).json({ message: 'The subscribed has been successfully removed from this blog.' })
}



module.exports = { findSubscribedUsers, addSubscribe, deleteSubscribe }
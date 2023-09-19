import React, { useEffect, useState } from 'react'

import { Box, Button, Paper, Container, Typography, AppBar, Toolbar, useScrollTrigger, IconButton } from '@mui/material'
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import Grid from '@mui/material/Unstable_Grid2'
import { blue } from '@mui/material/colors'
import ClientSearchBar from '../../components/ClientSearchBar'
import { useDeleteBlogMutation, useGetUserBlogsFromUserIdQuery } from './blogsApiSlice'
import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../../components/LoadingSpinner'
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined'
import UpgradeOutlinedIcon from '@mui/icons-material/UpgradeOutlined'
import VerticalAlignBottomOutlinedIcon from '@mui/icons-material/VerticalAlignBottomOutlined'
import VerticalAlignTopOutlinedIcon from '@mui/icons-material/VerticalAlignTopOutlined'
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import Blog from './Blog'


const Root = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center'
  },
}))


const SearchBarWidth = styled(Box)(({ theme }) => ({

  [theme.breakpoints.up('md')]: {
    width: '80%'
  },
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    justifyContent: 'center',
    width: '80%'
  },
}))

const PreView = styled(Button)({
  textTransform: 'none',
  background: blue[300]
})

const buttonStyle = {
  padding: '4px',
}


const dataList = [{ id: 1, 'type': 'All' }, { id: 2, 'type': 'Public' }, { id: 3, 'type': 'Private' }]

const BlogsList = () => {


  const { username, userId } = useAuth()

  const [
    deleteBlog,
    {
      data: removeMessage,
      isLoading: isDeleteLoading,
      isSuccess: isDeleteSuccess,
      isError: isDeleteError,
      error: deleteError
    }
  ] = useDeleteBlogMutation()

  const { userBlogs, isLoading, isSuccess, isError } = useGetUserBlogsFromUserIdQuery(userId, {
    selectFromResult: ({ data, isLoading, isSuccess, isError }) => ({
      userBlogs: data,
      isLoading,
      isSuccess,
      isError
    })
  })

  console.log(userBlogs)


  const [isSelected, setIsSelected] = useState('All')
  const [isDesc, setIsDesc] = useState(true) // high to low
  const [currentUserBlogs, setCurrentUserBlogs] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [isSearch, setIsSearch] = useState(false)
  const [refresh, setRefresh] = useState(false)


  useEffect(() => {
    if (isSuccess || refresh) {
      setCurrentUserBlogs(Object.values(userBlogs))
      setRefresh(false)
    }
  }, [isSuccess, refresh])


  const handleSelect = (e) => {
    setIsSelected(e.target.value)
  }



  const handleAscendent = () => {
    if (isDesc) {
      const ascendingOrder = currentUserBlogs?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setCurrentUserBlogs(ascendingOrder)
      setIsDesc(false)
    }
  }

  const handleDescendent = () => {
    if (!isDesc) {
      const descendingOrder = currentUserBlogs?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setCurrentUserBlogs(descendingOrder)
      setIsDesc(true)
    }
  }

  const handleSearch = () => {
    if (!searchInput.length) return console.log('nothing')
    const inputLowerCase = searchInput.toLowerCase()
    // console.log([...inputLowerCase]) // ['s', 'd', 'f', 'd', 's']
    const result = currentUserBlogs.filter(blog =>
      [inputLowerCase].some(character => blog.title.toLowerCase().includes(character) || blog.text.toLowerCase().includes(character))
    )

    if (!result.length) {
      setSearchInput('')
      setIsSearch(true)
      return setSearchResult('No search results found for blog(s)')
    } else {
      setSearchInput('')
      setIsSearch(true)
      return setSearchResult(result)
    }

  }

  const searchPublicBlogs = Array.isArray(searchResult) && searchResult?.filter(blog => blog.visible_to === 'public')
  const searchPrivateBlogs = Array.isArray(searchResult) && searchResult?.filter(blog => blog.visible_to === 'private')

  const publicBlogs = currentUserBlogs?.filter(blog => blog.visible_to === 'public')
  const privateBlogs = currentUserBlogs?.filter(blog => blog.visible_to === 'private')

  let content

  if (isLoading) {
    content = (
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <LoadingSpinner />
      </Box>
    )
  }



  if (isSuccess && !currentUserBlogs.length || isSuccess && !publicBlogs.length || isSuccess && !privateBlogs.length) {
    content =
      (<Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Typography>
          No Blogs are created
        </Typography>
      </Box>
      )
  }

  if (isSuccess && currentUserBlogs?.length > 0) {

    content = (

      <Grid container spacing={1} columns={{ xs: 12, sm: 12, md: 12, lg: 12, ll: 12, xl: 15, xxl: 12 }}>
        {
          isSelected === 'All' ?
            (
              currentUserBlogs?.map(blog =>
                <Grid key={blog.id} xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} >
                  <Blog blog={blog} deleteBlog={deleteBlog} setRefresh={setRefresh} isDeleteLoading={isDeleteLoading} removeMessage={removeMessage} />
                </Grid>)
            ) :
            isSelected === 'Public' ?
              (
                publicBlogs?.map(blog =>

                  <Grid key={blog.id} xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} >
                    <Blog blog={blog} />
                  </Grid>)
              ) :
              (
                privateBlogs?.map(blog =>
                  <Grid key={blog.id} xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} >
                    <Blog blog={blog} />
                  </Grid>)
              )
        }
      </Grid>
    )
  }

  return (

    <Box sx={{ width: '100%' }} >
      <Box sx={{ position: 'sticky', top: '70px', backgroundColor: 'white', zIndex: 10, width: '100%', pt: '10px', pb: '10px', pl: 2, pr: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
        <Box sx={{ width: '100%' }}>
          <ClientSearchBar setSearchInput={setSearchInput} searchInput={searchInput} handleSearch={handleSearch} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mt: 1 }}>
          <Box>
            {dataList?.map(category => {
              return (
                <Button style={buttonStyle} key={category.id} size='small' variant={isSelected === category.type ? 'contained' : 'text'} value={category.type} onClick={handleSelect} sx={{ minWidth: 0, mr: 2 }}>{category.type}</Button>
              )
            }
            )}
          </Box>
          <Box>
            {!isDesc ?
              <Button size='small' sx={{ minWidth: 0, p: 0 }} onClick={handleDescendent}>
                <ReorderOutlinedIcon />
                <ExpandMoreOutlinedIcon />
                DESC
              </Button>
              :
              <Button size='small' sx={{ minWidth: 0, p: 0 }} onClick={handleAscendent}>
                <ReorderOutlinedIcon />
                <ExpandLessOutlinedIcon />
                ACES
              </Button>
            }
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        {Array.isArray(searchResult) && searchResult.length && isSearch ?
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 12, ll: 12, xl: 15, xxl: 12 }}>

            {
              isSelected === 'All' ?
                (
                  searchResult?.map(blog =>
                    <Grid key={blog.id} xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Blog blog={blog} />
                    </Grid>)
                ) :
                isSelected === 'Public' ?
                  (
                    searchPublicBlogs?.map(blog =>

                      <Grid key={blog.id} xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Blog blog={blog} />
                      </Grid>)
                  ) :
                  (
                    searchPrivateBlogs?.map(blog =>
                      <Grid key={blog.id} xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Blog blog={blog} />
                      </Grid>)
                  )
            }
          </Grid>
          :
          typeof searchResult === 'string' && searchResult.length && isSearch ?
            <Box> {searchResult}</Box>
            :

            content


        }

      </Box>
    </Box >

  )
}

export default BlogsList
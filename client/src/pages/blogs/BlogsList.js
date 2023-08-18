import React from 'react'

import { Box, Button, Paper, Container, Typography, AppBar, Toolbar } from '@mui/material'
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import Grid from '@mui/material/Unstable_Grid2'
import Note from '../../components/Note'
import FrontPageSearchBar from '../../components/FrontPageSearchBar'

import { blue } from '@mui/material/colors'
import ClientSearchBar from '../../components/ClientSearchBar'
import { useGetBlogsQuery, useGetUserBlogsQuery } from './blogsApiSlice'
import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../../components/LoadingSpinner'


const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      ll: 1460,
      xl: 1670,
      xxl: 1950
    },
  },
})



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


const BlogsList = () => {

  const { username } = useAuth()
  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetBlogsQuery()


  // const { entities } = useGetBlogsQuery('blogsList', {
  //   selectFromResult: ({ data }) => ({
  //     entities: data?.entities
  //   })
  // })
  let content

  if (isLoading) {
    content = (
      <Box sx={{ position: 'relative', height: 'calc(100vh - 166px)' }} >
        <LoadingSpinner />
      </Box>
    )
  }

  if (isSuccess) {
    const blogs = Object.values(data?.entities)
    const userBlogs = blogs.filter(blog => blog.user === username)
    content = <LoadingSpinner />
    content = (
      <ThemeProvider theme={theme}  >
        <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 12, ll: 12, xl: 15, xxl: 12 }}>
          <Grid xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} sx={{ display: 'flex', justifyContent: 'center' }}><Note /></Grid>
          {userBlogs?.map(blog => (
            <Grid xs={12} sm={12} md={6} lg={4} ll={3} xl={3} xxl={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Note blog={blog} />
            </Grid>
          )
          )}
        </Grid>
      </ThemeProvider>
    )
  }


  return content
}

export default BlogsList
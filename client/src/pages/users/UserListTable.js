import React, { useMemo, useState } from 'react'
import { useGetUsersQuery } from './UserApiSlice'
import { Avatar, Button, Typography, Switch, FormGroup, FormControlLabel, Link, IconButton } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { DataGrid, gridClasses, GridCellParams } from '@mui/x-data-grid'
import PersonIcon from '@mui/icons-material/Person'
import { grey, blue, orange } from '@mui/material/colors'
import ToggleButton from '../../components/ToggleButton'
import SaveActionFromUsersList from './SaveActionFromUsersList'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import GridViewIcon from '@mui/icons-material/GridView'

const UserListTable = ({ usersList }) => {

  const navigate = useNavigate()

  const [rowId, setRowId] = useState(null)


  const user = usersList.map(user => {
    return {
      id: user?._id,
      userName: user?.username,
      email: user?.email,
      roles: user?.roles,
      active: user?.active,
      createAt: user?.createdAt,
      updateAt: user?.updatedAt,

    }
  })



  const options = { year: 'numeric', month: 'short', day: 'numeric' }

  const handleEdit = (userId) => {
    navigate(`/dash/users/edit/${userId}`)
  }

  const columns = useMemo(() => [

    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      renderCell: (params) => params.row.avatar ?
        <Avatar src={params.row.avatar} />
        :
        <Avatar sx={{ backgroundColor: grey[600] }}><PersonIcon /></Avatar>
      ,
      sortable: false,
      filterable: false,
    },
    { field: 'id', headerName: 'ID', width: 130 },
    { field: 'userName', headerName: 'User Name', width: 130 },
    { field: 'email', headerName: 'E-mail', width: 130 },
    {
      field: 'roles',
      headerName: 'Roles',
      width: 130,
      type: 'singleSelect',
      valueOptions: ['Employee', 'Admin', 'Client'],
      editable: true
    },
    {
      field: 'view',
      headerName: 'View',
      width: 130,
      renderCell: params => (
        <IconButton
          sx={{ fontSize: 35, backgroundColor: orange[400], '&:hover': { color: 'white' } }}
          onClick={() => handleEdit(params.id)}
        >
          <GridViewIcon sx={{ color: 'white', '&:hover': { color: orange[400] } }} />
        </IconButton>
      )
    },
    {
      field: 'active',
      headerName: 'State',
      width: 170,
      renderCell: params => {
        console.log('toggleButton did not change state', params.row.active)
        return (
          <ToggleButton active={params.row.active} />
        )
      },
      sortable: true,
      filterable: true,
    },
    {
      field: 'createAt',
      headerName: 'Created At',
      type: 'number',
      width: 130,
      renderCell: params => new Intl.DateTimeFormat('en-US', options).format(new Date(params.row.createAt))
    },
    {
      field: 'updateAt',
      headerName: 'Last Updated',
      type: 'number',
      width: 130,
      renderCell: params => new Intl.DateTimeFormat('en-US', options).format(new Date(params.row.updateAt))
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      renderCell:
        params => (
          <SaveActionFromUsersList {...{ params, rowId, setRowId }} />
        )

    },


    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    //   valueGetter: (params) =>
    //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    // },
  ],
    [rowId]
  )

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={user}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }

        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: 'primary.light',
          '.MuiDataGrid-cell:hover': {
            color: 'white',
          },
          // odd row background
          [`& .${gridClasses.row}.odd`]: {
            backgroundColor: grey[400],
          },
          [`& .${gridClasses.row}.even`]: {
            backgroundColor: grey[200],
          },
          //  rows css
          [`& .${gridClasses.row}`]: {
            '&.Mui-selected': {
              backgroundColor: blue[500],
              color: 'white',
              '&:hover': {
                backgroundColor: blue[500]
              },
              '& .MuiDataGrid-cell:hover': {
                color: 'black',
              },
            },
            '&:hover': {
              backgroundColor: blue[200],
            },
          }
        }}
      />
    </div>
  )
}

export default UserListTable
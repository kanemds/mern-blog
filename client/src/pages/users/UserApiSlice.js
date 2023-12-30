import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({

  // this sortCompare to sort ids:[] array only not entities:{...}
  // 0: same order 1: to the front -1: to the back
  sortComparer: (a, b) => (a.roles < b.roles) ? 1 : (a.roles > b.roles) ? -1 : 0
})

// console.log('usersAdapter', usersAdapter) // provided list of method : {selectId: ƒ, sortComparer: ƒ, getInitialState: ƒ, getSelectors: ƒ, removeOne: ƒ, …}

const initialState = usersAdapter.getInitialState()

// // usersAdapter.getInitialState() one of the createEntityAdapter method
// console.log('initialState', initialState) // return {ids:[], entities:[]}

export const usersApiSlice = apiSlice.injectEndpoints({
  // The build object contains various methods and utilities that allow you to define and configure different parts of your API.
  endpoints: builder => ({
    //  The build.query() method is used to define a query endpoint, which typically retrieves data from the server.
    getUsers: builder.query({
      query: () => ({
        url: '/users',
        validateStatus: (response, result) => {
          // prevent fetch error with stateCode === 200
          return response.status === 200 && !result.isError // set isError:true in the middleware errorMessage for unexpected error
        }
      }),
      // specifies that unused data will be retained for 5 seconds.
      // default as 60s if it has not been set
      // data will be gone after when using  useSelector(state => selectUserById(state, id))
      keepUnusedDataFor: 5,
      // change format from  [{id,username}, {…}]
      // to  {ids: Array(…), entities: {…}}
      transformResponse: responseData => {
        // before transformResponse: user.id is no exist
        const loadedUsers = responseData.map(user => {

          user.id = user._id
          // added extra value to each user:{id: "64a8a25ada03bef05ab843dc"}
          return user
        })
        // setAll(currentState,replace the currentState)
        return usersAdapter.setAll(initialState, loadedUsers)
        //  mongoDB default .id as ._id
        // redux toolkit can only read id as .id to transform as  {ids: Array(…), entities: {…}} for usersAdapter.getInitialState() formate
      },
      providesTags: (result, error, arg) => {
        // auto refetch if list or specific id changed
        // console.log('tagResult', result) // {ids: Array([…]), entities: {…}}
        // console.log('tagArg', arg)

        if (result?.ids) {
          // const example = result.ids.map(id => ({ type: 'User', id:id }))
          // console.log(...example)
          // {type: 'User', id: '6491ff902633c1ed798e648e'}
          return [
            { type: 'User', id: 'LIST' },
            // spread each tag, id = {id:id}

            ...result.ids.map((id) => ({ type: 'User', id }))
          ]
        } else return [{ type: 'User', id: 'LIST' }]
      }
    }),
    addNewUser: builder.mutation({
      query: userData => ({
        url: '/users',
        method: 'POST',
        body: userData
      }),
      invalidatesTags: [{
        type: 'User', id: 'LIST'
      }]
    }),
    updateUser: builder.mutation({
      query: updateData => ({
        url: '/users',
        method: 'PATCH',
        body: updateData
      }),
      invalidatesTags: (result, error, arg) => {
        // the updated user info: {id: '64a5fa16c6aa3ed5b30e837d', username: 'John', email: 'john@gmail.com', role: 'Admin', active: false}
        // console.log('invalidatesTags-arg', arg)
        return [
          { type: 'User', id: arg.id },
          { type: 'User', avatar: arg.avatar },
          { type: 'Blog', id: 'LIST' }
        ]
      }
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: '/users',
        method: 'DELETE',
        body: { id }
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: arg.id }
      ]
    })
  })
})

export const {
  //  hook generated by the API slice, providing access to the 
  useGetUsersQuery,
  useAddNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = usersApiSlice



// using builder.query() it automatically generates a set of hooks and selectors, including the select() method for that endpoint
// The select() method takes no arguments and returns a selector function. 



export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

// By calling this selector function with useSelector, you can access the result of the getUsers query from the Redux store's state in your component.

// const usersResult = useSelector(selectUsersResult);

// return:
// data: { ids: Array(2), entities: {… } }
// endpointName: "getUsers"
// fulfilledTimeStamp: 1687638568305
// isError: false
// isLoading: false
// isSuccess: true
// isUninitialized: false
// requestId: "b5vnBUgZeat8KoqsOQJBL"
// startedTimeStamp: 1687638568265
// status: "fulfilled"


// the second arg stores data from the first arg.
// the stored data from second arg will changed only the first arg update
// else the request data will send from the stored data object 

const selectUsersData = createSelector(
  selectUsersResult,
  // the stored data is specific from  selectUsersResult.data which is data: { ids: Array(2), entities: {… } }
  selectUsersResultObject => selectUsersResultObject.data
)


export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)

// in this case, selectUsersData(state) is used to check if the state contains the desired data.

// The selectUsersData selector is created using createSelector, and its purpose is to extract the data property from the selectUsersResult object. 
// By invoking selectUsersData(state), you are checking if the data property exists in the provided state.

// If the data property exists and is not undefined or null, selectUsersData(state) will return the value of the data property. Otherwise, it will return undefined.

// The ?? operator is then used to provide a fallback value (initialState) in case the data property is not present or is undefined in the state.



// other case

// By passing selectTodos to todosAdapter.getSelectors, you ensure that the selectors are based on the correct slice of the state containing the todos data.

// export const selectTodos = (state) => state.todos;
// export const {
//   selectAll: selectAllTodos,
//   selectById: selectTodoById,
//   selectIds: selectTodoIds,
//   selectEntities: selectTodoEntities,
// } = todosAdapter.getSelectors(selectTodos);


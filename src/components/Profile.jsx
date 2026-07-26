import React from 'react'
import EditProfile from './EditProfile'
import { useSelector } from 'react-redux'

const Profile = () => {
  const data = useSelector((store) => store.user);
  return (
      <div >
        {
        data &&
        < EditProfile user={data} />
        }
        </div> 
        
  )
}

export default Profile;

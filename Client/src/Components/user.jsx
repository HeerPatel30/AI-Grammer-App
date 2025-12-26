import React, { useState } from 'react'

const User = () => {
 
    const [user, setUser] = useState({
        name:"",
        email:"",
        password:"" 
    })
    const handleSubmit = async(e)=>{
        e.preventDefault();
        
    }
   return (
    <>
    <h1>User</h1>
    <form onSubmit={handleSubmit} >
        <input type="text" placeholder='Name' name='name' value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
        <input type="email" placeholder='Email' name='email' value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} />
        <input type="password" placeholder='Password' name='password' value={user.password} onChange={(e) => setUser({...user, password: e.target.value})} />
        <button type='submit'>Submit</button>

    </form>
    </>
  )
}

export default User
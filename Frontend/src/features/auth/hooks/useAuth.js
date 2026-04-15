import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {login,register,logout} from "../services/auth.api"

export const useAuth = () => {

  const context = useContext(AuthContext)
  const { user, setUser, loading, setLoading} = context

  // const handleLogin = async ({email, password}) => {
  //   setLoading(true)
  //   try {
  //     const data = await login({email, password})
  //     setUser(data.user)
  //   } catch(err) {
  //     console.log(err);
  //   }finally{
  //     setLoading(false)
  //   }
  // }

// const handleRegister = async ({username, email, password})  => {
//   setLoading(true)
//   try{
//     const data = await register({username, email, password})
//     // ❌ REMOVE THIS
//     // setUser(data.user)
//   }catch(err){
//     console.log(err);
//   } finally{
//     setLoading(false)
//   }
// }

const handleLogin = async ({ email, password }) => {
  setLoading(true);
  try {
    const data = await login({ email, password });

    setUser(data.user);

    return { success: true };   // ✅ important

  } catch (err) {
    console.log(err);

    return {
      error: err?.response?.data?.message || "Invalid credentials"
    };

  } finally {
    setLoading(false);
  }
};


const handleRegister = async ({ username, email, password }) => {
  setLoading(true);
  try {
    const data = await register({ username, email, password });

    // ❌ do NOT auto login
    // setUser(data.user)

    return { success: true };

  } catch (err) {
    console.log(err);

    // ✅ send backend error message
    return {
      error: err?.response?.data?.message || "User already exists"
    };

  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    setLoading(true)
    try {
      const data = await logout()
      setUser(null)
    }catch(err) {
      console.log(err);
    }finally {
      setLoading(false)
    }
  }


  
  // Auth initialization is handled once by AuthProvider.

  return {user, loading, handleRegister, handleLogin, handleLogout}








}
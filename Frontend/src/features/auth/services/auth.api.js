import axios from "axios"


const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
})

// use api.post
// api.get


export async function register({username, email, password}) {

  try {

  const response = await axios.post('http://localhost:3000/api/auth/register', {username, email, password},
    {withCredentials: true}
    // SERVER ACCESS TO READ AND SET DATA IN COOKIES
  );
  return response.data

  } catch(err) {
    console.log(err);
    throw err;
  }

}

export async function login({email, password}) {

    try {
      
      const response= await axios.post("http://localhost:3000/api/auth/login", {email, password},
        {withCredentials: true}
      );
      return response.data

    } catch(err){
      console.log(err);
    }


    
}

export async function logout() {
  
  try {
    const response = await axios.get("http://localhost:3000/api/auth/logout", {withCredentials:true})

    return response.data

  }catch(err) {
    console.log(err)
  }
}

export async function getMe() {
  
  try {
    const response = await axios.get("http://localhost:3000/api/auth/get-me", {withCredentials:true});

    return response.data
  } catch(err) {
    console.log(err)
  }
}


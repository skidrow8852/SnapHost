"use server"

export const signup = async(formData :  FormData) =>{
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");
}
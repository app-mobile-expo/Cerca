import { useState } from "react";

export function useLogin(){
    const [email, setEmail] = useState("")
    const [password, setPassword] =  useState("")

    const handleLogin = () =>{
        console.log({
            email,
            password
        })
    }

    return {
        email,
        password,
        setEmail,
        setPassword,
        handleLogin

    }
}
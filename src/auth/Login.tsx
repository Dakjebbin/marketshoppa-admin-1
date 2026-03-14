"use client";

import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { assets } from "../assets/assests";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("");
 
    const baseUrl = import.meta.env.VITE_BASE_URL || "/api"

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e:React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
setIsLoading(true)
    try {
      const response = await axios.post(`${baseUrl}/authUser/login`,{
        email,
        password
      }, {
        withCredentials:true
      })

      if (response.status === 200) {
        toast.success("Log in Successful"); 
        setEmail("")
        setPassword("")
        window.location.assign("/auth/dashboard")
      }
    } catch (error) {
        if (error instanceof axios.AxiosError) {
            if (!error.response) {
              toast.error("Network error. Please check your internet connection.")
            } else {
              toast.error(error.response.data?.message || "Something went wrong")
            }
          }
    } finally {
      setIsLoading(false)
    }
  }

  const isFormCompleted = 
   email && password;
  return (
    <div className="flex flex-col m-auto md:w-[92%] w-[98%] h-screen justify-center items-center ">
      <div className='flex items-center gap-2'>
        <div className='bg-primary flex items-center justify-center shrink-0 w-7.75 h-7.75 rounded-md'>
        <img className='w-[70%] shrink-0 ' src={assets.logo} alt="logo" />
        </div>
        <p className='font-bold text-lg'>MarketMate <span className='bg-text'>Admin</span></p>
      </div>
      <p className="md:text-3xl text-2xl text-center font-bold mt-5 text-gray-800 ">Log in to your MarketShoppa Account</p>

      <form onSubmit={handleSubmit} className=" flex flex-col gap-5 px-6 mt-10 md:w-[50%] w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="Email" className="font-semibold text-gray-800 md:text-base text-sm">
            Email Address
          </label>
          <span className="flex items-center gap-3 border w-full border-[#D0D5DD] rounded-lg px-5 py-2 focus-within:ring focus-within:ring-[#3ea40b] focus-within:border-[#3ea40b]">
            <MdOutlineMailOutline size={18} className="text-[#C5C5C5]" />
            <input
              type="email"
              className="outline-none w-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g jonesfelas@gmail.com"
              id=""
            />
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-800 md:text-base text-sm">
            Password
          </label>
          <div className=" flex items-center border w-full border-[#D0D5DD] rounded-lg pl-3  py-2 focus-within:ring focus-within:ring-[#3ea40b] focus-within:border-[#3ea40b]">
            <RiLockPasswordLine className="text-[#C5C5C5]" />
            <input
              placeholder="Enter your password"
              className="w-[90%] outline-none pl-3"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
            />

            {showPassword ? (
              <FaEye
                onClick={togglePassword}
                className="w-[10%] cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={togglePassword}
                className="w-[10%] text-[#C5C5C5] cursor-pointer"
              />
            )}
          </div>
        </div>

        <button
              disabled={!isFormCompleted}
              type='submit'
              className={`mt-5 text-center w-full rounded-lg text-white py-3 text-sm ${!isFormCompleted ? "cursor-not-allowed bg-[#a5d6a7] text-[#F7F8FA]" : "cursor-pointer bg-[#3ea40b] shadow-md shadow-[#3ea40b]"}`}>
                {isLoading ? "Loading..." : "Login"}
              </button>
      </form>
    </div>
  );
};

export default Login;

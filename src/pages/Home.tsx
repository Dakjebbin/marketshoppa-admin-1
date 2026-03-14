"use client";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Hero from "../components/Hero";
import { useAuth } from "../context/auth.context";

const Home = () => {
  const { user } = useAuth();

  if(!user){
    return null
  }

  if(user.role !== "Admin") {
     window.location.assign("/")
     toast.error("Not admin")
     return null
  }
  return (
    <>
      {user && (
        <div>
          <Header />
          <Hero />
        </div>
      )}

      {!user && (<div>session expired</div>)}
    </>
  );
};

export default Home;

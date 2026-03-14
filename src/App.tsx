import { Route, Routes } from "react-router-dom"
import Login from "./auth/Login"
import Home from "./pages/Home"

const App = () => {


  return (
    <div className="max-w-375 mx-auto w-full">
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/auth/dashboard" element={<Home/>} />
      </Routes>
      
    </div>
  )
}

export default App
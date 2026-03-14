
import { assets } from '../assets/assests'
import { IoMdRefresh } from 'react-icons/io'
import { useAuth } from '../context/auth.context'

const Header = () => {
  const {user} = useAuth();

  if(!user){
    return null
  }

  return (
    <header className='bg-white border-b py-2 px-6 border-[#f4f6f8] flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='bg-primary flex items-center justify-center shrink-0 w-7.75 h-7.75 rounded-md'>
        <img className='w-[70%] shrink-0 ' src={assets.logo} alt="logo" />
        </div>
        <p className='font-bold text-lg'>MarketShoppa <span className='bg-text'>Admin</span></p>
      </div>

      <div className='border border-[#f4f6f8] px-4 py-2 text-[#6b7280] rounded-lg text-sm flex items-center gap-1 cursor-pointer'>
      <IoMdRefresh />
        <p>Refresh</p>
      </div>
    </header>
  )
}

export default Header
import React from 'react'
import Appheader from './_components/Appheader'

const Dashboardlayout = ({children}) => {
  return (
    <div>
        <Appheader/>
        <div className='p-10 mt-15 md:px-20 lg:px-32 xl:px-54 2xl:px-56'>{children}</div>
        
    </div>
  )
}

export default Dashboardlayout
import { UserButton } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'

const Appheader = () => {
  return (
    <div className='p-3 shadow-sm flex justify-between items-center'>
        <Image src={'/logo.svg'} alt='logo' width={200} height={200}/>
        <UserButton/>
    </div>
  )
}

export default Appheader
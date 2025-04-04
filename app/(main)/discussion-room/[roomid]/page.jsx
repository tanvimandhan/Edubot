'use client'
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation'
import React from 'react'

import { useQuery } from 'convex/react';
import { useState,useEffect } from 'react';
import Image from 'next/image';
import { UserButton } from '@stackframe/stack';
import { CoachingExpert } from '@/services/options';

const DiscussionRoom = () => {
    const {roomid}=useParams();
    const DiscussionRoomData=useQuery(api.DiscussionRoom.GetDiscussionRoom,{id:roomid});
    const [expert,setExpert]=useState();
    //console.log(DiscussionRoomData);
    useEffect(()=>{
       if(DiscussionRoomData){
        const Expert = CoachingExpert.find(item => item.name === DiscussionRoomData.expertName);
          setExpert(Expert);
       }
    },[DiscussionRoomData])
    

  return (
    <div>
      <h2 className='text-lg font-bold'>
        {DiscussionRoomData?.coachingOption}
      </h2>
      <div className='mt-5 grid grid-cols-1 lg:grid-cols-3'>
        <div className='lg:col-span-2 h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative'>
          <Image src={expert?.avatar} alt='avatar' width={200} height={200} className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'/>
          <h2 className='text-gray-500'>{expert?.name}</h2>
          <div className='p-5 bg-gray-200 px-10 rounded-lg'>
            <UserButton/>
          </div>
        </div>
        <div className='lg:col-span-3 h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative'>
           <h2>chat section</h2>
        </div>
      </div>
    </div>
  )
}

export default DiscussionRoom
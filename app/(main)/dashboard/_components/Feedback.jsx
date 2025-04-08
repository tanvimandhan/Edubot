'use client'
import { UserContext } from '@/app/_context/UserContext';
import { useConvex } from 'convex/react'
import React, { useContext, useEffect } from 'react'
import { api } from '@/convex/_generated/api';
import { coachingOptions } from '@/services/options';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import Link from 'next/link';

const Feedback = () => {
  const convex=useConvex();
    const {userData}=useContext(UserContext);
    const [discussionRoomList,setDiscussionRoomList]=useState([]);
  
    useEffect(()=>{
      userData && GetDiscussionRooms();
    },[userData])
  
    const GetDiscussionRooms=async()=>{
       const result=await convex.query(api.DiscussionRoom.GetAllDiscussionRoom,{
        uid:userData?._id
       })
       console.log(result);
       setDiscussionRoomList(result);
    }
    const GetAbstractImages=(option)=>{
      const coachingOption=coachingOptions.find((item)=>item.name==option)
      return coachingOption?.abstract??'/ab1.png';
    }
    return (
      <div>
          <div>
              <h2 className='font-bold text-lg'>Your previous Feedback</h2>
  
              {discussionRoomList?.length==0&&<h2 className='text-gray-400'>no prev lectures watched</h2>}
              <div className='mt-5'>
                {discussionRoomList.map((item,index)=>(item.coachingOption=='Topic based lecture'||item.coachingOption=='Learn language' || item.coachingOption=='Topic based lecture'||item.coachingOption=='Meditation')(
                  <div key={index} className='border-b-[2px] pb-3 mb-4 group flex justify-between items-center cursor-pointer'>
                    <div className='flex gap-7 items-center'>
                      <Image src={GetAbstractImages(item.coachingOption)} alt='abstract' width={70} height={50} className='rounded-full h-[70px] w-[70px]'/>
                      <div >
                        <h2 className='font-bold'>{item.topic}</h2>
                        <h2 className='text-gray-400'>{item.coachingOption}</h2>
                        <h2 className='text-gray-400 text-sm'>{moment(item._creationTime).fromNow()}</h2>
                      </div>
                    </div>
                    <Link href={'/view-summary/'+item._id}>
                        <Button variant='outline' className='invisible group-hove:visible'>View Feedback</Button>
                    </Link>
                    
                  </div>
                  
                ))}
              </div>
          </div>
      </div>
    )
 
}

export default Feedback
'use client'
import React from 'react'
import { useParams } from 'next/navigation'

function ViewSummary() {
    const {roomid}=useParams();

    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
    console.log(DiscussionRoomData)
  return (
    <div>ViewSummary</div>
  )
}

export default ViewSummary
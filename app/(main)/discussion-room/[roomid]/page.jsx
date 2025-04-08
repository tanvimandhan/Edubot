'use client'
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import React, { useRef, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { UserButton } from '@stackframe/stack';
import { CoachingExpert } from '@/services/options';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { RealtimeTranscriber } from 'assemblyai';
import { getToken } from '@/services/GlobalServices';
import { Loader2 } from "lucide-react";
import ChatBox from './_components/chatBox';
import { AIModel } from '@/services/GlobalServices';


const RecordRTC = dynamic(() => import('recordrtc'), { ssr: false });

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
  const [expert, setExpert] = useState();
  const [enableMic, setEnableMic] = useState(false);
  const realtimeTranscriber = useRef(null);
  const [transcribe,setTranscribe]=useState();
  const [audioUrl,setAudioUrl]=useState();
  const [enableFeedbackNotes,setEnableFeedbackNotes]=useState(false);

  const UpdateConversation=useMutation(api.DiscussionRoom.UpdateConversation);
  const [conversation,setConversation]=useState([{
    role:'assistant',
    content:"Hi"
  },
  {
    role:'user',
    content:"hello"
  }
]);
  const [loading,setLoading]=useState(false);
  const recorder = useRef(null);
  const silenceTimeout = useRef(null);
  let texts={};
  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name === DiscussionRoomData.expertName);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    setEnableMic(true);
    setLoading(true);
    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
      sample_rate: 16000
    });

    realtimeTranscriber.current.on('transcript', async (transcript) => {
      console.log(transcript);
      let msg=''
      if(transcript.message_type=='FinalTranscript'){
         setConversation(prev=>[...prev,{
          role:'user',
          content:transcript.text
         }])
         //calling ai model to get response
         
      }
      texts[transcript.audio_start]=transcript?.text;
      const keys=Object.keys(texts);
      keys.sort((a,b)=>a-b);

      for(const key of keys){
        if(texts[key]){
          msg+=`${texts[key]}`
        }
      }setTranscribe(msg);
    })

    await realtimeTranscriber.current.connect();
    useEffect(()=>{
      async function fetchData(){
        if(conversation[conversation.length-1].role=='user'){
          const lastTwomsg=conversation.slice(-2);
          const aiRes=await AIModel(DiscussionRoomData.topic,DiscussionRoomData.coachingOption,lastTwomsg)
          console.log(aiRes);
          const url=await ConvertTextToSpeech(aiRes.content,DiscussionRoom.expertName);
          console.log(url)
          setAudioUrl(url);
          setConversation(prev=>[...prev,aiRes])
        }
      }
      fetchData();
    },[conversation])
    setLoading(false);
    toast('connected...')
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=pcm',
            recorderType: RecordRTC.StereoAudioRecorder, // ✅ fixed typo
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,

            ondataavailable: async (blob) => {
              if (!realtimeTranscriber.current) return;

              if (blob.size > 5 * 1024 * 1024) {
                console.warn('Skipping oversized blob');
                return;
              }

              try {
                const buffer = await blob.arrayBuffer();
                realtimeTranscriber.current.sendAudio(buffer);

                if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
                silenceTimeout.current = setTimeout(() => {
                  console.log('User stopped talking');
                }, 2000);
              } catch (err) {
                console.error('Error converting blob to buffer:', err);
              }
            },
          });

          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  };

  const disconnect = async (e) => {
    e.preventDefault();
    setEnableMic(false);
    setLoading(true);
    if (realtimeTranscriber.current) {
      await realtimeTranscriber.current.close();
      realtimeTranscriber.current = null;
    }

    if (recorder.current) {
      recorder.current.stopRecording(() => {
        recorder.current = null;
      });
    }

    if (silenceTimeout.current) {
      clearTimeout(silenceTimeout.current);
      silenceTimeout.current = null;
    }
    setEnableMic(false);
    toast('disconnected')
    await UpdateConversation({
      id:DiscussionRoomData._id,
      conversation:conversation
    })
    setLoading(false);
    setEnableFeedbackNotes(true);
  };

  useEffect(() => {
    return () => {
      if (realtimeTranscriber.current) {
        realtimeTranscriber.current.close();
        realtimeTranscriber.current = null;
      }

      if (recorder.current) {
        recorder.current.stopRecording(() => {
          recorder.current = null;
        });
      }

      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
        silenceTimeout.current = null;
      }
    };
  }, []);

  return (
    <div className='-mt-12'>
      <h2 className='text-lg font-bold'>
        {DiscussionRoomData?.coachingOption}
      </h2>
      <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10'>
        <div className='lg:col-span-2'>
          <div className='h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative'>
            <Image
              src={expert?.avatar || "/ab1.png"}
              alt='avatar'
              width={200}
              height={200}
              className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
            />
            <h2 className='text-gray-500'>{expert?.name || "Expert"}</h2>
            <audio src={audioUrl} type='audio/mp3' autoPlay/>
            <div className='p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10'>
              <UserButton />
            </div>
          </div>
          <div className='mt-5 flex items-center justify-center'>
            {!enableMic ? (
              <Button onClick={connectToServer} disabled={loading}>{loading&&<Loader2 className='animate-spin'/>} Connect</Button>
            ) : (
              <Button variant="destructive" onClick={disconnect}>v{loading&& <Loader2 className='animate-spin'/>} Disconnect</Button> // ✅ fixed onClickd
            )}
          </div>
        </div>
        <div>
          <ChatBox conversation={conversation} enableFeedbackNotes={enableFeedbackNotes}/>
        </div>
      </div>
      <div>
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
}

export default DiscussionRoom;

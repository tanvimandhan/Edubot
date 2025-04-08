import axios from "axios";
import OpenAI from "openai";
import { coachingOptions } from "./options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

export const getToken=async()=>{
    const result=await axios.get('/api/getToken');
    return result.data
}
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey:process.env.NEXT_PUBLIC_AI_OPENROUTER,
    dangerouslyAllowBrowser:true
  });

export const AIModel=async(topic,coachingOption,lastTwoConversation)=>{
  const option=coachingOptions.find((item)=>item.name==coachingOption)
  const PROMPT=(option.prompt).replace('{user_topic}',topic)
    const completion = await openai.chat.completions.create({
    model: "google/gemini-2.5-pro-exp-03-25:free",
    messages: [
      {role:'assistant',content:PROMPT},
      {
        "role": "user",
        "content":msg
        //  [
        //   {
        //     "type": "text",
        //     "text": "What is in this image?"
        //   },
        //   {
        //     "type": "image_url",
        //     "image_url": {
        //       "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
        //     }
        //   }
        // ]
      },...lastTwoConversation
    ],
    
  });

  console.log(completion.choices[0].message);
  return completion.choices[0].message;
}

export const AIModelToGenerateFeedbackAndNotes=async(coachingOption,conversation)=>{
  const option=coachingOptions.find((item)=>item.name==coachingOption)
  const PROMPT=(option.summaryprompt);
    const completion = await openai.chat.completions.create({
    model: "google/gemini-2.5-pro-exp-03-25:free",
    messages: [
      ...conversation,
      {role:'assistant',content:PROMPT},
    ],
    
  });

  console.log(completion.choices[0].message);
  return completion.choices[0].message;
}

export const ConvertTextToSpeech=async(text,expertName)=>{
  const pollyClient=new PollyClient({
    region:'us-east-1',
    credentials:{
       accessKeyId:process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
       secretAccessKey:process.env.NEXT_PUBLIC_AWS_SECRET_KEY
    }
  })
  const command=new SynthesizeSpeechCommand({
    Text:text,
    OutputFormat:'mp3',
    VoiceId:expertName
  })
  try{
    const {AudioStream}=await pollyClient.send(command);
    const audioArrayBuffer=await AudioStream.transformToByteArray();
    const audioBlob=new Blob([audioArrayBuffer],{type:'audio/mp3'})
    const audioUrl=URL.createObjectURL(audioBlob);
    return audioUrl
  }catch(e){
    console.log(e);
  }
}
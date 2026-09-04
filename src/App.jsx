import { useState } from "react";
export default function App(){
  const [temps,setTemps]=useState(0)

 const augmenter=()=>{
    console.log(temps)
    
    setInterval(()=>{
    setTemps((prevTemps)=>{
        return prevTemps+1
        console.log(prevTemps)
    })
  },1000)
 }
  
 
 


  return(
    <>
        <p> temps : {temps}</p>
        <button onClick={augmenter} >+</button>
        {/* <button onClick={diminuer} style={{margin:12}}>-</button>
        <button onClick={reset}>Reset</button> */}


    </>
  )

}
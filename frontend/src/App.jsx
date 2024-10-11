import { useState } from "react";
import {TailSpin} from 'react-loader-spinner'
export default function App(){
  const [ output, setOutput ] = useState()
  const [canStop, setCanStop] = useState(false)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ synth, setSyth ] = useState(window.speechSynthesis)
  const [ error, setError ] = useState(false)

  const runSpeechRecog = () => {
    setIsLoading(true)
    setOutput("")
    let recognization = new webkitSpeechRecognition();
      recognization.onstart = () => {
        setOutput("Listening")
      }
      recognization.onresult = (e) => {
        setOutput("Loading a response")
          var transcript = e.results[0][0].transcript;
          fetch("http://localhost:3001/", {
            method: 'POST',
            body: JSON.stringify({transcript: transcript}),
            headers: {
                'Content-Type': 'application/json'
            }
          })
          .then((res) => {
            console.log(res.message);
            if(!res.ok){
              setError(true)
              setTimeout(() => {
                setError(false)
              }, 2000)
            }
            return res.json()
          }).then((data) => {
            setIsLoading(false)
            setCanStop(true)
            console.log(data);
            setOutput(data.message);
            const utterThis = new SpeechSynthesisUtterance(data.message);
            synth.speak(utterThis);
          })
          .catch((err) => {
            setError(true)
          })
      }
      recognization.start();      
  }
  const stopSpeech = () => {
    synth.cancel()
    setCanStop(false)
  }
  
  return (
    <main>
      <div className="flex flex-col gap-3 items-center">
        <img src="gemini.png" alt="Ai logo" className="rounded w-20 mt-5"/>
        <h1 className="text-stone-200 font-bold text-6xl text-center pt-5">A DISCUSSION WITH GEMINI</h1>        
      </div>
      <div className="flex flex-col justify-center mt-40 items-center">
          {canStop ? 
            <button className="bg-[#756AB6] mt-5 px-3 py-1 rounded-md text-[#fff] hover:bg-[#614cee]" onClick={stopSpeech}>
              <i class="fa-solid fa-stop text-4xl p-2"></i>
            </button>
            :
            <button onClick={runSpeechRecog} className="bg-[#756AB6] px-3 py-1 rounded-md text-[#fff] hover:bg-[#614cee]">
              {isLoading ?
                <div className="flex gap-2" onClick={() => setIsLoading(prev => !prev)}>
                <p>{output}</p> 
                <TailSpin
                  visible={true}
                  height="30"
                  width="30"
                  color="#fff"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
              : <i className="fa-solid fa-microphone text-4xl p-2"></i>}
            </button>
          }
          {canStop && <h3 id="output" className="text-[#fff] m-3 p-2 text-center bg-[#364F6B]">{output}</h3>}
          {error && <h3 id="error" className="text-[#fff] m-3 p-2 text-center bg-[#364F6B]">An Error occured. Try again</h3>}
      </div>
    </main>
  );
};

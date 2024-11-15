import React, { useState, useEffect, useCallback } from "react";
import { IoMdMic } from "react-icons/io";
import { MdOutlineStopCircle } from "react-icons/md";
import Image from "./assets/giphy.gif";
import axios from "axios";

const App = () => {
  const [speech, setSpeech] = useState("How Are You");
  const [isListening, setIsListening] = useState(false);
  const [data, setData] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  let recognition = null;

  const FetchVoice = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length === 0) {
      console.log("No voices available, retrying...");
      setTimeout(FetchVoice, 500);
    } else {
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0]);
      console.log("Voices loaded successfully");
    }
  };

  useEffect(() => {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = FetchVoice;
    }
    FetchVoice();

    return () => {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
    };
  }, []);

  const textToVoice = (text) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis is not supported on this browser.");
      return;
    }

    if (!selectedVoice) {
      console.log("No voice selected. Waiting for voices to be available...");
      return;
    }

    const speechApi = new SpeechSynthesisUtterance();
    speechApi.text = text;
    speechApi.voice = selectedVoice;
    speechApi.lang = selectedVoice.lang || "en-GB";

    speechApi.onstart = () => {
      setIsSpeaking(true);
    };

    speechApi.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speechApi);
  };

  const SpeechFetch = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognition) {
      recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-GB";
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setSpeech(transcript);
      };
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const FetchApi = useCallback(() => {
    if (!speech.trim()) {
      console.log("Please say something.");
      return;
    }
    const API_KEY = "AIzaSyCtyNnfDRqSN3IoyvGUY_cSHop8ayoM8O8";
    const ApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `youer name is : Mr Bot
              
              Tone: The text is written in a casual, conversational, and friendly tone, like a chatbot or assistant talking to a friend.

Plain Text: It avoids any special symbols like markdown, tags, or unnecessary formatting. It is plain text that mimics a simple chat response.

Respond simple lang and  in a conversational and friendly tone. Imagine you're speaking to someone in a casual, helpful way, giving clear explanations and tips. Based on the question or topic given by the user, answer naturally, as if you're a friend helping them understand. no any symbol like this "😁 and * ** " 

Here’s the user’s input: "${speech}"`,
            },
          ],
        },
      ],
    };

    axios
      .post(ApiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(({ data }) => {
        const ResText = data.candidates[0].content.parts[0].text;
        console.log(ResText);

        setData(ResText);
        textToVoice(ResText);
      })
      .catch((err) => {
        console.error("API Error:", err);
        alert(
          "Error: " +
            (err.response ? err.response.data.error.message : err.message)
        );
      });
  }, [speech]);

  useEffect(() => {
    if (speech) {
      FetchApi();
    }
  }, [speech, FetchApi]);

  return (
    <div className="relative bg-black h-screen w-full text-white flex flex-col items-center justify-center p-10 sm:p-5">
    <h1 className="text-5xl font-semibold sm:text-xl mb-4">Mr Bot</h1>
    <img src={Image} alt="Chat Bot" className="w-80 sm:w-64 mb-4" />
  
    <p className="text-center mb-4">{speech}</p>
  
    <div className="absolute top-2 left-4 sm:top-1 sm:left-2">
      <label htmlFor="voiceSelect" className="block mb-2 text-xl sm:text-sm sm:w-10">
        Select Voice:
      </label>
      <select
        className="bg-zinc-900 py-2 px-4 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-32"
        id="voiceSelect"
        onChange={(e) => setSelectedVoice(voices[e.target.value])}
        disabled={voices.length === 0}
      >
        {voices.map((voice, index) => (
          <option key={index} value={index}>
            {voice.name} - {voice.lang}
          </option>
        ))}
      </select>
    </div>
  
    <div className="absolute bottom-10 sm:bottom-5">
      <button
        onClick={SpeechFetch}
        className="p-4 bg-zinc-700 rounded-full text-5xl cursor-pointer hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {isListening ? <MdOutlineStopCircle /> : <IoMdMic />}
      </button>
    </div>
  </div>
  
  );
};

export default App;

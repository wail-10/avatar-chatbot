import { useState, useEffect } from 'react'
import './App.css'
import ChatInterface from './components/ChatInterface'
import { Avatar } from './components/Avatar'
import { Leva } from 'leva'

function App() {
  // const [message, setMessage] = useState('')

  // useEffect(() => {
  //   fetch('http://localhost:3000/api/test')
  //     .then(response => response.json())
  //     .then(data => setMessage(data.message))
  //     .catch(error => console.error('Error:', error))
  // }, [])

  return (
    <div className="w-full h-screen overflow-hidden m-0 p-0">
      <Leva />
      <ChatInterface />
    </div>
  )
}

export default App

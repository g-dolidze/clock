import { useState } from 'react'

import './App.css'
import Clock from './clock/Clock'
import Data from './data/Data'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Data/> 
    <Clock/>
    </>
  )
}

export default App

import { useState } from 'react'

import './App.css'
import Clock from './clock/Clock'
import Data from './data/Data'
import Clock2 from './circleClock/Clock2'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* <Data/>  */}
    {/* <Clock/> */}
    <Clock2/>
    </>
  )
}

export default App

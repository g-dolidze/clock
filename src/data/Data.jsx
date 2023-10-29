import React, { useState } from 'react'
import  "./data.scss"

function Data() {
    const [time, setTime] = useState(new Date());

    
  return (
    <div className='data'>
        
<h1> {time.getDate()} { time.getMonth()<10? "0"+time.getMonth() :time.getMonth() }</h1>
        
    </div>
  )
}

export default Data
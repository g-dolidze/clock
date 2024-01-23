import React from 'react'
import  './clock.scss'

function Clock2() {
  return (
    <div className='page'>

        <ul className='clock'>
            <li className='o1 time'></li>
            <li className='o2 time'></li>
            <li className='o3 time'></li>
            <li className='o4 time'></li>
            <li className='o5 time'></li>
            <li className='o6 time'></li>
            <li className='o7 time'></li>
            <li className='o8 time'></li>
            <li className='o9 time'></li>
            <li className='o10 time'></li>
            <li className='o11 time'></li>
            <li className='o12 time'></li>
            <div className='center'>
                <div className='blackcenter'>
                </div>
            </div>
                <div className='hours'></div>
                <div className='minutes'></div>
                <div className='seconds'></div>
        </ul>
    </div>
  )
}

export default Clock2
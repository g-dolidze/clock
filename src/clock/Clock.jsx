import React, { useEffect, useState } from 'react';
import './clock.scss';

function Clock() {
  const [time, setTime] = useState(new Date());
  const [hours, setHours] = useState(time.getHours());
  const [minutes, setMinutes] = useState(time.getMinutes());
  const [seconds, setSeconds] = useState(time.getSeconds());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const liveTime = new Date();
      setHours(liveTime.getHours());
      setMinutes(liveTime.getMinutes());
      setSeconds(liveTime.getSeconds());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
  console.log(time.getMonth())

  return (
    <div className="page">
      <div className="clock-page">
        <div className="timer hour">
          <div className='balt'></div>
          <div className='balt b2'></div>
          <p>{hours < 10 ? '0' + hours : hours}</p>
        </div>
        <div className="timer minutes">
          <p>{minutes < 10 ? '0' + minutes : minutes}</p>
        </div>
        <div className="timer seconds">
          <p>{seconds < 10 ? '0' + seconds : seconds}</p>
        </div>
      </div>
    </div>
  );
}

export default Clock;

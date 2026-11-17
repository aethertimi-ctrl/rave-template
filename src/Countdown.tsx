import { useEffect, useState } from 'react';
import { EVENT_DOORS_OPEN_AT, EVENT_ENDS_AT } from '@/config/event';


function Countdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeLeft = Math.max(0, EVENT_DOORS_OPEN_AT.getTime() - now);
  const eventHasEnded = now >= EVENT_ENDS_AT.getTime();
  const cells = [
    { label: 'Days', value: Math.floor(timeLeft / 86400000) },
    { label: 'Hours', value: Math.floor(timeLeft / 3600000) % 24 },
    { label: 'Mins', value: Math.floor(timeLeft / 60000) % 60 },
    { label: 'Secs', value: Math.floor(timeLeft / 1000) % 60 },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Countdown to doors open" aria-live="off">
      {eventHasEnded ? (
        <span className="countdown-live">That was iRave 2.0. Thanks for being part of it!</span>
      ) : timeLeft === 0 ? (
        <span className="countdown-live">Doors are open — pull up!</span>
      ) : (
        cells.map((cell) => (
          <div className="countdown-cell" key={cell.label}>
            <strong>{String(cell.value).padStart(2, '0')}</strong>
            <span>{cell.label}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default Countdown;

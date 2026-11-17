import { useEffect, useState } from 'react';

// Doors open 9:00 PM, Saturday 12 December 2026, Nigeria time (WAT, +01:00),
// so the countdown is correct for visitors in any timezone.
const DOORS_OPEN = new Date('2026-12-12T21:00:00+01:00');

function Countdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeLeft = Math.max(0, DOORS_OPEN.getTime() - now);
  const cells = [
    { label: 'Days', value: Math.floor(timeLeft / 86400000) },
    { label: 'Hours', value: Math.floor(timeLeft / 3600000) % 24 },
    { label: 'Mins', value: Math.floor(timeLeft / 60000) % 60 },
    { label: 'Secs', value: Math.floor(timeLeft / 1000) % 60 },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Countdown to doors open">
      {timeLeft === 0 ? (
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

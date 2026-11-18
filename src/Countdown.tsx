import { useEffect, useState } from 'react';

// Doors open 8:00 PM (party starts 9:00 PM), Saturday 12 December 2026, Nigeria time
// (WAT, +01:00), so the countdown is correct for visitors in any timezone.
const DOORS_OPEN = new Date('2026-12-12T20:00:00+01:00');
// The party runs "till dawn": treat 6:00 AM on Sunday 13 December as the end.
const EVENT_END = new Date('2026-12-13T06:00:00+01:00');

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

  let liveMessage: string | null = null;
  if (now >= EVENT_END.getTime()) liveMessage = 'The Oblee Edition is a wrap. Thank you for pulling up.';
  else if (timeLeft === 0) liveMessage = 'Doors are open — pull up!';

  return (
    <div className="countdown" role="timer" aria-label="Countdown to doors open">
      {liveMessage ? (
        <span className="countdown-live">{liveMessage}</span>
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

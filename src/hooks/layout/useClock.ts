import { useEffect, useState } from 'react';

const MINUTE_MS = 60_000;

const currentTime = () => new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

/** Current local time as HH:mm, refreshed exactly at each minute boundary. */
export function useClock() {
  const [time, setTime] = useState(currentTime);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(currentTime());
      // Time zone offsets are whole minutes, so the UTC minute boundary is also the local one.
      timer = setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return time;
}

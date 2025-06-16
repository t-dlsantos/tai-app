import { useRef } from 'react';

let savedUserId: number | null = null;

export function useUserId(initialId?: number) {
  const ref = useRef<number | null>(null);

  if (!ref.current) {
    if (initialId !== undefined) {
      savedUserId = initialId;
      ref.current = initialId;
    } else if (savedUserId !== null) {
      ref.current = savedUserId;
    } else {
      const generated = Date.now();
      savedUserId = generated;
      ref.current = generated;
    }
  }

  return ref.current!;
}

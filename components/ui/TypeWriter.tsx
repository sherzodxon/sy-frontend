"use client";
import { useEffect, useState } from "react";
interface Props { words: string[]; speed?: number; pause?: number }
export default function TypeWriter({ words, speed = 80, pause = 1800 }: Props) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx));
        if (charIdx === current.length) {
          setTimeout(() => setDeleting(true), pause);
        } else setCharIdx(c => c + 1);
      }, speed);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx));
        if (charIdx === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
        else setCharIdx(c => c - 1);
      }, speed / 2);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return (
    <span>
      {display}
      <span className="typing-cursor" />
    </span>
  );
}

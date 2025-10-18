import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
/*these are the quotes that are going to be used for the user to type*/ 
const QUOTES = [
  `"Out of the night that covers me,
Black as the pit from pole to pole,
I thank whatever gods may be
For my unconquerable soul."
- William Ernest Henley`,
  `"Simplicity is prerequisite for reliability." - Edsger W. Dijkstra`,
  `"Talk is cheap. Show me the code." - Linus Torvalds`,
];


export default function App() {/*checks the state of the site, meaning the target text, user input, timing, errors, etc*/
  const [target, setTarget] = useState(QUOTES[0]);

  const [typed, setTyped] = useState("");

  const [startedAt, setStartedAt] = useState(null);

  const [endedAt, setEndedAt] = useState(null);

  const [errors, setErrors] = useState(0);

  const inputRef = useRef(null);
/*will derive the flags*/
  const finished = typed.length >= target.length;
/*will count the amount of correct characters */
  const correct = useMemo(() => {

    let ok = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) ok++;
    return ok;
  }, [typed, target]);

  const elapsedMs = (endedAt ?? Date.now()) - (startedAt ?? Date.now());

  const minutes = Math.max(elapsedMs / 60000, 1 / 60000);

  const wpm = Math.round((correct / 5) / minutes);

  const accuracy = typed.length

    ? Math.round((correct / typed.length) * 100)
    : 100;



/*stops the timer when reaching the end */
  useEffect(() => {
    if (finished && !endedAt) setEndedAt(Date.now());
  }, [finished, endedAt]);




  /*start timer, records text */
  function handleChange(e) {
    const v = e.target.value;
    if (!startedAt) setStartedAt(Date.now());

    if (v.length > target.length) return;

    const i = v.length - 1;
    if (i >= 0 && v[i] !== target[i]) setErrors((x) => x + 1);

    setTyped(v);
  }


  /*clears typing state */
  function reset(withQuote = target) {
    setTarget(withQuote);
    setTyped("");

    setStartedAt(null);
    setEndedAt(null);
    setErrors(0);
    inputRef.current?.focus();
  }
/*is the cycle the next quote */
  function shuffleQuote() {
    const next = QUOTES[(QUOTES.indexOf(target) + 1) % QUOTES.length];
    reset(next);
  }


/*gives a status to each character */
  function renderPassage() {
    const spans = [];
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      let cls = "";

      if (i < typed.length) cls = typed[i]=== ch ? "ok" : "bad";

      else if (i === typed.length&& !finished) cls = "caret";
      spans.push(
        <span key={i}className={cls === "caret" ? "caret" : ""}>
          <span className={`glyph ${cls}`}>{ch}</span>
        </span>

      );
    }
    return spans;
  }

  return (
    <div className="wrap">
      <header className="brand">
        <span className="logo">⚡</span>
        <span className="title">Speed Typer</span>
        <div className="spacer" />
        <div className="metric">
          <div className="label">Accuracy</div>
          <div className="pill">{accuracy}</div>
        </div>
        <div className="metric">
          <div className="label">WPM</div>
          <div className="pill">{wpm}</div>
        </div>
      </header>

      <div className="toolbar">
        <button title="New quote" onClick={shuffleQuote}>↻</button>
        <button title="Reset" onClick={() => reset()}>⟲</button>
        <button
          title="Copy quote"
          onClick={() => navigator.clipboard.writeText(target)}
        >
          📋
        </button>
      </div>

      <div className="passage">{renderPassage()}</div>

      <input
        ref={inputRef}
        className="typebox"
        placeholder="Type here…"
        value={typed}
        onChange={handleChange}
        disabled={finished}
        autoFocus
      />

      <div className="foot">
        <span>Chars: {typed.length}/{target.length}</span>
        <span>Errors: {errors}</span>
        <span>Time: {Math.max(0, Math.round(elapsedMs / 1000))}s</span>
      </div>
    </div>
  );
}

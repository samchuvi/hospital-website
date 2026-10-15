// Hidden from people (and screen readers), but naive spam bots fill it in.
export default function Honeypot() {
  return (
    <div className="hp" aria-hidden="true">
      <label htmlFor="hp-website">Leave this field empty</label>
      <input id="hp-website" type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export default function CalculatorActions({ onCalculate, onReset }) {
  return (
    <div style={{display:"flex",gap:12,marginTop:24,flexWrap:"wrap"}}>
      <button className="primary-button" onClick={onCalculate}>🧮 Calculate</button>
      <button className="primary-button" style={{background:"#6B7280"}} onClick={onReset}>↺ Reset</button>
    </div>
  );
}
export default function NumberInput({label,value,onChange,onKeyDown,inputMode="decimal"}) {
  return (
    <div>
      <label className="page-subtitle">{label}</label>
      <input type="text" inputMode={inputMode} value={value}
        onChange={(e)=>onChange(e.target.value)}
        onKeyDown={onKeyDown}
        style={{width:"100%"}} />
    </div>
  );
}

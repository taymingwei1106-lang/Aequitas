export default function ResultCard({label,value}) {
  return (
    <div className="card">
      <small>{label}</small>
      <h2 style={{marginBottom:0}}>{value}</h2>
    </div>
  );
}

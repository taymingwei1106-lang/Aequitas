export default function StatCard({label,value,accent}){
  return(
    <div className="card">
      <div className="card-label">{label}</div>
      <h2 style={{color:accent||"inherit"}}>{value}</h2>
    </div>
  )
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  saveProperty,
  getProperty,
  updateProperty,
} from "../services/storage";

export default function PropertyWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [form, setForm] = useState({
    projectName: "",
    purchasePrice: "",
    outstandingLoan: "",
    monthlyRental: "",
  });

  useEffect(() => {
    if (!editing) return;
    const property = getProperty(id);
    if (!property) return;

    setForm({
      projectName: property.projectName || "",
      purchasePrice: property.purchasePrice || "",
      outstandingLoan: property.outstandingLoan || "",
      monthlyRental: property.monthlyRental || "",
    });
  }, [editing, id]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (editing) {
      updateProperty(id, form);
      navigate(`/property/${id}`);
    } else {
      saveProperty(form);
      navigate("/portfolio");
    }
  }

  const completed = Object.values(form).filter(Boolean).length;
  const progress = (completed / 4) * 100;

  return (
    <div>
      <section className="page-header">
        <p className="page-subtitle">Investment Onboarding</p>
        <h1 className="page-title">
          {editing ? "Edit Investment" : "Add Investment"}
        </h1>
        <p className="page-subtitle">
          Build your portfolio one investment at a time.
        </p>
      </section>

      <div className="card form-card">
        <h3 style={{marginTop:0}}>Investment Information</h3>
        <p className="page-subtitle">
          Complete the basic information now. Additional analytics can be unlocked later.
        </p>

        <form onSubmit={handleSubmit} style={{display:"grid",gap:18}}>
          <input
            name="projectName"
            placeholder="Project Name"
            value={form.projectName}
            onChange={handleChange}
          />

          <input
            name="purchasePrice"
            type="number"
            placeholder="Purchase Price (RM)"
            value={form.purchasePrice}
            onChange={handleChange}
          />

          <input
            name="outstandingLoan"
            type="number"
            placeholder="Outstanding Loan (RM)"
            value={form.outstandingLoan}
            onChange={handleChange}
          />

          <input
            name="monthlyRental"
            type="number"
            placeholder="Monthly Rental (RM)"
            value={form.monthlyRental}
            onChange={handleChange}
          />

          <div style={{marginTop:12}}>
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              marginBottom:8
            }}>
              <span className="page-subtitle">Investment Completeness</span>
              <strong>{Math.round(progress)}%</strong>
            </div>

            <div style={{
              height:10,
              background:"#23232d",
              borderRadius:999,
              overflow:"hidden"
            }}>
              <div style={{
                width:`${progress}%`,
                height:"100%",
                background:"linear-gradient(90deg,#4f8cff,#68b8ff)"
              }}/>
            </div>
          </div>

          <button type="submit" className="primary-button">
            {editing ? "Save Changes" : "Save Investment"}
          </button>
        </form>
      </div>
    </div>
  );
}
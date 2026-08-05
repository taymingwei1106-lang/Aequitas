import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { saveProperty } from "../services/storage";

export default function PropertyWizard() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    projectName: "",
    purchasePrice: "",
    outstandingLoan: "",
    monthlyRental: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    saveProperty(form);

    navigate("/portfolio");
  }

  return (
    <div>

      <h1>Add Property</h1>

      <form
        className="property-form"
        onSubmit={handleSubmit}
      >

        <label>Project Name</label>

        <input
          name="projectName"
          value={form.projectName}
          onChange={handleChange}
          placeholder="The Era @ Duta North"
        />

        <label>Purchase Price (RM)</label>

        <input
          name="purchasePrice"
          value={form.purchasePrice}
          onChange={handleChange}
          type="number"
        />

        <label>Outstanding Loan (RM)</label>

        <input
          name="outstandingLoan"
          value={form.outstandingLoan}
          onChange={handleChange}
          type="number"
        />

        <label>Monthly Rental (RM)</label>

        <input
          name="monthlyRental"
          value={form.monthlyRental}
          onChange={handleChange}
          type="number"
        />

        <button
          className="primary-button"
          type="submit"
        >
          Save Property
        </button>

      </form>

    </div>
  );
}
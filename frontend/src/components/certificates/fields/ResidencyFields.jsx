export default function ResidencyFields({
  form,
  handleChange,
}) {
  return (
    <div className="form-group">
      <label>Years of Residency</label>
      <input
        name="yearsOfResidency"
        value={form.yearsOfResidency || ""}
        onChange={handleChange}
        placeholder="Example: 5 years"
      />
    </div>
  );
}

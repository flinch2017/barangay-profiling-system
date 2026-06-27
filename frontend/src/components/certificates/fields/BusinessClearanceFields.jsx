export default function BusinessClearanceFields({
  form,
  handleChange,
}) {
  return (
    <>
      <div className="form-group">
        <label>Business Name</label>
        <input
          name="businessName"
          value={form.businessName || ""}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Business Type</label>
        <input
          name="businessType"
          value={form.businessType || ""}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Business Address</label>
        <textarea
          name="businessAddress"
          value={form.businessAddress || ""}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

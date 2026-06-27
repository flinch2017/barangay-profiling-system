export default function OtherFields({
  form,
  handleChange,
}) {
  return (
    <>
      <div className="form-group">
        <label>Certificate Title</label>
        <input
          name="customTitle"
          value={form.customTitle || ""}
          onChange={handleChange}
          placeholder="Example: Certificate of Appearance"
        />
      </div>

      <div className="form-group">
        <label>Additional Details</label>
        <textarea
          name="remarks"
          value={form.remarks || ""}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

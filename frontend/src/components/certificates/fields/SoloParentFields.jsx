export default function SoloParentFields({
  form,
  handleChange,
}) {
  return (
    <>
      <div className="form-group">
        <label>Number of Children</label>
        <input
          type="number"
          min="0"
          name="numberOfChildren"
          value={form.numberOfChildren || ""}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Solo Parent ID Number</label>
        <input
          name="soloParentId"
          value={form.soloParentId || ""}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
    </>
  );
}

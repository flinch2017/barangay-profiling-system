export default function GoodMoralFields({
  form,
  handleChange,
}) {
  return (
    <div className="form-group">
      <label>Character Reference</label>
      <input
        name="characterReference"
        value={form.characterReference || ""}
        onChange={handleChange}
        placeholder="Optional"
      />
    </div>
  );
}

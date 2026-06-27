export default function IndigencyFields({

    form,

    handleChange,

}) {

    return (

        <div className="form-group">

            <label>Reason for Request</label>

            <textarea

                name="reason"

                value={form.reason || ""}

                onChange={handleChange}

            />

        </div>

    );

}
export default function BarangayClearanceFields({

    form,

    handleChange,

}) {

    return (

        <>

            <div className="form-group">

                <label>Cedula Number</label>

                <input

                    name="cedula"

                    value={form.cedula || ""}

                    onChange={handleChange}

                />

            </div>

            <div className="form-group">

                <label>Cedula Date</label>

                <input

                    type="date"

                    name="cedulaDate"

                    value={form.cedulaDate || ""}

                    onChange={handleChange}

                />

            </div>

            <div className="form-group">

                <label>Place Issued</label>

                <input

                    name="cedulaPlace"

                    value={form.cedulaPlace || ""}

                    onChange={handleChange}

                />

            </div>

        </>

    );

}
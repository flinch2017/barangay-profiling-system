export default function FirstTimeJobSeekerFields({

    form,

    handleChange,

}) {

    return (

        <>

            <div className="form-group">

                <label>Employer</label>

                <input

                    name="employer"

                    value={form.employer || ""}

                    onChange={handleChange}

                />

            </div>

            <div className="form-group">

                <label>Position Applied</label>

                <input

                    name="position"

                    value={form.position || ""}

                    onChange={handleChange}

                />

            </div>

        </>

    );

}
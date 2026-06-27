import { useParams } from "react-router-dom";

import CertificateLayout from "../components/certificates/CertificateLayout";

import BarangayClearanceFields from "../components/certificates/fields/BarangayClearanceFields";
import IndigencyFields from "../components/certificates/fields/IndigencyFields";
import ResidencyFields from "../components/certificates/fields/ResidencyFields";
import FirstTimeJobSeekerFields from "../components/certificates/fields/FirstTimeJobSeekerFields";
import BusinessClearanceFields from "../components/certificates/fields/BusinessClearanceFields";
import GoodMoralFields from "../components/certificates/fields/GoodMoralFields";
import SoloParentFields from "../components/certificates/fields/SoloParentFields";
import OtherFields from "../components/certificates/fields/OtherFields";
import "../styles/certificates.css";

export default function CertificateGeneration() {

    const { certificateType } = useParams();

    const fieldComponents = {

        "barangay-clearance": BarangayClearanceFields,

        "certificate-of-indigency": IndigencyFields,

        "certificate-of-residency": ResidencyFields,

        "first-time-job-seeker": FirstTimeJobSeekerFields,

        "business-clearance": BusinessClearanceFields,

        "good-moral-character": GoodMoralFields,

        "solo-parent-certificate": SoloParentFields,

        "other": OtherFields,

    };

    const Fields = fieldComponents[certificateType];

    if (!Fields) {
        return <h2>Certificate type not found.</h2>;
    }

    return (

        <CertificateLayout
            title={certificateType}
            FieldsComponent={Fields}
        />

    );

}

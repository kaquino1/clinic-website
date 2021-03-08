const express = require("express");
const mysql = require("./dbcon.js");
const CORS = require("cors");

const app = express();
app.set("port", process.env.PORT || 5000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(CORS());

// INSURANCES PAGE ROUTE HANDLERS
const getAllInsurances = "SELECT * FROM insurances";
const insertInsurance = "INSERT INTO insurances (`company`, `planLevel`) VALUES (?, ?)";
const deleteInsurance = "DELETE FROM insurances WHERE insuranceCode=?";
const checkInsurance = "SELECT * FROM insurances WHERE company=? AND planLevel=?";

const getInsuranceData = (res) => {
    var context = {};
    mysql.pool.query(getAllInsurances, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    })
};

app.get("/insurances", (req, res, next) => {
    getInsuranceData(res);
});

app.get("/insurance_companies", (req, res, next) => {
    var context = {};
    mysql.pool.query("SELECT DISTINCT company FROM insurances", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.post("/insurance_plans", (req, res, next) => {
    var { company } = req.body;
    var context = {};
    mysql.pool.query("SELECT planLevel FROM insurances WHERE company=?", [company], (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.post("/insurances", (req, res, next) => {
    var { company, planLevel } = req.body;
    mysql.pool.query(insertInsurance, [company, planLevel], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        res.send()
    });
});

app.post("/check_insurances", (req, res, next) => {
    var context = {};
    var { company, planLevel } = req.body;
    mysql.pool.query(checkInsurance, [company, planLevel], (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.delete("/insurances", (req, res, next) => {
    mysql.pool.query(deleteInsurance, [req.body.insuranceCode], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getInsuranceData(res);
    });
});

app.post("/insurance_search", (req, res, next) => {
    var context = {};
    var { company, planLevel } = req.body;
    var searchInsurance = "SELECT * FROM insurances WHERE ";
    var insuranceVariables = []

    if (company) {
        let cName = `%${company}%`;
        insuranceVariables.push(cName);
        searchInsurance += "company LIKE ? AND ";
    }

    insuranceVariables.push(planLevel);
    insuranceVariables.push(planLevel);
    searchInsurance += "(? IS NULL OR `planLevel` = ?)";

    mysql.pool.query(searchInsurance, insuranceVariables, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// MEDICATIONS PAGE ROUTE HANDLERS
const getAllMedications = "SELECT * FROM medications";
const insertMedications = "INSERT INTO medications (`medName`, `quantityAvailable`) VALUES (?, ?)";
const deleteMedications = "DELETE FROM medications WHERE medID=?";
const updateMedications = "UPDATE medications SET medName=?, quantityAvailable=? WHERE medID=?";
const checkMedications = "SELECT * FROM medications WHERE medName=?";

const getMedicationData = (res) => {
    var context = {};
    mysql.pool.query(getAllMedications, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    })
};

app.get("/medications", (req, res, next) => {
    getMedicationData(res);
});

app.post("/medications", (req, res, next) => {

    var { medName, quantityAvailable } = req.body;
    mysql.pool.query(insertMedications, [medName, quantityAvailable], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        res.send();
    });
});

app.post("/check_medications", (req, res, next) => {
    var context = {};
    mysql.pool.query(checkMedications, [req.body.medName], (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.delete("/medications", (req, res, next) => {
    mysql.pool.query(deleteMedications, [req.body.medID], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getMedicationData(res);
    });
});

app.put("/medications", (req, res, next) => {
    var { medID, medName, quantityAvailable } = req.body;
    mysql.pool.query(updateMedications, [medName, quantityAvailable, medID], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        res.send();
    });
});

app.post("/medication_search", (req, res, next) => {
    var context = {};
    var { medName, quantityAvailable, comparator } = req.body;
    var searchMedication = "SELECT * FROM medications WHERE ";
    var medicationVariables = [];

    if (medName) {
        let mName = `%${medName}%`;
        medicationVariables.push(mName)
        searchMedication += "medName LIKE ? AND ";
    }

    if (comparator == "LESS") {
        medicationVariables.push(quantityAvailable);
        medicationVariables.push(quantityAvailable);
        searchMedication += "(? IS NULL OR `quantityAvailable`<?)";
    }
    else if (comparator == "GREATER") {
        medicationVariables.push(quantityAvailable);
        medicationVariables.push(quantityAvailable);
        searchMedication += "(? IS NULL OR `quantityAvailable`>?)";
    }
    else {
        medicationVariables.push(quantityAvailable);
        medicationVariables.push(quantityAvailable);
        searchMedication += "(? IS NULL OR `quantityAvailable`=?)";
    }
    mysql.pool.query(searchMedication, medicationVariables, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// PATIENTS PAGE ROUTE HANDLERS
const getAllPatients = "SELECT patients.patientRecordNumber, patients.firstName, patients.lastName, patients.dateOfBirth, patients.gender, patients.diagnosis, patients.insuranceCode, insurances.company, insurances.planLevel FROM patients LEFT OUTER JOIN insurances ON insurances.insuranceCode = patients.insuranceCode";
const insertPatients = "INSERT INTO patients (`firstName`, `lastName`, `dateOfBirth`, `gender`, `diagnosis`, `insuranceCode`) VALUES (?, ?, ?, ?, ?, (SELECT insuranceCode from insurances WHERE insurances.company = ? AND insurances.planLevel = ?))";
const updatePatients = "UPDATE patients SET firstName=?, lastName=?, dateOfBirth=?, gender=?, diagnosis=?, insuranceCode=(SELECT insurances.insuranceCode FROM insurances WHERE insurances.company=? AND insurances.planLevel=?) WHERE patientRecordNumber=?";
const deletePatients = "DELETE FROM patients WHERE patientRecordNumber=?";

const getPatientData = (res) => {
    var context = {};
    mysql.pool.query(getAllPatients, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
};

app.get('/patients', (req, res, next) => {
    var context = {};
    mysql.pool.query(getAllPatients, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.post("/patients", (req, res, next) => {
    var { firstName, lastName, dob, gender, diagnosis, company, planLevel } = req.body;
    mysql.pool.query(insertPatients, [firstName, lastName, dob, gender, diagnosis, company, planLevel], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getPatientData(res);
    });
});

app.delete("/patients", (req, res, next) => {
    mysql.pool.query(deletePatients, [req.body.patientRecordNumber], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getPatientData(res);
    });
});

app.put("/patients", (req, res, next) => {
    var { patientRecordNumber, firstName, lastName, dob, gender, diagnosis, company, planLevel } = req.body;
    mysql.pool.query(updatePatients, [firstName, lastName, dob, gender, diagnosis, company, planLevel, patientRecordNumber], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getPatientData(res);
    });
});

app.post("/patient_search", (req, res, next) => {
    var context = {};
    var { firstName, lastName, dob, gender, diagnosis, company, planLevel } = req.body;
    var patientSearch = "SELECT patients.patientRecordNumber, patients.firstName, patients.lastName, patients.dateOfBirth, patients.gender, patients.diagnosis, insurances.insuranceCode, insurances.company, insurances.planLevel FROM patients LEFT OUTER JOIN insurances ON patients.insuranceCode = insurances.insuranceCode WHERE (? IS NULL OR `dateOfBirth` = ?) AND (? IS NULL OR `gender` = ?) AND ";

    if (gender == 2) {
        gender = null;
    }

    var patientVariables = [dob, dob, gender, gender];

    if (firstName) {
        let fName = `%${firstName}%`;
        patientSearch += "firstName LIKE ? AND ";
        patientVariables.push(fName);
    }

    if (lastName) {
        let lName = `%${lastName}%`;
        patientSearch += "lastName LIKE ? AND ";
        patientVariables.push(lName);
    }

    if (diagnosis != "" && diagnosis != null) {
        let dx = `%${diagnosis}%`;
        patientSearch += "(diagnosis LIKE ?) AND ";
        patientVariables.push(dx);
    }

    if (diagnosis == "") {
        patientSearch += "(`diagnosis` = ?) AND ";
        patientVariables.push(diagnosis);
    }

    // SELECT FOR NO INSURANCE
    if (company == "" && planLevel == "") {
        company = null;
        planLevel = null;
        patientSearch += "(`company` IS ?) AND (`planLevel` IS ?) AND ";
        patientVariables.push(company);
        patientVariables.push(planLevel);
    }
    // SEARCH BY COMPANY ONLY
    if (company != null && company != "" && planLevel == null) {
        // patientSearch += "(`company` = ?) AND (? IS NULL)";
        patientSearch += "(`company` = ?) AND ";
        patientVariables.push(company);
    }
    // SEARCH BY PLAN LEVEL ONLYS
    if (company == null && planLevel != null && planLevel != "") {
        patientSearch += "(`planLevel` = ?) AND ";
        patientVariables.push(planLevel);
    }
    // SEARCH BY COMPANY AND PLAN LEVEL
    if (company != null && company != "" && planLevel != null && planLevel != "") {
        patientSearch += "(`company` = ?) AND (`planLevel` = ?) AND ";
        patientVariables.push(company);
        patientVariables.push(planLevel);
    }
    patientSearch += "1=1";
    mysql.pool.query(patientSearch, patientVariables, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// DOCTORS PAGE ROUTE HANDLERS
const getAllDoctors = "SELECT * FROM doctors";
const insertDoctor = "INSERT INTO doctors (`firstName`, `lastName`, `specialty`) VALUES (?, ?, ?)";
const updateDoctor = "UPDATE doctors SET firstName=?, lastName=?, specialty=? WHERE employeeID=?";
const deleteDoctor = "DELETE FROM doctors WHERE employeeID=?";

const getDoctorData = (res) => {
    var context = {};
    mysql.pool.query(getAllDoctors, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
};

app.get('/allDoctors', (req, res, next) => {
    var context = {};
    mysql.pool.query(getAllDoctors, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Filtered search of doctors
app.post("/doctor_search", (req, res, next) => {
    var context = {};
    var { firstName, lastName, specialty } = req.body;
    var doctorSearchQuery = "SELECT * FROM doctors WHERE ";
    var doctorSearchVariables = [];

    if (firstName != "") {
        let first = `%${firstName}%`
        doctorSearchVariables.push(first)
        doctorSearchQuery = doctorSearchQuery + "firstName LIKE ? AND "
    }
    if (lastName != "") {
        let last = `%${lastName}%`
        doctorSearchVariables.push(last)
        doctorSearchQuery = doctorSearchQuery + "lastName LIKE ? AND "
    }

    if (specialty != "") {
        let spec = `%${specialty}%`
        doctorSearchVariables.push(spec)
        doctorSearchQuery = doctorSearchQuery + "specialty LIKE ? AND "
    }

    // 1=1 is filler to account for last AND operator as query builds up.
    doctorSearchQuery = doctorSearchQuery + "1=1"
    mysql.pool.query(doctorSearchQuery, doctorSearchVariables, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Insert a doctor
app.post("/add_doctor", (req, res, next) => {
    var { firstName, lastName, specialty } = req.body;
    mysql.pool.query(insertDoctor, [firstName, lastName, specialty], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getDoctorData(res);
    });
});

app.delete("/delete_doctor", (req, res, next) => {
    mysql.pool.query(deleteDoctor, [req.body.employeeID], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getDoctorData(res);
    });
});

app.put("/update_doctor", (req, res, next) => {
    var { employeeID, firstName, lastName, specialty } = req.body;
    mysql.pool.query(updateDoctor, [firstName, lastName, specialty, employeeID], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getDoctorData(res);
    });
});

// DOCTOR_PATIENT_ASSIGNMENTS ROUTE HANDLERS
const getAllAssignments = `SELECT doctors.employeeID, doctors.firstName as dfn, doctors.lastName as dln, patients.patientRecordNumber, patients.firstName as pfn,
        patients.lastName as pln, patients.dateOfBirth FROM doctors JOIN doctor_patient_assignments ON doctor_patient_assignments.employeeID = doctors.employeeID
    JOIN patients ON doctor_patient_assignments.patientRecordNumber = patients.patientRecordNumber ORDER BY doctors.employeeID ASC`;
const insertAssignment = "INSERT INTO doctor_patient_assignments (`employeeID`, `patientRecordNumber`) VALUES (?, ?)";
const deleteAssignment = "DELETE FROM doctor_patient_assignments WHERE employeeID=? AND patientRecordNumber=?";
const searchByDoctor = `SELECT doctors.employeeID, doctors.firstName as dfn, doctors.lastName as dln, patients.patientRecordNumber, patients.firstName as pfn,
        patients.lastName as pln, patients.dateOfBirth FROM doctors JOIN doctor_patient_assignments ON doctor_patient_assignments.employeeID = doctors.employeeID
    JOIN patients ON doctor_patient_assignments.patientRecordNumber = patients.patientRecordNumber WHERE doctors.employeeID =? ORDER BY doctors.employeeID ASC`;
const searchByPatient = `SELECT doctors.employeeID, doctors.firstName as dfn, doctors.lastName as dln, patients.patientRecordNumber, patients.firstName as pfn,
        patients.lastName as pln, patients.dateOfBirth FROM doctors JOIN doctor_patient_assignments ON doctor_patient_assignments.employeeID = doctors.employeeID
    JOIN patients ON doctor_patient_assignments.patientRecordNumber = patients.patientRecordNumber WHERE patients.patientRecordNumber =? ORDER BY patients.patientRecordNumber ASC`;
const checkIfAssignmentExists = `SELECT * FROM doctor_patient_assignments WHERE employeeID = ? AND patientRecordNumber = ? `

const getAssignmentData = (res) => {
    var context = {};
    mysql.pool.query(getAllAssignments, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
};

// Show all assignments route handler
app.get('/show_all_assignments', (req, res, next) => {
    var context = {};
    mysql.pool.query(getAllAssignments, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Show Assignments by doctor employee ID
app.post("/search_assignments_by_doctor", (req, res, next) => {
    var context = {};
    var { employeeID } = req.body;
    mysql.pool.query(searchByDoctor, [employeeID], (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Show Assignments by patient record number
app.post("/search_assignments_by_patient", (req, res, next) => {
    var context = {};
    var { patientRecordNumber } = req.body;
    mysql.pool.query(searchByPatient, [patientRecordNumber], (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Check if a doctor_patient_assignment exists before inserting route handler
app.post("/check_for_assignment", (req, res, next) => {
    var context = {};
    var { employeeID, patientRecordNumber } = req.body;
    mysql.pool.query(checkIfAssignmentExists, [employeeID, patientRecordNumber], (err, rows, result) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Insert a doctor_patient_assignment
app.post("/add_assignment", (req, res, next) => {
    var { employeeID, patientRecordNumber } = req.body;
    mysql.pool.query(insertAssignment, [employeeID, patientRecordNumber], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getAssignmentData(res);
    });
});

// Delete a doctor_patient_aassignment
app.delete("/delete_doctor_patient_assignment", (req, res, next) => {
    mysql.pool.query(deleteAssignment, [req.body.employeeID, req.body.patientRecordNumber], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getAssignmentData(res);
    });
});

// PRESCRIPTIONS PAGE ROUTE HANDLERS
const getAllPrescriptions = `SELECT prescriptions.prescriptionID, doctors.employeeID, doctors.firstName as dfn, doctors.lastName as dln,
        medications.medID, medications.medName, prescriptions.quantityOfTablets, patients.patientRecordNumber, patients.firstName as pfn,
        patients.lastName as pln FROM prescriptions JOIN doctors ON prescriptions.employeeID = doctors.employeeID JOIN medications ON prescriptions.medID = medications.medID
    JOIN patients ON prescriptions.patientRecordNumber = patients.patientRecordNumber`;
const insertPrescription = `INSERT INTO prescriptions(\`employeeID\`, \`medID\`, \`patientRecordNumber\`, \`quantityOfTablets\`)
                            VALUES (?, ?, ?, ?)`;
const updateMedicationsQuantity = `UPDATE medications SET quantityAvailable = quantityAvailable - ? WHERE medID = ?`
const checkIfPrescriptionExists = `SELECT * FROM prescriptions WHERE employeeID = ? AND patientRecordNumber = ? AND medID = ?`



const getPrescriptionData = (res) => {
    var context = {};
    mysql.pool.query(getAllPrescriptions, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
};

// Show all prescriptions route handler
app.get('/show_all_prescriptions', (req, res, next) => {
    var context = {};
    mysql.pool.query(getAllPrescriptions, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Check if a prescription exists before inserting route handler
app.post("/check_for_prescription", (req, res, next) => {
    var context = {};
    var { employeeID, patientRecordNumber, medID } = req.body;
    mysql.pool.query(checkIfPrescriptionExists, [employeeID, patientRecordNumber, medID], (err, rows, result) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

// Insert a new prescription
app.post("/add_prescription", (req, res, next) => {
    var { employeeID, patientRecordNumber, medID, quantityOfTablets } = req.body;
    mysql.pool.query(insertPrescription, [employeeID, patientRecordNumber, medID, quantityOfTablets], (err, result) => {
        if (err) {
            next(err);
            return;
        }
    });

    mysql.pool.query(updateMedicationsQuantity, [quantityOfTablets, medID], (err, result) => {
        if (err) {
            next(err);
            return;
        }
        getPrescriptionData(res);
    });

});


// Search for a prescription
app.post("/search_prescription", (req, res, next) => {
    var context = {};
    var { employeeID, patientRecordNumber, medID } = req.body;
    var searchPrescriptionQuery = `SELECT prescriptions.prescriptionID, doctors.employeeID, doctors.firstName as dfn, doctors.lastName as dln,
                            medications.medID, medications.medName, prescriptions.quantityOfTablets, patients.patientRecordNumber, patients.firstName as pfn,
                            patients.lastName as pln FROM prescriptions JOIN doctors ON prescriptions.employeeID = doctors.employeeID JOIN medications ON prescriptions.medID = medications.medID
                            JOIN patients ON prescriptions.patientRecordNumber = patients.patientRecordNumber WHERE `;
    var prescriptionSearchVariable = [];

    if (employeeID) {
        prescriptionSearchVariable.push(employeeID)
        searchPrescriptionQuery = searchPrescriptionQuery + "prescriptions.employeeID=? AND "
    }
    if (patientRecordNumber) {
        prescriptionSearchVariable.push(patientRecordNumber)
        searchPrescriptionQuery = searchPrescriptionQuery + "prescriptions.patientRecordNumber=? AND "
    }

    if (medID) {
        prescriptionSearchVariable.push(medID)
        searchPrescriptionQuery = searchPrescriptionQuery + "prescriptions.medID=? AND "
    }

    // 1=1 is filler to account for last AND operator as query builds up.
    searchPrescriptionQuery = searchPrescriptionQuery + "1=1"
    mysql.pool.query(searchPrescriptionQuery, prescriptionSearchVariable, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});



// Route handlers to fill dropdown menus
app.get("/get_doctor_names", (req, res, next) => {
    var context = {};
    mysql.pool.query("SELECT doctors.employeeID, doctors.firstName, doctors.lastName FROM doctors", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.get("/get_patient_names", (req, res, next) => {
    var context = {};
    mysql.pool.query("SELECT patients.patientRecordNumber, patients.firstName, patients.lastName FROM patients", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.get("/get_medication_names", (req, res, next) => {
    var context = {};
    mysql.pool.query("SELECT medications.medID, medications.medName FROM medications", (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});


app.use((req, res) => {
    res.status(404);
    res.send("404 Error");
});

app.use((req, res, next) => {
    console.error(err, stack);
    res.status(500);
    res.send("500 Error");
});

app.listen(app.get("port"), function () {
    console.log(`Express started on http://${process.env.HOSTNAME}:${app.get('port')}; Ctrl-C to terminate.`);
});

const baseURL = "https://clinic-serverside.herokuapp.com/52425/";

document.getElementById('addPrescriptionSubmit').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    var payload = { employeeID: null, patientRecordNumber: null, medID: null, quantityOfTablets: null }

    payload.employeeID = document.getElementById("prescribeDoctor").value;
    payload.patientRecordNumber = document.getElementById("prescribePatient").value;
    payload.medID = document.getElementById("prescribeMedication").value;
    payload.quantityOfTablets = document.getElementById('quantityOfTablets').value

    if(!formValidation(payload)){
        alert("Please fill in all required fields.");
        event.preventDefault();
        return
    }

    checkIfAssignmentExists(payload)
    event.preventDefault();
});


const getDoctorInfo = () => {
    var req = new XMLHttpRequest();
    var searchSelect = document.getElementById("prescribeDoctor");
    req.open('GET', baseURL + 'get_doctor_names', true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var doctorInfo = JSON.parse(req.responseText)
            populateDropDown(doctorInfo, searchSelect);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    
    });
    req.send(null);
};

const getPatientInfo = () => {

    var req = new XMLHttpRequest();
    var searchSelect = document.getElementById("prescribePatient");
    req.open('GET', baseURL + 'get_patient_names', true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var patientInfo = JSON.parse(req.responseText)
            populateDropDown(patientInfo, searchSelect);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    
    });
    req.send(null);
};

const getMedicationInfo = () => {

    var req = new XMLHttpRequest();
    var searchSelect = document.getElementById("prescribeMedication");
    req.open('GET', baseURL + 'get_medication_names', true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var medicationInfo = JSON.parse(req.responseText)
            populateDropDown(medicationInfo, searchSelect);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    
    });
    req.send(null);
};

const populateDropDown = (objectWithRows, dropDownToPopulate) => {

    if (Object.is(document.getElementById("prescribeDoctor"), dropDownToPopulate)){
        for (var i of objectWithRows.results) {
            full_string = `EID ${i.employeeID.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.employeeID;
            dropDownToPopulate.appendChild(option);
        }
    }
    else if (Object.is(document.getElementById("prescribePatient"), dropDownToPopulate)) {
        for (var i of objectWithRows.results) {
            full_string = `PRN ${i.patientRecordNumber.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.patientRecordNumber;
            dropDownToPopulate.appendChild(option);
        }
    }

    else{
        for (var i of objectWithRows.results) {
            full_string = `MID ${i.medID.toString()} -- ${i.medName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.medID;
            dropDownToPopulate.appendChild(option);
        }
    }

};

const formValidation = (data) => {
    for (var i in data) {
        if (data[i] === "") {
            return false
        }
    }
    return true;
};

const checkIfAssignmentExists = (payload) => {
    var req = new XMLHttpRequest();
    req.open('POST', baseURL + 'check_for_prescription', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText)
            databaseRowsArray = response.results
            if(databaseRowsArray.length != 0){
                alert('This prescription already exists in the database.')
            } else{
                insertPrescription(payload)
            }
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));
    };

const insertPrescription = (payload) => {
    var req = new XMLHttpRequest();
    req.open('POST', baseURL + 'add_prescription', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            alert("Prescription has been written successfully.")
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    }

window.addEventListener('load', function(event){
    getDoctorInfo()
    getPatientInfo()
    getMedicationInfo()
})

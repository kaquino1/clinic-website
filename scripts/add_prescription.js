const baseURL = "https://clinic-serverside.herokuapp.com/";

// Event listener for submit button on add prescription form
document.getElementById('addPrescriptionSubmit').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    var payload = { employeeID: null, patientRecordNumber: null, medID: null, quantityOfTablets: null }

    // Get values from form
    payload.employeeID = document.getElementById("prescribeDoctor").value;
    payload.patientRecordNumber = document.getElementById("prescribePatient").value;
    payload.medID = document.getElementById("prescribeMedication").value;
    payload.quantityOfTablets = document.getElementById('quantityOfTablets').value

    // If any of the values are empty, alert user that all fields are required and exit function.
    if (!formValidation(payload)) {
        alert("Please fill in all required fields.");
        event.preventDefault();
        return
    }

    // If user entered 0 as quantity of tablets to prescribe, alert user that quantity must be greater than 0 and exit function.
    if (parseInt(payload['quantityOfTablets']) === 0) {
        alert("Quantity of tablets to prescribe must be greater than 0.")
        event.preventDefault();
        return
    }

    // Multiple asynchronous requests are needed. A successful sequence of asynchronous requests are as follows:
    // Check that there is enough medication in stock to prescribe -> Check if the exact prescription already exists in the datbase -> insert prescription -> Success message
    getMedicationQuantityAvailable(payload)
    event.preventDefault();
});

// Asynchronous function called at window load to populate doctors dropdown menu
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

// Asynchronous function called at window load to populate patients dropdown menu
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

// Asynchronous function called at window load to populate medications dropdown menu
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

// Function called in asynchronous calls to fetch drop down menu information. If data is received from the server, this function is called
// to populate dropdowns with the recieved data via DOM manipulation
const populateDropDown = (objectWithRows, dropDownToPopulate) => {

    // Populate doctor dropdown menu
    if (Object.is(document.getElementById("prescribeDoctor"), dropDownToPopulate)) {
        for (var i of objectWithRows.results) {
            full_string = `EID ${i.employeeID.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.employeeID;
            dropDownToPopulate.appendChild(option);
        }
    }
    // Populate patient dropdown menu
    else if (Object.is(document.getElementById("prescribePatient"), dropDownToPopulate)) {
        for (var i of objectWithRows.results) {
            full_string = `PRN ${i.patientRecordNumber.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.patientRecordNumber;
            dropDownToPopulate.appendChild(option);
        }
    }
    // Populate medications dropdown menu
    else {
        for (var i of objectWithRows.results) {
            full_string = `MID ${i.medID.toString()} -- ${i.medName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.medID;
            dropDownToPopulate.appendChild(option);
        }
    }

};

// Function to validate form data input from user. If any input is empty, returns false. 
const formValidation = (data) => {
    for (var i in data) {
        if (data[i] === "") {
            return false
        }
    }
    return true;
};

// Asynchronous function to check if a prescription already exists in DB. 
const checkIfAssignmentExists = (payload) => {
    var req = new XMLHttpRequest();
    req.open('POST', baseURL + 'check_for_prescription', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText)
            databaseRowsArray = response.results
            if (databaseRowsArray.length != 0) {
                // A non-empty response means the prescription already exists in the DB. alert user and end here.
                alert('This prescription has already been written.')
            } else {
                // Call insertPrescription asynchronous function to insert prescription
                insertPrescription(payload)
            }
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
};

// Asynchronous function that checks that there is enough medication to make the requested prescription.
const getMedicationQuantityAvailable = (payload) => {
    var req = new XMLHttpRequest();
    req.open('POST', baseURL + 'get_medication_quantity_available', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText)
            databaseRowsArray = response.results
            if (databaseRowsArray[0]['quantityAvailable'] - parseInt(payload['quantityOfTablets']) < 0) {
                // If DB quantityAvailable - quantityOfTablets to prescribe is less than 0, there is not enough medication to prescribe this amount. Alert user
                alert('There is not enough quantity for this medication to write this prescription. Visit the medications page to refill.')
            }
            else {
                // Check that the prescription doesnt already exist in DB.
                checkIfAssignmentExists(payload)
            }
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
};

// Asynchronous call that adds a prescription to the database. 
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

// Populate dropdown menus on window load.
window.addEventListener('load', function (event) {
    getDoctorInfo()
    getPatientInfo()
    getMedicationInfo()
})

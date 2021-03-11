const baseURL = "http://flip3.engr.oregonstate.edu:8666/";

// Makes the table on the front end via DOM manipulation
function makeTable(rowsArray){
    var columns = ['Prescription ID', 'Employee ID', 'Doctor FN', 'Doctor LN', 'Medication ID', 'Medication Name', 'Quantity Prescribed', 'Patient Record #', 'Patient FN', 'Patient LN']

    // If server returns an empty array, hide table and display no results.
    if (rowsArray.length == 0) {
        document.getElementById('prescriptionsContainer').classList.add('hide');
        document.getElementById('noResults').classList.remove('hide');
    }
    else{
    // Delete table, make table header row, make table body rows, display table, and hide no results text.
    deleteTable()
    makeHeaderRow(columns);
    makeTableBodyRows(rowsArray)
    document.getElementById('prescriptionsContainer').classList.remove('hide');
    document.getElementById("noResults").classList.add('hide');
    }
}

// Makes the table header rows of the front end table.
function makeHeaderRow(columns){
    let table = document.getElementById('prescriptionsTable')
    let tableHead = document.createElement('thead')

    let row = document.createElement('tr')
    for(let i = 0; i < 10; i++){
        let headerCell = document.createElement('th');
        headerCell.textContent = columns[i]
        row.appendChild(headerCell)
        headerCell.className = 'headerCell';
    }
    tableHead.appendChild(row)
    table.appendChild(tableHead)
}

// Makes table body rows of the front end table.
function makeTableBodyRows(rowsArray){
    let table = document.getElementById('prescriptionsTable')
    let tableBody = document.createElement('tbody')
    let quantityOfRows = rowsArray.length
    let objectProperties = ["prescriptionID", "employeeID", "dfn", "dln", "medID", "medName", "quantityOfTablets", "patientRecordNumber", "pfn", "pln"]

    for(var i = 0; i < quantityOfRows; i++){ // make this many rows in the table
        var row = document.createElement('tr')
        for(var j = 0; j < 10; j ++){
            // an array of objects containing the row information that comes from a response from server
            var currentRow = rowsArray[i]
            let tableCell = document.createElement('td')
            tableCell.textContent = currentRow[objectProperties[j]]
            row.appendChild(tableCell)
        }
        tableBody.appendChild(row)
    }
    table.appendChild(tableBody)
}

// Deletes the existing table in the front end.
function deleteTable(){
    let table = document.getElementById('prescriptionsTable')
    while(table.lastElementChild){
        table.removeChild(table.lastElementChild)
    }
    return;
}

// Event listener for searching a prescription, filtered search
document.getElementById('searchPrescriptionSubmit').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    var payload = {employeeID: null, patientRecordNumber: null, medID: null}

    payload.employeeID = document.getElementById('searchDoctor').value
    payload.patientRecordNumber = document.getElementById('searchPatient').value
    payload.medID = document.getElementById('searchMedication').value

    // If user does not select any search field, alert them that they need to select at least one option from drop down menu
    if ((payload.employeeID == "") && (payload.patientRecordNumber == "") && (payload.medID == "")){
        alert('You must select at least one search option from the dropdown menus above.')
        event.preventDefault()
        return
    }

    // Make search POST request to server and Make Table with data received
    req.open('POST', baseURL + 'search_prescription', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response;
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));
    event.preventDefault();
    });

// Event listener for show all prescriptions button. Shows all entries of prescriptions in DB.
document.getElementById('showAll').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    req.open('GET', baseURL + 'show_all_prescriptions', true)
    req.send()
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText);
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
            document.getElementById('prescriptionsTable').scrollIntoView(); 
        } else {
            console.log("Error in network request: " + req.statusText)
        }
    })
    event.preventDefault();
})

// Server request for doctor information to populate dropdown menu
const getDoctorInfo = () => {
    var req = new XMLHttpRequest();
    var searchSelect = document.getElementById("searchDoctor");
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

// Server request for patient information to populate dropdown menu
const getPatientInfo = () => {

    var req = new XMLHttpRequest();
    var searchSelect = document.getElementById("searchPatient");
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

// Server request for medication information to populate dropdown menu
const getMedicationInfo = () => {

    var req = new XMLHttpRequest();
    var searchSelect = document.getElementById("searchMedication");
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

// Called within server requests for dropdown menu information to populate the dropdown menus on the front end.
const populateDropDown = (objectWithRows, dropDownToPopulate) => {

    // Populate doctors dropdown
    if (Object.is(document.getElementById("searchDoctor"), dropDownToPopulate)){
        for (var i of objectWithRows.results) {
            full_string = `EID ${i.employeeID.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.employeeID;
            dropDownToPopulate.appendChild(option);
        }
    }
    // Populate patients dropdown.
    else if (Object.is(document.getElementById("searchPatient"), dropDownToPopulate)) {
        for (var i of objectWithRows.results) {
            full_string = `PRN ${i.patientRecordNumber.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.patientRecordNumber;
            dropDownToPopulate.appendChild(option);
        }
    }

    // Populate medications dropdown
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


// event listener upon website load to populate dropdown menus.
window.addEventListener('load', function(event){
    getDoctorInfo()
    getPatientInfo()
    getMedicationInfo()
})

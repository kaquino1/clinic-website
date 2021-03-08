const baseURL = "https://clinic-serverside.herokuapp.com";

function makeTable(rowsArray){
    var columns = ['Doctor Employee ID', 'Doctor First Name', 'Doctor Last Name', 'Patient Record Number', 'Patient First Name', 'Patient Last Name', 'Patient DOB', 'Unassign']

    if (rowsArray.length == 0) {
        document.getElementById('assignmentsContainer').classList.add('hide');
        document.getElementById('noResults').classList.remove('hide');
    } else{
        deleteTable()
        makeHeaderRow(columns);
        makeTableBodyRows(rowsArray)
        document.getElementById('assignmentsContainer').classList.remove('hide');
        document.getElementById("noResults").classList.add('hide');
    }
}

function makeHeaderRow(columns){
    let table = document.getElementById('assignmentsTable')
    let tableHead = document.createElement('thead')

    let row = document.createElement('tr')
    // i = number of header rows
    for(let i = 0; i < 8; i++){
        let headerCell = document.createElement('th');
        headerCell.textContent = columns[i]
        row.appendChild(headerCell)
        headerCell.className = 'headerCell';
    }
    tableHead.appendChild(row)
    table.appendChild(tableHead)
}

function makeTableBodyRows(rowsArray){
    let table = document.getElementById('assignmentsTable')
    let tableBody = document.createElement('tbody')
    let quantityOfRows = rowsArray.length
    let objectProperties = ['employeeID', 'dfn', 'dln', 'patientRecordNumber', 'pfn', 'pln', 'dateOfBirth']

    for(var i = 0; i < quantityOfRows; i++){ // make this many rows in the table
        var row = document.createElement('tr')
        for(var j = 0; j < 8; j ++){
            var currentRow = rowsArray[i] // an array of objects containing the row information that comes from a response from server
            if(j < 6){
                let tableCell = document.createElement('td')
                tableCell.textContent = currentRow[objectProperties[j]]
                row.appendChild(tableCell)
            }

            else if(j === 6){
                let tableCell = document.createElement('td')

                let unmodifiedDate = currentRow[objectProperties[j]]
                let indexOfCharacterT = unmodifiedDate.indexOf("T")
                let slicedDate = unmodifiedDate.slice(0, indexOfCharacterT)

                tableCell.textContent = slicedDate

                row.appendChild(tableCell)
                tableCell.className = 'tableCell'
            }

            else {
                let tableCell = document.createElement('td')
                let unassignButton = document.createElement('button')
                unassignButton.textContent = 'Unassign'
                unassignButton.name = 'unassign'
                tableCell.appendChild(unassignButton)
                row.appendChild(tableCell)
            }
        }
        tableBody.appendChild(row)
    }
    table.appendChild(tableBody)
}

function deleteTable(){
    let table = document.getElementById('assignmentsTable')
    while(table.lastElementChild){
        table.removeChild(table.lastElementChild)
    }
    return;
}

// Make Assignment Listener
// Sends POST request to server. Event listener for MAKE ASSIGNMENT button
document.getElementById('makeAssignment').addEventListener('click', function(event){
    var payload = {employeeID: null, patientRecordNumber: null}

    payload.employeeID = document.getElementById('assignDoctor').value
    payload.patientRecordNumber = document.getElementById('assignPatient').value

    if((payload.employeeID == "") || (payload.patientRecordNumber == "")){
        alert("To assign a doctor to a patient, please select both a doctor and a patient.");
        event.preventDefault();
        return
    }

    // checkIfAssignmentExists is run before making an insert query to verify that the assignment isn't already in the DB
    // Within the callback of checkIfAssignmentExists, makeAssignment is called if it is found that the DB does not contain the
    // attempted assignment.
    checkIfAssignmentExists(payload)
    event.preventDefault()
    });

// Show all assignments by employee ID
document.getElementById('showDoctorsAssignments').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    var payload = {employeeID: null}
    payload.employeeID = document.getElementById('showAssignedDoctor').value

    if(payload.employeeID == ""){
        alert("To search for a doctor's patient assignments, please select a doctor from the dropdown. ");
        event.preventDefault();
        return
    }

    req.open('POST', baseURL + 'search_assignments_by_doctor', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response;
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            document.getElementById('showAssignedDoctor').selectedIndex = 0
            makeTable(databaseRowsArray)
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));
    event.preventDefault();
    });

// Search assignments by patients
document.getElementById('showPatientsAssignments').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    var payload = {patientRecordNumber: null}

    payload.patientRecordNumber = document.getElementById('showAssignedPatient').value

    if(payload.patientRecordNumber == ""){
        alert("To search for a patient's doctor assignments, please select a patient from the dropdown. ");
        event.preventDefault();
        return
    }

    req.open('POST', baseURL + 'search_assignments_by_patient', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response;
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            document.getElementById('showAssignedPatient').selectedIndex = 0
            makeTable(databaseRowsArray)
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));
    event.preventDefault();
    });


// Show all assignments event listener
document.getElementById('showAll').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    req.open('GET', baseURL + 'show_all_assignments', true)
    req.send()
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response;
            var response = JSON.parse(req.responseText);
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
        } else {
            console.log("Error in network request: " + req.statusText)
        }
    })
    event.preventDefault()
})

document.getElementById('assignmentsTable').addEventListener('click', function(event){
    let target = event.target;
    let parentNode = target.parentNode.parentNode
    let cells = parentNode.cells
    let employeeIdOfRow = cells[0].textContent
    let patientRecordNumberOfRow = cells[3].textContent
    let template_string = `Are you sure you want to unassign DR. ${cells[1].textContent} ${cells[2].textContent} from ${cells[4].textContent} ${cells[5].textContent}?`

    if(confirm(template_string)){
        deleteRow(employeeIdOfRow, patientRecordNumberOfRow)
        setTimeout(function(){ alert(`DR. ${cells[1].textContent} ${cells[2].textContent} successfully unassigned from ${cells[4].textContent} ${cells[5].textContent}.`); }, 500)
    }
    else{
        return
    }
})

const getDoctorInfo = () => {
    var req = new XMLHttpRequest();
    var firstDoctorSearchSelect = document.getElementById("assignDoctor");
    var secondDoctorSearchSelect = document.getElementById("showAssignedDoctor");
    req.open('GET', baseURL + 'get_doctor_names', true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var doctorInfo = JSON.parse(req.responseText)
            populateDropDown(doctorInfo, firstDoctorSearchSelect);
            populateDropDown(doctorInfo, secondDoctorSearchSelect)
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    
    });
    req.send(null);
};

const getPatientInfo = () => {

    var req = new XMLHttpRequest();
    var firstPatientSearchSelect = document.getElementById("assignPatient");
    var secondPatientSearchSelect = document.getElementById("showAssignedPatient");
    req.open('GET', baseURL + 'get_patient_names', true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var patientInfo = JSON.parse(req.responseText)
            populateDropDown(patientInfo, firstPatientSearchSelect);
            populateDropDown(patientInfo, secondPatientSearchSelect);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    
    });
    req.send(null);
};


const populateDropDown = (objectWithRows, dropDownToPopulate) => {

    if (Object.is(document.getElementById("assignDoctor"), dropDownToPopulate) || Object.is(document.getElementById("showAssignedDoctor"), dropDownToPopulate)){
        for (var i of objectWithRows.results) {
            full_string = `EID ${i.employeeID.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.employeeID;
            dropDownToPopulate.appendChild(option);
        }
    }
    else {
        for (var i of objectWithRows.results) {
            full_string = `PRN ${i.patientRecordNumber.toString()} -- ${i.lastName}, ${i.firstName}`
            var option = document.createElement("option");
            option.textContent = full_string
            option.value = i.patientRecordNumber;
            dropDownToPopulate.appendChild(option);
        }
    }
};

const checkIfAssignmentExists = (payload) => {
    var req = new XMLHttpRequest();
    req.open('POST', baseURL + 'check_for_assignment', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText)
            databaseRowsArray = response.results
            if(databaseRowsArray.length != 0){
                alert('This doctor-patient assignment already exists.')
            } else{
                makeAssignment(payload)
                document.getElementById('assignDoctor').selectedIndex = 0
                document.getElementById('assignPatient').selectedIndex = 0
            }
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));
    };

const makeAssignment = (payload) => {
    var req = new XMLHttpRequest();
    req.open('POST', baseURL + 'add_assignment', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response;
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            alert('Doctor has been successfully assigned to patient.')
            makeTable(databaseRowsArray)
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));
    }


function deleteRow(eid, prn){
    var req = new XMLHttpRequest();
    var payload = {employeeID: eid, patientRecordNumber: prn}
    req.open('DELETE', baseURL + 'delete_doctor_patient_assignment', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
        } else{
            console.log("Error in network request: " + req.statusText);
        }});
    req.send(JSON.stringify(payload));}


// event listener upon website load
window.addEventListener('load', function(event){
    getDoctorInfo()
    getPatientInfo()
})

const baseURL = "https://clinic-serverside.herokuapp.com";

function makeTable(rowsArray) {
    var columns = ['Doctor Employee ID', 'First Name', 'Last Name', 'Specialty', 'Update', 'Delete']

    if (rowsArray.length == 0) {
        document.getElementById('doctorsContainer').classList.add('hide');
        document.getElementById('noResults').classList.remove('hide');
    }
    else {
        deleteTable()
        makeHeaderRow(columns);
        makeTableBodyRows(rowsArray)
        document.getElementById('doctorsContainer').classList.remove('hide');
        document.getElementById("noResults").classList.add('hide');
    }
}

function makeHeaderRow(columns) {
    let table = document.getElementById('all-doctors-table')
    let tableHead = document.createElement('thead')

    let row = document.createElement('tr')
    for (let i = 0; i < 6; i++) {
        let headerCell = document.createElement('th');
        headerCell.textContent = columns[i]
        row.appendChild(headerCell)
        headerCell.className = 'headerCell';
    }
    tableHead.appendChild(row)
    table.appendChild(tableHead)
}

function makeTableBodyRows(rowsArray) {
    let table = document.getElementById('all-doctors-table')
    let tableBody = document.createElement('tbody')
    let quantityOfRows = rowsArray.length
    let objectProperties = ["employeeID", "firstName", "lastName", "specialty"]

    for (var i = 0; i < quantityOfRows; i++) { // make this many rows in the table
        var row = document.createElement('tr')
        for (var j = 0; j < 6; j++) {
            // an array of objects containing the row information that comes from a response from server
            var currentRow = rowsArray[i]
            if (j < 4) {
                let tableCell = document.createElement('td')
                tableCell.textContent = currentRow[objectProperties[j]]
                row.appendChild(tableCell)
            }

            else if (j === 4) {
                let tableCell = document.createElement('td')
                let updateButton = document.createElement('button')
                updateButton.textContent = 'Update'
                updateButton.name = 'update'
                tableCell.appendChild(updateButton)
                row.appendChild(tableCell)
            }
            else {
                let tableCell = document.createElement('td')
                let deleteButton = document.createElement('button')
                deleteButton.textContent = 'Delete'
                deleteButton.name = 'delete'
                tableCell.appendChild(deleteButton)
                row.appendChild(tableCell)
            }
        }
        tableBody.appendChild(row)
    }
    table.appendChild(tableBody)
}

function deleteTable() {
    let table = document.getElementById('all-doctors-table')
    while (table.lastElementChild) {
        table.removeChild(table.lastElementChild)
    }
    return;
}

// Search doctor, filtered search.
document.getElementById('searchDoctor').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    var payload = { firstName: null, lastName: null, specialty: null }

    payload.firstName = document.getElementById('firstName').value.toUpperCase()
    payload.lastName = document.getElementById('lastName').value.toUpperCase()
    payload.specialty = document.getElementById('specialty').value.toUpperCase()

    if ((payload.firstName == "") && (payload.lastName == "") && (payload.specialty == "")) {
        alert('You must include at least one search field.')
        event.preventDefault()
        return
    }

    req.open('POST', baseURL + 'doctor_search', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            document.getElementById("firstName").value = "";
            document.getElementById("lastName").value = "";
            document.getElementById("specialty").value = "";
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();
});

document.getElementById('showAll').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    req.open('GET', baseURL + 'allDoctors', true)
    req.send()
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
        } else {
            console.log("Error in network request: " + req.statusText)
        }
    })
    event.preventDefault();
})

document.getElementById('all-doctors-table').addEventListener('click', function (event) {
    let target = event.target;

    if (target.name === 'delete') {
        let parentNode = target.parentNode.parentNode
        let idOfRow = parentNode.firstElementChild.textContent
        if (confirm(`WARNING: Deleting doctor with employee ID ${idOfRow} will delete any prescriptions or doctor-patient assignments also associated with the employee. Are you sure you want to delete?`)) {
            deleteRow(idOfRow)
            setTimeout(function () { alert(`Doctor with employee ID ${idOfRow} successfully deleted.`); }, 500)
        }
        else {
            return
        }

    }

    if (target.name === 'update') {
        var row = event.target.closest('tr');
        var oldData = collectRowData(row);
        document.getElementById('updateEmployeeID').value = parseInt(oldData[0]);
        document.getElementById('updateFirstName').value = oldData[1];
        document.getElementById('updateLastName').value = oldData[2];
        document.getElementById('updateSpecialty').value = oldData[3];
        document.getElementById('updateDoctor').classList.remove('hide');
        document.getElementById('updateSubmit').scrollIntoView();
        return
    }
})

document.getElementById('updateSubmit').addEventListener('click', (event) => {
    var payload = { employeeID: null, firstName: '', lastName: '', specialty: '' };
    payload.employeeID = document.getElementById('updateEmployeeID').value;
    payload.firstName = document.getElementById('updateFirstName').value.toUpperCase();
    payload.lastName = document.getElementById('updateLastName').value.toUpperCase();
    payload.specialty = document.getElementById('updateSpecialty').value.toUpperCase();

    if ((payload.firstName == "") || (payload.lastName == "") || (payload.specialty == "")) {
        alert('Please complete all fields in order to update.')
        event.preventDefault()
        return
    }

    var req = new XMLHttpRequest();
    req.open('PUT', baseURL + 'update_doctor', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            document.getElementById('updateDoctor').classList.add('hide');
            // document.getElementById("noResults").classList.remove("hide");
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
            alert(`Employee ID ${payload.employeeID.toString()} successfully updated.`)
        }
        else {
            console.log('Error in network request' + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
});


function deleteRow(idOfRow) {
    var req = new XMLHttpRequest();
    var payload = { employeeID: idOfRow }
    req.open('DELETE', baseURL + 'delete_doctor', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText)
            var databaseRowsArray = response.results
            makeTable(databaseRowsArray)
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
}


const collectRowData = (row) => {
    var cells = row.cells;
    var oldData = [];
    for (var i = 0; i < 4; i++) {
        oldData.push(cells.item(i).innerHTML);
    }
    return (oldData);
};

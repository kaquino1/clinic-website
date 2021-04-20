const baseURL = "https://clinic-serverside.herokuapp.com/";

const table = document.getElementById("medicationTable");

// DELETE MEDICATION BUTTON LISTENER
table.addEventListener("click", (event) => {
    if (event.target && event.target.matches("button.deleteBtns")) {
        const row = event.target.closest("tr");
        const cells = row.cells;
        const toDelete = { medID: cells.item(0).innerHTML };
        if (confirm("Deleting this Medication will also delete all related records in Prescriptions")) {
            deleteRow(toDelete);
        }
    }
    if (event.target && event.target.matches("button.updateBtns")) {
        const row = event.target.closest("tr");
        const oldData = collectRowData(row);
        if (confirm("Restocking this medication will add 50 more units")) {
            restockMedication(oldData)
        };
    }
    event.preventDefault();
});

// GET MEDICATION DATA FROM ROW
const collectRowData = (row) => {
    const cells = row.cells;
    let oldData = [];
    for (let i = 0; i < 3; i++) {
        oldData.push(cells.item(i).innerHTML);
    }
    return (oldData);
};

// ADD 50 TO MEDICATION QUANTITY
const restockMedication = (oldData) => {
    let data = { medID: null, medName: null, quantityAvailable: null }
    data.medID = oldData[0];
    data.medName = oldData[1];
    data.quantityAvailable = 50 + parseInt(oldData[2]);

    // MEDICATION UPDATE REQUEST
    const req = new XMLHttpRequest();
    req.open("PUT", baseURL + "medications", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            getData();
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    })
    req.send(JSON.stringify(data));
};

// DELETE MEDICATION REQUEST
const deleteRow = (toDelete) => {
    const req = new XMLHttpRequest();
    req.open("DELETE", baseURL + "medications", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            getData();
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    })
    req.send(JSON.stringify(toDelete));
};

// DISPLAY MEDICATIONS DATA
const getData = () => {
    const req = new XMLHttpRequest();
    req.open("GET", baseURL + "medications", true);
    req.send(null);
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            const tableData = JSON.parse(req.responseText);
            makeTable(tableData);
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
};

const makeTable = (tableData) => {
    // DELETE TABLE BODY
    const tBody = document.getElementById("tableBody");
    if (tBody != null) {
        tBody.remove();
    }
    const medicationsContainer = document.getElementById("medicationsContainer");
    // HIDE TABLE IF EMPTY
    if (tableData.results.length == 0) {
        medicationsContainer.classList.add("hide");
        document.getElementById("noResults").classList.remove("hide");
    }
    else {
        medicationsContainer.classList.remove("hide")
        const tBody = table.createTBody();
        tBody.setAttribute("id", "tableBody")
        for (let i = 0; i < tableData.results.length; i++) {
            makeRow(tableData.results[i]);
        }
    }
};

const makeRow = (rowData) => {
    const tRow = document.createElement("tr");
    for (let key of Object.keys(rowData)) {
        const tCell = document.createElement("td");
        let cellText = document.createTextNode(rowData[key]);
        tCell.appendChild(cellText);
        tRow.appendChild(tCell);
    }
    const updateCell = document.createElement("td");
    const updateBtn = document.createElement("button");
    const upDateText = document.createTextNode("Restock");
    updateBtn.setAttribute("class", "updateBtns");
    updateBtn.appendChild(upDateText);
    updateCell.appendChild(updateBtn);
    tRow.appendChild(updateCell);

    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    const deleteText = document.createTextNode("Delete");
    deleteBtn.setAttribute("class", "deleteBtns");
    deleteBtn.appendChild(deleteText);
    deleteCell.appendChild(deleteBtn);
    tRow.appendChild(deleteCell);
    document.getElementById("tableBody").appendChild(tRow);
};

// SEARCH MEDICATIONS BUTTON LISTENER
document.getElementById("searchSubmit").addEventListener("click", (event) => {
    let data = { medName: null, quantityAvailable: null, comparator: null };
    if (document.getElementById("searchMedName").value != "") {
        data.medName = document.getElementById("searchMedName").value.toUpperCase()
    }
    if (document.getElementById("searchQuantity").value != "") {
        data.quantityAvailable = parseInt(document.getElementById("searchQuantity").value)
    }
    if (document.getElementById("compare").value != "") {
        data.comparator = document.getElementById("compare").value.toUpperCase()
    }
    if (data.medName == null && data.quantityAvailable == null) {
        alert("You must include at least one search field.");
        event.preventDefault();
        return
    }

    // SEARCH MEDICATIONS REQUEST
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "medication_search", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET SEARCH FORM
            resetSearchForm();
            document.getElementById("noResults").classList.add("hide");
            makeTable(JSON.parse(req.responseText));
            document.getElementById("medicationsContainer").scrollIntoView();
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
    event.preventDefault();
});

const resetSearchForm = () => {
    document.getElementById("searchMedName").value = "";
    document.getElementById("searchQuantity").value = "";
    document.getElementById("compare").value = "";
};

// SHOW ALL BUTTON LISTENER
document.getElementById("showAll").addEventListener("click", (event) => {
    document.getElementById("noResults").classList.add("hide");
    getData();
    document.getElementById("medicationsContainer").scrollIntoView();
    event.preventDefault();
});

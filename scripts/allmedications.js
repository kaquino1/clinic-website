const baseURL = "https://clinic-serverside.herokuapp.com/";

const table = document.getElementById("medicationTable");

// DELETE MEDICATION  
table.addEventListener("click", (event) => {
    if (event.target && event.target.matches("button.deleteBtns")) {
        var row = event.target.closest("tr");
        var cells = row.cells;
        var toDelete = { medID: cells.item(0).innerHTML };
        if (confirm("Deleting this Medication will also delete all related records in Prescriptions")) {
            deleteRow(toDelete);
        }
    }
    event.preventDefault();
});

const deleteRow = (toDelete) => {
    var req = new XMLHttpRequest();
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

const getData = () => {
    var req = new XMLHttpRequest();
    req.open("GET", baseURL + "medications", false);
    req.send(null);
    var tableData = JSON.parse(req.responseText);
    makeTable(tableData);
};

const makeTable = (tableData) => {
    // DELETE TABLE BODY
    var tBody = document.getElementById("tableBody");
    if (tBody != null) {
        tBody.remove();
    }
    var medicationsContainer = document.getElementById("medicationsContainer");
    // HIDE TABLE IF EMPTY
    if (tableData.results.length == 0) {
        medicationsContainer.classList.add("hide");
        document.getElementById("noResults").classList.remove("hide");
    }
    else {
        medicationsContainer.classList.remove("hide")
        var tBody = table.createTBody();
        tBody.setAttribute("id", "tableBody")
        for (var i = 0; i < tableData.results.length; i++) {
            makeRow(tableData.results[i]);
        }
    }
};

const makeRow = (rowData) => {
    var tRow = document.createElement("tr");
    for (var key of Object.keys(rowData)) {
        var tCell = document.createElement("td");
        var cellText = document.createTextNode(rowData[key]);
        tCell.appendChild(cellText);
        tRow.appendChild(tCell);
    }
    var deleteCell = document.createElement("td");
    var deleteBtn = document.createElement("button");
    var deleteText = document.createTextNode("Delete");
    deleteBtn.setAttribute("class", "deleteBtns");
    deleteBtn.appendChild(deleteText);
    deleteCell.appendChild(deleteBtn);
    tRow.appendChild(deleteCell);
    document.getElementById("tableBody").appendChild(tRow);
};

// SEARCH MEDICATIONS
document.getElementById("searchSubmit").addEventListener("click", (event) => {
    var data = { medName: null, quantityAvailable: null, comparator: null };
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
    var req = new XMLHttpRequest();
    req.open("POST", baseURL + "medication_search", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET SEARCH FORM
            resetSearchForm();
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

document.getElementById("showAll").addEventListener("click", (event) => {
    document.getElementById("noResults").classList.add("hide");
    getData();
    document.getElementById("medicationsContainer").scrollIntoView();
    event.preventDefault();
});

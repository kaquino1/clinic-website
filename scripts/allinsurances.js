const baseURL = "https://clinic-serverside.herokuapp.com/52425/";

const table = document.getElementById("insuranceTable");

// DELETE INSURANCE PLAN    
table.addEventListener("click", (event) => {
    if (event.target && event.target.matches("button.deleteBtns")) {
        var row = event.target.closest("tr");
        var cells = row.cells;
        var toDelete = { insuranceCode: cells.item(0).innerHTML };
        if (confirm("Deleting this Insurance Plan will remove it from any Patient records")) {
            deleteRow(toDelete);
        }
    }
    event.preventDefault();
});

const deleteRow = (toDelete) => {
    var req = new XMLHttpRequest();
    req.open("DELETE", baseURL + "insurances", true);
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
    req.open("GET", baseURL + "insurances", false);
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
    var insurancesContainer = document.getElementById("insurancesContainer");
    // HIDE TABLE IF EMPTY
    if (tableData.results.length == 0) {
        insurancesContainer.classList.add("hide");
        document.getElementById("noResults").classList.remove("hide");
    }
    else {
        insurancesContainer.classList.remove("hide")
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

// SEARCH INSURANCE
document.getElementById("searchSubmit").addEventListener("click", (event) => {
    var data = { company: null, planLevel: null };
    if (document.getElementById("searchComapny").value != "") {
        data.company = document.getElementById("searchComapny").value.toUpperCase();
    }
    if (document.getElementById("searchPlanLevel").value != "") {
        data.planLevel = document.getElementById("searchPlanLevel").value;
    }
    if (data.company == null && data.planLevel == null) {
        alert("You must include at least one search field.");
        event.preventDefault();
        return
    }
    var req = new XMLHttpRequest();
    req.open("POST", baseURL + "insurance_search", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET SEARCH FORM
            resetSearchForm();
            makeTable(JSON.parse(req.responseText));
            document.getElementById("insurancesContainer").scrollIntoView();
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
    event.preventDefault();
});

const resetSearchForm = () => {
    document.getElementById("searchComapny").value = "";
    document.getElementById("searchPlanLevel").value = "";
};

document.getElementById("showAll").addEventListener("click", (event) => {
    document.getElementById("noResults").classList.add("hide");
    getData();
    document.getElementById("insurancesContainer").scrollIntoView();
    event.preventDefault();
});

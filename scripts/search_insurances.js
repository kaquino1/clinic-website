const baseURL = "https://clinic-serverside.herokuapp.com/";

const table = document.getElementById("insuranceTable");

// DELETE INSURANCE PLAN BUTTON LISTENER
table.addEventListener("click", (event) => {
    if (event.target && event.target.matches("button.deleteBtns")) {
        const row = event.target.closest("tr");
        const cells = row.cells;
        const toDelete = { insuranceCode: cells.item(0).innerHTML };
        if (confirm("Deleting this Insurance Plan will remove it from any Patient records")) {
            deleteRow(toDelete);
        }
    }
    event.preventDefault();
});

// DELETE INSURANCE PLAN REQUEST
const deleteRow = (toDelete) => {
    const response = new XMLHttpRequest();
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

// DISPLAY INSURANCES DATA
const getData = () => {
    const response = new XMLHttpRequest();
    req.open("GET", baseURL + "insurances", true);
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
    const insurancesContainer = document.getElementById("insurancesContainer");
    // HIDE TABLE IF EMPTY
    if (tableData.results.length == 0) {
        insurancesContainer.classList.add("hide");
        document.getElementById("noResults").classList.remove("hide");
    }
    else {
        insurancesContainer.classList.remove("hide")
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
    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    const deleteText = document.createTextNode("Delete");
    deleteBtn.setAttribute("class", "deleteBtns");
    deleteBtn.appendChild(deleteText);
    deleteCell.appendChild(deleteBtn);
    tRow.appendChild(deleteCell);
    document.getElementById("tableBody").appendChild(tRow);
};

// SEARCH INSURANCES BUTTON LISTENER
document.getElementById("searchSubmit").addEventListener("click", (event) => {
    let data = { company: null, planLevel: null };
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
    // SEARCH INSURANCES REQUEST
    const response = new XMLHttpRequest();
    req.open("POST", baseURL + "insurance_search", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET SEARCH FORM
            resetSearchForm();
            document.getElementById("noResults").classList.add("hide");
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

// SHOW ALL BUTTON LISTENER
document.getElementById("showAll").addEventListener("click", (event) => {
    document.getElementById("noResults").classList.add("hide");
    getData();
    document.getElementById("insurancesContainer").scrollIntoView();
    event.preventDefault();
});

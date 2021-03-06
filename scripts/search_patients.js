const baseURL = "https://clinic-serverside.herokuapp.com/";

const table = document.getElementById("patientTable");

// UPDATE PATIENT SUBMIT BUTTON LISTENER
document.getElementById("updateSubmit").addEventListener("click", (event) => {
    let data = { patientRecordNumber: null, firstName: "", lastName: "", dob: null, gender: null, diagnosis: "", company: "", planLevel: "" };
    data.patientRecordNumber = parseInt(document.getElementById("updatepatientRecordNumber").value);
    data.firstName = document.getElementById("updateFName").value.toUpperCase();
    data.lastName = document.getElementById("updateLName").value.toUpperCase();
    data.dob = document.getElementById("updateDOB").value;
    if (document.querySelector('input[name="updateGender"]:checked')) {
        data.gender = parseInt(document.querySelector('input[name="updateGender"]:checked').value);
    }
    if (document.getElementById("updateDiagnosis").value != "") {
        data.diagnosis = document.getElementById("updateDiagnosis").value.toUpperCase();
    }
    data.company = document.getElementById("updateCompany").value;
    data.planLevel = document.getElementById("updatePlanLevel").value;
    updatePatient(data)
    event.preventDefault();
});

// UPDATE PATIENT REQUEST
const updatePatient = (data) => {
    const req = new XMLHttpRequest();
    req.open("PUT", baseURL + "patients", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            getData();
            // HIDE UPDATE FORM
            document.getElementById("updatePatient").classList.add("hide");
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    })
    req.send(JSON.stringify(data));
};

// DELETE PATIENT REQUEST
const deleteRow = (toDelete) => {
    const req = new XMLHttpRequest();
    req.open("DELETE", baseURL + "patients", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            getData();
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(toDelete));
};

// DISPLAY PATIENTS DATA
const getData = () => {
    const req = new XMLHttpRequest();
    req.open("GET", baseURL + "patients", true);
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
    const patientContainer = document.getElementById("patientsContainer");
    // HIDE TABLE IF EMPTY
    if (tableData.results.length == 0) {
        patientContainer.classList.add("hide");
        document.getElementById("noResults").classList.remove("hide");
    }
    else {
        patientContainer.classList.remove("hide")
        const tBody = table.createTBody();
        tBody.setAttribute("id", "tableBody");
        for (let i = 0; i < tableData.results.length; i++) {
            makeRow(tableData.results[i]);
        }
    }
};

const makeRow = (rowData) => {
    if (rowData.diagnosis == null) {
        rowData.diagnosis = "";
    }
    if (rowData.gender == false) {
        rowData.gender = "MALE";
    }
    else if (rowData.gender == true) {
        rowData.gender = "FEMALE";
    }
    rowData.dateOfBirth = rowData.dateOfBirth.slice(0, 10);
    if (rowData.insuranceCode == null) {
        rowData.insuranceCode = "";
    }
    if (rowData.company == null) {
        rowData.company = "";
    }
    if (rowData.planLevel == null) {
        rowData.planLevel = "";
    }
    const tRow = document.createElement("tr");
    for (let key of Object.keys(rowData)) {
        const tCell = document.createElement("td");
        let cellText = document.createTextNode(rowData[key]);
        tCell.appendChild(cellText);
        tRow.appendChild(tCell);
    }
    const updateCell = document.createElement("td");
    const updateBtn = document.createElement("button");
    const upDateText = document.createTextNode("Update");
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

// UPDATE & DELETE PATIENT ROW BUTTONS LISTENER
table.addEventListener("click", (event) => {
    if (event.target && event.target.matches("button.updateBtns")) {
        const row = event.target.closest("tr");
        const oldData = collectRowData(row);
        // RESET OPTIONAL FIELDS
        document.getElementById("updateDiagnosis").value = "";
        document.getElementById("updateCompany").value = "NONE";
        document.getElementById("updatePlanLevel").value = "NONE";
        // POPULATE FORM WITH ROW DATA
        document.getElementById("updatepatientRecordNumber").value = parseInt(oldData[0]);
        document.getElementById("updateFName").value = oldData[1];
        document.getElementById("updateLName").value = oldData[2];
        document.getElementById("updateDOB").value = oldData[3];
        if (oldData[4] == "MALE") {
            document.getElementById("updateMale").checked = true;
        }
        else {
            document.getElementById("updateFemale").checked = true;
        }
        if (oldData[5] != "") {
            document.getElementById("updateDiagnosis").value = oldData[5];
        }
        document.getElementById("updateCompany").value = oldData[7];
        document.getElementById("updatePlanLevel").value = oldData[8];
        document.getElementById("updatePatient").classList.remove("hide");
        document.getElementById("updateSubmit").scrollIntoView();
    }

    if (event.target && event.target.matches("button.deleteBtns")) {
        document.getElementById("updatePatient").classList.add("hide")
        const row = event.target.closest("tr");
        const cells = row.cells;
        const toDelete = { patientRecordNumber: cells.item(0).innerHTML };

        if (confirm("Deleting this Patient will also delete all related records in Prescriptions and Doctor-Patient Relationships")) {
            deleteRow(toDelete);
        }


    }
    event.preventDefault();
});

// GET PATIENT DATA FROM ROW
const collectRowData = (row) => {
    const cells = row.cells;
    let oldData = [];
    for (let i = 0; i < 9; i++) {
        oldData.push(cells.item(i).innerHTML);
    }
    return (oldData);
};

// INSURANCE COMPANIES REQUEST
const getInsuranceCompanies = () => {
    const req = new XMLHttpRequest();
    req.open("GET", baseURL + "insurance_companies", true);
    req.send(null);
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            const companies = JSON.parse(req.responseText);

            // POPULATE SEARCH DROPDOWN
            const searchSelect = document.getElementById("searchCompany");
            populateCompanyDropDown(companies, searchSelect);

            // POPULATE UPDATE DROPDOWN
            const updateSelect = document.getElementById("updateCompany");
            populateCompanyDropDown(companies, updateSelect);
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
};

const populateCompanyDropDown = (companies, companySelect) => {
    for (let i of companies.results) {
        const option = document.createElement("option");
        let optionText = document.createTextNode(i.company);
        option.value = i.company;
        option.appendChild(optionText);
        companySelect.appendChild(option);
    }
};

// POPULATE PLAN LEVEL DROPDOWN WHEN COMPANY SELECTION CHANGES
document.getElementById("updateCompany").onchange = (event) => {
    const inputText = event.target.value;
    removePlanLevels();

    if (inputText != "NONE") {
        let data = { company: "" };
        data.company = inputText;
        getInsurancePlanLevels(data);
    }
    else {
        // PLAN LEVEL IS NONE
        setPlanLevels()
    }
};

// REMOVE OLD PLAN LEVEL OPTIONS WHEN COMPANY SELECTION CHANGES
const removePlanLevels = () => {
    const planLevelSelect = document.getElementById("updatePlanLevel");
    while (planLevelSelect.firstChild) {
        planLevelSelect.removeChild(planLevelSelect.firstChild);
    };
};

// RESET PLAN LEVELS
const setPlanLevels = () => {
    const planLevelSelect = document.getElementById("udpatePlanLevel");
    const option = document.createElement("option");
    const optionText = document.createTextNode("NONE");
    option.value = "NONE";
    option.appendChild(optionText);
    planLevelSelect.appendChild(option);
}

// PLAN LEVELS REQUEST BASED ON COMPANY SELECTION
const getInsurancePlanLevels = (data) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "insurance_plans", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            const planLevels = JSON.parse(req.responseText);

            // POPULATE PLAN LEVEL DROPDOWN
            const planLevelSelect = document.getElementById("updatePlanLevel");
            for (let i of planLevels.results) {
                const option = document.createElement("option");
                let optionText = document.createTextNode(i.planLevel);
                option.vaue = i.planLevel;
                option.appendChild(optionText);
                planLevelSelect.appendChild(option);
            }
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
};

// SEARCH PATIENTS BUTTON LISTENER
document.getElementById("searchSubmit").addEventListener("click", (event) => {
    let data = { firstName: null, lastName: null, dob: null, gender: null, diagnosis: null, company: null, planLevel: null };
    data.firstName = document.getElementById("searchFName").value.toUpperCase();
    data.lastName = document.getElementById("searchLName").value.toUpperCase();
    data.dob = document.getElementById("searchDOB").value;
    data.diagnosis = document.getElementById("searchDiagnosis").value.toUpperCase();
    data.gender = document.getElementById("searchForm").elements["SearchGender"].value;
    data.company = document.getElementById("searchCompany").value;
    data.planLevel = document.getElementById("searchPlanLevel").value;
    if (data.gender == "0" || data.gender == "1") {
        data.gender = parseInt(data.gender);
    }
    for (let item in data) {
        if (data[item] === "") {
            data[item] = null;
        }
    }
    if (document.getElementById("noInsurance").checked) {
        data.company = "";
        data.planLevel = "";
    }
    if (document.getElementById("noDiagnosis").checked) {
        data.diagnosis = "";
    }
    if (data.firstName == null && data.lastName == null && data.dob == null && data.gender == null && data.diagnosis == null && data.company == null && data.planLevel == null) {
        alert("You must include at least one search field.");
        event.preventDefault();
        return
    }

    // SEARCH PATIENTS REQUEST
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "patient_search", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET SEARCH FORM
            resetSearchForm();
            document.getElementById("noResults").classList.add("hide");
            makeTable(JSON.parse(req.responseText));
            document.getElementById("patientsContainer").scrollIntoView();
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
    event.preventDefault();
});

const resetSearchForm = () => {
    document.getElementById("searchFName").value = "";
    document.getElementById("searchLName").value = "";
    document.getElementById("searchDOB").value = "";
    document.getElementById("searchDiagnosis").value = "";
    document.getElementById("searchCompany").value = "";
    document.getElementById("searchPlanLevel").value = "";
    const radiobtn = document.getElementsByName("SearchGender");
    for (let i = 0; i < radiobtn.length; i++) {
        radiobtn[i].checked = false;
    }
    document.getElementById("noDiagnosis").checked = false;
    document.getElementById("noInsurance").checked = false;
    document.getElementById("searchDiagnosis").disabled = false;
    document.getElementById("searchCompany").disabled = false;
    document.getElementById("searchPlanLevel").disabled = false;
};

// SHOW ALL BUTTON LISTENER
document.getElementById("showAll").addEventListener("click", (event) => {
    document.getElementById("noResults").classList.add("hide");
    getData();
    document.getElementById("patientsContainer").scrollIntoView();
    event.preventDefault();
});

// DIAGNOSIS INPUT INACTIVE IF NONE
const inactivateDiagnosis = () => {
    const checkBox = document.getElementById("noDiagnosis");
    const textfield = document.getElementById("searchDiagnosis");
    if (checkBox.checked == true) {
        textfield.disabled = true;
        textfield.value = "";
    } else {
        textfield.disabled = false;
    }
};

// INSURANCE COMPANY AND PLAN LEVEL DROPDOWN INACTIVE IF NONE
const inactivateInsurance = () => {
    const checkBox = document.getElementById("noInsurance");
    const companySelect = document.getElementById("searchCompany");
    const planLevelSelect = document.getElementById("searchPlanLevel");
    if (checkBox.checked == true) {
        companySelect.disabled = true;
        planLevelSelect.disabled = true;
        companySelect.value = "";
        planLevelSelect.value = "";
    } else {
        companySelect.disabled = false;
        planLevelSelect.disabled = false;
    }
};

getInsuranceCompanies();

const baseURL = "https://clinic-serverside.herokuapp.com/";

// ADD PATIENT BUTTON LISTENER
document.getElementById("addSubmit").addEventListener("click", (event) => {
    let data = { firstName: "", lastName: "", dob: null, gender: null, diagnosis: "", company: "", planLevel: "" };
    data.firstName = document.getElementById("addFName").value.toUpperCase();
    data.lastName = document.getElementById("addLName").value.toUpperCase();
    data.dob = document.getElementById("addDOB").value;
    if (document.querySelector('input[name="gender"]:checked')) {
        data.gender = parseInt(document.querySelector('input[name="gender"]:checked').value);
    }
    if (document.getElementById("addDiagnosis").value != "") {
        data.diagnosis = document.getElementById("addDiagnosis").value.toUpperCase();
    }
    data.company = document.getElementById("addCompany").value;
    data.planLevel = document.getElementById("addPlanLevel").value;
    if (!formValidation(data)) {
        alert("Fill in All *Required Fields");
        event.preventDefault();
        return
    }
    else {
        addPatient(data);
    }
    event.preventDefault();
});

const formValidation = (data) => {
    if (data.firstName.trim().length === 0 || data.lastName.trim().length === 0) {
        return false
    }
    for (let i in data) {
        if (data[i] === "") {
            if (i != "diagnosis")
                return false
        }
    }
    return true;
};

// ADD PATIENT REQUEST
const addPatient = (data) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "patients", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET ADD FORM
            resetAddForm();
            alert("Patient Sucessfully Added!");
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
};

const resetAddForm = () => {
    document.getElementById("addFName").value = "";
    document.getElementById("addLName").value = "";
    document.getElementById("addDOB").value = "";
    document.querySelector('input[name="gender"]:checked').checked = false;
    document.getElementById("addDiagnosis").value = "";
    document.getElementById("addCompany").value = "NONE";
    removePlanLevels();
    setPlanLevels();
    document.getElementById("noDiagnosis").checked = false;
    document.getElementById("addDiagnosis").disabled = false;
}

// INSURANCE COMPANIES REQUEST
const getInsuranceCompanies = () => {
    const req = new XMLHttpRequest();
    req.open("GET", baseURL + "insurance_companies", true);
    req.send(null);
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // POPULATE INSURANCE COMPANY DROPDOWN
            const companies = JSON.parse(req.responseText);
            const companySelect = document.getElementById("addCompany");
            populateCompanyDropDown(companies, companySelect);
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
};

const populateCompanyDropDown = (companies, companySelect) => {
    for (let i of companies.results) {
        const option = document.createElement("option");
        const optionText = document.createTextNode(i.company);
        option.value = i.company;
        option.appendChild(optionText);
        companySelect.appendChild(option);
    }
};

// POPULATE PLAN LEVEL DROPDOWN WHEN COMPANY SELECTION CHANGES
document.getElementById("addCompany").onchange = (event) => {
    const inputText = event.target.value;
    removePlanLevels();

    if (inputText != "NONE") {
        let data = { company: "" };
        data.company = inputText;
        getInsurancePlanLevels(data);
    }
    else {
        // PLAN LEVEL IS NONE
        setPlanLevels();
    }
};

// REMOVE OLD PLAN LEVEL OPTIONS WHEN COMPANY SELECTION CHANGES
const removePlanLevels = () => {
    const planLevelSelect = document.getElementById("addPlanLevel")
    while (planLevelSelect.firstChild) {
        planLevelSelect.removeChild(planLevelSelect.firstChild);
    };

};

// RESET PLAN LEVELS
const setPlanLevels = () => {
    const planLevelSelect = document.getElementById("addPlanLevel")
    const option = document.createElement("option");
    const optionText = document.createTextNode("NONE");
    option.value = "NONE";
    option.appendChild(optionText);
    planLevelSelect.appendChild(option);
};

// PLAN LEVELS REQUEST BASED ON COMPANY SELECTION
const getInsurancePlanLevels = (data) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "insurance_plans", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            const planLevels = JSON.parse(req.responseText);

            // POPULATE PLAN LEVEL DROPDOWN
            const planLevelSelect = document.getElementById("addPlanLevel")
            for (let i of planLevels.results) {
                const option = document.createElement("option");
                const optionText = document.createTextNode(i.planLevel);
                option.vaue = i.planLevel;
                option.appendChild(optionText);
                planLevelSelect.appendChild(option);
            }
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
};

// DIAGNOSIS INPUT INACTIVE IF NONE
const inactivateDiagnosis = () => {
    const checkBox = document.getElementById("noDiagnosis");
    const textfield = document.getElementById("addDiagnosis");
    if (checkBox.checked == true) {
        textfield.disabled = true;
        textfield.value = "";
    } else {
        textfield.disabled = false;
    }
};

getInsuranceCompanies();

const baseURL = "https://clinic-serverside.herokuapp.com/";

// ADD INSURANCE PLAN BUTTON LISTENER
document.getElementById("addSubmit").addEventListener("click", (event) => {
    let data = { company: "", planLevel: "" };
    data.company = document.getElementById("addCompany").value.toUpperCase();
    data.planLevel = document.getElementById("addPlanLevel").value;
    if (!formValidation(data)) {
        alert("Fill in All *Required Fields");
        event.preventDefault();
        return
    }
    checkDuplicates(data);
    event.preventDefault();
});

const formValidation = (data) => {
    if (data.company.trim().length === 0) {
        return false
    }
    for (let i in data) {
        if (data[i] == "") {
            return false
        }
    }
    return true;
};

// CHECK IF INSURANCE PLAN EXISTS
const checkDuplicates = (data) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "check_insurances", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            const response = JSON.parse(req.responseText);
            console.log(response);

            if (response.results.length != 0) {
                resetForm();
                alert("This Insurance Plan already exists in the database");
            }
            else {
                addInsurance(data);
            }
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    })
    req.send(JSON.stringify(data));
};

// ADD INSURANCE PLAN REQUEST
const addInsurance = (data) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "insurances", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET ADD FORM
            resetAddForm();
            alert("Insurance Plan Successfully Added!");
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
};

const resetAddForm = () => {
    document.getElementById("addCompany").value = "";
    document.getElementById("addPlanLevel").value = "BRONZE";
};
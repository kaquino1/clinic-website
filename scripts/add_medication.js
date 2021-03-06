const baseURL = "https://clinic-serverside.herokuapp.com/";

// ADD MEDICATION BUTTON LISTENER
document.getElementById("addSubmit").addEventListener("click", (event) => {
    let data = { medName: "", quantityAvailable: null };
    data.medName = document.getElementById("addMedName").value.toUpperCase();
    data.quantityAvailable = parseInt(document.getElementById("addQuantity").value);
    if (!formValidation(data)) {
        alert("Fill in All *Required Fields");
        event.preventDefault();
        return
    }
    checkDuplicates(data);
    event.preventDefault();
});

const formValidation = (data) => {
    if (data.medName.trim().length === 0) {
        return false
    }
    for (let i in data) {
        if (data[i] == "") {
            return false
        }
    }
    return true;
};

// CHECK IF MEDICATION EXISTS
const checkDuplicates = (data) => {
    let check_data = {};
    check_data.medName = data.medName;

    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "check_medications", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            const response = JSON.parse(req.responseText);
            if (response.results.length != 0) {
                resetForm();
                alert("This Medication already exists in the database");
            }
            else {
                addMedication(data);
            }
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    })
    req.send(JSON.stringify(check_data));
};

// ADD MEDICATION REQUEST
const addMedication = (data) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseURL + "medications", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // RESET ADD FORM
            resetAddForm();
            alert("Medication Successfully Added!");
        }
        else {
            console.log("Error in network request" + req.statusText);
        }
    });
    req.send(JSON.stringify(data));
};

const resetAddForm = () => {
    document.getElementById("addMedName").value = "";
    document.getElementById("addQuantity").value = "";
};
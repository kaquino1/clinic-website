const baseURL = "https://clinic-serverside.herokuapp.com/52425/";

document.getElementById('add-doctor-submit').addEventListener('click', function (event) {
    var req = new XMLHttpRequest();
    var payload = { firstName: null, lastName: null, specialty: null }

    payload.firstName = document.getElementById('firstName').value.toUpperCase()
    payload.lastName = document.getElementById('lastName').value.toUpperCase()
    payload.specialty = document.getElementById('specialty').value.toUpperCase()

    if (payload.firstName.trim().length === 0 || payload.lastName.trim().length === 0 || payload.specialty.trim().length === 0) {
        alert("To add a doctor, all fields must be completed.")
        event.preventDefault()
        return
    }
    else {
        req.open('POST', baseURL + 'add_doctor', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 400) {
                document.getElementById('firstName').value = "";
                document.getElementById('lastName').value = "";
                document.getElementById('specialty').value = "";
                alert('Doctor successfully added.')
            } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        req.send(JSON.stringify(payload))
    };
    event.preventDefault();
});

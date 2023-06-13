const body = document.querySelector("body"),
    modeToggle = body.querySelector(".mode-toggle");
sidebar = body.querySelector("nav");
sidebarToggle = body.querySelector(".sidebar-toggle");

let getMode = localStorage.getItem("mode");
if (getMode && getMode === "dark") {
    body.classList.toggle("dark");
}

let getStatus = localStorage.getItem("status");
if (getStatus && getStatus === "close") {
    sidebar.classList.toggle("close");
}

modeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        localStorage.setItem("mode", "dark");
    } else {
        localStorage.setItem("mode", "light");
    }
});

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if (sidebar.classList.contains("close")) {
        localStorage.setItem("status", "close");
    } else {
        localStorage.setItem("status", "open");
    }
});

/*Thermomether */

const units = {
    Threat: "",
    Other: "",
};

const config = {
    minTemp: 0,
    maxTemp: 100,
    unit: "Threat",
};

// Change min and max temperature values

const tempValueInputs = document.querySelectorAll("input[type='text']");

tempValueInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
        const newValue = event.target.value;

        if (isNaN(newValue)) {
            return (input.value = config[input.id]);
        } else {
            config[input.id] = input.value;
            range[input.id.slice(0, 3)] = config[input.id]; // Update range
            return setTemperature(); // Update temperature
        }
    });
});

// Switch unit of temperature

const unitP = document.getElementById("unit");

unitP.addEventListener("click", () => {
    config.unit = config.unit === "Threat" ? "Other" : "Threat";
    unitP.innerHTML = config.unit + " " + units[config.unit];
    return setTemperature();
});

// Change temperature

const range = document.querySelector("input[type='range']");
const temperature = document.getElementById("temperature");

function setTemperature(temp) {
    temperature.style.height =
        (temp - config.minTemp) / (config.maxTemp - config.minTemp) * 100 + "%";
    temperature.dataset.value = temp + units[config.unit];
}

range.addEventListener("input", () => setTemperature(range.value));
setTimeout(() => setTemperature(75), 1000);



// Function to update the threat value on the thermometer and table
async function updateThreatValue() {
    try {
        const response = await fetch("/get_threat_value");
        const data = await response.json();

        const threatValue = data.threat_value;

        // Update thermometer height based on threat value
        const thermometer = document.getElementById("temperature");
        thermometer.style.height = `${threatValue}%`;
        thermometer.dataset.value = threatValue;

        // Update range input value
        const rangeInput = document.getElementById("rangeInput");
        rangeInput.value = threatValue;

        // Update risk level text
        const riskLevel = document.getElementById("unit");

        // Set temperature based on priority
        if (threatValue <= 0) {
            riskLevel.textContent = "Low";
            thermometer.classList.remove("moderate", "high", "critical");
            thermometer.classList.add("low");
            setTemperature(0);
        } else if (threatValue <= 50) {
            riskLevel.textContent = "Medium";
            thermometer.classList.remove("low", "high", "critical");
            thermometer.classList.add("moderate");
            setTemperature(50);
        } else {
            riskLevel.textContent = "High";
            thermometer.classList.remove("low", "moderate");
            thermometer.classList.add("high");
            setTemperature(100);
        }

        // Update table
        const table = document.getElementById("table");
        table.innerHTML = "";
        data.items.forEach((item) => {
            const row = table.insertRow();
            const priorityCell = row.insertCell();
            const nameCell = row.insertCell();
            const priority = item.priority;

            priorityCell.textContent = priority;
            nameCell.textContent = item.name;

            // Apply category styling based on priority
            if (priority === "low") {
                priorityCell.classList.add("low-priority");
            } else if (priority === "medium") {
                priorityCell.classList.add("medium-priority");
            } else if (priority === "high") {
                priorityCell.classList.add("high-priority");
            }
        });
    } catch (error) {
        console.error("Error fetching threat value:", error);
    }
}

// Call the updateThreatValue function initially and every 1 minute
updateThreatValue();
setInterval(updateThreatValue, 60000);


function fetchThreatData() {
    fetch('/threats')
        .then(response => response.json())
        .then(data => {
            // Clear existing table rows
            const tableBody = document.getElementById('table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = '';

            // Update table with new data
            data.forEach(threat => {
                const row = tableBody.insertRow();
                const priorityCell = row.insertCell();
                const messageCell = row.insertCell();
                const protocolCell = row.insertCell();
                const classTypeCell = row.insertCell();

                // Set cell values
                priorityCell.textContent = threat.priority;
                messageCell.textContent = threat.message;
                protocolCell.textContent = threat.protocol;
                classTypeCell.textContent = threat.classType;

                // Apply priority-specific class
                row.classList.add(getPriorityClass(threat.priority));
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getPriorityClass(priority) {
    if (priority === 'low') {
        return 'low-priority';
    } else if (priority === 'medium') {
        return 'medium-priority';
    } else if (priority === 'high') {
        return 'high-priority';
    } else {
        return '';
    }
}

// Call fetchThreatData to populate the table initially
fetchThreatData();

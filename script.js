// script.js
var selectedTimeslots = new Set(); // Use a Set to store unique selected timeslots

// Function to update the display of selected timeslots
function updateSelectedTimeslotsDisplay() {
    let fullTimeslotList = [];

    const timeslotsByDay = {}; // Object to hold timeslots grouped by day

    selectedTimeslots.forEach(dayTimeslotKey => {
        // Splitting the key into day and timeslot parts
        const [day, start, end] = dayTimeslotKey.split('-');
        if (!timeslotsByDay[day]) {
            timeslotsByDay[day] = []; // Initialize an array for the day if it doesn't exist
        }
        // Reforming the timeslot string to include "from" and "to" for clarity
        const timeslotRange = `${start}:00 to ${end}:00`;
        timeslotsByDay[day].push(timeslotRange);
    });

    Object.entries(timeslotsByDay).forEach(([day, timeslots]) => {
        timeslots.forEach(timeslot => {
            // Creating a string that represents the full timeslot, including the day
            let fullTimeslot = `${day.charAt(0).toUpperCase() + day.slice(1)} ${timeslot}`;
            fullTimeslotList.push(fullTimeslot);
        });
    });

    // Update the table cell with the full list of selected timeslots
    let timeslotDisplayCell = document.getElementById('timeslotDisplay');
    if (fullTimeslotList.length > 0) {
        timeslotDisplayCell.innerHTML = fullTimeslotList.join('<br>');
    } else {
        timeslotDisplayCell.textContent = 'None selected';
    }

    // Calculate total hours: Each timeslot represents 2 hours
    let totalHours = selectedTimeslots.size * 2;
    document.getElementById('totalHoursTable').textContent = totalHours;
}



// Function to calculate the number of prospects that can be created
function calculateProspects() {
    
    // Retrieve input values and convert them to minutes
    const researchTime = parseFloat(document.getElementById('research_time').value) || 0;
    const createTime = parseFloat(document.getElementById('create_time').value) || 0;
    const analysisTime = parseFloat(document.getElementById('analysis_time').value) || 0;
    const defineStrategyTime = parseFloat(document.getElementById('define_strategy_time').value) || 0;
    const firstContactTime = parseFloat(document.getElementById('first_contact_time').value) || 0;

    const callsPerAppointment = parseFloat(document.getElementById('action_calls').value) || 0;
    // Sum of all the times to create one prospect in minutes
    const totalTimePerProspectMinutes = researchTime + createTime + analysisTime + defineStrategyTime + firstContactTime;

    // Convert the total time per prospect to hours for comparison with totalHoursAvailable
    const totalTimePerProspectHours = totalTimePerProspectMinutes / 60;

    // Retrieve the total hours available from the selected timeslots
    const totalHoursAvailable = parseFloat(document.getElementById('totalHoursTable').textContent) || 0;

    // Calculate the number of prospects that can be created
    const numberOfProspects = totalTimePerProspectHours > 0 ? Math.floor(totalHoursAvailable / totalTimePerProspectHours) : 0;

    // Directly update the text content of existing elements
    document.getElementById('detailTimePerProspect').textContent = `${totalTimePerProspectMinutes} minutes (${totalTimePerProspectHours.toFixed(2)} hours and ${callsPerAppointment.toFixed(2)} Calls`;
    document.getElementById('detailProspectsPossible').textContent = `${numberOfProspects} prospects`;
    
    return numberOfProspects;
}

// Calculate the forecast of calls and emails for the prospects
function calculateForecast() {
    // Retrieve the number of prospects possible
    const numberOfProspects = calculateProspects();

    // Retrieve pricing data
    let pricePerCallBrut = parseFloat(document.getElementById('price_call_brut').value);
    let pricePerCallNet = parseFloat(document.getElementById('price_call_net').value);
    let pourcentageCallconversion = parseFloat(document.getElementById('pourcentage_lost_call').value) / 100 || 0;

    // New inputs for the number of actions and conversions
    const callsPerAppointment = parseFloat(document.getElementById('action_calls').value) || 0;
    const emailsPerAppointment = parseFloat(document.getElementById('action_emails').value) || 0;
    const appointmentConversionRate = parseFloat(document.getElementById('conversion_appointments').value) / 100 || 0;

    // Calculate total actions needed to achieve the number of prospects
    const totalCallsNeeded = numberOfProspects * callsPerAppointment;
    const totalEmailsNeeded = numberOfProspects * emailsPerAppointment;


    // Calculate the number of brut and net calls
    let brutCalls = totalCallsNeeded * pourcentageCallconversion; // Number of net calls
    let netCalls = totalCallsNeeded - brutCalls; // Number of brut calls

    // Calculate the income from calls
    let totalIncomeFromBrutCalls = brutCalls * pricePerCallBrut; // Assuming all calls are brut for simplification
    let totalIncomeFromNetCalls = netCalls * pricePerCallNet; // Assuming all calls can also be calculated as net for comparison

    // Calculate the expected number of appointments
    const expectedAppointments = numberOfProspects * appointmentConversionRate;

    document.getElementById('forecastTotalCallsNeeded').textContent = `${totalCallsNeeded.toFixed(2)}`;
    document.getElementById('forecastTotalEmailsNeeded').textContent = `${totalEmailsNeeded.toFixed(2)}`;
    document.getElementById('forecastExpectedAppointments').textContent = `${expectedAppointments.toFixed(2)}`;
    document.getElementById('forecastIncomeFromBrutCalls').textContent = `Brut Calls: ${brutCalls.toFixed(2)} generating ${totalIncomeFromBrutCalls.toFixed(2)}€`;
    document.getElementById('forecastIncomeFromNetCalls').textContent = `Net Calls: ${netCalls.toFixed(2)} generating ${totalIncomeFromNetCalls.toFixed(2)}€`;
}

document.addEventListener('DOMContentLoaded', function() {

    // Function to handle input changes and recalculate forecasts
    function handleInputChange() {
        calculateProspects();
        calculateForecast();
    }

    // Attach event listeners to each timeslot for selection
    document.querySelectorAll('.timeslot').forEach(function(button) {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day'); // Get the day attribute
            const timeslotValue = this.getAttribute('data-timeslot');
            const dayTimeslotKey = day + '-' + timeslotValue; // Combine day and timeslot for uniqueness

            this.classList.toggle('selected');

            if (this.classList.contains('selected')) {
                selectedTimeslots.add(dayTimeslotKey);
            } else {
                selectedTimeslots.delete(dayTimeslotKey);
            }

            updateSelectedTimeslotsDisplay();
            handleInputChange(); // Use handleInputChange to recalculate
        });
    });

    // Attach event listeners to all number inputs within any form to recalculate on change
    document.querySelectorAll('form input[type="number"], form select').forEach(input => {
        input.addEventListener('input', handleInputChange);
    });

    // Optionally, if there are select elements or other input types you want to monitor, add event listeners for those as well
    // For example, for select elements, you might want to use 'change' event instead of 'input'
    document.querySelectorAll('form select').forEach(select => {
        select.addEventListener('change', handleInputChange);
    });

});

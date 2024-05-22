import init, { start_erg_mode } from './pkg/kickr_control_wasm.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded');
    await init(); // Initialize WebAssembly module

    const app = document.getElementById('app');
    const startMenu = document.getElementById('startMenu');
    const createTrainingMenu = document.getElementById('createTrainingMenu');
    const startTrainingScreen = document.getElementById('startTrainingScreen');
    const waitingScreen = document.getElementById('waitingScreen');
    const trainingScreen = document.getElementById('trainingScreen');
    const myFTPMenu = document.getElementById('myFTPMenu');
    const myDeviceMenu = document.getElementById('myDeviceMenu');
    const myTrainingsMenu = document.getElementById('myTrainingsMenu');

    // Buttons
    const createTrainingButton = document.getElementById('createTraining');
    const startTrainingMenuButton = document.getElementById('startTrainingMenu');
    const myTrainingsButton = document.getElementById('myTrainings');
    const myFTPButton = document.getElementById('myFTP');
    const myDeviceButton = document.getElementById('myDevice');
    const backToMenuButtons = document.querySelectorAll('[id^=backToMenu]');
    const addIntervalButton = document.getElementById('addInterval');
    const saveTrainingButton = document.getElementById('saveTraining');
    const selectTrainingButton = document.getElementById('selectTraining');
    const startTrainingButton = document.getElementById('startTraining');
    const endTrainingButton = document.getElementById('endTraining');
    const saveFTPButton = document.getElementById('saveFTP');
    const connectDeviceButton = document.getElementById('connectDevice');
    const backToMenuFromTrainingsButton = document.getElementById('backToMenuFromTrainings');

    // Inputs
    const trainingNameInput = document.getElementById('trainingName');
    const ftpInput = document.getElementById('ftpInput');
    const trainingSelect = document.getElementById('trainingSelect');
    const deviceStatus = document.getElementById('deviceStatus');
    const trainingList = document.getElementById('trainingList');

    let ftp = localStorage.getItem('ftp') || 0;
    let trainings = JSON.parse(localStorage.getItem('trainings')) || [];
    let connectedDevice = null;
    let intervals = [];

    // Show the start menu
    function showStartMenu() {
        console.log('Showing Start Menu');
        startMenu.style.display = 'block';
        createTrainingMenu.style.display = 'none';
        startTrainingScreen.style.display = 'none';
        waitingScreen.style.display = 'none';
        trainingScreen.style.display = 'none';
        myFTPMenu.style.display = 'none';
        myDeviceMenu.style.display = 'none';
        myTrainingsMenu.style.display = 'none';
    }

    // Show create training menu
    function showCreateTrainingMenu() {
        console.log('Showing Create Training Menu');
        startMenu.style.display = 'none';
        createTrainingMenu.style.display = 'block';
        intervals = [];
        updateIntervals();
    }

    // Show start training menu
    function showStartTrainingMenu() {
        console.log('Showing Start Training Menu');
        startMenu.style.display = 'none';
        startTrainingScreen.style.display = 'block';
        populateTrainingSelect();
    }

    // Show waiting screen
    function showWaitingScreen() {
        console.log('Showing Waiting Screen');
        startMenu.style.display = 'none';
        waitingScreen.style.display = 'block';
    }

    // Show training screen
    function showTrainingScreen() {
        console.log('Showing Training Screen');
        waitingScreen.style.display = 'none';
        trainingScreen.style.display = 'block';
        runNextInterval();
    }

    // Show my FTP menu
    function showMyFTPMenu() {
        console.log('Showing My FTP Menu');
        startMenu.style.display = 'none';
        myFTPMenu.style.display = 'block';
        ftpInput.value = ftp;
    }

    // Show my device menu
    function showMyDeviceMenu() {
        console.log('Showing My Device Menu');
        startMenu.style.display = 'none';
        myDeviceMenu.style.display = 'block';
    }

    // Show my trainings menu
    function showMyTrainingsMenu() {
        console.log('Showing My Trainings Menu');
        startMenu.style.display = 'none';
        myTrainingsMenu.style.display = 'block';
        populateTrainingList();
    }

    // Update intervals UI
    function updateIntervals() {
        const intervalsDiv = document.getElementById('intervals');
        intervalsDiv.innerHTML = intervals.map((interval, index) => `
            <div class="interval">
                <input type="number" placeholder="FTP (%)" value="${interval.ftp || ''}" data-index="${index}" data-type="ftp">
                <input type="number" placeholder="Cadans (RPM)" value="${interval.cadence || ''}" data-index="${index}" data-type="cadence">
                <input type="number" placeholder="Duur (minuten)" value="${interval.duration || ''}" data-index="${index}" data-type="duration">
                <button type="button" class="removeInterval" data-index="${index}">Verwijder</button>
            </div>
        `).join('');
    }

    // Add new interval
    function addInterval() {
        intervals.push({});
        updateIntervals();
    }

    // Remove interval
    function removeInterval(index) {
        intervals.splice(index, 1);
        updateIntervals();
    }

    // Save training
    function saveTraining() {
        const trainingName = trainingNameInput.value;
        if (!trainingName || intervals.length === 0) {
            alert('Vul een naam in en voeg minstens één interval toe.');
            return;
        }
        trainings.push({ name: trainingName, intervals });
        localStorage.setItem('trainings', JSON.stringify(trainings));
        showStartMenu();
    }

    // Populate training select
    function populateTrainingSelect() {
        trainingSelect.innerHTML = trainings.map((training, index) => `
            <option value="${index}">${training.name}</option>
        `).join('');
    }

    // Populate training list
    function populateTrainingList() {
        trainingList.innerHTML = trainings.map((training, index) => `
            <li>${training.name}</li>
        `).join('');
    }

    // Select training
    function selectTraining() {
        const selectedIndex = trainingSelect.value;
        const selectedTraining = trainings[selectedIndex];
        document.getElementById('selectedTrainingName').innerText = selectedTraining.name;
        showWaitingScreen();
    }

    // Save FTP
    function saveFTP() {
        ftp = ftpInput.value;
        localStorage.setItem('ftp', ftp);
        showStartMenu();
    }

    // Connect device
    async function connectDevice() {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['cycling_power'] }],
                optionalServices: ['device_information']
            });
            const server = await device.gatt.connect();
            connectedDevice = server;
            deviceStatus.innerText = 'Verbonden met ' + device.name;
        } catch (error) {
            deviceStatus.innerText = 'Verbinding mislukt';
            console.error(error);
        }
    }

    // Run next interval
    function runNextInterval() {
        if (trainingScreen.style.display !== 'block') return;

        const trainingIndex = trainingSelect.value;
        const training = trainings[trainingIndex];
        const interval = training.intervals.shift();
        if (!interval) {
            alert('Training voltooid!');
            showStartMenu();
            return;
        }

        const ftpPercentage = parseInt(interval.ftp);
        const wattage = (ftp * ftpPercentage) / 100;
        const cadenceValue = parseInt(interval.cadence);
        const durationValue = parseInt(interval.duration) * 60 * 1000;

        document.getElementById('currentWattage').innerText = wattage;
        document.getElementById('currentCadence').innerText = cadenceValue;
        document.getElementById('currentIntervalTime').innerText = interval.duration + ' min';
        document.getElementById('totalTimeRemaining').innerText = training.intervals.length * interval.duration + ' min';

        start_erg_mode(wattage); // Start de ERG-modus met het berekende wattage

        let elapsed = 0;
        const intervalId = setInterval(() => {
            elapsed += 1000;
            const timeRemaining = Math.round((durationValue - elapsed) / 1000);
            document.getElementById('currentIntervalTime').innerText = timeRemaining + ' sec';
            if (elapsed >= durationValue) {
                clearInterval(intervalId);
                runNextInterval();
            }
        }, 1000);
    }

    // Event listeners with debugging
    createTrainingButton.addEventListener('click', () => {
        console.log('Create Training Button Clicked');
        showCreateTrainingMenu();
    });
    startTrainingMenuButton.addEventListener('click', () => {
        console.log('Start Training Menu Button Clicked');
        showStartTrainingMenu();
    });
    myTrainingsButton.addEventListener('click', () => {
        console.log('My Trainings Button Clicked');
        showMyTrainingsMenu();
    });
    myFTPButton.addEventListener('click', () => {
        console.log('My FTP Button Clicked');
        showMyFTPMenu();
    });
    myDeviceButton.addEventListener('click', () => {
        console.log('My Device Button Clicked');
        showMyDeviceMenu();
    });
    addIntervalButton.addEventListener('click', () => {
        console.log('Add Interval Button Clicked');
        addInterval();
    });
    saveTrainingButton.addEventListener('click', () => {
        console.log('Save Training Button Clicked');
        saveTraining();
    });
    selectTrainingButton.addEventListener('click', () => {
        console.log('Select Training Button Clicked');
        selectTraining();
    });
    startTrainingButton.addEventListener('click', () => {
        console.log('Start Training Button Clicked');
        showTrainingScreen();
    });
    saveFTPButton.addEventListener('click', () => {
        console.log('Save FTP Button Clicked');
        saveFTP();
    });
    connectDeviceButton.addEventListener('click', () => {
        console.log('Connect Device Button Clicked');
        connectDevice();
    });
    endTrainingButton.addEventListener('click', () => {
        console.log('End Training Button Clicked');
        showStartMenu();
    });
    backToMenuFromTrainingsButton.addEventListener('click', () => {
        console.log('Back to Menu from Trainings Button Clicked');
        showStartMenu();
    });

    backToMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Back to Menu Button Clicked');
            showStartMenu();
        });
    });

    document.getElementById('intervals').addEventListener('input', (e) => {
        const index = e.target.dataset.index;
        const type = e.target.dataset.type;
        intervals[index][type] = e.target.value;
        console.log(`Interval ${index} updated: ${type} = ${e.target.value}`);
    });

    document.getElementById('intervals').addEventListener('click', (e) => {
        if (e.target.classList.contains('removeInterval')) {
            const index = e.target.dataset.index;
            removeInterval(index);
            console.log(`Interval ${index} removed`);
        }
    });

    // Load initial data
    if (ftp) {
        ftpInput.value = ftp;
    }
    if (trainings.length > 0) {
        populateTrainingSelect();
    }
});

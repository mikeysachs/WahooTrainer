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

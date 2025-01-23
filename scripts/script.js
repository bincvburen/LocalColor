// Elementen selecteren
const steps = document.querySelectorAll('.form-step');
const progress = document.querySelectorAll('.progress div');
const plantOptions = document.getElementById('plantOptions');
const colorOptions = document.getElementById('colorOptions');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const submitButton = document.getElementById('submit');
const chosenPlantElement = document.getElementById('chosen-plant');
const chosenColorElement = document.getElementById('chosen-color');
const selectedPlantElement = document.getElementById('selected-plant');

let currentStep = 0;
let selectedPlant = '';
let selectedColor = '';
let data = null; // Data uit JSON

// Event Listeners voor knoppen
nextButton.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        moveToStep(currentStep + 1);
    }
});

prevButton.addEventListener('click', () => {
    if (currentStep > 0) {
        moveToStep(currentStep - 1);
    }
});

// Achtergrond aanpassen op basis van selectie
function setBackgroundImage(imageUrl) {
    document.body.style.backgroundImage = `url("${imageUrl}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
}

// Verplaatsen tussen stappen
function moveToStep(step) {
    steps[currentStep].classList.remove('active');
    progress[currentStep].classList.remove('active');

    currentStep = step;

    steps[currentStep].classList.add('active');
    progress[currentStep].classList.add('active');

    updateButtons();
    updateSummary();
}

// Knoppen tonen/verbergen
function updateButtons() {
    nextButton.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-block';
    submitButton.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';

    // Verberg "Prev" knop op stap 1
    prevButton.style.display = currentStep === 0 ? 'none' : 'inline-block';
}

// Data laden vanuit JSON
fetch('plants.json')
    .then(response => response.json())
    .then(loadedData => {
        data = loadedData;
        initializeForm(data);
    });

// Formulier initialiseren
function initializeForm(data) {
    populatePlantOptions(data.plants, data.colors);
    handlePlantSelection(data);
}

// Planten dynamisch laden
function populatePlantOptions(plants, colors) {
    plantOptions.innerHTML = ''; // Leegmaken voor dynamische vulling

    plants.forEach(plant => {
        const option = document.createElement('label');
        option.className = 'radio-item';
        option.style.borderColor = plant.name === 'Stokroos' ? '#800080' : plant.name === 'Klimop' ? '#0000FF' : '#FFA500'; // Borderkleur per plant
        option.style.backgroundColor = '#FFFFFF'; // Witte achtergrond standaard

        const plantColors = plant.colors
            .map(colorName => {
                const color = colors.find(c => c.name === colorName);
                return `<span class="color-indicator" style="background-color: ${color.saturated};"></span>`;
            })
            .join('');

        option.innerHTML = `
            <input type="radio" name="plant" value="${plant.name}" required>
            <div class="plant">
                <div class="plant-info">
                    <h3>${plant.name}</h3>
                    <div class="kleuren">${plantColors}</div>
                </div>
                <div class="plant-feitjes">
                    <ul>
                        <li><i class="fa-solid fa-seedling oogsten"></i> ${plant.harvest}</li>
                        <li><i class="fa-solid fa-heart verzorging"></i> ${plant.about}</li>
                        <li><i class="fa-solid fa-sun zon"></i> ${plant.location}</li>
                    </ul>
                </div>
            </div>`;
        plantOptions.appendChild(option);
    });
}

// Planten selectie verwerken
function handlePlantSelection(data) {
    plantOptions.addEventListener('change', (e) => {
        selectedPlant = e.target.value;
        const plant = data.plants.find(p => p.name === selectedPlant);

        // Achtergrondafbeelding van de plant instellen
        setBackgroundImage(plant.image);

        // Kleuropties genereren
        populateColorOptions(plant, data.colors);

        // Highlight geselecteerde plant
        document.querySelectorAll('.radio-item').forEach(item => {
            item.style.backgroundColor = '#FFFFFF'; // Reset achtergrondkleur
        });
        e.target.parentElement.style.backgroundColor = `rgba(${hexToRgb(plant.name === 'Stokroos' ? '#E6E6FA' : plant.name === 'Klimop' ? '#ADD8E6' : '#FFCC99')}, 0.3)`; // 20% doorzichtige achtergrond

        // Update gekozen plant in de samenvatting
        selectedPlantElement.textContent = selectedPlant;
    });
}

// Kleuren dynamisch laden
function populateColorOptions(plant, colors) {
    colorOptions.innerHTML = ''; // Leegmaken voor dynamische vulling

    plant.colors.forEach(colorName => {
        const color = colors.find(c => c.name === colorName);
        const option = document.createElement('label');
        option.className = 'radio-item';
        option.style.borderColor = color.saturated; // Borderkleur per kleur
        option.style.backgroundColor = '#FFFFFF'; // Witte achtergrond standaard

        option.innerHTML = `
            <input type="radio" name="color" value="${color.name}" required>
            <div class="plant">
                <div class="plant-info">
                    <h3>${color.name}</h3>
                    <div class="kleuren">
                        <span class="color-indicator" style="background-color: ${color.saturated};"></span>
                    </div>
                </div>
                <div class="plant-feitjes">
                    <ul>
                        <li><i class="fa-solid fa-leaf oogsten"></i> ${color.amount}</li>
                        <li><i class="fa-solid fa-hourglass verzorging"></i> Het kleuren duurt ${color.time} uur</li>
                    </ul>
                </div>
            </div>`;
        colorOptions.appendChild(option);
    });

    colorOptions.addEventListener('change', (e) => {
        selectedColor = e.target.value;
        const chosenColor = colors.find(c => c.name === selectedColor);
    
        if (chosenColor && chosenColor.image) {
            setBackgroundImage(chosenColor.image); // Verander naar de achtergrondafbeelding
        }
    
        document.querySelectorAll('#colorOptions .radio-item').forEach(item => {
            item.style.backgroundColor = '#FFFFFF'; // Reset achtergrondkleur
        });
        e.target.parentElement.style.backgroundColor = `rgba(${hexToRgb(chosenColor.saturated)}, 0.3)`; // Zachte highlight
    
        // Update gekozen kleur als bolletje in de samenvatting
        if (chosenColor) {
            const chosenColorElement = document.getElementById('chosen-color');
            chosenColorElement.style.backgroundColor = chosenColor.saturated; // Zet de bol kleur
            chosenColorElement.style.display = 'inline-block'; // Zorg dat het zichtbaar is
    
            // Verander de tekstkleur naar de gekozen kleur
            chosenColorElement.style.color = chosenColor.saturated; // Verandert de tekstkleur naar de gekozen kleur
            chosenColorElement.textContent = chosenColor.name; // Zet de naam van de kleur als tekst
        }
    
        // Update gekozen plant
        const chosenPlantElement = document.getElementById('chosen-plant');
        chosenPlantElement.textContent = selectedPlant;
    });
    
}

document.getElementById('name').addEventListener('input', (e) => {
    const name = e.target.value;
    // Update de user-name spans met de ingevulde naam
    document.querySelectorAll('#user-name').forEach(span => {
        span.textContent = name;
    });
});




// Samenvatting bijwerken
function updateSummary() {
    if (currentStep === steps.length - 1) {
        chosenPlantElement.textContent = selectedPlant;
        chosenColorElement.textContent = selectedColor;
    }
}

// Helper functie om hex naar RGB te converteren
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}


// Highlight geselecteerde opties
plantOptions.addEventListener('change', (e) => {
    document.querySelectorAll('.radio-item').forEach(item => item.classList.remove('selected'));
    e.target.parentElement.classList.add('selected');
});

colorOptions.addEventListener('change', (e) => {
    document.querySelectorAll('.radio-item').forEach(item => item.classList.remove('selected'));
    e.target.parentElement.classList.add('selected');
});

// Initialisatie
updateButtons();




submitButton.addEventListener('click', () => {
    // Haal de gegevens van het formulier op
    const name = document.getElementById('name').value;
    const selectedPlant = document.querySelector('input[name="plant"]:checked')?.value;
    const selectedColor = document.querySelector('input[name="color"]:checked')?.value;

    // Controleer of alle velden zijn ingevuld
    if (!name || !selectedPlant || !selectedColor) {
        console.error("Vul alle velden in!");
        return;
    }

    // Log de gegevens
    console.log("Gegevens opgeslagen in localStorage:", { name, selectedPlant, selectedColor });

    // Sla de gegevens op in localStorage
    localStorage.setItem('name', name);
    localStorage.setItem('selectedPlant', selectedPlant);
    localStorage.setItem('selectedColor', selectedColor);

    // Log om te controleren of het is opgeslagen
    console.log("localStorage na opslaan:", localStorage);

    // Redirect naar de tijdlijnpagina
    window.location.href = 'tijdlijn.html';
});


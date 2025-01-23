window.addEventListener('load', async () => {
    // Log de volledige inhoud van localStorage
    console.log("localStorage bij het laden van tijdlijnpagina:", localStorage);

    // Haal de gegevens op uit localStorage
    const name = localStorage.getItem('name');
    const selectedPlant = localStorage.getItem('selectedPlant');
    const selectedColor = localStorage.getItem('selectedColor');

    // Log de opgehaalde gegevens
    console.log("Opgehaalde gegevens uit localStorage:", { name, selectedPlant, selectedColor });

    // Controleer of gegevens bestaan
    if (name && selectedPlant && selectedColor) {
        // Vul de elementen met de gegevens
        document.getElementById('nameDisplay').innerText = `${name}`;
        document.getElementById('plantDisplay').innerText = `${selectedPlant}`;
        console.log("Gegevens succesvol weergegeven op tijdlijnpagina.");
    } else {
        console.error("Gegevens ontbreken in localStorage. Controleer het formulier en de opslaan-actie.");
        return; // Stop als er geen gegevens zijn
    }

    try {
        // JSON-data laden met fetch
        const response = await fetch('../plants.json');
        if (!response.ok) {
            throw new Error(`Fout bij het laden van plants.json: ${response.status}`);
        }
        const plantsData = await response.json();

        // Zoek de geselecteerde plant in de JSON
        const chosenPlant = plantsData.plants.find(plant => plant.name === selectedPlant);

        if (chosenPlant) {
            // Dynamisch afbeeldingen toevoegen
            await loadDynamicImages(chosenPlant);

            console.log("Afbeeldingen succesvol geladen uit de JSON.");
        } else {
            console.error("De geselecteerde plant komt niet overeen met de JSON-data.");
        }

        // Zoek de geselecteerde kleur in de JSON
        const chosenColor = plantsData.colors.find(color => color.name === selectedColor);

        if (chosenColor) {
            // Haal zowel de saturated als de unsaturated kleur op
            const saturatedColor = chosenColor.saturated;   // Voor --accent
            const unsaturatedColor = chosenColor.unsaturated; // Voor --accent2
            const colorImage = chosenColor.image;
            const secondaryName = chosenColor.secondaryName; // Haal de secondary name op

            // CSS :root aanpassen met beide kleuren
            document.documentElement.style.setProperty('--accent', saturatedColor);
            document.documentElement.style.setProperty('--accent2', unsaturatedColor);

            // Background image aanpassen met de gekozen kleur
            document.body.style.backgroundImage = `url(${colorImage})`;

            // Weergave van de secondary name op de plaats van colorDisplay
            document.getElementById('colorDisplay').innerText = `${secondaryName}`;

            console.log("Stijl dynamisch aangepast met de geselecteerde saturated en unsaturated kleuren.");
        } else {
            console.error("De geselecteerde kleur komt niet overeen met de JSON-data.");
        }

    } catch (error) {
        console.error("Fout bij het ophalen of verwerken van plants.json:", error);
    }
});

// Globale variabele voor de IntersectionObserver
let observer;

// Functie voor het dynamisch laden van afbeeldingen
async function loadDynamicImages(chosenPlant) {
    const stadiumImagesContainer = document.getElementById('stadiumImages');
    stadiumImagesContainer.innerHTML = ''; // Verwijder oude inhoud

    // Loop door de afbeeldingen en voeg ze toe
    chosenPlant.stages.forEach((imagePath, index) => {
        const img = document.createElement('img');
        img.src = imagePath; // Pad van de afbeelding uit de JSON
        img.alt = `Plant stadium ${index + 1}`;
        img.classList.add('carousel-item');
        stadiumImagesContainer.appendChild(img);
    });

    // Herinitialiseer de observer voor de nieuwe afbeeldingen
    reinitializeObserver();
}

// Functie voor het herinitialiseren van de IntersectionObserver
function reinitializeObserver() {
    // Selecteer de nieuwe afbeeldingen
    const images = document.querySelectorAll('.circle img');

    if (observer) {
        // Stop met observeren van oude afbeeldingen
        images.forEach(img => observer.unobserve(img));
    }

    // Configuratie voor de IntersectionObserver
    const observerOptions = {
        root: document.querySelector('.circle'),
        rootMargin: '0px', // Kan worden aangepast om de 'trigger' te veranderen
        threshold: 0.5, // Dit betekent dat 50% van de afbeelding in het zicht moet zijn
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Voeg de active class toe aan de afbeelding die zichtbaar is
                entry.target.classList.add('active');
            } else {
                // Verwijder de active class als de afbeelding niet zichtbaar is
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    // Begin met het observeren van elke afbeelding
    images.forEach(img => {
        observer.observe(img);
    });
}

// Event listener voor de slider
const slider = document.getElementById('slider');
const valueLabel = document.querySelector('#lengte-label .value');

// Update de waarde van het label wanneer de slider beweegt
slider.addEventListener('input', () => {
    valueLabel.textContent = slider.value; // Alleen de waarde wordt aangepast
});

// Zorg dat de initiële waarde correct is
valueLabel.textContent = slider.value;

// Functie om de achtergrond te updaten
function updateBackground() {
    // Haal de geselecteerde waarde op
    const selectedWeather = document.querySelector('input[name="weer"]:checked').value;
    const weekElement = document.querySelector('.week');

    // Pas de achtergrondafbeelding aan op basis van de selectie
    let backgroundUrl = '';
    switch (selectedWeather) {
        case 'zon':
            backgroundUrl = '/img/Weer/Zon.png';
            break;
        case 'halfbewolkt':
            backgroundUrl = '/img/Weer/Halfbewolkt.png';
            break;
        case 'bewolkt':
            backgroundUrl = '/img/Weer/Bewolkt.png';
            break;
    }
    weekElement.style.backgroundImage = `url(${backgroundUrl})`;
}

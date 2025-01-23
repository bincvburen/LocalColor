document.addEventListener("DOMContentLoaded", () => {
    fetch('plants.json')
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".bubbels");
            const safeZoneRadius = 400; // De straal van de veilige zone in het midden
            const placedBubbles = []; // Hier slaan we de reeds geplaatste bubbels op
            const extraPadding = 100; // Extra padding aan de rechter- en onderkant

            let selectedPlant = ""; // Huidige geselecteerde plant

            // Functie om te controleren of twee bubbels elkaar overlappen
            function isOverlapping(newBubble, existingBubble) {
                const dx = newBubble.x - existingBubble.x;
                const dy = newBubble.y - existingBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < newBubble.size + existingBubble.size;
            }

            // Functie om te controleren of de nieuwe bubbel binnen de veilige zone valt
            function isInSafeZone(x, y) {
                return (
                    x > container.offsetWidth / 2 - safeZoneRadius &&
                    x < container.offsetWidth / 2 + safeZoneRadius &&
                    y > container.offsetHeight / 2 - safeZoneRadius &&
                    y < container.offsetHeight / 2 + safeZoneRadius
                );
            }

            // Dynamisch de bubbels aanmaken op basis van de 'facts' in de JSON
            function createBubblesForPlant(plant) {
                // Container leegmaken en geplaatste bubbels resetten
                container.innerHTML = "";
                placedBubbles.length = 0;

                plant.facts.forEach((fact) => {
                    const bubble = document.createElement("div");
                    bubble.classList.add("bubbel");

                    bubble.innerHTML = `
                        <div class="bubbel-header">
                            <i class="${fact.icon}" style="color: ${fact.color};"></i>
                            <span class="bubbel-titel">${fact.title}</span>
                            <button class="bubbel-toggle">+</button>
                        </div>
                        <div class="bubbel-content">
                            <p>${fact.text}</p>
                        </div>
                    `;

                    const size = 100; // Stel vaste grootte in voor consistentie
                    let randomX, randomY;
                    let isValidPosition = false;

                    // Zoek naar een geldige positie die niet overlapt en niet in de veilige zone valt
                    while (!isValidPosition) {
                        randomX = Math.random() * (container.offsetWidth - size - extraPadding);
                        randomY = Math.random() * (container.offsetHeight - size - 20);

                        if (isInSafeZone(randomX, randomY)) {
                            continue;
                        }

                        isValidPosition = placedBubbles.every((existingBubble) => {
                            return !isOverlapping({ x: randomX, y: randomY, size }, existingBubble);
                        });

                        if (
                            randomX < 0 ||
                            randomY < 0 ||
                            randomX + size > container.offsetWidth - extraPadding ||
                            randomY + size > container.offsetHeight - extraPadding
                        ) {
                            isValidPosition = false;
                        }
                    }

                    bubble.style.left = `${randomX}px`;
                    bubble.style.top = `${randomY}px`;

                    placedBubbles.push({ x: randomX, y: randomY, size });

                    container.appendChild(bubble);

                    bubble.addEventListener("click", () => {
                        const content = bubble.querySelector(".bubbel-content");
                        const isVisible = content.classList.contains("open");
                        
                        if (isVisible) {
                            content.classList.remove("open"); // Sluit de content
                            bubble.querySelector(".bubbel-toggle").textContent = "+";
                        } else {
                            content.classList.add("open"); // Open de content
                            bubble.querySelector(".bubbel-toggle").textContent = "-";
                        }
                    });
                    
                    
                });
            }

            const plantSelector = document.querySelector("#plantOptions");
            plantSelector.addEventListener("change", (event) => {
                selectedPlant = event.target.value;
                const plantData = data.plants.find(plant => plant.name === selectedPlant);

                if (plantData) {
                    createBubblesForPlant(plantData);
                }
            });

            data.plants.forEach((plant) => {
                const option = document.createElement("option");
                option.value = plant.name;
                option.textContent = plant.name;
                plantSelector.appendChild(option);
            });

            container.innerHTML = "";
        })
        .catch(error => {
            console.error("Fout bij het laden van de JSON:", error);
        });
});

// Fetches 10 random dog images and populates the carousel
async function loadRandomDogs() {
  const response = await fetch('https://dog.ceo/api/breeds/image/random/10');
  const data = await response.json();
  const carousel = document.getElementById('dog-carousel');
  carousel.innerHTML = ''; // Clears existing images

  data.message.forEach((imageUrl) => {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Random Dog';
    img.className = 'carousel-image';
    carousel.appendChild(img);
  });


  if (typeof simpleSlider !== 'undefined') {
    simpleSlider.initialize(carousel, { interval: 3000 });
  } else {
    console.error("Simple Slider is not defined.");
  }
}

// Fetches dog breeds and dynamically create buttons
async function loadDogBreeds() {
  try {
    const response = await fetch('https://dogapi.dog/api/v2/breeds');
    const data = await response.json();
    const breeds = data.data; // Breed information is in the `data` array
    const buttonContainer = document.getElementById('breed-buttons');

    buttonContainer.innerHTML = ''; // Clears existing buttons

    breeds.forEach((breed) => {
      const button = document.createElement('button');
      button.textContent = breed.attributes.name; // Uses the breed name
      button.className = 'breed-button';
      button.setAttribute('data-breed-id', breed.id); // Stores breed ID as a data attribute
      button.addEventListener('click', () => fetchBreedInfo(breed.id)); // Fetches detailed info on click
      buttonContainer.appendChild(button);
    });
  } catch (error) {
    console.error("Error fetching dog breeds:", error);
  }
}

// Fetches and display detailed breed information
async function fetchBreedInfo(breedId) {
  try {
    const response = await fetch(`https://dogapi.dog/api/v2/breeds/${breedId}`);
    const data = await response.json();

    // Extracts breed attributes
    const breed = data.data.attributes;

    // Displays breed information
    displayBreedInfo(breed);
  } catch (error) {
    console.error("Error fetching breed info:", error);
    alert("Failed to fetch breed information.");
  }
}

// Displays breed information in the container
function displayBreedInfo(breed) {
  const breedInfo = document.getElementById('breed-info');
  document.getElementById('breed-name').textContent = breed.name;
  document.getElementById('breed-description').textContent =
    breed.description || 'No description available.';
  
  // Access life expectancy details
  const minLife = breed.life?.min || 'Unknown';
  const maxLife = breed.life?.max || 'Unknown';
  document.getElementById('breed-lifespan').textContent = `${minLife} - ${maxLife} years`;

  breedInfo.classList.remove('hidden'); // Make the breed info container visible
}

// Voice Commands with Annyang
if (annyang) {
  const commands = {
     // Required commands
     'hello': () => alert('Hello World!'),
     'change the color to *color': (color) => {
       document.body.style.backgroundColor = color;
     },
     'navigate to *page': (page) => {
       const target = page.toLowerCase();
       if (['home', 'stocks', 'dogs'].includes(target)) {
         window.location.href = `${target}.html`;
       } else {
         alert('Page not found!');
       }
     },
     // Command to load a specific dog breed
    'load dog breed *breed': async (breedName) => {
      const buttons = document.querySelectorAll('.breed-button');
      const button = Array.from(buttons).find(
        (btn) => btn.textContent.toLowerCase() === breedName.toLowerCase()
      );

      if (button) {
        const breedId = button.getAttribute('data-breed-id');
        fetchBreedInfo(breedId);
      } else {
        alert(`Breed "${breedName}" not found! Please check the spelling.`);
      }
    },
  };

  // Add commands and start listening
  annyang.addCommands(commands);
  annyang.start();

  // Buttons to control Annyang
  document.getElementById('audio-off').addEventListener('click', () => annyang.abort());
  document.getElementById('audio-on').addEventListener('click', () => annyang.start());
}

// Add the new voice command to the instructions
function addVoiceCommandToInstructions() {
  const instructions = document.getElementById('audio-instructions');
  const commandList = document.createElement('ul');
  commandList.innerHTML = `
    <li>
      <strong>Load Dog Breed</strong>
      <ul>
        <li>Say: "Load dog breed [breed name]"</li>
      </ul>
    </li>
  `;
  instructions.appendChild(commandList);
}

// Load data and add instructions on page load
loadRandomDogs();
loadDogBreeds();
addVoiceCommandToInstructions();

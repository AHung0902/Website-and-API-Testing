// Fetches a random quote from Zenquotes API when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://zenquotes.io/api/random/YOUR_API_KEY') // Replace with your actual API key
    .then(response => response.json())
    .then(data => {
      const quoteContainer = document.getElementById('quote-container');
      const quote = data[0].q; // Zenquotes returns an array of quotes
      const author = data[0].a;
      quoteContainer.innerHTML = `<p>"${quote}" - <strong>${author}</strong></p>`;
    })
    .catch(error => {
      console.error('Error fetching quote:', error);
    });

  // Audio command setup with Annyang 
  if (annyang) {
    // Define commands
    const commands = {
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
      }
    };

    // Add commands to Annyang
    annyang.addCommands(commands);

    // Starts Annyang
    annyang.start({ autoRestart: true, continuous: false });

    // Handles microphone errors
    annyang.addCallback('error', (error) => {
      console.error('Annyang error:', error);
    });

    annyang.addCallback('errorPermissionBlocked', () => {
      alert('Microphone permissions are blocked. Please enable them in your browser settings.');
    });

    annyang.addCallback('errorPermissionDenied', () => {
      alert('Microphone permissions denied. Please allow access to use voice commands.');
    });

    // Buttons to control Annyang
    document.getElementById('audio-off').addEventListener('click', () => {
      annyang.abort();
      console.log('Annyang stopped');
    });
    document.getElementById('audio-on').addEventListener('click', () => {
      annyang.start();
      console.log('Annyang started');
    });
  } else {
    console.warn('Annyang is not available in your browser.');
  }
});
 
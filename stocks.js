let stockChart;

function createChart(labels, data) {
  const ctx = document.getElementById('stock-chart').getContext('2d');
  if (stockChart) stockChart.destroy(); // Destroys existing chart to avoid overlap
  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Closing Price',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          }
        },
        y: {
          title: {
            display: true,
            text: 'Closing Price (USD)',
          }
        }
      }
    }
  });
}

// Fetches stock data from Polygon.io API
async function fetchStockData(ticker, range) {
  const apiKey = 'rfP9tXcnGBtdxt_MxTam6aH67enbVlnm';
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - range);
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formattedStartDate}/${today.toISOString().split('T')[0]}?apiKey=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.results) {
    const labels = data.results.map(item => new Date(item.t).toLocaleDateString());
    const prices = data.results.map(item => item.c);
    createChart(labels, prices);
  } else {
    alert('No data found for the specified ticker!');
  }
}

// Populates top 5 Reddit stocks
async function fetchRedditStocks() {
  const response = await fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03');
  const data = await response.json();
  const top5 = data.slice(0, 5);
  
  const tableBody = document.getElementById('reddit-stocks');
  tableBody.innerHTML = ''; // Clears previous data
  
  top5.forEach(stock => {
    const row = document.createElement('tr');
    const sentimentIcon = stock.sentiment === 'Bullish' 
      ? '<span class="sentiment-icon bullish">🐂</span>' 
      : '<span class="sentiment-icon bearish">🐻</span>';
  
    row.innerHTML = `
      <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
      <td>${stock.no_of_comments}</td>
      <td>${sentimentIcon}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Event listeners
document.getElementById('lookup-stock').addEventListener('click', () => {
  const ticker = document.getElementById('stock-ticker').value.toUpperCase();
  const range = parseInt(document.getElementById('date-range').value, 10);
  if (ticker) fetchStockData(ticker, range);
});

fetchRedditStocks();

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

    // Stock lookup command
    'lookup *stock': (stock) => {
      const ticker = stock.toUpperCase();
      document.getElementById('stock-ticker').value = ticker;
      fetchStockData(ticker, 30); // Fetch stock data for 30 days
    }
  };

  // Add commands to Annyang
  annyang.addCommands(commands);

  // Starts Annyang
  annyang.start();

  // Handle microphone controls
  document.getElementById('audio-off').addEventListener('click', () => annyang.abort());
  document.getElementById('audio-on').addEventListener('click', () => annyang.start());
} else {
  console.warn('Annyang is not available in your browser.');
}

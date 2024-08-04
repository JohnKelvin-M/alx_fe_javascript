// script.js

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock server URL

// Load quotes from local storage or use default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    category: "Motivation",
  },
  {
    text: "Don't let yesterday take up too much of today.",
    category: "Inspirational",
  },
];

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  populateCategorySelect();
  document
    .getElementById("newQuote")
    .addEventListener("click", showRandomQuote);
  document
    .getElementById("exportJson")
    .addEventListener("click", exportToJsonFile);
  loadLastSelectedCategory();
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 60000); // Fetch from server every 60 seconds
});

// Populate the category select dropdown
function populateCategorySelect() {
  const categorySelect = document.getElementById("categoryFilter");
  categorySelect.innerHTML = '<option value="all">All Categories</option>'; // Clear existing options
  const categories = [...new Set(quotes.map((quote) => quote.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Display a random quote from the selected category
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((quote) => quote.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex].text;
    document.getElementById("quoteDisplay").textContent = randomQuote;
    sessionStorage.setItem("lastViewedQuote", randomQuote); // Save last viewed quote to session storage
  } else {
    document.getElementById("quoteDisplay").textContent =
      "No quotes available in this category.";
  }
}

// Add a new quote to the list
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    updateCategorySelect(newQuoteCategory);
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Update the category dropdown with a new category if it's not already present
function updateCategorySelect(newCategory) {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = [...categorySelect.options].map((option) => option.value);
  if (!categories.includes(newCategory)) {
    const option = document.createElement("option");
    option.value = newCategory;
    option.textContent = newCategory;
    categorySelect.appendChild(option);
  }
}

// Load the last selected category from local storage
function loadLastSelectedCategory() {
  const lastSelectedCategory = localStorage.getItem("lastSelectedCategory");
  if (lastSelectedCategory) {
    document.getElementById("categoryFilter").value = lastSelectedCategory;
    filterQuotes(); // Apply the filter based on the last selected category
  }
}

// Filter quotes based on the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", selectedCategory); // Save the selected category to local storage
  showRandomQuote(); // Show a random quote based on the selected category
}

// Export quotes to JSON file
function exportToJsonFile() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url); // Free up memory
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategorySelect();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert(
        "Failed to import quotes. Please ensure the file is in the correct format."
      );
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate fetching quotes from a server
function fetchQuotesFromServer() {
  fetch(SERVER_URL)
    .then((response) => response.json())
    .then((serverQuotes) => {
      serverQuotes = serverQuotes.map((q) => ({
        text: q.title,
        category: "Server",
      })); // Simulated format
      handleIncomingServerData(serverQuotes);
    })
    .catch((error) =>
      console.error("Error fetching quotes from server:", error)
    );
}

// Handle incoming server data and merge with local data
function handleIncomingServerData(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);
  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  populateCategorySelect();
  showNotification("Quotes have been updated with the latest server data.");
}

// Merge local and server quotes, resolving conflicts by preferring server data
function mergeQuotes(localQuotes, serverQuotes) {
  const localQuotesMap = new Map(
    localQuotes.map((quote) => [quote.text, quote])
  );
  serverQuotes.forEach((serverQuote) => {
    localQuotesMap.set(serverQuote.text, serverQuote); // Prefer server data
  });
  return Array.from(localQuotesMap.values());
}

// Show a notification to the user
function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.backgroundColor = "lightblue";
  notification.style.padding = "10px";
  notification.style.marginBottom = "10px";
  document.body.insertBefore(notification, document.body.firstChild);
  setTimeout(() => notification.remove(), 5000); // Remove after 5 seconds
}

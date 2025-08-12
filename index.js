// Global constants
const BUTTON_SUBMIT = document.getElementById("submit_button");
const ELEMENTS_TO_FADE_IN = [
  "organic-light",
  "recycling-light",
  "waste-light",
  "transfer-station-light",
  "specialist-recycler-light",
  "information-container",
  "reminder",
  "acknowledgement",
  "about",
];
const GUYALA = document.getElementById("guyala");
const INPUT = document.getElementById("input");
const SUGGESTIONS_LIST = document.getElementById("suggestions-list");
const LOADING_SPINNER = document.getElementById("loading-spinner");

const TRAFFIC_LIGHT_ORGANIC = document.getElementById("organic-light");
const TRAFFIC_LIGHT_RECYCLING = document.getElementById("recycling-light");
const TRAFFIC_LIGHT_SPECIALIST_RECYCLER = document.getElementById(
  "specialist-recycler-light"
);
const TRAFFIC_LIGHT_TRANSFER_STATION = document.getElementById(
  "transfer-station-light"
);
const TRAFFIC_LIGHT_WASTE = document.getElementById("waste-light");

const TRAFFIC_LIGHTS = {
  0: "organic-light",
  1: "recycling-light",
  2: "waste-light",
  3: "transfer-station-light",
  4: "specialist-recycler-light",
};

let is_first_query = true;
let wasteItemsCache = null;

// Initialization: listen for user interactions
listenForInput();

// Listen for input events
function listenForInput() {
  listenForSearch();
  listenForTrafficLightClick();
  listenForGuyalaClick();
  listenForAutocomplete();
}

// Search listeners
function listenForSearch() {
  BUTTON_SUBMIT.addEventListener("click", () =>
    respondToSearch(INPUT.value.trim())
  );
  INPUT.addEventListener("keypress", (event) => submitOnEnter(event));
}

// Enter key triggers search
function submitOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    BUTTON_SUBMIT.click();
  }
}

// Traffic light click expands then contracts if on
function listenForTrafficLightClick() {
  TRAFFIC_LIGHT_ORGANIC.addEventListener("click", () =>
    animateTrafficLight(TRAFFIC_LIGHT_ORGANIC)
  );
  TRAFFIC_LIGHT_RECYCLING.addEventListener("click", () =>
    animateTrafficLight(TRAFFIC_LIGHT_RECYCLING)
  );
  TRAFFIC_LIGHT_WASTE.addEventListener("click", () =>
    animateTrafficLight(TRAFFIC_LIGHT_WASTE)
  );
  TRAFFIC_LIGHT_TRANSFER_STATION.addEventListener("click", () =>
    animateTrafficLight(TRAFFIC_LIGHT_TRANSFER_STATION)
  );
  TRAFFIC_LIGHT_SPECIALIST_RECYCLER.addEventListener("click", () =>
    animateTrafficLight(TRAFFIC_LIGHT_SPECIALIST_RECYCLER)
  );
}

function animateTrafficLight(traffic_light) {
  if (traffic_light.classList.contains("on")) {
    traffic_light.classList.add("traffic-light-clicked");
    setTimeout(() => {
      traffic_light.classList.remove("traffic-light-clicked");
    }, 750);
  }
}

// Guyala animation
function listenForGuyalaClick() {
  GUYALA.addEventListener("click", () => animateGuyala());
}

function animateGuyala() {
  GUYALA.classList.add("guyala-clicked");
  setTimeout(() => {
    GUYALA.classList.remove("guyala-clicked");
  }, 750);
}

// Validate input length
function isValidInput(input) {
  if (input.length < 1) {
    alert("Please type in a waste item 🙃");
    document.getElementById("form").reset();
    return false;
  } else if (input.length > 50) {
    alert("Maximum search term length is 50 characters 🙃");
    document.getElementById("form").reset();
    return false;
  }
  return true;
}

// Fetch waste items JSON (cached)
async function getWasteItems() {
  if (wasteItemsCache) return wasteItemsCache;
  try {
    const response = await fetch("./waste_items.json");
    if (!response.ok) throw new Error("Network response not ok");
    wasteItemsCache = await response.json();
    return wasteItemsCache;
  } catch (error) {
    alert(
      "Sorry, there was a problem loading the waste items data. Please try again later."
    );
    throw error;
  }
}

// Get matching waste item or default if none matches
async function getWasteItemOrDefualt(input) {
  const WASTE_ITEMS = await getWasteItems();
  const PATTERN = new RegExp(`^${input.trim().toLowerCase()}s?$`);
  for (let i = 1; i < WASTE_ITEMS.length; i++) {
    for (let j = 0; j < WASTE_ITEMS[i].terms.length; j++) {
      if (PATTERN.test(WASTE_ITEMS[i].terms[j])) {
        return WASTE_ITEMS[i];
      }
    }
  }
  return WASTE_ITEMS[0];
}

// Set traffic lights on/off and aria-pressed
function setTrafficLights(waste_item) {
  for (let i = 0; i < 5; i++) {
    const traffic_light = document.getElementById(TRAFFIC_LIGHTS[i]);
    if (waste_item.disposal[i]) {
      traffic_light.classList.remove("off");
      traffic_light.classList.add("on");
      traffic_light.setAttribute("aria-pressed", "true");
    } else {
      traffic_light.classList.remove("on");
      traffic_light.classList.add("off");
      traffic_light.setAttribute("aria-pressed", "false");
    }
  }
}

// Populate info on page
function setPageBody(waste_item) {
  if (waste_item.name === "default") {
    document.getElementById("heading").innerHTML = "No Information";
    document.getElementById("disposal").innerHTML =
      "The item you have searched for doesn't exist in our database of waste items. Take the item to a council transfer station or specialist recycler, and they may be able to help you.";
    document.getElementById("information").innerHTML = "";
  } else {
    document.getElementById("heading").innerHTML = waste_item.name;
    document.getElementById("disposal").innerHTML = getDisposal(waste_item);
    document.getElementById("information").innerHTML =
      waste_item.information + (waste_item.information.length > 0 ? "<br><br>" : "");
  }
}

// Compose disposal info text from flags
function getDisposal(waste_item) {
  let disposal_string = ``;
  const DISPOSAL_TEMPLATES = {
    0: `${waste_item.name} ${waste_item.pluralisation} biodegradable, and will break down naturally over time. Dispose of ${waste_item.name} in a compost or organics bin. Explore how you can <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/which-bin-do-i-put-it-in/love-food-hate-waste/compost-your-food-waste" target="_blank" rel="noopener">compost food waste</a>. `,
    1: `${waste_item.name} ${waste_item.pluralisation} recyclable, and can be re-processed and turned into something new! Dispose of ${waste_item.name} in a recycling bin. `,
    2: `${waste_item.name} can be disposed of in a general waste bin. `,
    3: `You can take ${waste_item.name} to a council transfer station for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/facilities" target="_blank" rel="noopener">waste transfer stations</a> in Cairns. `,
    4: `Some common waste items are more difficult to recycle. You can take ${waste_item.name} to a specialist recycler for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/what-happens-to-my-waste/specialist-recycling" target="_blank" rel="noopener">specialist recycling</a> in Cairns. `,
  };
  for (let i = 0; i < 5; i++) {
    if (waste_item.disposal[i]) {
      disposal_string += DISPOSAL_TEMPLATES[i];
    }
  }
  return disposal_string;
}

// Fade in page elements on first search
function fadeInElements() {
  for (let i = 0; i < ELEMENTS_TO_FADE_IN.length; i++) {
    document.getElementById(ELEMENTS_TO_FADE_IN[i]).classList.add("fade-in");
  }
}

// Show loading spinner, perform search, then hide spinner
async function respondToSearch(input) {
  if (!isValidInput(input)) return;

  LOADING_SPINNER.style.display = "inline-block";

  try {
    const WASTE_ITEM = await getWasteItemOrDefualt(input);
    setTrafficLights(WASTE_ITEM);
    setPageBody(WASTE_ITEM);
    if (is_first_query) {
      fadeInElements();
      is_first_query = false;
    }
  } catch (err) {
    console.error(err);
    alert("Sorry, there was an error processing your request.");
  } finally {
    LOADING_SPINNER.style.display = "none";
  }
}

// Autocomplete Suggestions Feature
function listenForAutocomplete() {
  INPUT.addEventListener("input", handleAutocompleteInput);
  SUGGESTIONS_LIST.addEventListener("click", handleSuggestionClick);
  SUGGESTIONS_LIST.addEventListener("keydown", handleSuggestionKeydown);
  INPUT.addEventListener("blur", () => {
    // Hide suggestions after short delay to allow clicks
    setTimeout(() => {
      hideSuggestions();
    }, 150);
  });
}

async function handleAutocompleteInput() {
  const val = INPUT.value.trim().toLowerCase();
  if (!val) {
    hideSuggestions();
    return;
  }
  const items = await getWasteItems();
  const matches = items
    .filter((item) =>
      item.terms.some((term) => term.startsWith(val))
    )
    .slice(0, 5);

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  SUGGESTIONS_LIST.innerHTML = matches
    .map(
      (item, index) =>
        `<li role="option" tabindex="0" id="suggestion-${index}" data-name="${item.name}">${item.name}</li>`
    )
    .join("");
  SUGGESTIONS_LIST.style.display = "block";
  INPUT.setAttribute("aria-expanded", "true");
}

function handleSuggestionClick(e) {
  if (e.target.tagName === "LI") {
    selectSuggestion(e.target);
  }
}

function handleSuggestionKeydown(e) {
  if (e.target.tagName !== "LI") return;

  const key = e.key;

  if (key === "Enter" || key === " ") {
    e.preventDefault();
    selectSuggestion(e.target);
  }
  // Optionally, add arrow key navigation between suggestions here
}

function selectSuggestion(element) {
  const selectedName = element.dataset.name;
  INPUT.value = selectedName;
  hideSuggestions();
  BUTTON_SUBMIT.click();
}

function hideSuggestions() {
  SUGGESTIONS_LIST.style.display = "none";
  INPUT.setAttribute("aria-expanded", "false");
}

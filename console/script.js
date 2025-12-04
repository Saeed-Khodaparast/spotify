const searchInput = document.getElementById("searchInput");
const radioBtns = document.querySelectorAll('input[name="searchType"]');
// const datalist = document.createElement("datalist");
// datalist.id = "metalBands";

// metalBands.forEach((band) => {
//   const option = document.createElement("option");
//   option.value = band;
//   datalist.appendChild(option);
// });

//document.body.appendChild(datalist);
//searchInput.setAttribute("list", "metalBands");

// #region Listeners
searchInput.addEventListener("change", (event) => {
  const selectedType = document.querySelector(
    'input[name="searchType"]:checked'
  );
  const query = event.target.value;
  const type = selectedType?.value;
  searchArtists(token, query, type);
});

document.querySelectorAll('input[name="searchType"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    searchInput.setAttribute("placeholder", `Search ${event.target.value}s`);
    const query = searchInput.value;
    if (query) {
      searchArtists(token, query, event.target.value);
    }
  });
});

// #endregion Listeners

// Tab functionality
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    const tabId = button.dataset.tab;

    // Remove active class from all tabs and content
    document
      .querySelectorAll(".tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    // Add active class to clicked tab and corresponding content
    button.classList.add("active");
    document.getElementById(tabId).classList.add("active");
  });
});

// Artist albums functionality
document.getElementById("getAlbumsBtn").addEventListener("click", () => {
  const artistId = document.getElementById("artistIdInput").value;
  if (artistId && token) {
    getArtistAlbums(token, artistId);
  }
});

document.getElementById("getSinglesBtn").addEventListener("click", () => {
  const artistId = document.getElementById("artistIdInput").value;
  if (artistId && token) {
    getArtistSingles(token, artistId);
  }
});

document.getElementById("getCompilationsBtn").addEventListener("click", () => {
  const artistId = document.getElementById("artistIdInput").value;
  if (artistId && token) {
    getArtistCompilations(token, artistId);
  }
});

document.getElementById("getAppearsBtn").addEventListener("click", () => {
  const artistId = document.getElementById("artistIdInput").value;
  if (artistId && token) {
    getArtistAppears(token, artistId);
  }
});

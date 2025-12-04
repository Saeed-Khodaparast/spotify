let token;
let currentArtistId;
let data = [];

document.addEventListener("DOMContentLoaded", async () => {
  token = localStorage.getItem("spotifyAccessToken");
  if (!token) {
    // Start authorization flow
    authorizeUser();

    // Listen for authorization response
    window.addEventListener("message", async (event) => {
      if (event.data.code) {
        token = await exchangeCodeForToken(event.data.code);
      }
    });
    return;
  }

  const artistData = JSON.parse(localStorage.getItem("currentArtist"));

  if (artistData) {
    currentArtistId = artistData.id;

    // Update the artist page with the data
    document.querySelector(".artist-image").src = artistData.images[0].url;
    document.querySelector(".artist-name").textContent = artistData.name;
    document.querySelector(".add").addEventListener("click", async () => {
      const albums = await getArtistAlbums(token, currentArtistId);
      const singles = await getArtistSingles(token, currentArtistId);
      const compilations = await getArtistCompilations(token, currentArtistId);
      const appearsOn = await getArtistAppearsOn(token, currentArtistId);
      let dataItem = {};
      dataItem.images = artistData.images;
      dataItem.artist = artistData.name;
      dataItem.id = artistData.id;
      dataItem.genres = artistData.genres;
      dataItem.country = "";
      dataItem.language = "";
      dataItem.followers = artistData.followers.total;
      dataItem.popularity = artistData.popularity;
      dataItem.albums = albums;
      dataItem.singles = singles;
      dataItem.compilations = compilations;
      dataItem.appearsOn = appearsOn;
      dataItem.spotify = artistData.external_urls.spotify;
      data = [...data, dataItem];
      console.log(data);
    });

    // Update genres
    const genresContainer = document.querySelector(".genres");
    genresContainer.innerHTML = "";
    artistData.genres.forEach((genre) => {
      const genreSpan = document.createElement("span");
      genreSpan.classList.add("genre");
      genreSpan.textContent = genre;
      genresContainer.appendChild(genreSpan);
    });

    // Update stats
    document.querySelector(".followers-count").textContent =
      artistData.followers.total.toLocaleString();
    document.querySelector(".popularity-score").textContent =
      artistData.popularity;

    // Update page title
    document.title = artistData.name;

    // Load initial albums data
    if (typeof token !== "undefined") {
      loadAlbums();
    } else {
      // Wait a bit for api.js to load
      setTimeout(() => loadAlbums(), 1000);
    }
  }

  // Tab functionality
  const tabs = document.querySelectorAll(".tab");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      // Remove active class from all tabs and panels
      tabs.forEach((t) => t.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));

      // Add active class to clicked tab and corresponding panel
      tab.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      // Load data based on tab
      switch (targetTab) {
        case "albums":
          loadAlbums();
          break;
        case "singles":
          loadSingles();
          break;
        case "compilations":
          loadCompilations();
          break;
        case "appears-on":
          loadAppearsOn();
          break;
      }
    });
  });
});

function createAlbumCard(album) {
  return `
    <div class="album-card" onclick="openAlbum('${album.id}')">
      <img src="${album.images[0]?.url || ""}" alt="${
    album.name
  }" class="album-image">
      <div class="album-info">
        <h3 class="album-name">${album.name}</h3>
        <p class="album-date">${new Date(album.release_date).getFullYear()}</p>
        <p class="album-tracks">${album.total_tracks} tracks</p>
      </div>
    </div>
  `;
}

async function loadAlbums() {
  const panel = document.getElementById("albums");
  panel.innerHTML = "<p>Loading albums...</p>";

  try {
    const albums = await getArtistAlbums(token, currentArtistId);
    panel.innerHTML = `<div class="albums-grid">${albums
      .map(createAlbumCard)
      .join("")}</div>`;
  } catch (error) {
    panel.innerHTML = "<p>Error loading albums</p>";
  }
}

async function loadSingles() {
  const panel = document.getElementById("singles");
  panel.innerHTML = "<p>Loading singles...</p>";

  try {
    const singles = await getArtistSingles(token, currentArtistId);
    panel.innerHTML = `<div class="albums-grid">${singles
      .map(createAlbumCard)
      .join("")}</div>`;
  } catch (error) {
    panel.innerHTML = "<p>Error loading singles</p>";
  }
}

async function loadCompilations() {
  const panel = document.getElementById("compilations");
  panel.innerHTML = "<p>Loading compilations...</p>";

  try {
    const compilations = await getArtistCompilations(token, currentArtistId);
    panel.innerHTML = `<div class="albums-grid">${compilations
      .map(createAlbumCard)
      .join("")}</div>`;
  } catch (error) {
    panel.innerHTML = "<p>Error loading compilations</p>";
  }
}

async function loadAppearsOn() {
  const panel = document.getElementById("appears-on");
  panel.innerHTML = "<p>Loading appears on...</p>";

  try {
    const appearsOn = await getArtistAppears(token, currentArtistId);
    panel.innerHTML = `<div class="albums-grid">${appearsOn
      .map(createAlbumCard)
      .join("")}</div>`;
  } catch (error) {
    panel.innerHTML = "<p>Error loading appears on</p>";
  }
}

function openAlbum(albumId) {
  // Find the album data from current loaded albums
  const albumData = { id: albumId };
  localStorage.setItem("currentAlbum", JSON.stringify(albumData));
  window.location.href = "album.html";
}

function getArtistDiscography(
  token,
  artistId,
  offset = 0,
  limit = 50,
  includeGroups = "album,single,compilation,appears_on"
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?&offset=${offset}&limit=${limit}&include_groups=${includeGroups}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.items;
    });
}

function getArtistAlbums(
  token,
  artistId,
  offset = 0,
  limit = 50,
  includeGroups = "album"
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?offset=${offset}&limit=${limit}&include_groups=${includeGroups}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.items;
    });
}

function getArtistSingles(
  token,
  artistId,
  offset = 0,
  limit = 50,
  includeGroups = "single"
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?&offset=${offset}&limit=${limit}&include_groups=${includeGroups}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.items;
    });
}

function getArtistCompilations(
  token,
  artistId,
  offset = 0,
  limit = 50,
  includeGroups = "compilation"
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?&offset=${offset}&limit=${limit}&include_groups=${includeGroups}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.items;
    });
}

function getArtistAppears(
  token,
  artistId,
  offset = 0,
  limit = 50,
  includeGroups = "appears_on"
) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?&offset=${offset}&limit=${limit}&include_groups=${includeGroups}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.items;
    });
}

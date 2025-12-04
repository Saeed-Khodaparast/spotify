let token;
let currentAlbumId;

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

  const albumData = JSON.parse(localStorage.getItem("currentAlbum"));

  if (albumData) {
    currentAlbumId = albumData.id;
    loadAlbumDetails();
  }
});

async function loadAlbumDetails() {
  try {
    const album = await getAlbumInfo(token, currentAlbumId);
    // update sidebar

    // Update album header
    document.querySelector(".cover").src = album.images[0]?.url || "";
    document.querySelector(".title").textContent = album.name;
    document.querySelector(".artist").textContent = album.artists
      .map((a) => a.name)
      .join(", ");
    document.querySelector(".details").textContent = `${
      album.release_date.split("-")[0]
    } • ${album.total_tracks} tracks`;
    document.title = album.name;

    // Load tracks
    const tracks = await getAlbumTracks(token, currentAlbumId);
    displayTracks(tracks);

    // Load saved ratings after tracks are displayed
    setTimeout(loadSavedRatings, 100);
  } catch (error) {
    console.error("Error loading album:", error);
  }
}

function displayTracks(tracks) {
  const tracksList = document.querySelector(".tracks-list");
  tracksList.innerHTML = tracks
    .map(
      (track, index) => `
    <div class="track-item">
      <div class="track-number">${index + 1}</div>
      <div class="track-info">
        <div class="track-name">${track.name}</div>
        <div class="track-artists">${track.artists
          .map((a) => a.name)
          .join(", ")}</div>
      </div>
      <div class="rating-bar" data-track-id="${track.id}">
        ${Array.from(
          { length: 5 },
          (_, i) => `<span class="star" data-rating="${i + 1}">★</span>`
        ).join("")}
      </div>
      <span>more&nbsp;</span>
      <div class="track-duration">${formatDuration(track.duration_ms)}</div>
      
    </div>
  `
    )
    .join("");

  // Add click and hover handlers for rating
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", handleRating);
    star.addEventListener("mouseenter", handleHover);
    star.addEventListener("mouseleave", handleHoverLeave);
  });
}

function handleRating(e) {
  const rating = parseInt(e.target.dataset.rating);
  const ratingBar = e.target.parentElement;
  const trackId = ratingBar.dataset.trackId;

  // Update visual rating
  const stars = ratingBar.querySelectorAll(".star");
  stars.forEach((star, index) => {
    star.classList.toggle("active", index < rating);
  });

  // Store rating in localStorage
  const ratings = JSON.parse(localStorage.getItem("trackRatings") || "{}");
  ratings[trackId] = rating;
  localStorage.setItem("trackRatings", JSON.stringify(ratings));
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function handleHover(e) {
  const rating = parseInt(e.target.dataset.rating);
  const stars = e.target.parentElement.querySelectorAll(".star");
  stars.forEach((star, index) => {
    star.classList.toggle("hover", index < rating);
  });
}

function handleHoverLeave(e) {
  const stars = e.target.parentElement.querySelectorAll(".star");
  stars.forEach((star) => star.classList.remove("hover"));
}

function loadSavedRatings() {
  const ratings = JSON.parse(localStorage.getItem("trackRatings") || "{}");
  document.querySelectorAll(".rating-bar").forEach((ratingBar) => {
    const trackId = ratingBar.dataset.trackId;
    const rating = ratings[trackId];
    if (rating) {
      const stars = ratingBar.querySelectorAll(".star");
      stars.forEach((star, index) => {
        star.classList.toggle("active", index < rating);
      });
    }
  });
}

async function createPlaylistFromAlbum() {
  try {
    let token = localStorage.getItem("spotifyAccessToken");

    if (!token) {
      // Start authorization flow
      authorizeUser();

      // Listen for authorization response
      window.addEventListener("message", async (event) => {
        if (event.data.code) {
          token = await exchangeCodeForToken(event.data.code);
          await createPlaylistWithToken(token);
        }
      });
      return;
    }

    await createPlaylistWithToken(token);
  } catch (error) {
    console.error("Error creating playlist:", error);
    alert("Failed to create playlist");
  }
}

async function createPlaylistWithToken(token) {
  const album = await getAlbumInfo(token, currentAlbumId);
  const playlist = await createPlaylist(
    token,
    album.name,
    `Playlist created from album: ${album.name}`,
    false
  );

  alert(`Playlist "${album.name}" created successfully!`);
}

async function getAlbumInfo(token, albumId) {
  const url = `https://api.spotify.com/v1/albums/${albumId}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
}

async function getAlbumTracks(token, albumId) {
  const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
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

function createPlaylist(
  token,
  name = "New Playlist",
  description = "New playlist description",
  isPublic = false
) {
  const url = `https://api.spotify.com/v1/users/rockstarboy-65/playlists`;
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      description: description,
      public: isPublic,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
}

function toggleSubMenu(parent) {
  const subMenu = document.querySelector(`.${parent} .sub-menu`);
  const display = subMenu.style.display;
  subMenu.style.display = display === "block" ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("searchInput");
  const radioBtns = document.querySelectorAll('input[name="searchType"]');
  const refreshBtn = document.getElementById("refreshBtn");
  const searchResults = document.getElementById("searchResults");

  let token = localStorage.getItem("spotifyAccessToken");
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

  refreshBtn.addEventListener("click", () => {
    localStorage.removeItem("spotifyAccessToken");
    // Reset the page state instead of reloading
    searchResults.innerHTML = "";
    searchInput.value = "";
    // Re-trigger the authorization flow
    authorizeUser();
  });

  // #region Listeners
  searchInput.addEventListener("change", (event) => {
    const selectedType = document.querySelector(
      'input[name="searchType"]:checked'
    );
    const query = event.target.value;
    const type = selectedType?.value;
    searchResults.innerHTML = "";
    if (query) {
      search(token, query, type).then((data) => {
        data.map((result) => searchResults.appendChild(getArtistItem(result)));
      });
    }
  });

  radioBtns.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      searchInput.setAttribute("placeholder", `Search ${event.target.value}s`);
      const query = searchInput.value;
      const type = selectedType?.value;
      searchResults.innerHTML = "";
      if (query) {
        search(token, query, type).then((data) => {
          data.map((result) =>
            searchResults.appendChild(getArtistItem(result))
          );
        });
      }
    });
  });

  // #endregion Listeners
});

function search(token, query, type) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=${type}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.artists.items;
    });
}

function getArtistItem(result) {
  const artist = document.createElement("div");
  artist.classList.add("artist");

  artist.addEventListener("click", () => {
    // Store artist data in localStorage to pass to artist page
    localStorage.setItem("currentArtist", JSON.stringify(result));
    // Navigate to artist page
    window.location.href = "pages/artist.html";
  });

  const image = document.createElement("img");
  image.classList.add("image");
  image.src = result.images[0].url;
  artist.appendChild(image);
  const container = document.createElement("div");
  container.classList.add("container");
  artist.appendChild(container);
  const name = document.createElement("h3");
  name.classList.add("name");
  name.innerText = result.name;
  container.appendChild(name);
  const genres = document.createElement("div");
  genres.classList.add("genres");
  container.appendChild(genres);
  for (let i = 0; i < result.genres.length; i++) {
    const genre = document.createElement("span");
    genre.classList.add("genre");
    genre.innerText = result.genres[i];
    genres.appendChild(genre);
  }
  const followers = document.createElement("table");
  followers.classList.add("followers");
  container.appendChild(followers);
  const followersRow = document.createElement("tr");
  followers.appendChild(followersRow);
  const followersHeader = document.createElement("th");
  followersHeader.innerText = "Followers";
  followersRow.appendChild(followersHeader);
  const popularityRow = document.createElement("tr");
  followers.appendChild(popularityRow);
  const popularityHeader = document.createElement("th");
  popularityHeader.innerText = "Popularity";
  popularityRow.appendChild(popularityHeader);
  const followersData = document.createElement("td");
  followersData.innerText = result.followers.total.toLocaleString();
  followersRow.appendChild(followersData);
  const popularityData = document.createElement("td");
  popularityData.innerText = result.popularity;
  popularityRow.appendChild(popularityData);
  return artist;
}

function authorizeUser() {
  const clientId = "9055bb3867b045e2893312b71d847881";
  const redirectUri = encodeURIComponent(
    "https://saeed-khodaparast.github.io/spotify/callback.html"
  );
  const scopes = "playlist-modify-public playlist-modify-private";

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
  window.open(authUrl, "_blank", "width=500,height=600");
}

async function exchangeCodeForToken(code) {
  const clientId = "9055bb3867b045e2893312b71d847881";
  const clientSecret = "629e224ed971402cb8bebe0f6812d323";
  const redirectUri = window.location.origin + "/callback.html";

  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
  })
    .then((response) => response.json())
    .then((data) => {
      token = data.access_token;
      localStorage.setItem("spotifyAccessToken", token);
      return token;
    });
}

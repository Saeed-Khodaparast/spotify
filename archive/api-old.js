let artists;
let albums;

function getAccessToken() {
  const clientId = "9055bb3867b045e2893312b71d847881";
  const clientSecret = "629e224ed971402cb8bebe0f6812d323";

  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    },
    body: "grant_type=client_credentials",
  })
    .then((response) => response.json())
    .then((data) => {
      token = data.access_token;
      return token;
    });
}

function searchArtists(token, artistName) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    artistName
  )}&type=artist`;
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

function getArtistAlbums(token, artistId) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error fetching albums: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.items);
      return data.items;
    });
}

function displayArtistData(artist) {
  const artistDataUl = document.getElementById("artistData");
  artistDataUl.innerHTML = ""; // Clear previous data

  if (artist) {
    const artistLi = document.createElement("li");
    const artistDiv = document.createElement("div");
    artistDiv.classList.add("artist");
    artistDiv.innerHTML = `
                    <strong>${artist.name}</strong><br>
                    Genres: ${artist.genres.join(", ")}<br>
                    <a href="${
                      artist.external_urls.spotify
                    }" target="_blank">View on Spotify</a>
                `;
    artistDataLi.appendChild(artistDiv);
    artistDataUl.appendChild(artistLi);
  } else {
    artistDataUl.innerHTML = "<li><p>Artist not found.</p></li>";
  }
}

function getPlaylistItems(token, playlistId) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

document.getElementById("searchInput").addEventListener("change", (event) => {
  const artistName = event.target.value;
  if (!artistName) {
    alert("Please enter an artist name.");
    return;
  }

  getAccessToken()
    .then((token) => searchArtists(token, artistName))
    .then((artists) => {
      console.log(artists);
      const artistDataUl = document.getElementById("artistData");
      artistDataUl.innerHTML = "";

      // Process artists sequentially
      return artists.reduce((promise, artist) => {
        return promise.then(() => {
          return getArtistAlbums(token, artist.id).then(() => {
            if (artist) {
              const artistLi = document.createElement("li");
              const artistDiv = document.createElement("div");
              artistDiv.classList.add("artist");

              // image
              const image = document.createElement("img");
              image.classList.add("image");
              image.src = artist.images[0].url;
              image.alt = artist.name;
              artistDiv.appendChild(image);

              const container = document.createElement("div");
              container.classList.add("container");

              // name
              const name = document.createElement("h3");
              name.classList.add("name");
              name.textContent = artist.name;
              container.appendChild(name);

              // genres
              const genres = document.createElement("div");
              genres.classList.add("genres");
              for (let i = 0; i < artist.genres.length; i++) {
                const genre = document.createElement("span");
                genre.classList.add("genre");
                genre.textContent = artist.genres[i];
                genres.appendChild(genre);
              }
              container.appendChild(genres);

              // table
              const table = document.createElement("table");
              table.classList.add("followers");
              const tr1 = document.createElement("tr");
              const th1 = document.createElement("th");
              const th2 = document.createElement("th");
              th1.textContent = "Followers";
              th2.textContent = "Popularity";
              tr1.appendChild(th1);
              tr1.appendChild(th2);
              const tr2 = document.createElement("tr");
              const td1 = document.createElement("td");
              const td2 = document.createElement("td");
              td1.textContent = artist.followers.total;
              td2.textContent = artist.popularity;
              tr2.appendChild(td1);
              tr2.appendChild(td2);
              table.appendChild(tr1);
              table.appendChild(tr2);
              container.appendChild(table);

              artistDiv.appendChild(container);
              artistLi.appendChild(artistDiv);
              artistDataUl.appendChild(artistLi);
            } else {
              artistDataUl.innerHTML = "<li><p>Artist not found.</p></li>";
            }
          });
        });
      }, Promise.resolve());
    })
    .catch((error) => {
      console.error("Error fetching artist data:", error);
    });
});

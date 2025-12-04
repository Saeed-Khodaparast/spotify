const data = {
  artists: [
    {
      images: [],
      artist: "Amon Amarth",
      id: "3pulcT2wt7FEG10lQlqDJL",
      genres: [],
      country: "",
      followers: 0,
      popularity: 0,
      albums: [],
      singles: [],
      compilations: [],
      playlists: [
        {
          images: [],
          name: "",
          id: "",
          type: "",
          year: 0,
          description: "",
          tracks: {},
        },
        { id: "0q50QtEwtTm3f6wdhLFdm1", type: "album" },
        { id: "06PC40AmhNtfdMWxFKG300", type: "album" },
        { id: "3NsZjuJnlhHZAZeZUNb1W4", type: "album" },
        { id: "1YbEgq7PiUoubqU8JrzVCR", type: "album" },
        { id: "6ET2WXrcujowRHusx2tM1n", type: "album" },
        { id: "37BVqImXUGYt90eFhMH2o9", type: "album" },
        { id: "6co0lL4pJINuUaaKou7DHT", type: "album" },
        { id: "6x9JRbZIRTmREeGyuRaEeq", type: "album" },
        { id: "7v8JrmVLRIXRozaA6OZvz3", type: "album" },
        { id: "2eSZy5krN6VK4HpBs3dhxU", type: "album" },
        { id: "00rxB9iGvPOb5uqaPdKLpZ", type: "album" },
        { id: "1FwHEq1QKkv6ZGNFdNfltO", type: "album" },
        { id: "0eGMdTiDJxrv7r9RWIoipj", type: "album" },
        { id: "033gJiTSIyZ1LhAmLV0o0G", type: "album" },
      ],
    },
    {
      playlists: [
        { id: "4InNd03qDrAh7q2rCyDEf4", type: "album" },
        { id: "0qjpGSGqreJeKyA8Zv5mYF", type: "album" },
        { id: "173yCvhsLm9CPe4V35zYjn", type: "album" },
        { id: "3TXaxNnNmPmIS1TpHMZO3g", type: "album" },
        { id: "2wjdrceKUep4oXvKykPPuz", type: "album" },
        { id: "3SHxLPqN5ovERh4LF4kkYo", type: "album" },
        { id: "60HSvBxJGLm4L7sr7ci4Oh", type: "album" },
        { id: "3RTcZvobGHZvFntOjrelhQ", type: "album" },
        { id: "2UBwlQqHzPdGDC2EIdRHJ9", type: "album" },
      ],
    },
  ],
};

//showPlaylists();

function showArtistsList() {
  const list = document.getElementById("artistsList");
  for (let i = 0; i < data.artists.length; i++) {
    const artist = document.createElement("li");
    artist.classList.add("artistsItem");
    artist.innerText = data.artists[i].artist;
    list.appendChild(artist);
    artist.addEventListener("click", () => showPlaylists(i));
  }
}

function showPlaylists() {
  const allIds = getAllPlaylistIds();
  const list = document.getElementById("artistsList");
  for (let i = 0; i < allIds.length; i++) {
    const playlist = document.createElement("li");
    playlist.classList.add("artistsItem");
    playlist.innerText = allIds[i];
    list.appendChild(playlist);
    playlist.addEventListener("click", () => {
      getAccessToken().then((token) => {
        getPlaylistItems(token, allIds[i]).then((data) => {
          console.log(data);
          playlist.innerText = data.name;
          displayPlaylistData(data);
        });
        //addID(allIds[i]);
      });
    });
  }
}

function getAllPlaylistIds() {
  return data.artists.flatMap((artist) =>
    artist.playlists.map((playlist) => playlist.id)
  );
}

function displayPlaylistData(playlistData) {
  const container = document.getElementById("playlistData");
  const totalDuration = playlistData.tracks.items.reduce(
    (total, item) => total + item.track.duration_ms,
    0
  );
  const hours = Math.floor(totalDuration / 3600000);
  const minutes = Math.floor((totalDuration % 3600000) / 60000);

  container.innerHTML = `
    <div class="playlist-container">
      <div class="playlist-header">
        <img src="${playlistData.images[0]?.url}" alt="${
    playlistData.name
  }" class="playlist-cover">
        <div class="playlist-info">
          <span class="playlist-type">${
            playlistData.public ? "Public" : "Private"
          } Playlist</span>
          <h1 class="playlist-title">${playlistData.name}</h1>
           <span>${
             playlistData.tracks.items[0].track.album.release_date.split("-")[0]
           }</span>
           <span class="separator">•</span>
           <span>${playlistData.tracks.items[0].track.album.album_type}</span>
         
          <p class="playlist-description">${
            playlistData.description || "description"
          }</p>
          <div class="playlist-meta">
            <span class="owner">${playlistData.owner.display_name}</span>
            <span class="separator">•</span>
            <span class="track-count">${playlistData.tracks.total} songs</span>
            <span class="separator">•</span>
            <span class="duration">${hours}h ${minutes}m</span>
          </div>
        </div>
      </div>
      
      <div class="tracks-section">
        <div class="tracks-header">
          <span class="track-number">#</span>
          <span class="track-title">Title</span>
          <span class="track-album">Album</span>
          <span class="track-duration">⏱</span>
        </div>
        
        <div class="tracks-list">
          ${playlistData.tracks.items
            .map(
              (item, index) => `
            <div class="track" data-track-id="${item.track.id}">
              <span class="track-number">${index + 1}</span>
              <div class="track-info">
                <div class="track-title">${item.track.name}</div>
                <div class="track-artist">${item.track.artists
                  .map((artist) => artist.name)
                  .join(", ")}</div>
              </div>
              div class="track-album">${item.track.album.name}</div>
              <div cl<ass="track-duration">${Math.floor(
                item.track.duration_ms / 60000
              )}:${String(
                Math.floor((item.track.duration_ms % 60000) / 1000)
              ).padStart(2, "0")}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

// const artists = document.getElementById("artists");
// for (let i = 0; i < data.artists.length; i++) {
//   const artist = document.createElement("li");
//   artist.classList.add("artist");
//   artist.innerText = data.artists[i].artist;
//   artists.appendChild(artist);
//   artist.addEventListener("click", () => showPlaylists(i));
// }

// const artistHeader = document.getElementById("artistHeader");
// const playlists = document.getElementById("playlists");
// function showPlaylists(index) {
//   artists.style.display = "none";
//   artistHeader.display = "block";
//   artistHeader.innerText = data.artists[index].artist;
//   for (let i = 0; i < data.artists[index].playlists.length; i++) {
//     const playlist = document.createElement("li");
//     playlist.classList.add("playlist");
//     playlist.innerText =
//       data.artists[index].playlists[i].title +
//       " (" +
//       data.artists[index].playlists[i].year +
//       ")";
//     playlists.appendChild(playlist);
//     playlist.addEventListener("click", addID);
//     playlist.id = data.artists[index].playlists[i].id;
//   }
// }

// function addID(event) {
//   const iFrame = document.getElementById("iFrame");
//   const input = document.getElementById("dropdown");
//   const showID = document.getElementById("showID");
//   const body = document.getElementById("plContainer");
//   body.innerHTML = `<iframe id="frame" class="iFrame"
//     src="https://open.spotify.com/embed/playlist/${event.target.id}?utm_source=generator&theme=0"
//     frameBorder="0" allowfullscreen=""
//     allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
//   showID.innerText = `ID: ${event.target.id}`;
// }

function addID(id) {
  const body = document.getElementById("plContainer");
  body.innerHTML = `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/${id}?utm_source=generator" width="100%" height="100%" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
}

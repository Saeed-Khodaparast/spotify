let token;
let userToken;

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

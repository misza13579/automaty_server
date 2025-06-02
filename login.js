document.getElementById("reg").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/logowanie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token && data.zalogowany) {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("username", username);
      if (username === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "profil.html";
      }
    } else {
      document.getElementById("error-message").innerText = data.error || "Niepoprawny login lub hasło.";
    }
  })
  .catch(() => {
    document.getElementById("error-message").innerText = "Wystąpił błąd podczas logowania.";
  });
});

document.addEventListener("DOMContentLoaded", function() {
  sessionStorage.removeItem("token"); 
  sessionStorage.removeItem("username"); 
});
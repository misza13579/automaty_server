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
      window.location.href = "profil.html";
    } else {
      alert(data.komunikat || "Niepoprawny login lub hasło.");
    }
  })
  .catch(error => {
    console.error("Błąd:", error);
    alert("Wystąpił błąd po stronie serwera.");
  });
});
document.addEventListener("DOMContentLoaded", function() {
  sessionStorage.removeItem("token"); 
  sessionStorage.removeItem("username"); 
});
document.getElementById("reg").addEventListener("submit", function(e) {
    e.preventDefault(); // zapobiega przeładowaniu strony
  
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
      if (data.zalogowany) {
        sessionStorage.setItem("username", username);
        window.location.href = "profil.html";
      } else {
        alert("Niepoprawny login lub hasło.");
      }
    })
    .catch(error => {
      console.error("Błąd:", error);
    });
  });
  
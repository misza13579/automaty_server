document.getElementById("reg").addEventListener("submit", function(e) {
    e.preventDefault(); // zapobiega przeładowaniu strony
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const idcard = document.getElementById("idcard").value;
    const secondpassword = document.getElementById("secondpassword").value;

    if (password !== secondpassword) {
      alert("Hasła nie są takie same!");
      return;
    }
    fetch("http://localhost:3000/dodaj_uzytkownika", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ idcard, username, password })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      window.location.href = "main.htm";
    })
    .catch(error => {
      console.error("Błąd:", error);
    });

  });
  
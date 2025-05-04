document.getElementById("reg").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const secondpassword = document.getElementById("secondpassword").value;
  const idcard = document.getElementById("idcard").value;

  if (password !== secondpassword) {
    alert("Hasła nie są takie same!");
    return;
  }

  if (!/^\d{10}$/.test(idcard)) {
    alert("Identyfikator musi zawierać dokładnie 10 cyfr.");
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
    if (data.sukces) {
      window.location.href = "main.htm";
    }
  })
  .catch(error => {
    console.error("Błąd:", error);
    alert("Wystąpił błąd podczas rejestracji.");
  });
});

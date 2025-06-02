document.getElementById("reg").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const secondpassword = document.getElementById("secondpassword").value;
  const idcard = document.getElementById("idcard").value;
  const checkbox = document.getElementById('accept-rules');
  const errorMsg = document.getElementById("error-message");

  errorMsg.innerText = ""; // czyść stare błędy

  if (password !== secondpassword) {
    errorMsg.innerText = "Hasła nie są takie same.";
    return;
  }

  if (!checkbox.checked) {
    errorMsg.innerText = "Musisz zaakceptować regulamin, aby się zarejestrować.";
    return;
  }

  if (!/^\d{10}$/.test(idcard)) {
    errorMsg.innerText = "Identyfikator musi zawierać dokładnie 10 cyfr.";
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
    if (data.sukces) {
      alert(data.message);
      window.location.href = "main.htm";
    } else {
      errorMsg.innerText = data.message || "Błąd serwera";
    }
  })
  .catch(() => {
    errorMsg.innerText = "Wystąpił błąd podczas rejestracji.";
  });
});

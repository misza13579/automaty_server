window.onload = function() {
  fetch("http://localhost:3000/najlepsze_wyniki", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Błąd po stronie serwera.");
        return;
      }
      const tabela = document.getElementById("wynik");
      data.forEach(row => {
        const tr = document.createElement("tr");
        const tdLogin = document.createElement("td");
        tdLogin.innerText = row.login;
        tdLogin.style.border = "1px solid black";
        tdLogin.style.padding = "8px";
        const tdWynik = document.createElement("td");
        tdWynik.innerText = row.najlepszy_wynik;
        tdWynik.style.border = "1px solid black";
        tdWynik.style.padding = "8px";
        tr.appendChild(tdLogin);
        tr.appendChild(tdWynik);
        tabela.appendChild(tr);
      });
    })
    .catch(() => {
      document.getElementById("error-message").innerText = "Wystąpił błąd podczas ładowania danych.";
    });
};
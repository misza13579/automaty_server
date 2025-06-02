window.onload = function () {
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");

  if (!username || !token) {
    window.location.href = "login.htm";
    return;
  }

  fetch("http://localhost:3000/pobranie-uzytkownikow", {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(users => {
      const tbody = document.getElementById("pending-users");
      tbody.innerHTML = "";

      if (users.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>Brak oczekujących użytkowników</td></tr>";
        return;
      }

      users.forEach(user => {
        const tr = document.createElement("tr");

        const tdLogin = document.createElement("td");
        tdLogin.innerText = user.login;

        const tdId = document.createElement("td");
        tdId.innerText = user.identyfikator;

        // Przycisk zatwierdzenia
        const tdApprove = document.createElement("td");
        const approveBtn = document.createElement("button");
        approveBtn.innerText = "Zatwierdź";
        approveBtn.onclick = function () {
          fetch("http://localhost:3000/zmiana-zatwierdzania", {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login: user.login })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert(`Użytkownik ${user.login} zatwierdzony.`);
                tr.remove();
              } else {
                alert("Błąd zatwierdzania: " + (data.error || "Nieznany błąd"));
              }
            })
            .catch(error => {
              console.error("Błąd:", error);
              alert("Wystąpił błąd podczas zatwierdzania.");
            });
        };

        // Przycisk usunięcia
        const tdDelete = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Usuń";
        deleteBtn.style.backgroundColor = "#e74c3c";
        deleteBtn.style.color = "white";
        deleteBtn.onclick = function () {
          if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${user.login}?`)) return;

          fetch("http://localhost:3000/usun-uzytkownika", {
            method: "POST", 
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login: user.login })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert(`Użytkownik ${user.login} usunięty.`);
                tr.remove();
              } else {
                alert("Błąd usuwania: " + (data.error || "Nieznany błąd"));
              }
            })
            .catch(error => {
              console.error("Błąd:", error);
              alert("Wystąpił błąd podczas usuwania.");
            });
        };

        tdApprove.appendChild(approveBtn);
        tdDelete.appendChild(deleteBtn);

        tr.appendChild(tdLogin);
        tr.appendChild(tdId);
        tr.appendChild(tdApprove);
        tr.appendChild(tdDelete);

        tbody.appendChild(tr);
      });
    })
    .catch(error => {
      console.error("Błąd:", error);
      alert("Nie udało się pobrać użytkowników.");
    });
};

window.onload = function() {
    const username = sessionStorage.getItem("username");
    document.getElementById("username").innerText = "Witaj, " + username;
  
    fetch(`http://localhost:3000/wyniki/${username}`)
      .then(response => response.json())
      .then(data => {
        const tabela = document.getElementById("wynik");  // <-- tbody
  
        data.forEach(row => {
          const tr = document.createElement("tr");
  
          const tdData = document.createElement("td");
          tdData.innerText = row.data;
          tdData.style.border = "1px solid black";
          tdData.style.padding = "8px";
  
          const tdWynik = document.createElement("td");
          tdWynik.innerText = row.wynik;
          tdWynik.style.border = "1px solid black";
          tdWynik.style.padding = "8px";
  
          tr.appendChild(tdData);
          tr.appendChild(tdWynik);
  
          tabela.appendChild(tr);
        });
      })
      .catch(error => {
        console.error("Błąd:", error);
      });
  };
  
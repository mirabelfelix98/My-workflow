async function loadData() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/admin-data", {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.ok) {
    const data = await res.json();
    document.getElementById("reviews").innerHTML =
      data.reviews.map(r => `<p>${r.text} → ${r.reply}</p>`).join("");
  } else {
    alert("Unauthorized! Please log in again.");
    window.location.href = "login.html";
  }
}

async function addTone() {
  const token = localStorage.getItem("token");
  const newTone = document.getElementById("newTone").value;

  await fetch("http://localhost:5000/add-tone", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ tone: newTone })
  });

  alert("Tone added!");
}

loadData();

fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Testing", email: "testing@example.com", password: "password123" })
})
.then(r => r.json())
.then(d => console.log("Register:", d))
.catch(console.error)

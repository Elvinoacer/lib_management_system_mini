fetch("http://localhost:3000/api/auth/csrf")
  .then(r => r.json())
  .then(async data => {
    const res = await fetch("http://localhost:3000/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: "testing@example.com",
        password: "password123",
        csrfToken: data.csrfToken,
        json: "true"
      })
    })
    console.log(await res.json())
  })

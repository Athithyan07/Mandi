import { app } from "./app.js"

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`=======================================================`)
  console.log(`🚀 Mandi Connect Backend API is RUNNING on port ${PORT}`)
  console.log(`👉 http://localhost:${PORT}`)
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`)
  console.log(`=======================================================`)
})

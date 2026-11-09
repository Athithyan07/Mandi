#!/usr/bin/env node
// Mandi Connect — Concurrent Multi-App Runner
// Runs Backend (Port 4000) and Frontend (Port 3000) with colored logs & graceful shutdown

import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

const target = process.argv[2] // 'backend', 'frontend', or undefined (both)

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  backend: "\x1b[36m", // Cyan
  frontend: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
}

function runProcess(name, color, cwd, cmd, args) {
  const isWindows = process.platform === "win32"
  const actualCmd = isWindows ? "cmd.exe" : cmd
  const actualArgs = isWindows ? ["/d", "/s", "/c", `${cmd} ${args.join(" ")}`] : args

  const p = spawn(actualCmd, actualArgs, {
    cwd,
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
    env: { ...process.env, FORCE_COLOR: "1" },
  })

  p.stdout.on("data", (data) => {
    const lines = data.toString().split(/\r?\n/)
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}[${name}]${ANSI.reset} ${line}`)
      }
    }
  })

  p.stderr.on("data", (data) => {
    const lines = data.toString().split(/\r?\n/)
    for (const line of lines) {
      if (line.trim()) {
        console.error(`${color}[${name}]${ANSI.reset} ${line}`)
      }
    }
  })

  p.on("exit", (code) => {
    console.log(`${color}[${name}]${ANSI.reset} Process exited with code ${code}`)
  })

  return p
}

console.log(`${ANSI.bold}======================================================${ANSI.reset}`)
console.log(`${ANSI.bold}🌾 MANDI CONNECT — FULL-STACK DEVELOPMENT RUNNER${ANSI.reset}`)
console.log(`Working Directory: ${rootDir}`)
console.log(`${ANSI.bold}======================================================${ANSI.reset}`)

const children = []

if (!target || target === "backend") {
  console.log(`${ANSI.backend}▶ Starting Backend API Service on http://localhost:4000 ...${ANSI.reset}`)
  const backend = runProcess(
    "BACKEND :4000",
    ANSI.backend,
    path.join(rootDir, "apps", "backend"),
    "npm",
    ["run", "dev"]
  )
  children.push(backend)
}

if (!target || target === "frontend") {
  console.log(`${ANSI.frontend}▶ Starting Office Frontend App on http://localhost:3000 ...${ANSI.reset}`)
  const frontend = runProcess(
    "FRONTEND :3000",
    ANSI.frontend,
    path.join(rootDir, "apps", "office"),
    "pnpm",
    ["run", "dev"]
  )
  children.push(frontend)
}

function cleanup() {
  console.log(`\n${ANSI.warn}Shutting down processes gracefully...${ANSI.reset}`)
  for (const child of children) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", child.pid.toString(), "/f", "/t"])
      } else {
        child.kill("SIGTERM")
      }
    } catch (e) {
      // ignore
    }
  }
  process.exit(0)
}

process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)

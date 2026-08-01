#!/bin/bash
# Scaffolds the event-portal folder structure.
# Usage: bash scaffold-project.sh
# Run this in the parent directory where you want "event-portal/" created.

set -e

ROOT="event-portal"

echo "Creating $ROOT structure..."

# ---------- BACKEND ----------
mkdir -p "$ROOT/backend/src/config"
mkdir -p "$ROOT/backend/src/middleware"
mkdir -p "$ROOT/backend/src/controllers"
mkdir -p "$ROOT/backend/src/routes"
mkdir -p "$ROOT/backend/src/services"
mkdir -p "$ROOT/backend/src/prisma/migrations"

touch "$ROOT/backend/src/config/db.js"
touch "$ROOT/backend/src/middleware/auth.js"
touch "$ROOT/backend/src/middleware/roleCheck.js"
touch "$ROOT/backend/src/middleware/errorHandler.js"
touch "$ROOT/backend/src/controllers/auth.controller.js"
touch "$ROOT/backend/src/controllers/event.controller.js"
touch "$ROOT/backend/src/controllers/registration.controller.js"
touch "$ROOT/backend/src/controllers/checkin.controller.js"
touch "$ROOT/backend/src/controllers/volunteer.controller.js"
touch "$ROOT/backend/src/routes/auth.routes.js"
touch "$ROOT/backend/src/routes/event.routes.js"
touch "$ROOT/backend/src/routes/registration.routes.js"
touch "$ROOT/backend/src/routes/checkin.routes.js"
touch "$ROOT/backend/src/routes/volunteer.routes.js"
touch "$ROOT/backend/src/services/qr.service.js"
touch "$ROOT/backend/src/services/socket.service.js"
touch "$ROOT/backend/src/prisma/schema.prisma"
touch "$ROOT/backend/src/server.js"
touch "$ROOT/backend/.env"
touch "$ROOT/backend/.env.example"
touch "$ROOT/backend/package.json"

# ---------- FRONTEND ----------
mkdir -p "$ROOT/frontend/src/api"
mkdir -p "$ROOT/frontend/src/components"
mkdir -p "$ROOT/frontend/src/pages/auth"
mkdir -p "$ROOT/frontend/src/pages/organizer"
mkdir -p "$ROOT/frontend/src/pages/volunteer"
mkdir -p "$ROOT/frontend/src/pages/attendee"
mkdir -p "$ROOT/frontend/src/context"
mkdir -p "$ROOT/frontend/src/hooks"
mkdir -p "$ROOT/frontend/src/routes"

touch "$ROOT/frontend/src/api/axiosInstance.js"
touch "$ROOT/frontend/src/pages/auth/Login.jsx"
touch "$ROOT/frontend/src/pages/auth/Signup.jsx"
touch "$ROOT/frontend/src/pages/organizer/Dashboard.jsx"
touch "$ROOT/frontend/src/pages/organizer/CreateEvent.jsx"
touch "$ROOT/frontend/src/pages/organizer/Analytics.jsx"
touch "$ROOT/frontend/src/pages/volunteer/Tasks.jsx"
touch "$ROOT/frontend/src/pages/volunteer/ScanQR.jsx"
touch "$ROOT/frontend/src/pages/attendee/BrowseEvents.jsx"
touch "$ROOT/frontend/src/pages/attendee/MyRegistrations.jsx"
touch "$ROOT/frontend/src/context/AuthContext.jsx"
touch "$ROOT/frontend/src/routes/ProtectedRoute.jsx"
touch "$ROOT/frontend/src/routes/RoleRoute.jsx"
touch "$ROOT/frontend/src/App.jsx"
touch "$ROOT/frontend/.env"
touch "$ROOT/frontend/.env.example"
touch "$ROOT/frontend/package.json"

# ---------- ROOT ----------
touch "$ROOT/README.md"

cat > "$ROOT/.gitignore" <<EOF
node_modules/
.env
dist/
build/
.DS_Store
EOF

echo "Done. Structure created under ./$ROOT"
echo ""
echo "Next steps:"
echo "  cd $ROOT/backend && npm init -y && npm install express cors dotenv bcrypt jsonwebtoken prisma @prisma/client qrcode socket.io"
echo "  cd $ROOT/frontend && npm create vite@latest . -- --template react"

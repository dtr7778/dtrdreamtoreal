#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 is not installed. Please install it first."
        exit 1
    fi
}

info "Checking prerequisites..."

check_command node
check_command pnpm
check_command docker

if [[ -f .nvmrc ]]; then
    NVM_REQUIRED=$(cat .nvmrc | tr -d '[:space:]')
    NVM_CURRENT=$(node --version | sed 's/^v//')
    if [[ "$NVM_CURRENT" != "$NVM_REQUIRED"* ]]; then
        warn "Node.js $NVM_REQUIRED recommended (current: $NVM_CURRENT). Use 'nvm use' to switch."
    fi
fi

if ! command -v supabase &> /dev/null; then
    error "Supabase CLI is not installed."
    echo "  Install it: https://supabase.com/docs/guides/cli/getting-started"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Linux: curl -fsSL https://cli.supabase.com/install.sh | sh"
    exit 1
fi

if ! docker info &> /dev/null; then
    error "Docker is not running. Please start Docker Desktop or the Docker daemon."
    exit 1
fi

info "All prerequisites met."

setup_env_from_example() {
    local example_file="$1"
    local dir
    dir=$(dirname "$example_file")
    local base
    base=$(basename "$example_file")

    local target
    if [[ "$base" == ".env.example" ]]; then
        target="$dir/.env"
    else
        return
    fi

    if [[ ! -f "$target" ]]; then
        info "Creating $target from $example_file..."
        cp "$example_file" "$target"
    else
        info "$target already exists, skipping."
    fi
}

while IFS= read -r -d '' f; do
    setup_env_from_example "$f"
done < <(find "$ROOT_DIR" -name '.env.example' -print0 2>/dev/null)

info "Installing project dependencies..."
pnpm install

info ""
info "Setup complete!"
info "Run 'pnpm dev' to start the development server."
info "Open http://localhost:3000 in your browser."

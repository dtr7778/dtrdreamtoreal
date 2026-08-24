#!/usr/bin/env bash

if command -v docker-compose &> /dev/null; then
    docker-compose "$@"
elif docker compose version &> /dev/null 2>&1; then
    docker compose "$@"
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' is available" >&2
    exit 1
fi
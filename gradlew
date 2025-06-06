#!/usr/bin/env bash
set -e
# Ensure android gradlew is executable
chmod +x android/gradlew
# Forward all commands to android/gradlew
exec android/gradlew "$@" 
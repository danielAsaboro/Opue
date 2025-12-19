#!/bin/bash
# Helper script to run Prisma Studio with correct environment
# Run: ./scripts/prisma-studio.sh

export DATABASE_URL="postgresql://user@localhost:5432/opue?schema=public"
npx prisma studio





















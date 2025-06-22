#!/bin/bash

# Script para probar los nuevos endpoints de turnos
BASE_URL="http://localhost:8080"

echo "🔍 Testing Turnos Endpoints..."

# 1. Obtener todos los turnos
echo -e "\n📋 1. Obteniendo todos los turnos:"
curl -s "$BASE_URL/turno" | jq '.'

# 2. Obtener un turno específico (usando ID válido)
echo -e "\n📋 2. Obteniendo turno ID 1202:"
curl -s "$BASE_URL/turno/1202" | jq '.'

# 3. Obtener estados válidos para un turno PROGRAMADO
echo -e "\n📋 3. Obteniendo estados válidos para turno PROGRAMADO (ID 1202):"
curl -s "$BASE_URL/turno/1202/estados-validos" | jq '.'

# 4. Probar confirmación de turno PROGRAMADO
echo -e "\n📋 4. Probando confirmación de turno PROGRAMADO (ID 1252):"
curl -s -X PUT "$BASE_URL/turno/1252/confirmar" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: TEST_USER" | jq '.'

# 5. Obtener estados válidos para turno CONFIRMADO
echo -e "\n📋 5. Obteniendo estados válidos para turno CONFIRMADO (ID 1153):"
curl -s "$BASE_URL/turno/1153/estados-validos" | jq '.'

# 6. Probar completar turno CONFIRMADO
echo -e "\n📋 6. Probando completar turno CONFIRMADO (ID 1153):"
curl -s -X PUT "$BASE_URL/turno/1153/completar" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: TEST_USER" | jq '.'

# 7. Probar cancelación de turno con motivo
echo -e "\n📋 7. Probando cancelación de turno PROGRAMADO (ID 1202):"
curl -s -X PUT "$BASE_URL/turno/1202/cancelar" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: TEST_USER" \
  -d '{"motivo": "Cancelación por motivos de salud del paciente"}' | jq '.'

# 8. Primero confirmar el turno REAGENDADO, luego reagendarlo
echo -e "\n📋 8a. Confirmando turno REAGENDADO (ID 1152) para poder reagendarlo:"
curl -s -X PUT "$BASE_URL/turno/1152/confirmar" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: TEST_USER" | jq '.'

echo -e "\n📋 8b. Ahora reagendando el turno CONFIRMADO:"
curl -s -X PUT "$BASE_URL/turno/1152/reagendar" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: TEST_USER" \
  -d '{
    "fecha": "2025-06-28",
    "horaInicio": "14:00:00",
    "horaFin": "14:30:00",
    "motivo": "Reagendamiento por disponibilidad del paciente"
  }' | jq '.'

# 6. Probar dashboard de auditoría
echo -e "\n📋 9. Probando dashboard de auditoría actualizado:"
curl -s "$BASE_URL/audit/dashboard" | jq '.'

# 10. Probar filtros avanzados de turnos
echo -e "\n📋 10. Probando filtros avanzados (turnos por estado PROGRAMADO):"
curl -s "$BASE_URL/turno/filtrar?estado=PROGRAMADO" | jq '.'

# 11. Probar filtros por fecha
echo -e "\n📋 11. Probando filtros por fecha (turnos de hoy en adelante):"
curl -s "$BASE_URL/turno/filtrar?fechaDesde=2025-06-21" | jq '.'

echo -e "\n✅ Pruebas completadas!"

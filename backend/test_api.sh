#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting System Integrity Tests..."

# Utility to extract JSON field using node
get_json_value() {
  echo $1 | node -e "try { const input = fs.readFileSync(0, 'utf-8'); const json = JSON.parse(input); console.log(json.$2 || ''); } catch (e) { console.log(''); }"
}

# 1. Login as Director
echo -e "\n${GREEN}[1] Login as Director${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/admin/signin" \
  -H "Content-Type: application/json" \
  -d '{"username":"director","password":"director123"}')

DIRECTOR_TOKEN=$(get_json_value "$LOGIN_RES" "admin_token")

if [ -z "$DIRECTOR_TOKEN" ]; then
  echo -e "${RED}Failed to login as Director:${NC} $LOGIN_RES"
  exit 1
else
  echo "Director Logged in. Token Acquired."
fi


# 2. Login as Security
echo -e "\n${GREEN}[2] Login as Security${NC}"
SEC_RES=$(curl -s -X POST "$BASE_URL/admin/signin" \
  -H "Content-Type: application/json" \
  -d '{"username":"security","password":"security123"}')

SECURITY_TOKEN=$(get_json_value "$SEC_RES" "admin_token")

if [ -z "$SECURITY_TOKEN" ]; then
  echo -e "${RED}Failed to login as Security:${NC} $SEC_RES"
  exit 1
else
  echo "Security Logged in. Token Acquired."
fi


# 3. Login as Student
echo -e "\n${GREEN}[3] Login as Student${NC}"
STUDENT_RES=$(curl -s -X POST "$BASE_URL/student/signin" \
  -H "Content-Type: application/json" \
  -d '{"username":"o210008","password":"o210008@rguktong"}')

STUDENT_TOKEN=$(get_json_value "$STUDENT_RES" "student_token")

if [ -z "$STUDENT_TOKEN" ]; then
  echo -e "${RED}Failed to login as Student:${NC} $STUDENT_RES"
  exit 1
else
  echo "Student Logged in. Token Acquired."
fi


# 4. Get Student Profile
echo -e "\n${GREEN}[4] Get Student Details${NC}"
PROFILE_RES=$(curl -s -X GET "$BASE_URL/student/getdetails" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

STUDENT_NAME=$(get_json_value "$PROFILE_RES" "student.Name")
if [ "$STUDENT_NAME" == "SREECHARAN DESU" ]; then
  echo "Verified Student Name: $STUDENT_NAME"
else
  echo -e "${RED}Failed to verify student name.${NC} Response: $PROFILE_RES"
fi


# 5. Create Outpass Request (Student)
echo -e "\n${GREEN}[5] Student Creating Outpass Request${NC}"
# Dates need to be valid
FROM_DATE=$(date -v+1d +%Y-%m-%d)
TO_DATE=$(date -v+3d +%Y-%m-%d)

OUTPASS_RES=$(curl -s -X POST "$BASE_URL/student/requestoutpass" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"reason\":\"Going home\",\"from_date\":\"$FROM_DATE\",\"to_date\":\"$TO_DATE\",\"userId\":\"o210008\"}")

SUCCESS=$(get_json_value "$OUTPASS_RES" "success")
if [ "$SUCCESS" == "true" ]; then
  echo "Outpass Requested Successfully."
else
  echo -e "${RED}Failed to request outpass.${NC} $OUTPASS_RES"
fi


# 6. Create Faculty (Director)
echo -e "\n${GREEN}[6] Director Creating Faculty${NC}"
FACULTY_USER="TCH001"
FACULTY_RES=$(curl -s -X POST "$BASE_URL/admin/faculty/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DIRECTOR_TOKEN" \
  -d "{\"username\":\"$FACULTY_USER\",\"password\":\"teach123\",\"name\":\"Prof. Test\",\"email\":\"test@prof.com\",\"department\":\"CSE\"}")

FACULTY_SUCCESS=$(get_json_value "$FACULTY_RES" "success")
if [ "$FACULTY_SUCCESS" == "true" ]; then
  echo "Faculty Created Successfully."
else 
  # Might fail if already exists, check msg
  MSG=$(get_json_value "$FACULTY_RES" "msg")
  echo "Create Faculty Result: $MSG"
fi


# 7. Faculty Login
echo -e "\n${GREEN}[7] Faculty Login${NC}"
FAC_LOGIN_RES=$(curl -s -X POST "$BASE_URL/faculty/signin" \
  -H "Content-Type: application/json" \
  -d '{"username":"TCH001","password":"teach123"}')

FACULTY_TOKEN=$(get_json_value "$FAC_LOGIN_RES" "token")

if [ -z "$FACULTY_TOKEN" ]; then
  echo -e "${RED}Failed to login as Faculty:${NC} $FAC_LOGIN_RES"
else
  echo "Faculty Logged in. Token Acquired."
  
  # 8. Faculty Profile
  echo -e "\n${GREEN}[8] Get Faculty Profile${NC}"
  FAC_PROFILE_RES=$(curl -s -X GET "$BASE_URL/faculty/me" \
    -H "Authorization: Bearer $FACULTY_TOKEN")
  
  FAC_NAME=$(get_json_value "$FAC_PROFILE_RES" "faculty.Name")
  echo "Faculty Profile Name: $FAC_NAME"
fi


# 9. Get Curriculum (Public/Admin)
echo -e "\n${GREEN}[9] Fetch Curriculum${NC}"
CURR_RES=$(curl -s -X GET "$BASE_URL/admin/curriculum/get-curriculum" \
  -H "Authorization: Bearer $DIRECTOR_TOKEN")

HAS_CSE=$(echo $CURR_RES | grep -o "CSE" | head -1)
if [ ! -z "$HAS_CSE" ]; then
  echo "Curriculum Fetched (Contains CSE)."
else
  echo -e "${RED}Failed to fetch curriculum properly.${NC}"
fi


# 10. Security Scanner Check (Scan Student)
echo -e "\n${GREEN}[10] Security Scanning Student (Check-Out Attempt)${NC}"
SCAN_RES=$(curl -s -X POST "$BASE_URL/admin/security/scan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECURITY_TOKEN" \
  -d '{"studentId":"o210008"}')

echo "Scan Result: $SCAN_RES"


echo -e "\n${GREEN}Tests Completed.${NC}"

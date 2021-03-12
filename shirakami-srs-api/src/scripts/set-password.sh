#!/bin/sh

# Check if all params are provided
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ -z "$1" ] || [ -z "$2" ]; then
  echo 'Usage: ./set-password.sh <email> <password>'
  echo 'Description: Changes the password of an account identified by its email address.'
  exit 1
fi

# Extract parameters into variables
EMAIL="$1"
NEW_PASSWORD="$2"

# Fetch user id for the user with the given email. Return if it's not found
echo "Looking up user..."
USER_ID=$(mysql -h $MYSQL_HOST -P 3306 -u $MYSQL_USER -p$MYSQL_PASSWORD -D $MYSQL_DB -s --skip-column-names -e "SELECT id FROM user_entity WHERE email=\"$EMAIL\"")
if [ -z "$USER_ID" ]; then
  echo "No user found for email '$EMAIL'"
  exit 2
fi
echo "User $USER_ID found!"

# Determine the new password hash
echo "Hashing password..."
NEW_PASSWORD_HASH=$(bcrypt-cli "$NEW_PASSWORD" 10)

# Update password
echo "Updating password..."
mysql -h $MYSQL_HOST -P 3306 -u $MYSQL_USER -p$MYSQL_PASSWORD -D $MYSQL_DB -s --skip-column-names -e "UPDATE user_entity SET passwordHash = \"$NEW_PASSWORD_HASH\" WHERE id = \"$USER_ID\"" && \
echo "Password updated!"

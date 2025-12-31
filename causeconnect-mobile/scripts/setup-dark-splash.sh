#!/bin/bash

echo "🔄 Setting up dark mode splash after prebuild..."

# 1. Create night colors directory
mkdir -p android/app/src/main/res/values-night
touch android/app/src/main/res/values-night/colors.xml

# 2. Create dark colors.xml
cat > android/app/src/main/res/values-night/colors.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="splashscreen_background">#00003E</color>
  <color name="iconBackground">#00003E</color>
  <color name="colorPrimary">#4a6b8a</color>
  <color name="bootsplash_background">#00003E</color>
</resources>
EOF

# 3. Create night drawable directories
mkdir -p android/app/src/main/res/drawable-night-hdpi
mkdir -p android/app/src/main/res/drawable-night-mdpi
mkdir -p android/app/src/main/res/drawable-night-xhdpi
mkdir -p android/app/src/main/res/drawable-night-xxhdpi
mkdir -p android/app/src/main/res/drawable-night-xxxhdpi

# 4. Copy dark assets (CORRECTED PATH - added /android/)
cp assets/bootsplash-dark/android/drawable-hdpi/bootsplash_logo.png \
   android/app/src/main/res/drawable-night-hdpi/bootsplash_logo.png

cp assets/bootsplash-dark/android/drawable-mdpi/bootsplash_logo.png \
   android/app/src/main/res/drawable-night-mdpi/bootsplash_logo.png

cp assets/bootsplash-dark/android/drawable-xhdpi/bootsplash_logo.png \
   android/app/src/main/res/drawable-night-xhdpi/bootsplash_logo.png

cp assets/bootsplash-dark/android/drawable-xxhdpi/bootsplash_logo.png \
   android/app/src/main/res/drawable-night-xxhdpi/bootsplash_logo.png

cp assets/bootsplash-dark/android/drawable-xxxhdpi/bootsplash_logo.png \
   android/app/src/main/res/drawable-night-xxxhdpi/bootsplash_logo.png

cp assets/bootsplash-dark/android/drawable-hdpi/splashscreen_logo.png \
   android/app/src/main/res/drawable-night-hdpi/splashscreen_logo.png

cp assets/bootsplash-dark/android/drawable-mdpi/splashscreen_logo.png \
   android/app/src/main/res/drawable-night-mdpi/splashscreen_logo.png

cp assets/bootsplash-dark/android/drawable-xhdpi/splashscreen_logo.png \
   android/app/src/main/res/drawable-night-xhdpi/splashscreen_logo.png

cp assets/bootsplash-dark/android/drawable-xxhdpi/splashscreen_logo.png \
   android/app/src/main/res/drawable-night-xxhdpi/splashscreen_logo.png

cp assets/bootsplash-dark/android/drawable-xxxhdpi/splashscreen_logo.png \
   android/app/src/main/res/drawable-night-xxxhdpi/splashscreen_logo.png

echo "✅ Dark mode splash restored!"

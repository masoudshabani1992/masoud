#!/usr/bin/env bash
# ساخت APK «استند دایناسوری» بدون Gradle
#
# متغیرهای محیطی (اختیاری):
#   JAVAC / JAVA / KEYTOOL  — مسیر ابزارهای JDK
#   AAPT2 / ZIPALIGN        — ابزارهای build-tools
#   DX                      — مسیر dx.jar (دکسر)
#   ANDROID_JAR             — مسیر android.jar (SDK)
#
# مثال ساندباکس:
#   JAVAC=/tmp/android-tools/jdk/bin/javac JAVA=/tmp/android-tools/jdk/bin/java \
#   KEYTOOL=/tmp/android-tools/jdk/bin/keytool AAPT2=.../aapt2 \
#   ZIPALIGN=/tmp/android-tools/zipalign DX=/tmp/android-tools/dx.jar \
#   ANDROID_JAR=/tmp/android-tools/android.jar ./build.sh
set -euo pipefail
cd "$(dirname "$0")"

JAVAC=${JAVAC:-javac}
JAVA=${JAVA:-java}
KEYTOOL=${KEYTOOL:-keytool}
AAPT2=${AAPT2:-aapt2}
ZIPALIGN=${ZIPALIGN:-zipalign}
DX=${DX:-dx.jar}
ANDROID_JAR=${ANDROID_JAR:?ANDROID_JAR را تنظیم کنید}

B=build
rm -rf "$B" out
mkdir -p "$B/assets/web" "$B/classes" "$B/compiled" out

echo '== [1/6] کپی دارایی‌های وب'
for d in ar assets models sounds vendor index.html; do
  cp -r "../$d" "$B/assets/web/"
done

echo '== [2/6] aapt2 link'
"$AAPT2" compile res/drawable/icon.png -o "$B/compiled/"
"$AAPT2" link -o "$B/base.apk" -I "$ANDROID_JAR" \
  --manifest AndroidManifest.xml -A "$B/assets/web" \
  --auto-add-overlay "$B/compiled/"*.flat

echo '== [3/6] javac'
"$JAVAC" -source 7 -target 7 -nowarn -encoding UTF-8 \
  -bootclasspath "$ANDROID_JAR" \
  -d "$B/classes" src/com/dinoar/stand/MainActivity.java

echo '== [4/6] dex'
"$JAVA" -jar "$DX" --dex --no-strict --output="$B/classes.dex" "$B/classes"

python3 - "$B" <<'EOF'
import os, sys, zipfile
b = sys.argv[1]
z = zipfile.ZipFile(os.path.join(b, 'base.apk'), 'a', zipfile.ZIP_DEFLATED)
z.write(os.path.join(b, 'classes.dex'), 'classes.dex')
z.close()
print('classes.dex added')
EOF

echo '== [5/6] zipalign'
if [ -n "${LD_LIBRARY_PATH:-}" ]; then
  LD_LIBRARY_PATH="$(dirname "$ZIPALIGN"):${LD_LIBRARY_PATH:-}" "$ZIPALIGN" -p -f 4 "$B/base.apk" "$B/aligned.apk"
else
  LD_LIBRARY_PATH="$(dirname "$ZIPALIGN")" "$ZIPALIGN" -p -f 4 "$B/base.apk" "$B/aligned.apk"
fi

echo '== [6/6] امضا'
KS=dino-release.jks
if [ ! -f "$KS" ]; then
  "$KEYTOOL" -genkeypair -keystore "$KS" -storepass dino1234 -keypass dino1234 \
    -alias dino -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Dino Stand, O=DinoAR" 2>/dev/null
fi
node sign.mjs "$B/aligned.apk" "$KS" dino1234 out/dino-stand.apk

echo "== done: out/dino-stand.apk"
ls -la out/

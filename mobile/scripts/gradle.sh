#!/usr/bin/env bash
# Run the Android build with a JDK that Gradle accepts.
#
# The Android Gradle Plugin supports JDK 17–21. A newer JDK on the PATH — 25,
# say — fails with "Unsupported class file major version" before it prints
# anything useful, so this picks a supported one explicitly.
#
#   ./scripts/gradle.sh assembleRelease
set -euo pipefail

find_jdk() {
  # Anything the user has already chosen, if it is in range.
  if [[ -n "${JAVA_HOME:-}" ]] && supported "$JAVA_HOME"; then
    echo "$JAVA_HOME"; return
  fi
  for version in 21 17; do
    for candidate in \
      "/opt/homebrew/opt/openjdk@$version/libexec/openjdk.jdk/Contents/Home" \
      "/usr/local/opt/openjdk@$version/libexec/openjdk.jdk/Contents/Home" \
      "$(/usr/libexec/java_home -v "$version" 2>/dev/null || true)"
    do
      [[ -n "$candidate" && -x "$candidate/bin/javac" ]] && { echo "$candidate"; return; }
    done
  done
}

supported() {
  local major
  major=$("$1/bin/java" -XshowSettings:properties -version 2>&1 |
    awk -F= '/java.specification.version/ {gsub(/ /,"",$2); print $2}')
  [[ "$major" == "17" || "$major" == "21" ]]
}

JDK=$(find_jdk)
if [[ -z "$JDK" ]]; then
  echo "No JDK 17 or 21 found. Install one with:" >&2
  echo "  brew install openjdk@21" >&2
  exit 1
fi

cd "$(dirname "$0")/../android"
echo "Using JDK: $JDK"
JAVA_HOME="$JDK" exec ./gradlew "$@"

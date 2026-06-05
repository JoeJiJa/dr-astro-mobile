<img src="https://i.ibb.co/35dkfy1c/logo.png" alt="Dr. Astro Logo" width="120" height="120" align="right" style="border-radius:20px">

# 🌟 Dr. Astro — Medical Education App

> **Your all-in-one MBBS companion** — Subject library, Exam Hub, Practical Vault, AI Neural Lab, and more. Available on Android, Windows, macOS, Linux, and iOS.

[![Build & Release](https://github.com/JoeJiJa/dr-astro-flutter/actions/workflows/build-release.yml/badge.svg)](https://github.com/JoeJiJa/dr-astro-flutter/actions/workflows/build-release.yml)
[![Flutter](https://img.shields.io/badge/Flutter-3.24-blue?logo=flutter)](https://flutter.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📥 Download Now

| Platform | Download |
|----------|---------|
| 📱 **Android APK** (All phones) | [⬇️ DrAstro-universal.apk](https://github.com/JoeJiJa/dr-astro-flutter/releases/latest/download/DrAstro-universal.apk) |
| 📱 **Android APK** (Modern — arm64) | [⬇️ DrAstro-arm64.apk](https://github.com/JoeJiJa/dr-astro-flutter/releases/latest/download/DrAstro-arm64.apk) |
| 🪟 **Windows** | [⬇️ DrAstro-Windows.zip](https://github.com/JoeJiJa/dr-astro-flutter/releases/latest/download/DrAstro-Windows.zip) |
| 🌐 **Web** | [dr-astro.vercel.app](https://dr-astro.vercel.app) |

> **Dev builds** (latest from `main`): [Releases → dev-build](https://github.com/JoeJiJa/dr-astro-flutter/releases/tag/dev-build)

### Android Installation Steps
1. Download `DrAstro-arm64.apk` (recommended) or `DrAstro-universal.apk`
2. On your Android phone: Settings → Security → Enable "Install from unknown sources"
3. Open the downloaded APK and tap **Install**
4. Launch Dr. Astro ✨

### Windows Installation Steps
1. Download `DrAstro-Windows.zip`
2. Extract the ZIP to any folder
3. Run `dr_astro.exe`

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📚 **Subject Library** | 19+ MBBS subjects with hundreds of books, notes, Q-banks |
| 🎓 **Exam Hub** | Subject-specific exam sections and past papers |
| 🔬 **Practical Vault** | Practical materials, OSCE guides, viva prep |
| 🧠 **Neural Lab AI** | Gemini-powered AI tutor for medical questions |
| 📖 **Study Mode** | Integrated PDF/link viewer for all books |
| 🌙 **Dark/Light Mode** | Beautiful dark theme by default |
| ⚡ **Real-time Sync** | Live Firebase Firestore sync — admin changes reflect instantly |
| 🔐 **Authentication** | Email/password login with Firebase Auth |
| 👑 **Admin Panel** | Full CRUD for books, sections, and users |
| 📱 **Cross-Platform** | Single codebase for Android, iOS, Windows, macOS, Linux |

---

## 🏗️ Architecture

```
lib/
├── core/
│   ├── constants/     # App-wide constants
│   ├── models/        # Data models (Subject, Book, AppUser)
│   ├── providers/     # Riverpod state providers
│   ├── router/        # GoRouter navigation
│   ├── services/      # Firebase, Gemini AI services
│   └── theme/         # AppTheme, AppColors
├── features/
│   ├── admin/         # Admin panel (book & section management)
│   ├── auth/          # Login & Signup screens
│   ├── exam/          # Exam Hub screen
│   ├── home/          # Dashboard / Home screen
│   ├── library/       # Subject library & detail screens
│   ├── neural_lab/    # Gemini AI chat screen
│   ├── practical/     # Practical Vault screen
│   ├── profile/       # Profile & Settings screen
│   └── study/         # Book/PDF viewer
├── ui/
│   └── widgets/       # Shared reusable widgets
├── firebase_options.dart
└── main.dart
```

**State Management**: `flutter_riverpod` with `StateNotifier` and `FutureProvider`  
**Navigation**: `go_router` with auth redirect and shell routes  
**Data**: Firebase Firestore `subjects-v2` collection (same as web app)

---

## 🛠️ Local Development Setup

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Flutter SDK | ≥ 3.24.0 | [flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install) |
| Dart SDK | ≥ 3.2.0 | Included with Flutter |
| Android Studio | Latest | [developer.android.com/studio](https://developer.android.com/studio) |
| Xcode (macOS only) | ≥ 15 | Mac App Store |
| Git | Any | [git-scm.com](https://git-scm.com) |

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/JoeJiJa/dr-astro-flutter.git
cd dr-astro-flutter

# Install Flutter dependencies
flutter pub get

# Verify your environment
flutter doctor -v
```

### Run on Mobile Simulator

```bash
# List available devices
flutter devices

# Android — start emulator first via Android Studio, then:
flutter run -d android

# iOS (macOS only)
open -a Simulator
flutter run -d ios
```

### Run on Desktop

```bash
# Windows
flutter run -d windows

# macOS
flutter run -d macos

# Linux
flutter run -d linux
```

### Run on Web (development)

```bash
flutter run -d chrome
```

---

## 📦 Production Build Commands

### Android APK

```bash
# Build split APKs (recommended — smaller per-device)
flutter build apk --release --split-per-abi

# Build universal APK (works on all devices)
flutter build apk --release

# APK output location:
# build/app/outputs/apk/release/app-arm64-v8a-release.apk
# build/app/outputs/apk/release/app-release.apk
```

### Android App Bundle (for Google Play)

```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS (for App Store)

```bash
# Build IPA (requires macOS + Xcode + Apple Developer account)
flutter build ipa --release

# Then open Xcode to upload to App Store Connect:
open ios/Runner.xcworkspace
```

### Windows (MSIX Installer)

```bash
# Install msix package first
dart pub add msix --dev

# Build Windows executable
flutter build windows --release

# Create MSIX package (requires msix configuration in pubspec.yaml)
flutter pub run msix:create
# Output: build/windows/x64/runner/Release/dr_astro.msix
```

### macOS (DMG)

```bash
flutter build macos --release
# Output: build/macos/Build/Products/Release/Dr. Astro.app
# Package as DMG using: hdiutil create -volname "Dr. Astro" ...
```

### Linux (AppImage/Snap)

```bash
flutter build linux --release
# Output: build/linux/x64/release/bundle/dr_astro
# Wrap with appimage-builder or snapcraft
```

---

## 🔄 Version Control & Branching Strategy

```
main         ← Production branch. Protected. Auto-builds APK on every push.
│
├── develop  ← Integration branch for features
│   ├── feature/neural-lab-v2
│   ├── feature/offline-mode
│   └── fix/firebase-auth-bug
│
└── release/1.x  ← Release preparation branches
```

### Branch Protection Rules
- `main`: Requires 1 PR review, CI must pass
- `develop`: Feature branches merge here via PR

### Release Process
```bash
# Create a new release tag
git tag -a v1.2.0 -m "Release v1.2.0 — New feature XYZ"
git push origin v1.2.0

# GitHub Actions will automatically:
# 1. Build Android APK + Windows
# 2. Create GitHub Release with download links
```

### Commit Convention
```
feat: Add offline reading mode
fix: Firebase auth token refresh
docs: Update setup instructions
style: Improve dark mode colors
refactor: Extract book card widget
chore: Upgrade Flutter to 3.24
```

---

## 🔥 Firebase Setup (Custom Deployment)

If you want to connect to your own Firebase project:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore** in production mode
4. Add your Android app (package: `com.yourdomain.app`)
5. Download `google-services.json` → place in `android/app/`
6. Run `flutterfire configure` to update `lib/firebase_options.dart`

### Firestore Data Structure
```
subjects-v2/ {subjectId} → {
  name, icon, color, years,
  materials: {
    textbooks: [...books],
    studyMaterials: [...books],
    clinicalBooks: [...books],
    questionBank: [...books],
    ...
  },
  examSections: [...sections],
  practicalSections: [...sections]
}

users/ {userId} → {
  name, email, role, joinedAt,
  favorites: [...bookIds],
  recentlyViewed: [...bookIds],
  streak, totalXP
}
```

---

## 👤 Admin Access

Users with these emails are automatically granted admin access:
- `joejijaburaq2005@gmail.com`

Admins can:
- ✅ Add/Edit/Delete books in any subject category
- ✅ Add/Rename/Remove exam and practical sections
- ✅ View all registered users
- ✅ Access the Admin Panel via Profile → Admin Panel

---

## 🌐 Web App

The web version of Dr. Astro is built with **Next.js + Firebase** and is separate from this Flutter app. Both share the same Firebase backend (`drastroapp` project).

- Web App: [dr-astro.vercel.app](https://dr-astro.vercel.app)
- Web Repo: [JoeJiJa/dr-astro-mobile](https://github.com/JoeJiJa/dr-astro-mobile)

---

## 📜 License

```
MIT License

Copyright (c) 2024 Dr. Astro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "feat: Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ for MBBS students by Dr. Astro Team
</p>

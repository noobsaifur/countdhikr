# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Bun installed - [install Bun](https://bun.sh/docs/installation)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
bun install

# Step 4: Start the development server with auto-reloading and an instant preview.
bun run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Bun 1.3.4
- Vite 7.2.7
- TypeScript
- React 19.2.1
- shadcn-ui
- Tailwind CSS
- Capacitor

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Android Native Build Guide

This section provides a guide to building and running this project on Android.

### Quick Build Commands Reference

Here are the essential commands for building and running the application.

1.  **Initial Setup**
    Install all project dependencies.
    ```bash
    npm install
    ```

2.  **Build Web Assets**
    Compile the web-based code into a production-ready format.
    ```bash
    npm run build
    ```

3.  **Sync with Android Project**
    Copy the web assets into the native Android project.
    ```bash
    npx cap sync android
    ```

4.  **Build the Android App (APK)**
    This command compiles the native Android code and packages it into an `.apk` file.
    ```bash
    cd android
    ./gradlew assembleDebug
    ```

5.  **Run on Device**
    Deploy and launch the app on a connected Android device or emulator.
    ```bash
    export ANDROID_SDK_ROOT=/home/user/.androidsdkroot
    npx cap run android
    ```

### Development Diary: The Journey to a Successful Build

This section chronicles the challenges faced and the solutions discovered during the initial Android build setup.

#### The Goal
The objective was to run the existing Capacitor project on a real Android device.

#### The First Attempt & The Long Wait
The initial command, `npx cap run android`, kicked off a very long process of downloading the JDK and Gradle.

#### Frustration Point #1: The SDK Location
The build failed with the error: `SDK location not found`. The build system couldn't find the Android tools.

**Solution:**
Create a `local.properties` file inside the `android` directory and specify the path to the SDK:
```
# android/local.properties
sdk.dir=/home/user/.androidsdkroot
```

#### Frustration Point #2: `native-run` Deception
Even with a successful build, `npx cap run android` failed to deploy to the device with the error: `ERR_SDK_NOT_FOUND: No valid Android SDK root found.`. The `native-run` tool did not use the `local.properties` file.

**Solution:**
The solution was to set the `ANDROID_SDK_ROOT` environment variable for the current terminal session.
```bash
export ANDROID_SDK_ROOT=/home/user/.androidsdkroot
```
Combining this with the run command led to the final, successful deployment:
```bash
export ANDROID_SDK_ROOT=/home/user/.androidsdkroot && npx cap run android
```

#### Frustration Point #3: The `dev.nix` Environment Build Loop
The `.idx/dev.nix` file, which configures the development environment, repeatedly failed to build due to schema changes. Attempts to fix the `onStart` and `idx` blocks were unsuccessful, leading to a build loop.

**Solution:**
The solution was to bypass the environment build issues and build the Android app directly by setting the `JAVA_HOME` environment variable in the terminal.
```bash
export JAVA_HOME=/nix/store/j29aw4vdyzglbwbx7gv3bb4nn6zxwwls-openjdk-17.0.17+10/lib/openjdk && export PATH=$JAVA_HOME/bin:$PATH && cd android && ./gradlew assembleDebug
```
This allowed for successful APK builds while the environment configuration issue was being addressed.

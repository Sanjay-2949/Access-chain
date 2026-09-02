# Google Authentication Setup Guide

This guide covers the necessary steps to configure Google Authentication and Maps API for the AccessChain application.

## Prerequisites
- A Google account
- Access to Google Cloud Console (https://console.cloud.google.com)

## Step 1: Create Google Cloud Project
1. Go to Google Cloud Console.
2. Click on the project dropdown at the top of the page.
3. Click **New Project**.
4. Enter a project name (e.g., `accesschain-dev`) and click **Create**.

## Step 2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services > OAuth consent screen**.
2. Choose **External** (or Internal if using Google Workspace) and click **Create**.
3. Fill in the required fields:
   - **App name:** AccessChain
   - **User support email:** Your email
   - **Developer contact info:** Your email
4. Click **Save and Continue**.
5. (Optional) Add scopes `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
6. Add test users (your email) since the app is in Testing mode.
7. Click **Save and Continue** until complete.

## Step 3: Create OAuth 2.0 Client ID (Web Application)
1. Navigate to **APIs & Services > Credentials**.
2. Click **Create Credentials** and select **OAuth client ID**.
3. Application type: **Web application**.
4. Name: `AccessChain Web Client`.
5. **Authorized JavaScript origins:**
   - Add `http://localhost:3000`
6. **Authorized redirect URIs:** (if needed)
   - Add `http://localhost:3000/api/auth/callback/google`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

## Step 4: Enable Maps APIs
1. Navigate to **APIs & Services > Library**.
2. Search for and enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Places API (New)**

## Step 5: Create Maps API Key
1. Navigate to **APIs & Services > Credentials**.
2. Click **Create Credentials > API key**.
3. In the dialog, copy the generated API Key.
4. Click **Edit API Key** to add restrictions:
   - Under **Application restrictions**, select **HTTP referrers (web sites)** and add `http://localhost:3000/*`.
   - Under **API restrictions**, select **Restrict key** and choose the Maps and Places APIs you just enabled.
5. Click **Save**.

## Step 6: Configure Environment Variables
1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Paste your copied credentials into the file:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
   ```

## Step 7: Run and Test
1. Start the application:
   ```bash
   npm run dev
   ```
2. Navigate to the app in your browser and try logging in using Google Authentication. Ensure that the Maps components render correctly.

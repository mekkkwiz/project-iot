# Bin Map

This is a web application that shows the locations and statuses of waste bins on a Google Map.

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- Firebase account and a project set up with Realtime Database

### Installing

1. Clone the repository and navigate to the project directory.

    ```bash
    git clone https://github.com/your-username/bin-map.git
    cd bin-map
    ```

2. Install the required packages using NPM.

    ```bash
    npm install
    ```

3. Set up your Firebase credentials by creating a file named firebase-adminsdk.json in the pages/api directory with the following contents:

    ```json
    {
        "type": "service_account",
        "project_id": "YOUR_PROJECT_ID",
        "private_key_id": "YOUR_PRIVATE_KEY_ID",
        "private_key": "YOUR_PRIVATE_KEY",
        "client_email": "YOUR_CLIENT_EMAIL",
        "client_id": "YOUR_CLIENT_ID",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/ YOUR_CLIENT_EMAIL"
    }
    ```

    Replace YOUR_PROJECT_ID, YOUR_PRIVATE_KEY_ID, YOUR_PRIVATE_KEY, YOUR_CLIENT_EMAIL, and YOUR_CLIENT_ID with your own Firebase project credentials.

4. Set up your Google Maps API key by creating a .env file in the root directory with the following contents:

    ```.env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
    ```

    Replace YOUR_API_KEY with your own Google Maps API key.

### Running

1. Start the development server.

    ```bash
    npm run dev
    ```

2. Open your web browser and navigate to <http://localhost:3000>.

### Usage

The web application shows a Google Map with markers for each bin location. The markers are colored red if the bin is full and green if the bin is not full.

You can click on the logo in the top left corner to go back to the homepage. You can also click on the "About" or "Contact" links in the top right corner to navigate to the respective pages.

## Built With

- Next.js - React framework for server-side rendering
- React Google Maps API - React components for Google Maps
- Firebase Realtime Database - Cloud-hosted NoSQL database
- TypeScript - Superset of JavaScript with static typing

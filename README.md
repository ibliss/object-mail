# Email Viewer

A simple React application to view emails stored in an Amazon S3 bucket.

## Prerequisites

- Node.js installed on your local machine
- AWS account with access to an S3 bucket containing email objects

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/ibliss/object-mail.git
   cd email-viewer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure AWS credentials:
   - Open `src/config.js`
   - Replace the placeholder values with your AWS credentials and S3 bucket details

4. Run the application:
   ```
   npm start
   ```

   The app will run locally at `http://localhost:3000`.

## Security Note

This application stores AWS credentials in the frontend, which is not recommended for production use. Ensure that you're using this application only in a secure, local environment.

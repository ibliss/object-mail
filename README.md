# Email Viewer

A simple React application to view emails stored in an Amazon S3 bucket.

## Prerequisites

- Node.js installed on your local machine
- AWS account with access to an S3 bucket containing email objects

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/ibliss/object-mail.git
   cd object-mail
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure AWS credentials:
   - Create a `.env` file in the root directory
   - Add the following environment variables:
     ```
     REACT_APP_AWS_REGION=your-aws-region
     REACT_APP_AWS_ACCESS_KEY_ID=your-access-key-id
     REACT_APP_AWS_SECRET_ACCESS_KEY=your-secret-access-key
     REACT_APP_S3_BUCKET=your-bucket-name
     ```
   - Replace the placeholder values with your AWS credentials and S3 bucket details:
     - `your-aws-region`: The AWS region where your S3 bucket is located (e.g., us-east-1)
     - `your-access-key-id`: Your AWS IAM user access key ID
     - `your-secret-access-key`: Your AWS IAM user secret access key
     - `your-bucket-name`: The name of your S3 bucket containing the email objects

4. Run the application:
   ```
   npm start
   ```

   The app will run locally at `http://localhost:3000`.

## Security Note

This application stores AWS credentials in the frontend, which is not recommended for production use. Ensure that you're using this application only in a secure, local environment.

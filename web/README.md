## Run on Docker

Build the application using following command (it takes 5-10 minutes for this step):
`docker build -t webvault .`

Post building, run the application using the following command:
`docker run -d -p 80:80 web`

Go to `http://localhost`. You should see the login page.

## Setup nginx

Install nginx. Modify the downstream backend endpoint and local IP in nginx.local.conf file.
Run the following command:
`nginx -c $PWD/nginx.local.conf -g "daemon off;"`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

Close this window and open http://localhost:8080 for getting the correct application. (This will be fixed soon.)

The page will reload when you make changes.\
You may also see any lint errors in the console.
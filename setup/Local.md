# Setup locally
Apart from a working python (3+) and nodejs (1.18+) environmentm you will need a running postgres & redis server.

## Backend

Install python dependencies (root directory)
```
pip install -r requirements.txt
```

Setup local environments variables for the python server to pickup
```
export POSTGRES_HOST=<database_host>
export POSTGRES_USER=<database_user>
export POSTGRES_DB=<database_name>
export POSTGRES_PASSWORD=<database_password>
export CACHE_BACKEND=redis
export CELERY_BROKER_URL=redis://<redis_host>:6379/0
export CELERY_RESULT_BACKEND=redis://<redis_host>:6379/0
```

Run migrations
```
python manage.py migrate
```

Start server (on port 8080)
```
python manage.py runserver 0.0.0.0:8080
```


## Web
Go to the web directory
```
cd web
```
Install NodeJs dependencies (root directory)
```
npm install
```

Start Node Server
```
npm start
```

In a separate window, start nginx process (accepts on port 80)
```
nginx -c $PWD/nginx.local.conf -g "daemon off;"
```

Go to [http://localhost](http://localhost:80) to access the portal. 
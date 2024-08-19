module.exports = {
    apps: [
      {
        name: 'INPRENET', 
        script: 'main.js', 
        instances: '3', 
        exec_mode: 'cluster',
        log_date_format: 'DD-MM-YYYY HH:mm Z',
        env: {
            NODE_ENV: 'development',
            DB_PORT:1522,
            DB_USERNAME:'INPRENET',
            DB_PASSWORD:'Cide2025',
            BACKEND_HOST:'http://10.100.0.84',
	          JWT_SECRET:87654321,
            CONNECT_STRING:'10.100.0.13:1522/INPRENET'
          },
          env_production: {
            NODE_ENV: 'production',
            BACKEND_HOST:'http://10.100.0.84',
            DB_PORT:1522,
            DB_USERNAME:'INPRENET',
            DB_PASSWORD:'Cide2025',
            JWT_SECRET:87654321,
            CONNECT_STRING:'10.100.0.13:1522/INPRENET'
        },
      },
    ],
  };

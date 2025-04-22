# User-Group API

A RESTful API to manage users and groups, built with Node.js, Express, TypeScript, and MySQL.

## Setup Instructions

### Prerequisites

- Node.js: v22.14.0
- MySQL: 8.0.41 (Windows)
- npm: 8.19.2
- Typescript: 5.8.2
- Jest: 29.7.0

### Databese setup
create .env file
    MYSQL_HOST='[]'
    MYSQL_USER='[]'
    MYSQL_PSW='[]'
    MYSQL_DB='[]'
    MYSQL_PORT=[]

npm run
    build: "tsc",
    test: "jest",
    start: "ts-node-dev src/index.ts"

all requests:
    restcall.rest

### Clone the repository

```bash
git clone https://github.com/davideOddi/user_group_apis.git

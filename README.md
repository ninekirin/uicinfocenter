# UIC Information Center

## Introduction

At UIC, accessing essential information for academic pursuits, such as course timetables, classroom availability, professor consultation hours, and administrative office locations, proves challenging due to the disparate nature of data spread across various sources like websites, emails, and online forms. This fragmented information poses a significant inconvenience, particularly for incoming freshmen.

This project employed a comprehensive data crawling and management system to address the scattered and inconvenient information access for the UIC community. The system integrates natural language query capabilities to create an intelligent, user-friendly platform. It begins by crawling and categorizing campus-related data into structured and unstructured forms. Users can also upload documents to expand the knowledge base, enabling the intelligent chatbot, ChatUIC, to acquire new information.

For unstructured data, the system uses Retrieval-Augmented Generation (RAG) technology. Data is segmented and stored in a vector database for efficient retrieval; when a query is submitted, the system matches it with relevant segments, which are then processed by an LLM to generate responses.
Structured data, such as faculty information and course materials, can be imported from the UIC website or uploaded by users in formats like Excel or PDF stored in a relational database. Using LangChain, the system employs a Text-to-SQL agent to analyse user queries semantically and generate SQL statements. Carefully designed prompts help the LLM understand the database schema and relationships, ensuring precise retrieval of structured data.

The final system integrates the intelligent chatbot, ChatUIC, into a web platform, offering faculty and students an intuitive interface for seamless access to campus information. By combining advanced LLM-based data processing with powerful agent-based workflows, the project highlights significant advancements in chatbot and information retrieval technologies.

## Docker Compose for UIC Information Center

This repository contains the Docker Compose file for the UIC Information Center.

### Debug

Please rename the `.env` file to `.env.prod` as example to avoid the environment variables going to effect the development environment.

### Deployment

1. Clone the repository

```bash
git clone https://github.com/ninekirin/uicinfocenter.git
```

2. Change the `.env` file

```bash
cd uicinfocenter/src
cp .env.example .env
```

3. Build the Docker images

```bash
docker-compose build
```

4. Run the Docker containers

```bash
docker-compose up -d
```

5. Open the browser and go to `http://localhost:7788` to see the UIC Information Center.

- If you want to run the application on a different port, you can change the `.env` file.

- If you want to run the application on port 80 and 443, you can set up a reverse proxy using Caddy, Nginx or Traefik.

### Deployment on HomeLab

For home lab deployment, you need to perform an extra step.

You need to change the permissions of the `init.sql` file.

```bash
cd uicinfocenter/src
chmod a+r ./mariadb/init.sql
```

### Stopping the Containers

To stop the containers, run the following command:

```bash
docker-compose down
```

### Updating the Containers

To update the containers, run the following command:

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup and Restore

To backup the MariaDB database, run the following command:

```bash
docker exec -it deadbeef mysqldump -u root --password=$MYSQL_ROOT_PASSWORD uicinfocenter > uicinfocenter.sql
```

To restore the MariaDB database, run the following command:

```bash
docker exec -i deadbeef mysql -u root --password=$MYSQL_ROOT_PASSWORD uicinfocenter < uicinfocenter.sql
```

## License

This project is licensed under the MIT License.
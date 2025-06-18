import { SqlDatabase } from "langchain/sql_db"
import { DataSource } from "typeorm"

import dotenv from 'dotenv'
dotenv.config()

const datasource = new DataSource({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    host: "localhost",
    entities: [],
});

try {
    const db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource, });
    const clients = await db.run("SELECT * FROM clientes LIMIT 10;");
    console.log('clients', clients);
} catch (error) {
    console.log('error connecting to db')
    console.log(error)
}

require('dotenv').config();

const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool, Client } = require('pg');

const colors = require('./data.js').colors;

const typeDefs = gql`
    type Query {
        hello: String,
        colors: [Color],
        color(category: String): [Color],
        employees: [Employee],
    }

    type Color {
        color: String,
        category: String,
        code: ColorCode
    }

    type ColorCode {
        rgba: [Int],
        hex: String
    }

    type Employee {
        employee_id: Int,
        last_name: String,
        first_name: String,
        title: String,
        title_of_courtesy: String,
        birth_date: String,
        hire_date: String,
        address: String,
        city: String,
        region: String,
        postal_code: Int,
        country: String,
        home_phone: String,
        extension: Int,
        notes: String,
        reports_to: Int,
        photo_path: String
    }    
`;

const resolvers = {
    Query: {
        hello: () => 'Hello, World!',
        colors: () => colors,
        color: (parent, args, context, info) => (
            colors.filter(c => c.category === args.category)
        ),
        employees: async () => {
            var data = await pool.query('SELECT * FROM employees');
            return data.rows;
        }
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: 'postgres',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

app.get('/employees', async (req, res) => {
    var data = await pool.query('SELECT * FROM employees');
    res.json(data.rows);
})

app.listen({ port: 3000 }, () => {
    console.log(`server listening on http://localhost:3000${server.graphqlPath}`);
})
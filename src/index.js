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
        employee(employee_id: Int): Employee
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
        reports_to: Employee
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
            var data = await pool.query(`
            select 
                json_build_object(
                    \'employee_id\', e1.employee_id,
                    \'first_name\', e1.first_name, 
                    \'last_name\', e1.last_name, 
                    \'title\', e1.title,
                    \'reports_to\', json_build_object(
                        \'employee_id\', e2.employee_id,
                        \'first_name\', e2.first_name,
                        \'last_name\', e2.last_name,
                        \'title\', e2.title
                    )
                )
            from employees e1
            inner join employees e2 on e1.reports_to = e2.employee_id`);
            data = data.rows.map(r => r.json_build_object);
            return data;
        },
        employee: async (parent, args, context, info) => {
            var data = await pool.query(`SELECT * FROM employees WHERE employee_id = ${args.employee_id}`);
            return data.rows[0];
        },
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
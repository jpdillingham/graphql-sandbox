const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const colors = require('./data.js').colors;

const typeDefs = gql`
    type Query {
        hello: String,
        colors: [Color],
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
`;

const resolvers = {
    Query: {
        hello: () => 'Hello, World!',
        colors: () => colors,
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 3000 }, () => {
    console.log(`server listening on http://localhost:3000${server.graphqlPath}`);
})
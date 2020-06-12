import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloLink } from 'apollo-link';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import gql from 'graphql-tag';
import { GraphQLScalarType, Kind } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';



// GraphQL Schema definition.
const typeDefs = gql`
  type timeclock_shifts_view {
    id: Int!
    date_start: date
    date_stop: date
  }
  scalar date
`;

const resolvers = {
  // example of scalar type, which will parse the string into a custom class CustomDate which receives a Date object
  date: new GraphQLScalarType({
    name: 'timestamp',
    serialize: (parsed: Date | null) => parsed && parsed.toISOString(),
    parseValue: (raw: any) => raw && new Date(raw),
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    }
  })
};

// GraphQL Schema, required to use the link
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const uri = '/v1/graphql';

export function createApollo(httpLink: HttpLink) {
  const basic = setContext((operation, context) => ({
    headers: {
      Accept: 'charset=utf-8'
    }
  }));

  const auth = setContext((operation, context) => {
    const token = localStorage.getItem('token');
    if (token == null) {
      return {};
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };
  });

  const link = ApolloLink.from([basic, auth, httpLink.create({ uri })]);
  const cache = new InMemoryCache();

  return { link, cache };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}

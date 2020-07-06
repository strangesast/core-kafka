import { NgModule } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { split, ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import gql from 'graphql-tag';
import { GraphQLScalarType, Kind } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { DateResolver } from 'graphql-scalars';



// GraphQL Schema definition.
const typeDefs = gql`
  type timeclock_shifts_view {
    id: Int!
    date_start: timestamp
    date_stop: timestamp
  }
  scalar Date
  scalar timestamp
`;

const resolvers = {
  // example of scalar type, which will parse the string into a custom class CustomDate which receives a Date object
  timestamp: new GraphQLScalarType({
    name: 'timestamp',
    serialize: (parsed: Date | null) => parsed && parsed.toISOString(),
    parseValue: (raw: any) => raw && new Date(raw),
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    }
  }),
  Date: DateResolver
};

/*
const resolvers = {
  Date: DateResolver,
};
*/


// GraphQL Schema, required to use the link
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const uri = '/v1/graphql';

export function createApollo(httpLink: HttpLink) {

  const headers = new HttpHeaders();
  headers.append('Accept', 'charset=utf-8');
  const token = localStorage.getItem('token');
  const authorization = token ? `Bearer ${token}` : null;
  headers.append('Authorization', authorization);

  const http = httpLink.create({ uri, headers });

  const client = new SubscriptionClient(`ws://${window.location.host}${uri}`, { reconnect: true });
  const ws = new WebSocketLink(client);

  const link = split(
    ({query}) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    ws,
    http
  );
  const cache = new InMemoryCache();

  return { link, cache, resolvers, typeDefs };
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

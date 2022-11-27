export const typeDefs = `#graphql
  type Car {
    bibId: String
  }

  type Track {
    id: String
    nextCar: Car!
    runningCars: [Car]
  }

  type Query {
    currentTracks: [Track],
  }
`;

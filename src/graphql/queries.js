/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getBatteryData = /* GraphQL */ `
  query GetBatteryData($TagID: Int!, $Timestamp: Int!) {
    getBatteryData(TagID: $TagID, Timestamp: $Timestamp) {
      TagID
      Timestamp
      UserID
      __typename
    }
  }
`;
export const listBatteryData = /* GraphQL */ `
  query ListBatteryData(
    $filter: TableBatteryDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBatteryData(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        TagID
        Timestamp
        UserID
        __typename
      }
      nextToken
      __typename
    }
  }
`;

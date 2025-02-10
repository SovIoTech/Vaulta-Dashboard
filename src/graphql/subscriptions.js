/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateBatteryData = /* GraphQL */ `
  subscription OnCreateBatteryData(
    $TagID: Int
    $Timestamp: Int
    $UserID: String
  ) {
    onCreateBatteryData(TagID: $TagID, Timestamp: $Timestamp, UserID: $UserID) {
      TagID
      Timestamp
      UserID
      __typename
    }
  }
`;
export const onUpdateBatteryData = /* GraphQL */ `
  subscription OnUpdateBatteryData(
    $TagID: Int
    $Timestamp: Int
    $UserID: String
  ) {
    onUpdateBatteryData(TagID: $TagID, Timestamp: $Timestamp, UserID: $UserID) {
      TagID
      Timestamp
      UserID
      __typename
    }
  }
`;
export const onDeleteBatteryData = /* GraphQL */ `
  subscription OnDeleteBatteryData(
    $TagID: Int
    $Timestamp: Int
    $UserID: String
  ) {
    onDeleteBatteryData(TagID: $TagID, Timestamp: $Timestamp, UserID: $UserID) {
      TagID
      Timestamp
      UserID
      __typename
    }
  }
`;

import React from "react";
import { LoadRemoteMfe } from "./LoadRemoteMfe";

export const IksComp = (props) => (
  <LoadRemoteMfe
    url={"http://localhost:3002/remoteEntry.js"}
    scope="ItemKeywordSearch"
    module="./ItemSearchUIWithStore"
    compProps={props}
    mfeName="item-lookup"
    // loader="Please wait while Loading... " // optional
    // ErrorComponent={() => <ErrorComponent />} // optional
    // LoaderComponent={() => <LoaderComponent />} // optional
    appName={"showroom"} // optional
  />
);

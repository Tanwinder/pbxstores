import React from "react";
import { LoadRemoteMfe } from "./LoadRemoteMfe";

export const IksComp = (props) => (
  <LoadRemoteMfe
    url={"http://localhost:3002/remoteEntry.js"}
    scope="ItemKeywordSearch"
    module="./ItemSearchUIWithStore"
    compProps={props}
    mfeName="item-lookup"
    // fallbackUrl="https://carbon.6332.lowes.com/omnia/item-keyword-search/remoteEntry.js" // optional
    // loader="Please wait while Loading... " // optional
    // ErrorComponent={() => <ErrorComponent />} // optional
    // LoaderComponent={() => <LoaderComponent />} // optional
    appName={"showroom"} // optional
  />
);

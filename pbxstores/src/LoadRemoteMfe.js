import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const LoadRemoteMfePackages = {
  react: {
    // eslint-disable-next-line global-require

    // eslint-disable-next-line global-require
    [require("react/package.json").version]: {
      // eslint-disable-next-line global-require

      get: () => new Promise((res) => res(() => require("react"))),

      loaded: true,

      from: "webpack4",
    },
  },

  "react-dom": {
    // eslint-disable-next-line global-require

    [require("react-dom/package.json").version]: {
      // eslint-disable-next-line global-require

      get: () => new Promise((res) => res(() => require("react-dom"))),

      loaded: true,

      from: "webpack4",
    },
  },

  "react-router-dom": {
    // eslint-disable-next-line global-require

    [require("react-router-dom/package.json").version]: {
      // eslint-disable-next-line global-require

      get: () => new Promise((res) => res(() => require("react-router-dom"))),

      loaded: true,

      from: "webpack4",
    },
  },
};

function useScript(src) {
  const [status, setStatus] = useState(
    src
      ? document
          .querySelector(`script[src="${src}"]`)
          ?.getAttribute("data-status") ?? "loading"
      : "idle"
  );

  useEffect(
    () => {
      if (!src) {
        setStatus("idle");
        return undefined;
      }

      // Fetch existing script element by src
      // It may have been added by another instance of this hook
      let script = document.querySelector(`script[src="${src}"]`);

      if (!script) {
        // Create script
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.setAttribute("data-status", "loading");
        // Add script to document body
        document.body.appendChild(script);

        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event) => {
          /* istanbul ignore next */ // Typescript barks if this isn't optionally chained, but the accurate type excludes null since script will ALWAYS be defined here, so opting to ignore in test coverage
          script?.setAttribute(
            "data-status",
            event.type === "load" ? "ready" : "error"
          );
        };

        script.addEventListener("load", setAttributeFromEvent);
        script.addEventListener("error", setAttributeFromEvent);
      } else {
        // Grab the existing script status from its data-attribute and set to state if it exists,
        // otherwise assume this script has been loaded correctly elsewhere
        setStatus(script.getAttribute("data-status") ?? "ready");
      }

      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event) => {
        setStatus(event.type === "load" ? "ready" : "error");
      };

      // Add event listeners
      script.addEventListener("load", setStateFromEvent);
      script.addEventListener("error", setStateFromEvent);

      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent);
          script.removeEventListener("error", setStateFromEvent);
        }
      };
    },
    [src] // Only re-run effect if script src changes
  );

  return status;
}

const initializedScopes = {};

let startTime = new Date();

const Loader = ({ LoaderComponent, loaderText, styles }) => {
  if (LoaderComponent) {
    return <LoaderComponent />;
  }

  if (loaderText) {
    return <div>loader.....</div>;
  }

  return <h2>Loading...</h2>;
};

Loader.propTypes = {
  LoaderComponent: PropTypes.elementType,
  loaderText: PropTypes.string,
};

const LoadRemoteMfe = ({
  url,
  scope,
  module: moduleName,
  compProps,
  packages,
  loader,
  onError,
  mfeName: mfeNameProp,
  LoaderComponent,
  ErrorComponent,
  initialLoadForLazyLoading,
  styles,
}) => {
  const remoteEntryUrl = url?.trim();
  const scriptStatus = useScript(remoteEntryUrl);
  const [Component, setComponent] = useState(null);
  const moduleNameMem = useMemo(() => {
    if (moduleName.match(/^\.\//)) {
      return moduleName;
    }
    return `./${moduleName}`;
  }, [moduleName]);

  const legacyShareScope = useMemo(
    () => ({
      ...LoadRemoteMfePackages,
      ...(packages || {}),
    }),
    [packages]
  );

  useEffect(() => {
    const Comp = lazy(
      () =>
        new Promise((resolve) => {
          const moduleResolve = resolve;
          new Promise((res) => {
            /**
             * to fix container already initialized issue.
             */
            if (!initializedScopes[scope]) {
              initializedScopes[scope] = legacyShareScope;
              window[scope].init(initializedScopes[scope]);
            }
            res(1);
          }).then(() => {
            window[scope].get(moduleNameMem).then((factory) => {
              moduleResolve(factory());
            });
          });
        })
    );
    setComponent(Comp);
  }, [remoteEntryUrl, moduleNameMem, scope, packages, legacyShareScope]);

  if (scriptStatus === "error") {
    if (onError) {
      onError();
      return null;
    }

    if (ErrorComponent) {
      return <ErrorComponent />;
    }

    /* TODO - This seems like an odd message to show our associates, but keeping
    here in case other logic relies on it or they expect to report this specific
    error message; ideally it should be an Alert component with a curated message */
    return <h2>Failed to load dynamic script: {remoteEntryUrl}</h2>;
  }

  if (scriptStatus !== "ready") {
    return (
      <Loader
        LoaderComponent={LoaderComponent}
        loaderText={loader}
        styles={styles}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <Loader
          LoaderComponent={LoaderComponent}
          loaderText={loader}
          styles={styles}
        />
      }
    >
      <Component
        {...compProps}
        initialLoadForLazyLoading={initialLoadForLazyLoading}
        startTime={startTime}
        endTime={new Date()}
      />
    </Suspense>
  );
};

LoadRemoteMfe.propTypes = {
  url: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  module: PropTypes.string.isRequired,
  mfeName: PropTypes.string.isRequired,
  compProps: PropTypes.object,
  packages: PropTypes.object,
  loader: PropTypes.string,
  onError: PropTypes.func,
  initialLoadForLazyLoading: PropTypes.bool,
  ErrorComponent: PropTypes.element,
  styles: PropTypes.any,
};

LoadRemoteMfe.defaultProps = {
  compProps: {},
  initialLoadForLazyLoading: false,
  loader: "",
  onError: null,
  ErrorComponent: null,
};

export { LoadRemoteMfe };
export default LoadRemoteMfe;

import { App } from "./app/app";
import { createRoot } from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

class DinoconfigBuilder extends HTMLElement {
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });

    const cache = createCache({
      key: "mui",
      container: shadowRoot,
    });

    const root = createRoot(shadowRoot);

    root.render(
      <CacheProvider value={cache}>
        <App />
      </CacheProvider>
    );

    console.log("DinoconfigBuilder mounted");
  }
}

customElements.define('dinoconfig-builder', DinoconfigBuilder);
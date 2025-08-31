import { App } from "./app/app";
import { createRoot } from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

class DinoconfigBuilder extends HTMLElement {
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });


    // Tell MUI/Emotion to inject styles into shadowRoot
    const cache = createCache({
      key: "mui",
      container: shadowRoot, // 👈 inject styles into shadowRoot
    });

    const root = createRoot(shadowRoot);

    root.render(
      <CacheProvider value={cache}>
        <App shadowRoot={shadowRoot} />
      </CacheProvider>
    );

    console.log("DinoconfigBuilder mounted");
  }
}

customElements.define('dinoconfig-builder', DinoconfigBuilder);
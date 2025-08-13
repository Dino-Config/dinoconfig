import { App } from './app/app';
import { createRoot } from "react-dom/client";

class DinoconfigBuilder extends HTMLElement {
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });

    // Inject Bootstrap CSS
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css');
    shadowRoot.appendChild(linkElem);

    // Create React mount point
    const mountPoint = document.createElement('span');
    shadowRoot.appendChild(mountPoint);

    const root = createRoot(mountPoint);
    root.render(<App />);
  }
}
customElements.define('dinoconfig-builder', DinoconfigBuilder);
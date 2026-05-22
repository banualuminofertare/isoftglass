// Patch DOM methods to prevent crashes from browser extensions
// (Google Translate, Grammarly, ad blockers) that modify text nodes
// while React tries to reconcile the DOM tree.
if (typeof Node !== 'undefined') {
  const origRemoveChild = Node.prototype.removeChild;
  // @ts-ignore
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (console && console.warn) {
        console.warn('removeChild: node not a child — likely a browser extension conflict', child);
      }
      return child;
    }
    // @ts-ignore
    return origRemoveChild.apply(this, arguments) as T;
  };

  const origInsertBefore = Node.prototype.insertBefore;
  // @ts-ignore
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
    if (refNode && refNode.parentNode !== this) {
      if (console && console.warn) {
        console.warn('insertBefore: ref node not a child — likely a browser extension conflict', refNode);
      }
      return newNode;
    }
    // @ts-ignore
    return origInsertBefore.apply(this, arguments) as T;
  };
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);

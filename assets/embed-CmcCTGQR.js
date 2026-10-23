import{n as e}from"./rolldown-runtime-C0FnF6B9.js";var t,n,r,i;function a(){return(a=e((()=>{t=`cheminfo:embed-height`,n=`cheminfo:embed-expand`,r=`cheminfo:embed-measure`,i=`cheminfo:embed-collapse`})))()}function o(e,n={}){if(e==null)return()=>void 0;let r=n.target??l();if(r===void 0)return()=>void 0;let i=-1,a=n=>{let a=Math.ceil(e.getBoundingClientRect().height);a===i&&!n||(i=a,r.postMessage({type:t,height:a},`*`))};a(!1);let o=l(),s=n.messages??d(),c=e=>{let{source:t,data:n}=e;(t===r||o!==void 0&&t===o)&&u(n)&&a(!0)};s?.addEventListener(`message`,c);let p=n.ResizeObserver??f(),m=p===void 0?void 0:new p(()=>a(!1));return m?.observe(e),()=>{m?.disconnect(),s?.removeEventListener(`message`,c)}}function s(){return l()!==void 0}function c(e=l()){e?.postMessage({type:n},`*`)}function l(){let{parent:e}=globalThis;return e===void 0||e===globalThis?void 0:e}function u(e){return typeof e==`object`&&!!e&&e.type===`cheminfo:embed-measure`}function d(){let e=globalThis;return typeof e.addEventListener==`function`&&typeof e.removeEventListener==`function`?e:void 0}function f(){return globalThis.ResizeObserver}function p(){return(p=e((()=>{a()})))()}function m(e=globalThis){let{history:t,location:n}=e;if(e.origin!==`null`||t===void 0||n===void 0||_.has(t))return;_.add(t);let r=t.pushState.bind(t),i=t.replaceState.bind(t);t.pushState=(e,t,i)=>{h(()=>r(e,t,i),i,e=>n.assign(e))},t.replaceState=(e,t,r)=>{h(()=>i(e,t,r),r,e=>n.replace(e))}}function h(e,t,n){try{e()}catch(e){if(t==null||!g(e))throw e;n(String(t))}}function g(e){return typeof e==`object`&&!!e&&e.name===`SecurityError`}var _;function v(){return(v=e((()=>{_=new WeakSet})))()}function y(e,t){let n=b(e);return t?`{\n${n}\n${x(e)}\n}`:`{\n${n}\n}\nimportScripts(${JSON.stringify(e)});`}function b(e){return`const base = ${JSON.stringify(e)};
const rebase = (url) => {
  if (typeof url !== 'string') return url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
};
const nativeFetch = globalThis.fetch;
globalThis.fetch = (input, init) => nativeFetch(rebase(input), init);
if (typeof XMLHttpRequest === 'function') {
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    return nativeOpen.call(this, method, rebase(url), ...rest);
  };
}
const nativeImportScripts = globalThis.importScripts;
globalThis.importScripts = (...urls) => nativeImportScripts(...urls.map(rebase));`}function x(e){let t=JSON.stringify(C),n=S(`globalThis[Symbol.for(${t})]?.();`),r=S(`import ${JSON.stringify(n)};\nimport ${JSON.stringify(e)};`);return`const held = [];
const replayed = new WeakSet();
const hold = (event) => {
  if (replayed.has(event)) return;
  event.stopImmediatePropagation();
  held.push(event);
};
const replay = () => {
  const event = held.shift();
  if (event === undefined) {
    removeEventListener('message', hold);
    return;
  }
  const copy = new MessageEvent('message', { data: event.data, ports: event.ports });
  replayed.add(copy);
  dispatchEvent(copy);
  setTimeout(replay);
};
addEventListener('message', hold);
const release = Symbol.for(${t});
globalThis[release] = () => {
  delete globalThis[release];
  setTimeout(replay);
};
const wrapper = ${JSON.stringify(r)};
import(wrapper).catch((error) => {
  const failure =
    typeof error?.message === 'string' && error.message.includes(wrapper)
      ? new TypeError(error.message.replaceAll(wrapper, base))
      : error;
  setTimeout(() => {
    throw failure;
  });
});`}function S(e){return`data:text/javascript,${encodeURIComponent(e)}`}var C;function w(){return(w=e((()=>{C=`cheminfo-mcp-server/sandbox-worker`})))()}function T(e=globalThis){let t=e.Worker;if(e.origin!==`null`||t===void 0||O.has(t))return;class n extends t{constructor(t,n){let r=e.document?.baseURI??e.location?.href;super(...D(t,n,r))}}O.add(n),e.Worker=n}function E(e,t={},n){return D(e,t,n)[0]}function D(e,t,n){let r=new URL(String(e),n).href;if(r.startsWith(`data:`)||r.startsWith(`blob:`))return[r,t];let i=y(r,t?.type===`module`),a=k.get(i);return a===void 0&&(a=URL.createObjectURL(new Blob([i],{type:`text/javascript`})),k.set(i,a)),[a,{...t,type:`classic`}]}var O,k;function A(){return(A=e((()=>{w(),O=new WeakSet,k=new Map})))()}function j(e=globalThis){let{parent:t}=e;t!==void 0&&t!==e&&(T(e),m(e),M(e,t))}function M(e,t){e.addEventListener===void 0||P.has(e)||(P.add(e),e.addEventListener(`keydown`,n=>{n.key!==`Escape`||n.isComposing||(e.document?.querySelector(N)??setTimeout(()=>{n.defaultPrevented||t.postMessage({type:i},`*`)},0))},{capture:!0}))}var N,P;function F(){return(F=e((()=>{a(),v(),A(),N=`[aria-modal="true"]`,P=new WeakSet})))()}function I(e,t=globalThis){let{parent:n}=t;if(n===void 0||n===t)return t.location?.assign(e),`here`;let r=t.open?.(e,`_blank`)??null;return r===null?(c(n),`full-screen`):(r.opener=null,`window`)}function L(){return(L=e((()=>{p()})))()}function R(){return(R=e((()=>{p(),a(),F(),v(),A(),L()})))()}R();export{i as EMBED_COLLAPSE_MESSAGE,n as EMBED_EXPAND_MESSAGE,t as EMBED_HEIGHT_MESSAGE,r as EMBED_MEASURE_MESSAGE,j as installEmbedPage,m as installSandboxHistory,T as installSandboxWorkers,s as isFramed,I as openSitePage,o as reportEmbedHeight,c as requestEmbedExpand,E as workerBootstrapUrl};
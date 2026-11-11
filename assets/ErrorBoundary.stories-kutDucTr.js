import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CLJ7iDQ8.js";import{n as r,r as i}from"./toError-DY-iNW4J.js";import{n as a,t as o}from"./useT-Cg7rWZOT.js";import{n as s,t as c}from"./callout-D2nMxT79.js";import{n as l,r as u}from"./buttons-BwL58W8A.js";import{n as d,t as f}from"./nonIdealState-Gu33EjMm.js";function p(e){let{error:t,onRetry:n,title:r,retryLabel:i,className:o}=e,s=a();return(0,m.jsx)(f,{className:o,icon:`error`,title:r??s(`error.title`),description:(0,m.jsx)(`span`,{className:`error-fallback__message`,children:t.message===``?s(`error.noMessage`):t.message}),action:n===void 0?void 0:(0,m.jsx)(l,{icon:`refresh`,text:i??s(`error.tryAgain`),onClick:n})})}var m;function h(){return(h=e((()=>{u(),d(),o(),m=n(),p.__docgenInfo={description:`The default face of a failure: what happened, and a way out of it.

The message is written out rather than swallowed, because a visitor who
reports "it says nothing" cannot be helped, whereas one who reports the
sentence can.
@param props - See {@link ErrorFallbackProps}.
@returns The non-ideal state.`,methods:[],displayName:`ErrorFallback`,props:{error:{required:!0,tsType:{name:`Error`},description:`What was thrown, whose message is what the visitor is told.`},onRetry:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the visitor asks for another attempt. Left out when there is
nothing sensible to retry, and then no button is drawn.
@default undefined — no retry button`},title:{required:!1,tsType:{name:`string`},description:`First line, above the message.
@default the chrome's own line, in the language of the page`},retryLabel:{required:!1,tsType:{name:`string`},description:`Text of the retry button.
@default the chrome's own words for it, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class the holder carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}var g,_,v;function y(){return(y=e((()=>{g=t(),r(),h(),_=n(),v=class extends g.Component{static getDerivedStateFromError(e){return{error:i(e)}}constructor(e){super(e),this.state={error:null}}componentDidCatch(e,t){let{onError:n}=this.props;if(n!==void 0)try{n(i(e),t.componentStack??``)}catch{}}reset=()=>{this.setState({error:null})};render(){let{children:e,fallback:t,title:n}=this.props,{error:r}=this.state;return r===null?e:t===void 0?(0,_.jsx)(p,{error:r,title:n,onRetry:this.reset}):t(r,this.reset)}},v.__docgenInfo={description:`Keep one failing part of the page from taking the whole page with it.

A viewer that cannot start, a worker that dies, a structure that will not
parse: without a boundary any of these leaves a blank page carrying the
right title, which reads as a routing or a build defect and is neither.`,methods:[{name:`reset`,docblock:`Forget the error and render the children again.`,modifiers:[],params:[],returns:{type:{name:`void`}},description:`Forget the error and render the children again.`}],displayName:`ErrorBoundary`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The part of the page whose failures are caught here.`},fallback:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(error: Error, reset: () => void) => ReactNode`,signature:{arguments:[{type:{name:`Error`},name:`error`},{type:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},name:`reset`}],return:{name:`ReactNode`}}},description:`What is drawn in place of the children once one of them has thrown. The
reset closes the boundary again, so a retry re-renders the children.
@default a non-ideal state naming the error, with a retry button`},onError:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(error: Error, componentStack: string) => void`,signature:{arguments:[{type:{name:`Error`},name:`error`},{type:{name:`string`},name:`componentStack`}],return:{name:`void`}}},description:`Called once with the error and the stack of components it came through, so
a site can report it. Anything it throws is ignored: a failing reporter
must not replace the failure the visitor is already looking at.
@default undefined — the failure is not reported anywhere`},title:{required:!1,tsType:{name:`string`},description:`First line of the default fallback.
@default 'Something went wrong'`}}}})))()}function b(){return(0,C.jsxs)(`div`,{style:j,children:[(0,C.jsx)(`div`,{style:M,children:`Caffeine`}),(0,C.jsx)(`code`,{style:N,children:`Cn1cnc2c1c(=O)n(C)c(=O)n2C`}),(0,C.jsx)(`div`,{style:P,children:`Rendered by the viewer this boundary is watching.`})]})}function x(){throw Error(`The structure viewer could not start: WebGL is unavailable on this device.`)}function S(){}var C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{u(),s(),y(),C=n(),w=e=>(0,C.jsx)(`div`,{style:A,children:(0,C.jsx)(e,{})}),T={title:`Error/ErrorBoundary`,component:v,args:{children:(0,C.jsx)(b,{})},argTypes:{title:{control:`text`}},decorators:[w],parameters:{layout:`padded`,docs:{description:{component:`Keeps one failing part of the page — a viewer that cannot start, a structure that will not parse — from taking the whole page down with it.`}}}},E={},D={args:{children:(0,C.jsx)(x,{}),onError:S}},O={args:{children:(0,C.jsx)(x,{}),title:`The 3D viewer could not start`}},k={args:{children:(0,C.jsx)(x,{}),fallback:(e,t)=>(0,C.jsxs)(c,{intent:`warning`,icon:`warning-sign`,title:`Viewer unavailable`,children:[(0,C.jsx)(`p`,{children:e.message}),(0,C.jsx)(l,{size:`small`,icon:`refresh`,text:`Try again`,onClick:t})]})}},A={width:`min(32rem, 92vw)`,padding:`0.75rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`},j={display:`flex`,height:160,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,borderRadius:`var(--radius)`,background:`var(--surface-sunken)`,gap:6},M={fontWeight:600},N={fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:13},P={color:`var(--text-muted)`,fontSize:13},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source},description:{story:`Nothing has failed, so the boundary is invisible and draws its children.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    children: <DemoChildThatThrows />,
    onError: reportNowhere
  }
}`,...D.parameters?.docs?.source},description:{story:`The child throws on render, so what is shown is the default fallback: the
message the error carried, and a retry that re-renders the children.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    children: <DemoChildThatThrows />,
    title: 'The 3D viewer could not start'
  }
}`,...O.parameters?.docs?.source},description:{story:`The same failure under a title the page chose.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    children: <DemoChildThatThrows />,
    fallback: (error, reset) => <Callout intent="warning" icon="warning-sign" title="Viewer unavailable">
        <p>{error.message}</p>
        <Button size="small" icon="refresh" text="Try again" onClick={reset} />
      </Callout>
  }
}`,...k.parameters?.docs?.source},description:{story:`A fallback of the site's own, which is what a small panel needs when the
default non-ideal state is taller than the region it stands in for.`,...k.parameters?.docs?.description}}},F=[`Default`,`Caught`,`CaughtWithTitle`,`CustomFallback`]})))()}I();export{D as Caught,O as CaughtWithTitle,k as CustomFallback,E as Default,F as __namedExportsOrder,T as default};
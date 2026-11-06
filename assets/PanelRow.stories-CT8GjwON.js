import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CJRfpBq-.js";import{n as r,t as i}from"./SplitRow-DAfQk5Q8.js";import{i as a,n as o,r as s,t as c}from"./SidePanelStack-DbOWTYIa.js";function l(e){let{collapsed:t,view:n,panels:r,ratio:a,defaultRatio:o,onRatio:s}=e,{min:c,max:l}=e;return!t&&r!==null?(0,u.jsx)(i,{ratio:a,defaultRatio:o,onRatio:s,...c===void 0?{}:{min:c},...l===void 0?{}:{max:l},stackBelow:0,start:n,end:r}):(0,u.jsxs)(`div`,{className:`panel-row`,children:[(0,u.jsx)(`div`,{className:`panel-row__view`,children:n}),r===null?null:(0,u.jsx)(`div`,{className:`panel-row__drawer`,children:r})]})}var u;function d(){return(d=e((()=>{r(),u=n(),l.__docgenInfo={description:`The figure of an editor and the panels that drive it.

With room they sit side by side, with the splitter between them. Without
room the figure keeps the whole row, because a figure is what an editor is
for and a stack of forms left in its place is a tool nothing can be drawn in.
A panel then takes the whole row from the rail, is used, and is sent away
again, and the figure, still mounted underneath, comes back as it was. A strip
of figure left beside it would be too narrow to draw in, and would take the
room from the fields the panel was opened for.

The editor keeps to three rules this row cannot keep for it, since it is
handed what it shows and reads no store:
- **One panel at a time.** A rail press shows that panel and sends the other
  away, and the header's fold sends it away too. Several would share a height
  none of them reads at.
- **What is open in the workspace stays as it was.** The panel over the figure
  is not written to it, so a wider window finds the panels it left. The rail
  lights the panel on show rather than the panels in the workspace, or an icon
  would be lit with nothing to see and its first press would seem to do
  nothing.
- **Only somebody asking opens one.** A press on the rail or a link naming the
  panel does; a gesture on the figure that opens a panel beside it with room
  must not, or selecting an atom covers the atom.
@param props - See {@link PanelRowProps}.
@returns The split row, or the figure with the panels over it.`,methods:[],displayName:`PanelRow`,props:{collapsed:{required:!0,tsType:{name:`boolean`},description:"Whether the window has no room for the panels beside the figure, as\n`readPanelsCollapsed` and `watchPanelsCollapsed` say."},view:{required:!0,tsType:{name:`ReactNode`},description:`The figure the row is for.`},panels:{required:!0,tsType:{name:`ReactNode`},description:"The panels to show: every open one with room, and without room the one\npanel the rail asked for. `null` when there is none."}},composes:[`Pick`]}})))()}function f(e){let{collapsed:t}=e,[n,r]=(0,p.useState)([`style`]),[i,a]=(0,p.useState)(null),o=t?i===null?[]:[i]:n;function u(e){t?a(t=>t===e?null:e):r(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])}return(0,m.jsxs)(`div`,{style:h,children:[(0,m.jsx)(`div`,{style:g,children:(0,m.jsx)(l,{collapsed:t,ratio:null,defaultRatio:70,onRatio:()=>void 0,view:(0,m.jsx)(`div`,{style:v,children:`The figure`}),panels:o.length===0?null:(0,m.jsx)(`div`,{style:_,children:(0,m.jsx)(c,{panels:y,openPanelIds:o,onClose:u,children:e=>(0,m.jsx)(`p`,{style:{padding:8},children:e.title})})})})}),(0,m.jsx)(s,{panels:y,openIds:o,onToggle:u})]})}var p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{p=t(),a(),d(),o(),m=n(),h={display:`flex`,height:420,border:`1px solid var(--border)`,background:`var(--surface)`},g={display:`flex`,minWidth:0,flex:`1 1 0%`},_={display:`flex`,height:`100%`,minHeight:0,flexDirection:`column`,borderLeft:`1px solid var(--border)`,background:`var(--surface)`},v={display:`grid`,height:`100%`,placeItems:`center`,color:`var(--text-muted)`},y=[{id:`style`,icon:`style`,title:`Style`},{id:`object`,icon:`edit`,title:`Object`}],b={title:`Panels/PanelRow`,component:f,parameters:{docs:{description:{component:`The figure and its panels. With room they share the row; without room the figure keeps it, and the rail brings one panel over it.`}}}},x={args:{collapsed:!1}},S={args:{collapsed:!0}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    collapsed: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    collapsed: true
  }
}`,...S.parameters?.docs?.source}}},C=[`WithRoom`,`Collapsed`]})))()}w();export{S as Collapsed,x as WithRoom,C as __namedExportsOrder,b as default};
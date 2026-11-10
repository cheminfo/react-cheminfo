import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-l1UYYj1C.js";import{i as r,n as i,r as a,t as o}from"./useT-DIzwLqAW.js";import{E as s,O as c,n as l,t as u,w as d}from"./components-Qdo-C48M.js";import{n as f,r as p,t as ee}from"./FullscreenStage-BeBGDsmV.js";import{n as m,r as h}from"./familyTokens-DsQXXJV4.js";import{n as g,t as _}from"./SplitRow-B21ZZMI_.js";var v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{v={display:`flex`,flexDirection:`column`,flex:`1 1 1px`,minHeight:0},y={display:`flex`,borderBottom:`1px solid rgb(217 223 230)`},b={marginLeft:`auto`,display:`flex`,alignItems:`center`,padding:`0 8px`,fontSize:11,opacity:.7},x={display:`flex`,flexDirection:`column`,gap:6,padding:8,flex:`1 1 1px`,minHeight:0,overflow:`auto`},S={flex:`1 1 1px`,minHeight:0,overflow:`auto`},C={width:`100%`,borderCollapse:`collapse`,fontSize:11,fontVariantNumeric:`tabular-nums`},w={position:`sticky`,top:0,zIndex:1,background:`rgb(255 255 255)`,textAlign:`left`,padding:0,borderBottom:`1px solid rgb(217 223 230)`},T={...w,padding:`2px 6px`,whiteSpace:`nowrap`},E={all:`unset`,display:`block`,width:`100%`,padding:`3px 4px`,cursor:`pointer`,fontSize:10,fontWeight:600,textTransform:`uppercase`,letterSpacing:`0.04em`,opacity:.6},D={padding:`1px 6px`,borderBottom:`1px solid rgb(238 241 245)`,whiteSpace:`nowrap`},O={...D,textAlign:`right`},k={fontSize:11,fontWeight:600,textTransform:`uppercase`,letterSpacing:`0.04em`,opacity:.6},{...k},{...k},A={padding:8,fontSize:12,opacity:.7}})))()}function M(e){let{collapsed:t,view:n,panels:r,ratio:i,defaultRatio:a,onRatio:o}=e,{min:s,max:c,open:l,onOpenChange:u}=e;return!t&&r!==null?(0,P.jsx)(_,{ratio:i,defaultRatio:a,onRatio:o,...s===void 0?{}:{min:s},...c===void 0?{}:{max:c},...l===void 0?{}:{open:l},...u===void 0?{}:{onOpenChange:u},stackBelow:0,start:n,end:r}):(0,P.jsx)(N,{view:n,panels:r})}function N(e){let{view:t,panels:n}=e;return(0,P.jsxs)(`div`,{className:`panel-row`,children:[(0,P.jsx)(`div`,{className:`panel-row__view`,children:t}),n===null?null:(0,P.jsx)(`div`,{className:`panel-row__drawer`,children:n})]})}var P;function F(){return(F=e((()=>{g(),P=n(),M.__docgenInfo={description:`The figure of an editor and the panels that drive it.

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

With room, an editor passing \`open\` and \`onOpenChange\` has the double click on
the bar hide the panels and bring them back. The figure takes the row, and the
panels stay mounted beside it, so nothing typed into them is lost.
@param props - See {@link PanelRowProps}.
@returns The split row, or the figure with the panels over it.`,methods:[],displayName:`PanelRow`,props:{collapsed:{required:!0,tsType:{name:`boolean`},description:"Whether the window has no room for the panels beside the figure, as\n`readPanelsCollapsed` and `watchPanelsCollapsed` say."},view:{required:!0,tsType:{name:`ReactNode`},description:`The figure the row is for.`},panels:{required:!0,tsType:{name:`ReactNode`},description:"The panels to show: every open one with room, and without room the one\npanel the rail asked for. `null` when there is none."}},composes:[`Pick`]},N.__docgenInfo={description:`The figure alone in the row, with the panels over the whole of it when there
are any. The figure stays mounted underneath, so sending a panel away brings
it back as it was.
@param props - The figure, and the panels or \`null\`.
@returns The row.`,methods:[],displayName:`CollapsedPanelRow`}})))()}function I(e){let{panels:t,openIds:n,onToggle:r}=e;return(0,L.jsx)(l,{children:t.map(e=>(0,L.jsx)(l.Item,{"data-panel-id":e.id,icon:e.icon,tooltip:e.title,"aria-label":e.title,active:n.includes(e.id),onClick:()=>r(e.id)},e.id))})}var L;function R(){return(R=e((()=>{u(),L=n(),I.__docgenInfo={description:`Draw the rail.
@param props - The panels, which are open, and what to do about a click.
@returns The rail.`,methods:[],displayName:`PanelRail`,props:{panels:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`RailPanel`,elements:[{name:`TId`}],raw:`RailPanel<TId>`}],raw:`ReadonlyArray<RailPanel<TId>>`},description:`The panels offered, in the order they are shown.`},openIds:{required:!0,tsType:{name:`unknown`},description:`Which of them are open.`},onToggle:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(id: TId) => void`,signature:{arguments:[{type:{name:`TId`},name:`id`}],return:{name:`void`}}},description:`Called with the panel an icon was clicked for.`}}}})))()}function z(e){let{id:t,title:n,isOpen:a,onOpenChange:o,focus:s,pin:l,fillScreen:u}=e,{onClose:f,children:m}=e,h=i(),g=B(n,r()),[_]=(0,V.useState)(p),v=u&&_,y=(0,V.useRef)(null),b=(0,V.useCallback)(e=>{y.current=e},[]);function x(){a||o(!0),y.current?.requestFullscreen().catch(()=>void 0)}return(0,H.jsx)(c.Item,{id:t,title:n,open:a,onOpenChange:o,renderToolbar:()=>(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(d,{variant:`minimal`,className:`side-panel__fold`,icon:a?`chevron-down`:`chevron-right`,"data-panel-open":a,"aria-expanded":a,"aria-label":h(a?`panel.fold`:`panel.unfold`,{panel:g}),tooltipProps:{content:h(a?`panel.foldTooltip`:`panel.unfoldTooltip`)},onClick:()=>o(!a)}),v&&(0,H.jsx)(d,{variant:`minimal`,icon:`fullscreen`,"aria-label":h(`panel.fillScreen`,{panel:g}),tooltipProps:{content:h(`panel.fillScreenTooltip`)},onClick:x}),l!==void 0&&(0,H.jsx)(d,{variant:`minimal`,className:l.pinned?`side-panel__pin side-panel__pin--on`:`side-panel__pin`,icon:`pin`,"aria-pressed":l.pinned,"aria-label":h(`panel.pin`,{panel:g}),tooltipProps:{content:l.pinned?h(`panel.unpinTooltip`):h(`panel.pinTooltip`)},onClick:l.toggle}),s!==void 0&&(0,H.jsx)(d,{variant:`minimal`,icon:s.active?`expand-all`:`collapse-all`,"aria-pressed":s.active,"aria-label":h(`panel.focus`,{panel:g}),tooltipProps:{content:s.active?h(`panel.unfocusTooltip`):h(`panel.focusTooltip`)},onClick:s.toggle}),(0,H.jsx)(d,{variant:`minimal`,icon:`cross`,tooltipProps:{content:h(`panel.closeTooltip`)},"aria-label":h(`panel.close`,{panel:g}),onClick:f})]}),children:(0,H.jsx)(ee,{style:te,onStage:b,children:e=>(0,H.jsxs)(H.Fragment,{children:[e?.active===!0&&(0,H.jsxs)(`div`,{style:W,children:[(0,H.jsx)(`span`,{style:G,children:n}),(0,H.jsx)(d,{variant:`minimal`,icon:`minimize`,"aria-label":h(`panel.leaveFullScreen`),tooltipProps:{content:h(`panel.leaveFullScreenTooltip`)},onClick:e.toggle})]}),m]})})})}function B(e,t){return t===`de`?e:e.toLocaleLowerCase(t)}function te(e){return e?U:v}var V,H,U,W,G;function K(){return(K=e((()=>{V=t(),u(),a(),o(),f(),h(),j(),H=n(),U={...v,background:m.surface},W={...y,alignItems:`center`,justifyContent:`space-between`,paddingLeft:12},G={fontWeight:`bold`},z.__docgenInfo={description:`One panel of the stack: the header with the shell's gestures, and the body,
which is also the box that fills the screen.

The chevron leads the header, where a disclosure is looked for. The header
takes only a string title and draws its toolbar on the right, so the chevron
is the toolbar's first item and \`chrome.css\` sets it before the title.

The header is not part of what fills the screen, so a body that does carries
a bar of its own with the title and the way back.
@param props - See {@link SidePanelItemProps}.
@returns The accordion item.`,methods:[],displayName:`SidePanelItem`,props:{id:{required:!0,tsType:{name:`string`},description:`Identity of the panel in the stack.`},title:{required:!0,tsType:{name:`string`},description:`What the header says.`},isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the panel shows its body.`},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Called when the chevron, the header or a shift-click on another header
folds or unfolds the panel.
@param isOpen - Whether it shows its body.`},focus:{required:!0,tsType:{name:`union`,raw:`{ active: boolean; toggle: () => void } | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ active: boolean; toggle: () => void }`,signature:{properties:[{key:`active`,value:{name:`boolean`,required:!0}},{key:`toggle`,value:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}},required:!0}}]}},{name:`undefined`}]},description:"Whether the panel is the one in focus, and the toggle; `undefined` while it\nis alone in the stack, where there is nothing to fold."},pin:{required:!1,tsType:{name:`signature`,type:`object`,raw:`{ pinned: boolean; toggle: () => void }`,signature:{properties:[{key:`pinned`,value:{name:`boolean`,required:!0}},{key:`toggle`,value:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}},required:!0}}]}},description:`Whether the panel is pinned, and the toggle; \`undefined\` for an editor
that does not pin its panels.
@default undefined`},fillScreen:{required:!0,tsType:{name:`boolean`},description:`Whether the header offers to fill the screen with the panel, where the
browser can.`},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the close cross is pressed.`},children:{required:!0,tsType:{name:`ReactNode`},description:`The body.`}}}})))()}function ne(e,t){let[n,r]=(0,J.useState)(Y),i=re(t?new Set(t.folded):n,e);!t&&i!==n&&r(i);let a=(0,J.useRef)(i);(0,J.useLayoutEffect)(()=>{a.current=i});function o(n){a.current=n,t?t.onChange(e.filter(e=>n.has(e))):r(n)}return{isOpen:e=>!i.has(e),setOpen:(e,t)=>{let n=a.current;if(n.has(e)!==t)return;let r=new Set(n);t?r.delete(e):r.add(e),o(r)},focused:q(e,i),toggleFocus:t=>{o(q(e,i)===t?Y:new Set(e.filter(e=>e!==t)))}}}function re(e,t){for(let n of e)if(!t.includes(n))return new Set(t.filter(t=>e.has(t)));return e}function q(e,t){if(e.length<2)return null;let n=null;for(let r of e)if(!t.has(r)){if(n!==null)return null;n=r}return n}var J,Y;function X(){return(X=e((()=>{J=t(),Y=new Set})))()}function Z(e){let{panels:t,openPanelIds:n,onClose:r,children:i,fillScreen:a}=e,{foldedPanelIds:o,onFoldedPanelIdsChange:l}=e,{pinnedPanelIds:u,onPinnedChange:d}=e,f=t.filter(e=>n.includes(e.id)),p=ne(f.map(e=>e.id),o===void 0?void 0:{folded:o,onChange:e=>l?.(e)});return(0,Q.jsx)(s,{children:(0,Q.jsx)(c,{children:f.map(e=>(0,Q.jsx)(z,{id:e.id,title:e.title,isOpen:p.isOpen(e.id),onOpenChange:t=>p.setOpen(e.id,t),focus:f.length>1?{active:p.focused===e.id,toggle:()=>p.toggleFocus(e.id)}:void 0,fillScreen:a?.(e)??!0,pin:u===void 0?void 0:{pinned:u.includes(e.id),toggle:()=>d?.(e.id,!u.includes(e.id))},onClose:()=>r(e.id),children:i(e)},e.id))})})}var Q;function $(){return($=e((()=>{u(),K(),X(),Q=n(),Z.__docgenInfo={description:`The panels that are open, stacked one under the other down the side.

Every open panel gets a share of the height rather than a turn: the things
they hold are read together — which spectrum is selected and what its peaks
are, the residues to pick from and what the drawing adds up to — so closing
one to see the other would be a step backwards. A header click still folds a
single panel away, and shift-click folds every other one.

They are drawn in the order the rail stacks their icons rather than the order
they were switched on, so a panel always comes back where it was.

The header carries the shell's own gestures and nothing about what the panel
holds: the chevron that folds it away, before the title; filling the screen
with the panel, where the browser can and the panel asks for it, first on
the right so the buttons every header carries line up; the pin, for an
editor that tells the panels placed on purpose from one opened in passing;
focus, which folds every other panel away and unfolds them again; and the
cross that closes it. What a panel switches on and off
is a toolbar at the top of its own body, so it travels with the panel when it
is folded, reordered or lent to another editor, and every header in every
editor reads the same — which is the reason this is one component rather
than one per editor.

The chevron is there because nothing else says which panels are folded. The
accordion draws every header identically and hides only the body, so a side
of four closed panels and a side of four open ones differ by white space, and
a reader looking for a panel that is already open reaches for its icon and
closes it. Focus is a button as well as a shift-click because a modifier on a
header is a gesture nobody finds, and it undoes itself, which a shift-click
does not.
@param props - Component props.
@returns The stack.`,methods:[],displayName:`SidePanelStack`,props:{panels:{required:!0,tsType:{name:`unknown`},description:`Every panel on offer, in the order their icons are stacked.`},openPanelIds:{required:!0,tsType:{name:`unknown`},description:`Which of them are open, named as each editor's own view names them.`},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(id: TPanel['id']) => void`,signature:{arguments:[{type:{name:`TPanel['id']`,raw:`TPanel['id']`},name:`id`}],return:{name:`void`}}},description:"Called with the panel whose close cross was pressed. It is the id of one of\n`panels` rather than any string, so an editor whose panels are a fixed set\nhands its own `togglePanel` straight in.\n@param id - Identity of that panel."},children:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(panel: TPanel) => ReactNode`,signature:{arguments:[{type:{name:`TPanel`},name:`panel`}],return:{name:`ReactNode`}}},description:`What to draw inside one panel.
@param panel - The panel to draw.
@returns Its body.`},fillScreen:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(panel: TPanel) => boolean`,signature:{arguments:[{type:{name:`TPanel`},name:`panel`}],return:{name:`boolean`}}},description:`Whether a panel offers to fill the screen, for a stack where only some
panels hold something worth it.
@param panel - The panel asked about.
@returns Whether its header carries the button.
@default every panel does, where the browser can fill the screen`},foldedPanelIds:{required:!1,tsType:{name:`unknown`},description:`The panels folded away, for an editor that keeps them — across a reload,
say. The editor drops a panel from them when it closes it, so that it
comes back unfolded.
@default undefined, the stack keeps them and forgets them when it unmounts`},onFoldedPanelIdsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(ids: Array<TPanel['id']>) => void`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`TPanel['id']`,raw:`TPanel['id']`}],raw:`Array<TPanel['id']>`},name:`ids`}],return:{name:`void`}}},description:`Called with the panels folded when a chevron, a header or a focus folds or
unfolds one; read only with \`foldedPanelIds\`.
@param ids - The open panels folded, in the order they are drawn.
@default undefined`},pinnedPanelIds:{required:!1,tsType:{name:`unknown`},description:`The panels pinned, for an editor that keeps the panels placed on purpose
apart from a panel opened in passing. Every header then carries a pin.
@default undefined, no header carries a pin`},onPinnedChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: TPanel['id'], pinned: boolean) => void`,signature:{arguments:[{type:{name:`TPanel['id']`,raw:`TPanel['id']`},name:`id`},{type:{name:`boolean`},name:`pinned`}],return:{name:`void`}}},description:`Called when a header's pin is pressed; read only with \`pinnedPanelIds\`.
@param id - The panel.
@param pinned - Whether it is to be pinned.
@default undefined`}}}})))()}export{w as _,N as a,b,j as c,D as d,E as f,S as g,O as h,R as i,k as l,T as m,$ as n,M as o,A as p,I as r,F as s,Z as t,x as u,v,y as x,C as y};
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C326WbYZ.js";import{n,t as r}from"./SplitRow-CP7iUHnR.js";function i(e){let{collapsed:t,view:n,panels:i,ratio:s,defaultRatio:c,onRatio:l}=e,{min:u,max:d,open:f,onOpenChange:p}=e;return!t&&i!==null?(0,o.jsx)(r,{ratio:s,defaultRatio:c,onRatio:l,...u===void 0?{}:{min:u},...d===void 0?{}:{max:d},...f===void 0?{}:{open:f},...p===void 0?{}:{onOpenChange:p},stackBelow:0,start:n,end:i}):(0,o.jsx)(a,{view:n,panels:i})}function a(e){let{view:t,panels:n}=e;return(0,o.jsxs)(`div`,{className:`panel-row`,children:[(0,o.jsx)(`div`,{className:`panel-row__view`,children:t}),n===null?null:(0,o.jsx)(`div`,{className:`panel-row__drawer`,children:n})]})}var o;function s(){return(s=e((()=>{n(),o=t(),i.__docgenInfo={description:`The figure of an editor and the panels that drive it.

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
@returns The split row, or the figure with the panels over it.`,methods:[],displayName:`PanelRow`,props:{collapsed:{required:!0,tsType:{name:`boolean`},description:"Whether the window has no room for the panels beside the figure, as\n`readPanelsCollapsed` and `watchPanelsCollapsed` say."},view:{required:!0,tsType:{name:`ReactNode`},description:`The figure the row is for.`},panels:{required:!0,tsType:{name:`ReactNode`},description:"The panels to show: every open one with room, and without room the one\npanel the rail asked for. `null` when there is none."}},composes:[`Pick`]},a.__docgenInfo={description:`The figure alone in the row, with the panels over the whole of it when there
are any. The figure stays mounted underneath, so sending a panel away brings
it back as it was.
@param props - The figure, and the panels or \`null\`.
@returns The row.`,methods:[],displayName:`CollapsedPanelRow`}})))()}export{i as n,s as r,a as t};
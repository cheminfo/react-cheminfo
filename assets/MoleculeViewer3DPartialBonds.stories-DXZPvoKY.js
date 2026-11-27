import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-O33j9N-i.js";import{n,t as r}from"./MoleculeViewer3D-rXpIWnUo.js";var i;function a(){return(a=e((()=>{i=`12
Benzene: an illustrative geometry
C      1.3900    0.0000    0.0000
C      0.6950    1.2038    0.0000
C     -0.6950    1.2038    0.0000
C     -1.3900    0.0000    0.0000
C     -0.6950   -1.2038    0.0000
C      0.6950   -1.2038    0.0000
H      2.4700    0.0000    0.0000
H      1.2350    2.1391    0.0000
H     -1.2350    2.1391    0.0000
H     -2.4700    0.0000    0.0000
H     -1.2350   -2.1391    0.0000
H      1.2350   -2.1391    0.0000
`})))()}var o;function s(){return(s=e((()=>{o=`16
Diels-Alder transition state, butadiene + ethylene: an illustrative geometry
C      1.4770    0.6399    0.2150
C      0.7050    1.2058   -0.7792
C     -0.7050    1.2058   -0.7792
C     -1.4770    0.6399    0.2150
C     -0.6900   -1.4895    0.2150
C      0.6900   -1.4895    0.2150
H      2.4890    0.9952    0.3367
H      1.0320    0.5094    1.1901
H      1.2120    1.6772   -1.6074
H     -1.2120    1.6772   -1.6074
H     -2.4890    0.9952    0.3367
H     -1.0320    0.5094    1.1901
H     -1.2120   -1.7691   -0.6886
H     -1.2120   -1.7689    1.1185
H      1.2120   -1.7691   -0.6886
H      1.2120   -1.7689    1.1185
`})))()}var c;function l(){return(l=e((()=>{c=`6
SN2 transition state, Cl- + CH3Cl: an illustrative geometry
C      0.0000    0.0000    0.0000
Cl     2.3200    0.0000    0.0000
Cl    -2.3200    0.0000    0.0000
H      0.0000    1.0700    0.0000
H      0.0000   -0.5350    0.9267
H      0.0000   -0.5350   -0.9267
`})))()}function u(e){let t=[];for(let n=0;n<e;n++)t.push(d(-Math.cos(Math.PI*n/(e-1))));for(let n=e-2;n>0;n--)t.push(d(-Math.cos(Math.PI*n/(e-1))));return t.join(``)}function d(e){let t=f(e),n=f(-e),r=-.36*e,i=Math.sqrt(1.09*1.09-r*r),a=[`6`,`SN2 path ${e.toFixed(2)}`,p(`C`,0,0,0),p(`Cl`,t,0,0),p(`Cl`,-n,0,0)];for(let e=0;e<3;e++){let t=2*Math.PI*e/3;a.push(p(`H`,r,i*Math.cos(t),i*Math.sin(t)))}return`${a.join(`
`)}\n`}function f(e){return 2.32-(e<0?.88:.52)*e}function p(e,t,n,r){return`${e} ${t.toFixed(4)} ${n.toFixed(4)} ${r.toFixed(4)}`}var m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{a(),s(),l(),n(),m=t(),h={title:`Molecule3D/PartialBonds`,component:r,args:{molfile:{format:`xyz`,data:o}},parameters:{layout:`padded`,docs:{description:{component:`An XYZ file carries no bonds, so molstar bonds atoms by distance, and the stretched bonds of a transition state are not drawn. The viewer draws them dashed, with their lengths: by default for an XYZ file, and on request for a molfile, from the options popover. The geometries are illustrative, built by hand.`}}},render:e=>(0,m.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,m.jsx)(r,{...e})})},g={args:{frameNewMolecule:`front`}},_={args:{molfile:{format:`xyz`,data:c}}},v={args:{defaultSettings:{partialBondLengths:!1}}},y={args:{molfile:{format:`xyz`,data:u(31)},playing:!0,framesPerSecond:15}},b={args:{molfile:{format:`xyz`,data:i}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    frameNewMolecule: 'front'
  }
}`,...g.parameters?.docs?.source},description:{story:`Butadiene and ethylene meeting: the two C–C bonds being formed, 2.27 Å
long, are dashed.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'xyz',
      data: sn2
    }
  }
}`,..._.parameters?.docs?.source},description:{story:`Cl⁻ + CH₃Cl: the C–Cl bond formed and the one broken, both 2.32 Å.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      partialBondLengths: false
    }
  }
}`,...v.parameters?.docs?.source},description:{story:`The same transition state, its lengths left out.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'xyz',
      data: sn2Path(31)
    },
    playing: true,
    framesPerSecond: 15
  }
}`,...y.parameters?.docs?.source},description:{story:`The SN2 reaction played: a bond while the chlorine is close, a dashed
partial bond while it comes or goes, nothing once it is away.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'xyz',
      data: benzene
    }
  }
}`,...b.parameters?.docs?.source},description:{story:`An ordinary molecule read from an XYZ file: no dash, though its 1,3 carbons
are 2.41 Å apart — as far as the forming bonds of a transition state.`,...b.parameters?.docs?.description}}},x=[`DielsAlder`,`Sn2`,`WithoutLengths`,`Sn2Path`,`Benzene`]})))()}S();export{b as Benzene,g as DielsAlder,_ as Sn2,y as Sn2Path,v as WithoutLengths,x as __namedExportsOrder,h as default};
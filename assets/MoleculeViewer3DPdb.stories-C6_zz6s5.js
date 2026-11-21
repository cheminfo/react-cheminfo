import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DxOWz8o3.js";import{n,t as r}from"./MoleculeViewer3D-B_bijElh.js";var i;function a(){return(a=e((()=>{i=`COMPND    ETHANOL, AN ILLUSTRATIVE GEOMETRY
HETATM    1  C1  LIG A   1       0.083  -0.233   0.024  1.00  0.00           C
HETATM    2  C2  LIG A   1      -0.861   0.574  -0.832  1.00  0.00           C
HETATM    3  O1  LIG A   1      -0.668   1.957  -0.577  1.00  0.00           O
HETATM    4  H1  LIG A   1      -0.045  -1.188  -0.150  1.00  0.00           H
HETATM    5  H2  LIG A   1      -0.093  -0.051   0.969  1.00  0.00           H
HETATM    6  H3  LIG A   1       1.008   0.011  -0.188  1.00  0.00           H
HETATM    7  H4  LIG A   1      -0.683   0.375  -1.787  1.00  0.00           H
HETATM    8  H5  LIG A   1      -1.794   0.322  -0.615  1.00  0.00           H
HETATM    9  H6  LIG A   1      -1.129   2.424  -1.100  1.00  0.00           H
CONECT    1    2    4    5    6
CONECT    2    1    3    7    8
CONECT    3    2    9
CONECT    4    1
CONECT    5    1
CONECT    6    1
CONECT    7    2
CONECT    8    2
CONECT    9    3
END
`})))()}var o;function s(){return(s=e((()=>{o=`COMPND    SN2 TRANSITION STATE, ONE C-CL BOND WRITTEN
HETATM    1  C1  LIG A   1       0.000   0.000   0.000  1.00  0.00           C
HETATM    2 CL1  LIG A   1       2.320   0.000   0.000  1.00  0.00          CL
HETATM    3 CL2  LIG A   1      -2.320   0.000   0.000  1.00  0.00          CL
HETATM    4  H1  LIG A   1       0.000   1.070   0.000  1.00  0.00           H
HETATM    5  H2  LIG A   1       0.000  -0.535   0.927  1.00  0.00           H
HETATM    6  H3  LIG A   1       0.000  -0.535  -0.927  1.00  0.00           H
CONECT    1    2    4    5    6
CONECT    2    1
CONECT    4    1
CONECT    5    1
CONECT    6    1
END
`})))()}var c,l,u,d,f;function p(){return(p=e((()=>{a(),s(),n(),c=t(),l={title:`Molecule3D/PDB`,component:r,args:{molfile:{format:`pdb`,data:i}},parameters:{layout:`padded`,docs:{description:{component:"A PDB file, read by molstar: its `HETATM` and `ATOM` records, bonded by its `CONECT` records, and by the distances where they say nothing. The files are illustrative, written by hand."}}},render:e=>(0,c.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,c.jsx)(r,{...e})})},u={},d={args:{molfile:{format:`pdb`,data:o},defaultSettings:{partialBonds:`on`}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source},description:{story:"Ethanol as `HETATM` records, every bond written in `CONECT`.",...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'pdb',
      data: sn2
    },
    defaultSettings: {
      partialBonds: 'on'
    }
  }
}`,...d.parameters?.docs?.source},description:{story:`An SN2 transition state whose \`CONECT\` records bond one chlorine, 2.32 Å
away: drawn as a bond, however long. With the partial bonds switched on —
off by default for a PDB — the other chlorine is joined by dashes.`,...d.parameters?.docs?.description}}},f=[`Ethanol`,`ConectBondAndPartialBond`]})))()}p();export{d as ConectBondAndPartialBond,u as Ethanol,f as __namedExportsOrder,l as default};
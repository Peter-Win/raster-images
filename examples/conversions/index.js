/**
 * Show all possible pixel format conversions
 */
const fs = require("node:fs");
const { buildConverterGraph, findPath } = require("../../lib/Converter/ConverterGraph");
const { defaultConverterProps } = require("../../lib/Converter/ConverterProps");
const { allConverters } = require("../../lib/Converter/allConverters");

const template = `
<html>
<head>
  <title>Possible conversions</title>
  <style>
  .table { border-collapse: collapse; }
  .table td, .table th { padding: 0.2em 0.5em; border: thin solid silver; text-align: center; }
  .yes { background: #DFD; }
  .no { background: #FDD; }
  </style>
</head>
<body>
  <h1>Possible conversions</h1>
  <table class="table">
placeholder
  </table>
</body>
</html>
`
const main = () => {
    const graph = buildConverterGraph(defaultConverterProps, allConverters);
    const signs = Array.from(new Set([
        ...allConverters.map(({srcSign}) => srcSign),
        ...allConverters.map(({dstSign}) => dstSign),
    ]));
    const rows = [];
    // header
    rows.push("<tr>", "  <th></th>");
    signs.forEach(sign => {
        rows.push(`<th>${sign}</th>`);
    })
    rows.push("</tr>");

    // rows
    signs.forEach(srcSign => {
        rows.push("<tr>")
        rows.push(`  <th>${srcSign}</th>`);
        signs.forEach(dstSign => {
            let cls="";
            let msg = "";
            let title = `${srcSign} -x-&gt; ${dstSign}`;
            if (srcSign !== dstSign) {
                const path = findPath(srcSign, dstSign, graph);
                if (path.length === 0) {
                    cls="no";
                    msg="-";
                } else {
                    cls="yes";
                    msg=`x${path.length}`;
                    title = [srcSign, ...path.map(c => c.dstSign)].join(" - ")
                }
            }
            rows.push(`  <td class="${cls}" title="${title}">${msg}</td>`)
        })
        rows.push("</tr>")
    });

    // finish
    const text = rows.map(s => `  ${s}`).join("\n");
    fs.writeFileSync("conversions.html", template.replace("placeholder", text));
    console.log("see conversions.html");
}

main();
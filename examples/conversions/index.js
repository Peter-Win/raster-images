/**
 * Show all possible pixel format conversions
 */
const fs = require("node:fs");
const { buildConverterGraph, findPath } = require("../../lib/Converter/ConverterGraph");
const { defaultConverterProps } = require("../../lib/Converter/ConverterProps");
const { allConverters } = require("../../lib/Converter/allConverters");
const { strCFDescr } = require("../../lib/Converter/ConverterFactory");

const template = `
<html>
<head>
  <title>Possible conversions</title>
  <style>
  body { font-family: sans-serif; color: #333; }
  th {font-family: serif; font-size: 90%; }
  td {font-family: courier; font-weight: bold; }
  .table { border-collapse: collapse; }
  .table td, .table th { padding: 0.2em 0.5em; border: thin solid silver; text-align: center; }
  .yes { background: #DFD; }
  .no { background: #FDD; }
  .hover, tr:not(.thead):hover { background: #DDD; }
  .hover.yes, tr:hover .yes { background: #BFB; }
  .hover.no, tr:hover .no { background: #FBB; }
  </style>
</head>
<body>
  <h1>Possible conversions</h1>
  <table class="table">
placeholder
  </table>
  <script>
  window.addEventListener("load", function(){
    var cols = document.querySelectorAll('[data-col]');
    cols.forEach(function(el){
      el.addEventListener("mouseout", function() {
        cols.forEach(function(colEl){
            colEl.classList.remove("hover");
        })
      });
      el.addEventListener("mouseenter", function(){
        document.querySelectorAll('[data-col = "'+el.getAttribute('data-col')+'"]').forEach(function(colEl){
          colEl.classList.add("hover");
        })
      });  
    });
  })
  </script>
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
    rows.push(`<tr class="thead">`, "  <th></th>");
    signs.forEach((sign, col) => {
        rows.push(`<th data-col="${col}">${sign}</th>`);
    })
    rows.push("</tr>");

    // rows
    signs.forEach(srcSign => {
        rows.push(`<tr>`)
        rows.push(`  <th>${srcSign}</th>`);
        signs.forEach((dstSign, col) => {
            let cls="";
            let msg = "";
            let title = `${srcSign} -x-&gt; ${dstSign}`;
            if (srcSign !== dstSign) {
                const path = findPath(srcSign, dstSign, graph);
                if (!path || path.length === 0) {
                    cls="no";
                    msg="-";
                } else {
                    cls="yes";
                    msg=`×${path.length}`;
                    title = path.map(strCFDescr).join("\n")
                }
            }
            rows.push(`  <td class="${cls}" data-col="${col}" title="${title}">${msg}</td>`)
        })
        rows.push("</tr>")
    });

    // finish
    const text = rows.map(s => `  ${s}`).join("\n");
    fs.writeFileSync("conversions.html", template.replace("placeholder", text));
    console.log("see conversions.html");
}

main();
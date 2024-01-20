const path = require("node:path");
const { argv, stderr, stdout } = require('node:process');
const { promises, constants } = require("node:fs");
const { streamLock } = require('../../lib/stream');
const { dump } = require("../../lib/utils");
const { NodeJSFile } = require('../../lib/stream/NodeJSFile');
const { FormatTiff } = require('../../lib/format/tiff/FormatTiff');
const { tiffTagName, TiffTag } = require("../../lib/format/tiff/TiffTag");
const { typeDef, IfdType } = require("../../lib/format/tiff/ifd/IfdType");
const { getIfdString, getIfdNumbers } = require("../../lib/format/tiff/ifd/IfdEntry");
const { tiffCompressionDict } = require("../../lib/format/tiff/tags/TiffCompression");
const { photoIntNames } = require("../../lib/format/tiff/tags/PhotometricInterpretation");
const { tiffSampleFormatName } = require("../../lib/format/tiff/tags/TiffSampleFormat");
const { unitsTiffToStd, getTiffResolution } = require("../../lib/format/tiff/tags/TiffResolution");
const { loadImageFromFrame } = require("../../lib/loadImage");
const { savePngImage } = require("../../lib/format/png/save")

const showNumber = (n) => {
    let result = String(n);
    if (n > 9 && Math.floor(n) === n) result += ` (0x${n.toString(16).toUpperCase()})`;
    return result;
}

const dstShortName = (index) => `frame${index}.png`;
const dstFileUrl = (index) => `./files/${dstShortName(index)}`;
const dstFolder = path.join(__dirname, "files");
const dstFileName = (index) => path.join(dstFolder, dstShortName(index))

const saveFrame = async (frame, index) => {
    try {
        await promises.access(dstFolder, constants.F_OK);
    } catch (e) {
        await promises.mkdir(dstFolder);
    }
    const img = await loadImageFromFrame(frame);
    const wstream = new NodeJSFile(dstFileName(index), "w");
    await savePngImage(img, wstream);
}

const createFrameInfo = async (frame, index) => {
    const { format, ifd } = frame;
    const { stream, littleEndian } = format;
    let res = `  <h2>Frame # ${index+1} / ${format.frames.length}</h2>`;
    res += `  <div class="frame">`;
    res += `   <div class="ifd">`;
    for (const entry of Object.values(ifd.entries)) {
        const tagName = tiffTagName[entry.tagId] ?? entry.tagId;
        const typeName = typeDef[entry.type]?.name ?? entry.type;
        let content = "";
        if (entry.type === IfdType.ascii) {
            content = await getIfdString(entry, stream, littleEndian);
            content = `<span class="text">${content}</span>`
        } else {
            nums = await ifd.getNumbers(entry.tagId, stream);
            if (nums.length === 1 && tagName === "Compression") {
                content = tiffCompressionDict[nums[0]]?.name ?? nums[0];
            } else if (nums.length === 1 && tagName === "PhotometricInterpretation") {
                content = photoIntNames[nums[0]] ?? nums[0];
            } else if (nums.length === 1 && tagName === "ResolutionUnit") {
                content = unitsTiffToStd[nums[0]] ?? nums[0];
            } else if (tagName==="SampleFormat") {
                content = nums.map(n=>tiffSampleFormatName[n] || n).join(", ");
            } else if (tagName === "StripOffsets") {
                const eStripByteCounts = ifd.entries[TiffTag.StripByteCounts];
                const sizes = eStripByteCounts ? await getIfdNumbers(eStripByteCounts, stream, ifd.littleEndian) : [];
                content = await makeDump(nums, sizes, stream);
            } else if (tagName === "TileOffsets") {
                const sizes = await ifd.getNumbers(TiffTag.TileByteCounts, stream);
                content = await makeDump(nums, sizes, stream);
            } else if ((typeName === "Byte" || typeName === "Undefined") && entry.count >= 16) {
                const offset = entry.valueOffset.getUint32(0, littleEndian);
                await stream.seek(offset);
                const buffer = await stream.read(entry.count);
                content = makeHexView(buffer, offset);
            } else {
                content = nums.map(showNumber).join(", ");
            }
        }
        res += `    <div>${tagName}</div>`;
        res += `    <div>${typeName}</div>`;
        res += `    <div>${entry.count}</div>`;
        res += `    <div>${content}</div>`
    }
    res += `   </div>`;
    let imgCode = `   <img class="frame-img" src=${dstFileUrl(index)} />`;
    try {
        await saveFrame(frame, index);
    } catch (e) {
        imgCode = `    <div class="alert">${e.message}</div>`;
    }
    res += imgCode;
    res += `  </div>`;
    const resolution = await getTiffResolution(ifd, stream);
    if (resolution) {
        res += `<div>Resolution: ${resolution.resX} x ${resolution.resY} pixels/${resolution.resUnit}</div>`
    }
    return res;
}

const makeDump = async (offsets, sizes, stream) => {
    let content = "<pre>";
    for (let i=0; i<offsets.length; i++) {
        if (i>0) content += "\n";
        content += offsets[i].toString(16).toUpperCase().padStart(8, "0");
        await stream.seek(offsets[i]);
        const dataSize = Math.min(sizes[i] || 32, 32);
        const data = await stream.read(dataSize);
        content += ": " + dump(data);
    }
    return content + "</pre>"
}

const makeHexView = (buffer, startOffset) => {
    let content = "<pre>";
    let offset = startOffset;
    const end = startOffset + buffer.length;
    while (offset < end) {
        if (offset !== startOffset) content += "\n";
        const rowSize = Math.min(end - offset, 16);
        content += offset.toString(16).toUpperCase().padStart(6, " ");
        content += "  ";
        const rowStart = offset - startOffset;
        for (let i=0; i<rowSize; i++) content += `${buffer[rowStart + i].toString(16).toUpperCase().padStart(2, "0")} `;
        for (let i=0; i<rowSize; i++) {
            const c = buffer[rowStart + i];
            content += (c < 32 || c >= 0x78) ? "." : String.fromCharCode(c);
        }
        offset += rowSize;
    }
    return content + "</pre>"
}

const main = async () => {
    const fileName = argv[2];
    if (!fileName) {
        stderr.write("Error!\nYou must specify the name of the tiff file on the command line:\n > node index <tiff_file_name>\n");
        return;
    }
    await streamLock(new NodeJSFile(fileName, "r"), async (stream) => {
        const fileSize = await stream.getSize();
        const format = await FormatTiff.create(stream);
        const {frames, littleEndian} = format;
        let framesInfo = "";
        for (let i=0; i<frames.length; i++) {
            framesInfo += await createFrameInfo(frames[i], i);
        }
    
        const report = template
            .replace("<%=fileName%>", fileName)
            .replace("<%=fileSize%>", `${(fileSize / 1024).toFixed(0)} K`)
            .replace("<%=numFmt%>", littleEndian ? "Little endian" : "Big endian")
            .replace("<%=frames%>", framesInfo);
        await promises.writeFile("details.html", report);    
    })
}

main().then(() => {
    stdout.write("See details.html");
}).catch(e => {
    console.error(e);
})

const template = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>TIFF details</title>
  <style>
  html,body,div,p,h1,h2,pre {margin:0; padding:0}
  body {color:#333; font-size:14px; display:flex; flex-direction:column; gap: 8px; padding: 8px 12px;}
  h1 {font-size:18px;}
  h2 {font-size:16px; padding:0.2em 0.6em; background:#DDD;}
  .frame {
    display:grid;
    grid-template-columns: 3fr 1fr;
    column-gap: 1em;
    align-items: start;
  }
  .ifd {
    display:grid;
    grid-template-columns: auto auto auto 1fr;
    border-left: thin solid silver;
    border-top: thin solid silver;
  }
  .ifd > * {
    padding: 0.2em 0.6em;
    border-right: thin solid silver;
    border-bottom: thin solid silver;
  }
  .frame-img {
    max-width: 30vw;
    border: thin solid silver;
  }
  .text {color: blue;}
  .alert {background:#FCC; padding:1em; border: thick red solid;}
  </style>
</head>
<body>
  <h1><%=fileName%></h1>
  <p>File size: <%=fileSize%></p>
  <p>Number format: <%=numFmt%></p>
<%=frames%>  
</body>
</html>
`
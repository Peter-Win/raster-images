import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { bytesToUtf8, dump } from "../../../../utils";
import { PsdColorMode, readPsdFileHeader } from "../../PsdFileHeader";
import { readPsdSection } from "../../psdSection";
import { PsdResId } from "../PsdResId";
import { readPsdResources } from "../PsdResources";
import {
  PsdResolutionUnit,
  PsdSizeUnit,
  loadResolutionInfo,
} from "../ResolutionInfo";
import {
  loadPsdResLong,
  loadPsdResourceData,
  loadPsdResWord,
  loadPsdResWords,
} from "../loadPsdResource";
import { getThumbnailInfo } from "../ThumbnailHeader";
import { getTestFile } from "../../../../tests/getTestFile";
import { streamLock } from "../../../../stream";
import { PsdPrintScaleStyle, loadPsdPrintScale } from "../PsdPrintScale";

test("readPsdResources", async () => {
  await onStreamFromGallery("psd/G8x.psd", async (stream) => {
    const hdr = await readPsdFileHeader(stream);
    expect(hdr.colorMode).toBe(PsdColorMode.Grayscale);
    expect(hdr.depth).toBe(8);
    // skip palette section
    await readPsdSection(stream, 0, async () => {});
    // resource section
    await readPsdSection(stream, 0, async ({ size }) => {
      const resources = await readPsdResources(stream, size);
      const resList = Object.values(resources);
      expect(resList.length).toBe(30);

      const res0 = resList[0]!;
      expect(res0.id.toString(16)).toBe("3ed");
      expect(res0.id).toBe(PsdResId.resolutionInfo);
      expect(res0.offset.toString(16)).toBe("39fc");
      const resInfo = await loadResolutionInfo(stream, res0);
      expect(resInfo).toEqual({
        hRes: 72,
        hResUnit: PsdResolutionUnit.inches,
        widthUnit: PsdSizeUnit.cm,
        vRes: 72,
        vResUnit: PsdResolutionUnit.inches,
        heightUnit: PsdSizeUnit.cm,
      });

      const res1 = resList[1]!;
      expect(res1.id.toString(16)).toBe("3f3");
      expect(res1.id).toBe(PsdResId.printFlags);
      const data1 = await loadPsdResourceData(stream, res1);
      expect(dump(data1)).toBe("00 00 00 00 00 00 00 00 01");

      const res2 = resList[2]!;
      expect(res2.id.toString(16)).toBe("3f4"); // Grayscale and multichannel halftoning information
      expect(res2.size).toBe(18);
      const data2 = await loadPsdResourceData(stream, res2);
      expect(dump(data2)).toBe(
        "00 35 00 00 00 01 00 2D 00 00 00 06 00 00 00 00 00 01"
      );

      const res3 = resList[3]!;
      expect(res3.id.toString(16)).toBe("3f7"); // Grayscale and multichannel transfer function
      expect(dump(await loadPsdResourceData(stream, res3))).toBe(
        "00 00 FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF 03 E8 00 00"
      );

      const res4 = resList[4]!;
      expect(res4.id.toString(16)).toBe("400"); // index of target layer
      expect(res4.id).toBe(PsdResId.layerStateInfo);
      expect(await loadPsdResWord(stream, res4)).toBe(2);

      const res5 = resList[5]!;
      expect(res5.id.toString(16)).toBe("402");
      expect(res5.id).toBe(PsdResId.layersGroupInfo);
      expect(await loadPsdResWords(stream, res5)).toEqual([0, 0, 0, 0, 0, 0]);

      const res6 = resList[6]!;
      expect(res6.id.toString(16)).toBe("404");
      expect(res6.id).toBe(PsdResId.iptcNaa);
      expect(dump(await loadPsdResourceData(stream, res6))).toBe(
        "1C 02 00 00 02 00 00"
      );

      const res7 = resList[7]!;
      expect(res7.id.toString(16)).toBe("408");
      expect(res7.id).toBe(PsdResId.gridAndGuides);

      const res8 = resList[8]!;
      expect(res8.id.toString(16)).toBe("40a");

      const res9 = resList[9]!;
      // Thumbnail resource header
      expect(res9.id.toString(16)).toBe("40c");
      expect(res9.id).toBe(PsdResId.thumbnail);
      expect(res9.size).toBe(2945);
      expect(res9.offset.toString(16)).toBe("456a");
      const thumbInfo = await getThumbnailInfo(stream, res9);
      const thumbData = await stream.read(thumbInfo.imgSize);
      expect(thumbInfo.imgOffset.toString(16)).toBe("4586");
      expect(thumbInfo.header.width).toBe(133);
      expect(thumbInfo.header.height).toBe(70);
      const thumbFile = await getTestFile(__dirname, "thumbG8.jpg", "w");
      await streamLock(thumbFile, async () => {
        await thumbFile.write(thumbData);
      });

      const res10 = resList[10]!;
      expect(res10.id.toString(16)).toBe("40d");
      expect(res10.id).toBe(PsdResId.globalAngle);
      const angle = await loadPsdResLong(stream, res10);
      expect(angle).toBe(0);

      const res11 = resList[11]!;
      expect(res11.id.toString(16)).toBe("40f");
      expect(res11.id).toBe(PsdResId.iccProfile);
      expect(res11.size).toBe(912);
      expect(res11.offset.toString(16)).toBe("41be");

      const res12 = resList[12]!;
      expect(res12.id.toString(16)).toBe("414");
      expect(res12.id).toBe(PsdResId.idSeedNumber);
      expect(await loadPsdResLong(stream, res12)).toBe(0);

      const res13 = resList[13]!;
      expect(res13.id.toString(16)).toBe("419");
      expect(res13.id).toBe(PsdResId.globalAltitude);
      expect(await loadPsdResLong(stream, res13)).toBe(0);

      const res14 = resList[14]!;
      expect(res14.id.toString(16)).toBe("41a");
      expect(res14.id).toBe(PsdResId.slices);
      expect(res14.size).toBe(827);
      expect(res14.offset.toString(16)).toBe("3e5e");

      const res15 = resList[15]!;
      expect(res15.id.toString(16)).toBe("41e");
      expect(res15.size).toBe(4);
      expect(await loadPsdResLong(stream, res15)).toBe(0);

      const res16 = resList[16]!;
      expect(res16.id.toString(16)).toBe("421");
      expect(res16.offset.toString(16)).toBe("50f8");

      const res17 = resList[17]!;
      expect(res17.id.toString(16)).toBe("422");
      expect(res17.id).toBe(PsdResId.exif1);
      expect(res17.offset.toString(16)).toBe("515a");
      expect(res17.size).toBe(302);

      const res18 = resList[18]!;
      expect(res18.id.toString(16)).toBe("424");
      expect(res18.id).toBe(PsdResId.xmp);
      const xmpBuf = await loadPsdResourceData(stream, res18);
      await streamLock(
        await getTestFile(__dirname, "g8.xml", "w"),
        async (ws) => {
          await ws.write(xmpBuf);
        }
      );
      const xmpText = bytesToUtf8(xmpBuf);
      // see https://printtechnologies.org/wp-content/uploads/2020/03/xmp-specification-jan04_fileticket1nrcKq4MTKctabid158mid669.pdf
      expect(xmpText.slice(0, 40)).toBe(
        `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSz`
      );

      const res19 = resList[19]!;
      // (Photoshop 7.0) Caption digest. 16 bytes: RSA Data Security, MD5 message-digest algorithm
      expect(res19.id.toString(16)).toBe("425");
      expect(res19.size).toBe(16);
      const buf19 = await loadPsdResourceData(stream, res19);
      expect(dump(buf19)).toBe(
        "E8 F1 5C F3 2F C1 18 A1 A2 7B 67 AD C5 64 D5 BA"
      );

      const res20 = resList[20]!;
      expect(res20.id.toString(16)).toBe("426");
      expect(res20.id).toBe(PsdResId.printScale);
      expect(await loadPsdPrintScale(stream, res20)).toEqual({
        style: PsdPrintScaleStyle.centered,
        xLocation: 0,
        yLocation: 0,
        scale: 1,
      });

      const res21 = resList[21]!;
      expect(res21.id.toString(16)).toBe("428");
      // (Photoshop CS) Pixel Aspect Ratio. 4 bytes (version = 1 or 2), 8 bytes double, x / y of a pixel. Version 2, attempting to correct values for NTSC and PAL, previously off by a factor of approx. 5%.
      expect(res21.size).toBe(12);
      expect(dump(await loadPsdResourceData(stream, res21))).toBe(
        "00 00 00 01 3F F0 00 00 00 00 00 00"
      );

      const res22 = resList[22]!;
      expect(res22.id.toString(16)).toBe("42d");
      expect(res22.id).toBe(PsdResId.layerSelectionIds);
      expect(dump(await loadPsdResourceData(stream, res22))).toBe(
        "00 01 00 00 00 07"
      );

      const res23 = resList[23]!;
      expect(res23.id.toString(16)).toBe("430");
      // (Photoshop CS2) Layer Group(s) Enabled ID. 1 byte for each layer in the document, repeated by length of the resource.
      expect(dump(await loadPsdResourceData(stream, res23))).toBe(
        "01 01 01 01 01 01"
      );

      const res24 = resList[24]!;
      expect(res24.id.toString(16)).toBe("433");
      // (Photoshop CS3) Timeline Information. 4 bytes (descriptor version = 16), Descriptor
      expect(res24.size).toBe(516);

      const res25 = resList[25]!;
      expect(res25.id.toString(16)).toBe("434");
      // (Photoshop CS3) Sheet Disclosure. 4 bytes (descriptor version = 16), Descriptor
      expect(res25.size).toBe(70);

      const res26 = resList[26]!;
      expect(res26.id.toString(16)).toBe("436");
      // (Photoshop CS3) Onion Skins. 4 bytes (descriptor version = 16), Descriptor
      expect(res26.size).toBe(168);

      // Plug-In resource(s)
      const res27 = resList[27]!;
      expect(res27.id.toString(16)).toBe("fa0");
      expect(res27.size).toBe(264);
      expect(res27.offset.toString(16)).toBe("5294");

      const res28 = resList[28]!;
      expect(res28.id.toString(16)).toBe("fa1");
      expect(res28.size).toBe(28);
      const buf28 = await loadPsdResourceData(stream, res28);
      expect(dump(buf28)).toBe(
        "6D 66 72 69 00 00 00 02 00 00 00 10 00 00 00 01 00 00 00 00 00 00 00 01 00 00 00 00"
      );
      expect(bytesToUtf8(buf28.slice(0, 4))).toBe("mfri");

      const res29 = resList[29]!;
      // 0x2710 Print flags information. 2 bytes version ( = 1), 1 byte center crop marks, 1 byte ( = 0), 4 bytes bleed width value, 2 bytes bleed width scale.
      expect(res29.id.toString(16)).toBe("2710");
      expect(dump(await loadPsdResourceData(stream, res29))).toBe(
        "00 01 00 00 00 00 00 00 00 02"
      );
    });
  });
});

import { Stats, statSync } from "fs";
import sharp from "sharp";
import { ImageMetadata } from "~/@types/images";
import { getFileComponents, readAndParseFile, repoDirectory, write } from "../file";
import { IMAGE_CACHE } from "~/constants";
import { IDictionary } from "common-types";
import { getProjectConfig } from "../config";
import parse from "destr";

async function getSharpMetadata(file: string) {
  return sharp(file).metadata();
}

function unbufferExif<T extends Exclude<sharp.Metadata, "iptc"> & { iptc?: any }>(meta: T) {
  return { ...meta, exif: parse(meta.exif?.toString()) || {} };
}

function unbufferIptc<T extends Exclude<sharp.Metadata, "iptc"> & { exif?: any }>(meta: T) {
  return { ...meta, iptc: parse(meta.iptc?.toString()) || {} };
}

async function createMetaFor(f: Stats, img: string): Promise<ImageMetadata> {
  const sourceDirs = getProjectConfig().image?.rules?.map(r => r.source) || [];
  const imgPath = getFileComponents(img).filepath || "ROOT_DIRECTORY";
  const isSourceImage = sourceDirs.some(s => s.includes(imgPath));

  return {
    file: img,
    updated: f.atime,
    created: f.ctime,
    size: f.size,
    isSourceImage,
    meta: unbufferIptc(unbufferExif(await getSharpMetadata(img))),
  };
}

/**
 * Will check passed in file for existinance in the cache and
 * whether these entries are stale, if they are it will fill
 * them in.
 * 
 * Regardless of initial caching state, this function returns
 * the metadata for the images requested.
 */
async function refreshCache(images: string[]) {
  const c: IDictionary<ImageMetadata> = readAndParseFile<IDictionary<ImageMetadata>>(repoDirectory(IMAGE_CACHE)) || {};
  console.log({ c });

  const cache: Record<string, ImageMetadata> = {};
  const promises: Promise<ImageMetadata>[] = [];

  for (const img of images) {
    const f = statSync(img);
    if (c[img]) {
      if (f.atime !== c[img].updated) {
        promises.push(createMetaFor(f, img));
      } else {
        cache[img] = c[img];
      }
    } else {
      promises.push(createMetaFor(f, img));
    }
  }

  const misses = await Promise.all(promises);
  for (const miss of misses) {
    const file = miss.file;
    cache[file] = miss;
  }

  if (misses.length > 0) {
    write(repoDirectory(IMAGE_CACHE), JSON.stringify({ ...c, ...cache }, null, 2));
  }

  return cache;
}


/**
 * Recieves an array of images and returns an array of `ImageMetadata`
 * which leverages the [Sharp](https://sharp.pixelplumbing.com) library 
 * to get metadata for image files.
 */
export async function getImageMeta(...images: string[]) {
  console.log({ images });

  return refreshCache(images);
}
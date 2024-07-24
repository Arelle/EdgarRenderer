import { Reference, SingleFact } from "./fact";
import { FormInformation } from "./form-information";
import { Instance } from "./instance";
import { Meta, Section } from "./meta";


export interface InstanceFile
{
    current: boolean;
    formInformation: FormInformation;
    instance: number;
    instanceHtm: string;
    map: Map<string, SingleFact>;
    metaInstance: Meta;
    xhtmls: XhtmlFileMeta[];
    xmlSlugs: string[];
    xmlUrl: string;
    xml?: Instance;
}


export interface MetaLinks
{
    instance: InstanceFile;
    meta: Meta;
    inlineFiles: Array<{ slug: string, current: boolean, loaded: boolean }>;
    version: string;
    sections: Record<any, unknown>;
    std_ref?: { [key: string]: Reference };
}

export interface MetaLinksResponse
{
    instance: Record<string, InstanceData>;
    version: string;
    std_ref: Record<string, Reference>;
}

export interface InstanceData
{
    axisCustom: number;
    axisStandard: number;
    baseTaxonomies: Record<string, number>;
    contextCount: number;
    dts: unknown;
    elementCount: number;
    entityCount: number;
    hidden: Record<string, unknown>;
    keyCustom: number;
    keyStandard: number;
    memberCustom: number;
    memberStandard: number
    nsprefix: string;
    nsuri: string;
    report: Record<string, Section>;
    segmentCount: number;
    tag: Record<string, unknown>;
    unitCount: number;
}

// export interface T2
// {
//     current: boolean;
//     instanceHtm: currentInstance,
//     instance: number;
//     xhtmls: xhtmls,
//     xmlSlug: xmlSlugs[],
//     xmlUrl: xmlUrl,
//     metaInstance: Object.assign(data.instance[currentInstance]),
//     map: Map<string, unknown>;
// }


export interface XhtmlFileMeta
{
    current: boolean;
    loaded: boolean;
    slug: string;
    url: string;
    xhtml: string;
}

export interface InlineFileMeta
{
    current: boolean,
    loaded: boolean,
    slug: string,
    dropdown?: boolean,
    table?: boolean
}


//Might we want this?
// export type FileMetadata = XhtmlFileMeta | InlineFileMeta;

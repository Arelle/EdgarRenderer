// export interface FormInformation
export type FormInformation =
{
    axisCustom: number;
    axisStandard: number;
    baseTaxonomies: { [key: string]: number };
    contextCount: number;
    dts: { [key: string]: { [key: string]: string[] } };
    elementCount: number;
    entityCount: number;
    hidden: { [key: string]: number };
    keyCustom: number;
    keyStandard: number;
    memberCustom: number;
    memberStandard: number;
    nsPrefix: string;
    nsuri: string;
    segmentCount: number;
    unitCount: number;
    version: string;
} |
{
    axisCustom: number;
    axisStandard: number;
    baseTaxonomies: { [key: string]: number };
    contextCount: number;
    dts: { [key: string]: { [key: string]: string[] } };
    elementCount: number;
    entityCount: 1;
    hidden: { [key: string]: number };
    keyCustom: number;
    keyStandard: number;
    memberCustom: number;
    memberStandard: number;
    nsprefix: string;       //Doesn't match name above
    nsuri: string;
    segmentCount: number;
    unitcount: number;      //Doesn't match name above
};

export interface Instance {
    _declaration: Declaration;
    xbrl: Xbrl;
}

export interface FetchedInstance {
    instanceHtm: string,
    instance: 0,
    xhtmls: Array<{
            slug: string,
            url: string,
            current: boolean,
            loaded: boolean
        }>,
    current: true,
    xmlSlug: Array<string>,
    xmlUrls: Array<string>,
    metaInstance: object;
    map: object;
}

export interface Declaration {
    _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
    version: string;
    encoding: string;
}

export interface Xbrl {
    _attributes?: XbrlAttributes;
    "link:schemaRef"?: LinkSchemaRef;
    context?: Context;
    unit?: Units[];
    ['link:footnoteLink']?: {
        "link:loc": LinkLOC[];
        "link:footnote": LinkFootnote[];
        "link:footnoteArc": LinkFootnoteArc[];
    };
    [key: string]: Fact[] | Fact
}

export interface XbrlAttributes {
    "xml:lang": string;
    xmlns: string;
    "xmlns:dei": string;
    "xmlns:link": string;
    "xmlns:xlink": string;
}

export interface Context {
    _attributes: ContextAttributes;
    entity: Entity;
    period: Period;
}
export interface Units {
    _attributes: ContextAttributes;
    measure: {
        _text: string
    }
}

export interface ContextAttributes {
    id: ID;
}

export enum ID {
    Iefa8Ad5Be1Bd4C1Eae7Defb551D2Cc47D2023050320230503 = "iefa8ad5be1bd4c1eae7defb551d2cc47_D20230503-20230503",
}

export interface Entity {
    identifier: Identifier;
}

export interface Identifier {
    _attributes: IdentifierAttributes;
    _text: string;
}

export interface IdentifierAttributes {
    scheme: string;
}

export interface Period {
    startDate: EndDateClass;
    endDate: EndDateClass;
}

export interface EndDateClass {
    _text: Date;
}

export interface Fact {
    _attributes: DeiAmendmentFlagAttributes;
    _text: string;
}

export interface DeiAmendmentFlagAttributes {
    contextRef: ID;
    id?: string;
}

export interface LinkSchemaRef {
    _attributes: LinkSchemaRefAttributes;
}

export interface LinkSchemaRefAttributes {
    "xlink:href": string;
    "xlink:type": string;
}

export interface InstanceAttributes {
    "xlink:role": string;
    "xlink:type": string;
}

export interface LinkFootnote {
    _attributes: LinkFootnoteAttributes;
    _text: string;
}

export interface LinkFootnoteAttributes {
    id: string;
    "xlink:label": string;
    "xlink:role": string;
    "xlink:type": string;
    "xml:lang": string;
}

export interface LinkFootnoteArc {
    _attributes: LinkFootnoteArcAttributes;
}

export interface LinkFootnoteArcAttributes {
    "xlink:arcrole": string;
    "xlink:from": string;
    "xlink:to": string;
    "xlink:type": PurpleXlinkType;
}

export enum PurpleXlinkType {
    Arc = "arc",
}

export interface LinkLOC {
    _attributes: LinkLOCAttributes;
}

export interface LinkLOCAttributes {
    "xlink:href": string;
    "xlink:label": string;
    "xlink:type": FluffyXlinkType;
}

export enum FluffyXlinkType {
    Locator = "locator",
}

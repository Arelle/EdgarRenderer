export interface Facts {
    [x: string]: string;
    key: string;
    value: SingleFact;
}

export interface SingleFact {
    contextRef: string;
    name: string;
    ix: string;
    id: string;
    value?: string;
    isAmountsOnly: boolean;
    isTextOnly: boolean;
    isNegativeOnly: boolean;
    isHTML: boolean;
    isSelected: boolean;
    period: string;
    scale: null;
    decimals?: Decimals | null;
    sign: null;
    footnote: null | string;
    isEnabled: boolean;
    isHighlight: boolean;
    references: Array<Reference | null>;
    calculations: Array<Calculation[]>;
    labels: LabelElement[];
    xbrltype: string;
    localname: string;
    nsuri: string;
    presentation: string[];
    raw?: string;
    format?: null | string;
    isAdditional?: boolean;
    isCustom?: boolean;
    file?: string;
    unitRef?: string;
    measure?: string;
    balance?: Balance;
    segment?: Array<SegmentClass[] | SegmentClass>;
    continuedIDs: Array<string>;
    "xsi:nil"?: string;
}

export enum Balance {
    Credit = "Credit",
    Debit = "Debit",
}

export interface Calculation {
    label: LabelEnum;
    value: string;
}

export enum LabelEnum {
    Parent = "Parent",
    Section = "Section",
    Weight = "Weight",
}

export enum Decimals {
    HundredMillions = "Hundred Millions",
    Hundredths = "Hundredths",
    Millions = "Millions",
    TenThousandths = "Ten Thousandths",
    Thousands = "Thousands",
    Thousandths = "Thousandths",
}

export interface LabelElement {
    Documentation: string;
    Label: string;
    "Terse Label"?: string;
    "Verbose Label"?: string;
    "Negated Terse Label"?: string;
    "Total Label"?: string;
    "Negated Label"?: string;
    "Period End Label"?: string;
    "Period Start Label"?: string;
    "Negated Period End Label"?: string;
    "Negated Period Start Label"?: string;
    "Negated Total Label"?: string;
}


export interface Reference {
    Name: string;
    Paragraph?: string;
    Publisher: string;
    Section?: string;
    SubTopic?: string;
    Topic?: string;
    URI?: string;
    Subparagraph?: string;
    Number?: string;
    Subsection?: string;
    Article?: string;
    Sentence?: string;
}

export interface SegmentClass {
    axis: string;
    dimension: string;
    type: string;
    value?: null;
}

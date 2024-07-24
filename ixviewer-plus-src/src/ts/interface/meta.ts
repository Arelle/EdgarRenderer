export interface Meta {
    instance: InstanceClass;
    std_ref: StdRef;
    version: string;
    nsprefix?: string;
    tag?: Record<string, Tag>;
    report?: unknown;
}

export interface Section {
    role: string,
    longName: string,
    shortName: string,
    isDefault: boolean,
    groupType: string,
    subGroupType: string,
    menuCat: string,
    menuCatClean: string,
    order: number,
    inlineFactSelector: string,
    firstAnchor: {
        contextRef: string,
        name: string,
        baseRef: string,
        ancestors: string[],
    },
    uniqueAnchor: {
        contextRef: string,
        name: string,
        baseRef: string,
        ancestors: string[],
    },
    instanceHtm: string,
    instanceDocName: string,
    instanceIndex: number,
    menuCatMapped: string,
    fact?: SectionFact,
    domId: string,
    instanceSectionId: string,
    instanceSectionHeaderId: string,
    instanceSectionBodyId: string,
    menuCatHeaderId: string,
    menuCatBodyId: string,
}

export interface SectionFact {
    instance?: string;
    name?: string,
    contextRef?: string,
    file?: string,
    ancestors?: Array<string>,
}

export interface InstanceClass {
    [key: string]: ActualInstance
}

export interface ActualInstance {
    axisCustom: number;
    axisStandard: number;
    contextCount: number;
    dts: Dts;
    elementCount: number;
    entityCount: number;
    hidden: { [key: string]: number };
    keyCustom: number;
    keyStandard: number;
    memberCustom: number;
    memberStandard: number;
    nsprefix: string;
    nsuri: string;
    report: { [key: string]: Report };
    segmentCount: number;
    tag: { [key: string]: Tag };
    unitCount: number;
}

export interface Dts {
    calculationLink: CalculationLink;
    definitionLink: CalculationLink;
    inline: CalculationLink;
    labelLink: CalculationLink;
    presentationLink: CalculationLink;
    schema: Schema;
}

export interface CalculationLink {
    local: string[];
}

export interface Schema {
    local: string[];
    remote: string[];
}

export interface Report {
    menuCat: string;
    order: number;
    firstAnchor: Anchor | null;
    groupType: GroupType;
    isDefault: string;
    longName: string;
    role: string;
    shortName: string;
    subGroupType: SubGroupType;
    uniqueAnchor: Anchor | null;
}

export interface Anchor {
    ancestors: string[];
    baseRef: BaseRef;
    contextRef: string;
    decimals: null | string;
    first?: boolean;
    lang: LangEnum;
    name: string;
    reportCount: number;
    unique?: boolean;
    unitRef: UnitRef | null;
    xsiNil: string;
}

export enum BaseRef {
    UBSAR2021HTM = "UBS_AR_2021.htm",
}

export enum LangEnum {
    EnUS = "en-US",
}

export enum UnitRef {
    Chf = "CHF",
    EpsChf = "EPS_CHF",
    Eur = "EUR",
    Pure = "pure",
    Shares = "shares",
    Usd = "USD",
    Y = "Y",
}

export enum GroupType {
    Disclosure = "disclosure",
    Document = "document",
    Statement = "statement",
}

export enum SubGroupType {
    Details = "details",
    Empty = "",
    Parenthetical = "parenthetical",
    Policies = "policies",
    Tables = "tables",
}

export interface Tag {
    auth_ref: string[];
    lang: LangClass;
    localname: string;
    nsuri: string;
    presentation?: string[];
    xbrltype: Xbrltype;
    calculation?: { [key: string]: Calculation };
    crdr?: Crdr;
}

export interface Calculation {
    order: number | null;
    parentTag: null | string;
    weight: number | null;
    root?: boolean;
}

export enum Crdr {
    Credit = "credit",
    Debit = "debit",
}

export interface LangClass {
    "en-us": EnUs;
    en?: En;
}

export interface En {
    role: EnRole;
}

export interface EnRole {
    documentation: string;
}

export interface EnUs {
    role: EnUsRole;
}

export interface EnUsRole {
    label: string;
    terseLabel?: string;
    verboseLabel?: string;
    documentation?: string;
    totalLabel?: string;
    negatedLabel?: string;
    periodEndLabel?: string;
    periodStartLabel?: string;
    positiveTerseLabel?: string;
    positiveVerboseLabel?: string;
    negatedTerseLabel?: string;
    zeroTerseLabel?: string;
    negatedTotalLabel?: string;
    negativeTerseLabel?: string;
    definitionGuidance?: string;
}

export enum Xbrltype {
    AccountingStandardItemType = "accountingStandardItemType",
    BooleanItemType = "booleanItemType",
    CentralIndexKeyItemType = "centralIndexKeyItemType",
    CountryCodeItemType = "countryCodeItemType",
    DateItemType = "dateItemType",
    DecimalItemType = "decimalItemType",
    DomainItemType = "domainItemType",
    DurationItemType = "durationItemType",
    EdgarStateCountryItemType = "edgarStateCountryItemType",
    FileNumberItemType = "fileNumberItemType",
    FilerCategoryItemType = "filerCategoryItemType",
    FiscalPeriodItemType = "fiscalPeriodItemType",
    GMonthDayItemType = "gMonthDayItemType",
    GYearItemType = "gYearItemType",
    IntegerItemType = "integerItemType",
    InternationalNameItemType = "internationalNameItemType",
    MonetaryItemType = "monetaryItemType",
    NonemptySequenceNumberItemType = "nonemptySequenceNumberItemType",
    NormalizedStringItemType = "normalizedStringItemType",
    PerShareItemType = "perShareItemType",
    PercentItemType = "percentItemType",
    SharesItemType = "sharesItemType",
    StringItemType = "stringItemType",
    SubmissionTypeItemType = "submissionTypeItemType",
    TextBlockItemType = "textBlockItemType",
    YesNoItemType = "yesNoItemType",
}

export interface StdRef {
    [key: string]: reference;
}

export interface reference {
    IssueDate: Date;
    Name: Name;
    Number: string;
    Paragraph?: string;
    Subparagraph?: Paragraph;
    URI: string;
    URIDate: Date;
    Section?: string;
    Clause?: string;
    Note?: Note;
}

export enum Name {
    Ias = "IAS",
    Ifrs = "IFRS",
}

export enum Note {
    Effective20230101 = "Effective 2023-01-01",
    EffectiveOnFirstApplicationOfIFRS9 = "Effective on first application of IFRS 9",
    ExpiryDate20230101 = "Expiry date 2023-01-01",
    ExpiryDate20250101 = "Expiry date 2025-01-01",
}

export enum Paragraph {
    A = "a",
    Ab = "ab",
    B = "b",
    Ba = "ba",
    C = "c",
    D = "d",
    E = "e",
    F = "f",
    G = "g",
    H = "h",
    I = "i",
    L = "l",
    N = "n",
    O = "o",
    P = "p",
    ParagraphA = "(a)",
    Q = "q",
    R = "r",
}

export interface R467 {
    Name: string;
    Number: string;
    Publisher: Publisher;
    Section: string;
    Subsection?: string;
    Footnote?: string;
    Paragraph?: Paragraph;
    Subparagraph?: string;
}

export enum Publisher {
    SEC = "SEC",
}

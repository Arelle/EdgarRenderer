export interface FilingSummary
{
    //These fields are read from filingSummary.xml and cannot be renamed to be correct camelCase
    BaseTaxonomies: { BaseTaxonomy: Array<TextValue> };
    ContextCount: TextValue;
    ElementCount: TextValue;
    EntityCount: TextValue;
    FootnotesReported: TextValue;
    HasCalculationLinkbase: TextValue;
    HasPresentationLinkbase: TextValue;
    InputFiles: TextValue;
    Logs: TextValue;
    MyReports: TextValue;
    ProcessingTime: TextValue;
    ReportFormat: TextValue;
    ScenarioCount: TextValue;
    SegmentCount: TextValue;
    SupplementalFiles: { File: Array<TextValue> };
    TuplesReported: TextValue;
    UnitCount: TextValue;
    Version: TextValue;
}

export interface Report
{
    _attributes: {
        instance: string
    }
}


type TextValue = { _text: string };

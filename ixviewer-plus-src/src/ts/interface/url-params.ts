export type UrlParams = Record<string, string> &
{
    doc: string,
    hostName: string,
    redline: boolean,
    metalinks: string,
    summary: string,
    'doc-file': string,
    'metalinks-file': string,
    fact?: string,
};
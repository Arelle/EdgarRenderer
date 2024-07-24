import { Reference } from "./fact";
import { InstanceFile } from "./instance-file";
import { Section } from "./meta";
import { UrlParams } from "./url-params";


export type FMResponse = { instance: InstanceFile[], sections: Section[], std_ref: Record<string, Reference>, error?: false };
export type ErrorResponse = { error: true, messages: string[] };
export type All = { all: FMResponse };

export type FetchMergeArgs =
{
    absolute: string,
    params: UrlParams,
    instance?: InstanceFile[] | null,
    customPrefix?: string,
    std_ref: { [key: string]: Reference },
};

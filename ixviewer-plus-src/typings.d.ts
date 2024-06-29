declare module "dompurify";

declare interface CarouselEvent extends Event {
    to: number;
    from: number;
}

// The vars below are initialized in webpack config
declare const PRODUCTION: boolean;
declare const DEBUGJS: boolean;
declare const DEBUGCSS: boolean;
declare const LOGPERFORMANCE: boolean;
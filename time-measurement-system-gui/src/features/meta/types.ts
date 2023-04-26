export type ParsedMetaData = {
    carId: string,
    pylonTouchCount: number,
    derailmentCount: number,
    status?: "DNS" | "MC" | "DNF",
    removed: boolean,
    heat: string
};

export function parseMetaData(metaData: string): ParsedMetaData {
    return JSON.parse(metaData);
}

export function packMetaData(metaData: ParsedMetaData) {
    return JSON.stringify(metaData);
}

export function defaultMetaData(): string {
    return packMetaData({
        carId: "",
        pylonTouchCount: 0,
        derailmentCount: 0,
        removed: false,
        heat: ""
    });
}